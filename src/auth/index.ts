import Logger from '../logger';
import { auth, firestore } from 'firebase-admin';
import { app } from '..';
import ResponseData from '../objects/response-data';

const logger = Logger('Authentication');

app.use(async (req, res, next) => {
  try {
    if (!req.headers.authorization) throw new Error('Token is null!');
    const token = await auth().verifyIdToken(req.headers.authorization! as string);

    req.isAuthenticated = true;
    req.tokenData = token as unknown as any;

    if (!token.region || !token.city) {
      const userDoc = (await firestore().doc(`/users/${token.uid}`).get()).data();

      if (!userDoc) {
        // Somehow, this user does not have a user document in Firestore. 🤷‍♂️
        res.status(401).json(new ResponseData(true, 'Please complete the register process!'));
        return;
      }

      logger.log('Setting custom user claims for', token.email);
      // If the city and region fields are not present in the token, create them now.
      try {
        await auth().setCustomUserClaims(token.uid, {
          region: userDoc!.region,
          city: userDoc!.city,
        });
        logger.success('Custom user claims for', token.email, 'complete!');
      } catch (err) {
        logger.warn('Custom user claims for', token.email, 'failed:', err);
      }
    }

    next();
  } catch (err) {
    logger.warn(`Could not verify user token! ${err}`);
    req.isAuthenticated = false;
    req.tokenData = null;

    next();
  }
});
