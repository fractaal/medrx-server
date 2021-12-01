export interface User {
  firstName: string;
  middleName: string;
  lastName: string;
}
// try {
//   ({ firstName, middleName, lastName } = (await (await firestore().doc(`/users/${userId}`).get()).data()) as any);
// } catch (e) {
//   logger.error('Error getting user data', e);
//   throw new Error('Could not get user data');
// }
