import { database } from 'firebase-admin';
import { CartItem } from '../database/models/CartItem';
import Logger from '../logger';

const logger = Logger('Delivery Request API');

export const createDeliveryRequest = async (userId: string, region: string, city: string, products: CartItem[]) => {
  logger.log(`Created a new delivery request for ${userId} on ${region}/${city}`);
  const location = database().ref(`/${region}/${city}/${userId}/deliveries`);
  location.set({
    isAccepted: false,
    products,
  });
  return location;
};

export const getDeliveryRequestDbRef = async (userId: string, region: string, city: string) => {
  return database().ref(`/${region}/${city}/${userId}/deliveries`);
};

export const claimDeliveryRequest = async (claimerId: string, userId: string, region: string, city: string) => {
  const location = await getDeliveryRequestDbRef(userId, region, city);
  await location.update({
    isAccepted: true,
    claimerId,
  });
};

export const deleteDeliveryRequest = async (userId: string, region: string, city: string) => {
  const location = await getDeliveryRequestDbRef(userId, region, city);
  await location.remove();
};
