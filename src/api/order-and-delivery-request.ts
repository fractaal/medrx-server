import { database } from 'firebase-admin';
import Order from '../database/models/Order';
import { CartItem } from '../database/models/CartItem';
import { createDeliveryRequest, deleteDeliveryRequest, getDeliveryRequestDbRef } from './delivery-request';
import { countActiveOrders, createOrder, deleteOrder, getOrder, getOrderByPrescription } from './order';

import Logger from '../logger';
import { regionClaimsToSchema } from '../util/name-transforms';

const logger = Logger('Order & Delivery Request API');

export const createOrderAndDeliveryRequest = async (
  userId: string,
  products: CartItem[],
  region: string,
  city: string,
  prescriptionId?: string
): Promise<void> => {
  //
  const existingOrder = await getOrderByPrescription(prescriptionId ?? '', region);
  const existingDeliveryRequest = (await (await getDeliveryRequestDbRef(userId, region, city)).get()).val();

  if ((await countActiveOrders(userId, region, city)) > 0) {
    throw new Error('There is already an active order for this user');
  }

  if (existingOrder) {
    // Order already exists - do nothing
    throw new Error('Order already exists for the specified prescription');
  }

  if (existingDeliveryRequest) {
    // Delivery request already exists - do nothing
    throw new Error('Delivery request already exists');
  }

  let order: Order;
  let deliveryRequestRef: database.Reference;

  try {
    order = await createOrder(userId, products, region, prescriptionId);
  } catch (err) {
    logger.log(`Order could not be created for ${userId} - `, err);
    throw new Error('Order could not be created');
  }

  try {
    deliveryRequestRef = await createDeliveryRequest(userId, region, city, products);
  } catch (err) {
    await deleteOrder(order?.id, userId, region, city);
    logger.error(
      `Delivery request for ${userId} could not be created. The corresponding order has been deleted - `,
      err
    );
    throw new Error('Delivery request could not be created');
  }

  logger.log(`Order ${order} and delivery request creation for ${userId} successful`);
};

export const completeOrder = async (orderId: string, userId: string, region: string, city: string) => {
  const order = await getOrder(orderId, userId, region);

  if (!order) {
    throw new Error('Order not found');
  }

  const existingDeliveryRequest = (await (await getDeliveryRequestDbRef(order.userId, region, city)).get()).val();

  if (!existingDeliveryRequest) {
    throw new Error('No delivery request active - cannot complete order as it should be already completed');
  }

  if (existingDeliveryRequest?.status !== 'delivered') {
    throw new Error('Delivery request is not in the delivered state - cannot complete order');
  }

  const trx = await Order.startTransaction();
  const numRowsAffected = await order.$query(trx).withSchema(regionClaimsToSchema(region)).patch({
    isActive: false,
    status: 'complete',
  });

  try {
    await deleteDeliveryRequest(order.userId, region, city);
  } catch (err) {
    await trx.rollback();
    throw new Error('Delivery request could not be deleted');
  }

  if (numRowsAffected !== 1) {
    await trx.rollback();
    throw new Error('Order could not be completed - exactly 1 row must be affected');
  }

  await trx.commit();
};
