import Logger from '../logger';
import { auth } from 'firebase-admin';
import { app } from '..';

const logger = Logger('Authentication');

app.use(async (req, _, next) => {
  try {
    if (!req.body.token) throw new Error('Token is null!');
    const token = await auth().verifyIdToken(req.body.token);
    logger.log(token);
    req.isAuthenticated = true;
    req.tokenData = token;
  } catch (err) {
    logger.warn(`Could not verify user token! ${err}`);
    req.isAuthenticated = false;
    req.tokenData = null;
  } finally {
    next();
  }
});
