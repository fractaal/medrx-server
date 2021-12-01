import { database } from 'firebase-admin';
import { CartItem } from '../database/models/CartItem';
import { Delivery } from '../database/models/DeliveryRequest';
import Logger from '../logger';
import { getDistance, Location } from '../util/positions';

const logger = Logger('Delivery Request API');

export const createDeliveryRequest = async (userId: string, region: string, city: string, products: CartItem[]) => {
  logger.log(`Created a new delivery request for ${userId} on ${region}/${city}`);
  const location = await getDeliveryRequestDbRef(userId, region, city);
  location.set({
    isAccepted: false,
    products,
  });
  return location;
};

export const getDeliveryRequestDbRef = async (userId: string, region: string, city: string) => {
  return database().ref(`/${region}/${city}/${userId}/delivery`);
};

// TODO: make work
export const getDeliveryRequestsByProximity = async (
  origin: Location,
  maxEntries = 10,
  maxDistance = 10,
  region: string,
  city: string
) => {
  const ref = database().ref(`${region}/${city}`);
  const usersData: Record<string, { delivery: Delivery }> = await (await ref.get()).val();

  for (const [userId, userData] of Object.entries(usersData)) {
    const { delivery } = userData;

    const distance = getDistance(origin, { lat: delivery.lat, lng: delivery.lng });
    if (distance > maxDistance) {
      continue;
    }

    if (delivery.isAccepted) {
      continue;
    }

    return {
      userId,
      firstName: delivery.firstName,
      middleName: delivery.middleName,
      lastName: delivery.lastName,
      distance,
    };
  }
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
