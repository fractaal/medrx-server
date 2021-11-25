import { CartItem } from '../database/models/CartItem';
import Order from '../database/models/Order';
import { regionClaimsToSchema } from '../util/name-transforms';
import Logger from '../logger';
import { getDeliveryRequestDbRef } from './delivery-request';

const logger = Logger('Order API');

export const createOrder = async (userId: string, products: CartItem[], region: string, prescriptionId?: string) => {
  const order = await Order.query()
    .withSchema(regionClaimsToSchema(region))
    .insert({
      userId,
      prescriptionId,
      products: JSON.stringify(products),
      status: 'undetermined',
      isActive: true,
    });
  return order;
};

export const getOrder = async (orderId: string, userId: string, region: string) =>
  await Order.query().withSchema(regionClaimsToSchema(region)).findOne({ userId, id: orderId });

export const getOrdersPaginated = async (pageSize: number, pageNumber: number, userId: string, region: string) =>
  await Order.query().withSchema(regionClaimsToSchema(region)).where({ userId }).page(pageNumber, pageSize);

export const getOrderByPrescription = async (prescriptionId: string, region: string) => {
  return await Order.query().withSchema(regionClaimsToSchema(region)).findOne({ prescriptionId });
};

export const deleteOrder = async (orderId: string, userId: string, region: string, city: string) => {
  const order = await getOrder(orderId, userId, region);

  if (!order) {
    throw new Error('Order not found');
  }

  const existingDeliveryRequest = (await (await getDeliveryRequestDbRef(order.userId, region, city)).get()).val();

  if (existingDeliveryRequest) {
    throw new Error('User may not delete an order if they still have an active delivery request.');
  }

  await order.$query().withSchema(regionClaimsToSchema(region)).delete();
};

export const countActiveOrders = async (userId: string, region: string, city: string) => {
  // @ts-ignore
  return parseInt(
    (await Order.query().withSchema(regionClaimsToSchema(region)).where({ userId, isActive: true }).count())[0].count
  );
};
