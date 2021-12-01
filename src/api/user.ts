import { firestore } from 'firebase-admin';
import { User } from '../database/models/User';

export const getUserDocument = async (uid: string): Promise<firestore.DocumentSnapshot> => {
  return await firestore().collection('users').doc(uid).get();
};

export const getUserData = async (uid: string): Promise<User> => {
  const doc = await getUserDocument(uid);
  return doc.data() as User;
};
