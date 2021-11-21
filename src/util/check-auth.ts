import ResponseData from '../objects/response-data';
import { NextFunction, Request, Response } from 'express';
import Logger from '../logger';

const logger = Logger('Authguard');

// Authentication guard middleware
export default (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated) {
    logger.log(`${req.ip} tried to access ${req.url} but they aren't logged in.`);
    res.status(401).json(new ResponseData(true, 'You are not logged in!'));
    return;
  } else {
    next();
  }
};
