import { app } from '..';
import checkAuth from '../util/check-auth';
import { claimDeliveryRequest } from '../api/delivery-request';
import { body } from 'express-validator';
import validationHandler from '../util/validation-handler';
import Logger from '../logger';
import ResponseData from '../objects/response-data';

const logger = Logger('DeliveryRequestRoute');

app.patch(
  '/delivery-request/claim',

  body('deliveryRequestId').isString(),
  checkAuth,

  async (req, res) => {
    if (!validationHandler(req, res)) return;

    try {
      await claimDeliveryRequest(
        req.tokenData!.uid,
        req.body.deliveryRequestId,
        req.tokenData!.region,
        req.tokenData!.city
      );
    } catch (err) {
      logger.error(
        `${req.tokenData?.email} tried to claim a delivery request ${req.body.deliveryRequestId} but an error happened - `,
        err
      );
      res.json(new ResponseData(true, 'We could not accept this delivery request'));
    }
  }
);
