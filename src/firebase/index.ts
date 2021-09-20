import * as admin from 'firebase-admin';
import Logger from '../logger';

const log = Logger('Firebase');

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 as string, 'base64') as unknown as string)
  ),
  databaseURL: 'https://medrx-test-default-rtdb.asia-southeast1.firebasedatabase.app',
});
