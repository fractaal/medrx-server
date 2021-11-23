import { app } from '..';
import { CartItem } from '../database/models/CartItem';
import Logger from '../logger';
import Order from '../database/models/Order';

import { body } from 'express-validator';
import validationHandler from '../util/validation-handler';
import checkAuth from '../util/check-auth';
import ResponseData from '../objects/response-data';

import { database } from 'firebase-admin';

const logger = Logger('Order');

export const createOrder = async (userId: string, products: CartItem[], region: string, prescriptionId?: string) => {
  try {
    const order = await Order.query().withSchema(region.replace(/ /g, '_').toUpperCase()).insert({
      userId,
      prescriptionId,
      products,
      status: 'undetermined',
      isActive: true,
    });
    return order;
  } catch (err) {
    logger.error(`An error occured while creating the order for ${userId}`, err);
  }
};

export const deleteOrder = async (orderId: string, region: string, city: string, force = false) => {
  const existingDeliveryRequest = await getDeliveryRequest(orderId, region, city);

  if (existingDeliveryRequest && !force) {
    throw new Error('Order has already been assigned to a delivery request.');
  }

  if (existingDeliveryRequest && force) {
    logger.warn(`Force deleting order ${orderId} - it has already been assigned to a delivery request.`);
  }

  try {
    const numDeleted = await Order.query().withSchema(region.replace(/ /g, '_').toUpperCase()).deleteById(orderId);
    return numDeleted;
  } catch (err) {
    logger.error(`An error occured while deleting the order for ${orderId}`, err);
  }
};

export const getDeliveryRequest = async (userId: string, region: string, city: string) => {
  const location = database().ref(`/${region}/${city}/${userId}/deliveryRequests`);
  try {
    const data = (await location.get()).val();
    return data;
  } catch (err) {
    logger.error(`An error occured while getting delivery requests for ${userId}`, err);
  }
};

export const createDeliveryRequest = async (userId: string, region: string, city: string, products: CartItem[]) => {
  try {
    database().ref(`/${region}/${city}/${userId}/deliveryRequests`).set({
      isAccepted: false,
      products,
    });
    return true;
  } catch (err) {
    return false;
  }
};

export const getOrderByPrescription = async (prescriptionId: string) => {
  try {
    const order = await Order.query().findOne({ prescriptionId });
    return order;
  } catch (err) {
    logger.error(`An error occured while getting the order for ${prescriptionId}`, err);
  }
};

export const createOrderAndDeliveryRequest = async (
  userId: string,
  products: CartItem[],
  region: string,
  city: string,
  prescriptionId?: string
): Promise<void> => {
  //
  const existingOrder = await getOrderByPrescription(prescriptionId ?? '');
  const existingDeliveryRequest = await getDeliveryRequest(userId, region, city);

  if (existingOrder) {
    // Order already exists - do nothing
    throw new Error('Order already exists for the specified prescription');
  }

  if (existingDeliveryRequest) {
    // Delivery request already exists - do nothing
    throw new Error('Delivery request already exists');
  }

  const order = await createOrder(userId, products, region, prescriptionId);
  const deliveryRequestCreated = await createDeliveryRequest(userId, region, city, products);

  if (order) {
    logger.log(`Order ${order.id} created for ${userId}`);
  } else {
    logger.log(`Order could not be created for ${userId}`);
    throw new Error('Order could not be created');
  }

  if (!deliveryRequestCreated) {
    await deleteOrder(order?.id, region, city);
    logger.error(`Delivery request for ${userId} could not be created. The corresponding order has been deleted.`);
    throw new Error('Delivery request could not be created');
  }

  logger.log(`Order ${order} and delivery request creation for ${userId} successful`);
};

// Create controller
app.post(
  '/order/',

  checkAuth,
  body('userId').isString(),
  body('products').isArray(),
  body('prescriptionId').isString().optional({ nullable: true }),

  async (req, res) => {
    // @ts-ignore
    if (!validationHandler(req, res)) return;

    try {
      await createOrderAndDeliveryRequest(
        req.body.userId,
        req.body.products,
        req.body.region,
        req.body.city,
        req.body.prescriptionId
      );
    } catch (err) {
      const e: Error = err as unknown as Error;

      if (e.message.includes('already')) {
        res.status(400).json(new ResponseData(true, e.message));
      } else if (e.message.includes('could not')) {
        res.status(500).json(new ResponseData(true, e.message));
      } else {
        logger.warn('A possibly unhandled edge-case exception was thrown.', e);
        res.status(500).json(new ResponseData(true, 'An error occured'));
      }
    }
  }
);
