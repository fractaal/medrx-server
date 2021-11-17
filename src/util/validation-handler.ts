import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import ResponseData from '../objects/response-data';
import Logger from '../logger';

const logger = Logger('Validation');

export default (req: Request, res: Response, next?: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.log(
      `${req.tokenData?.email} tried to perform ${req.method} request on ${req.path} but request body validation failed.`,
      errors.array()
    );
    res.status(400).json(new ResponseData(true, 'Incorrect data', errors.array()));
    return false;
  }
  return true;
};
