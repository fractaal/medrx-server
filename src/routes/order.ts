import { app } from '..';
import Logger from '../logger';
import { body } from 'express-validator';
import validationHandler from '../util/validation-handler';
import checkAuth from '../util/check-auth';
import ResponseData from '../objects/response-data';

import { createOrderAndDeliveryRequest } from '../api/order-and-delivery-request';
import { getOrdersPaginated } from '../api/order';

const logger = Logger('Order Route');

// Create controller
app.post(
  '/order/',

  checkAuth,
  body('userId').isString(),
  body('products').isArray(),
  body('prescriptionId').isString().optional({ nullable: true }),

  async (req, res) => {
    // @ts-ignore
    if (!validationHandler(req, res)) return;

    try {
      await createOrderAndDeliveryRequest(
        req.body.userId,
        req.body.products,
        req.body.region,
        req.body.city,
        req.body.prescriptionId
      );
    } catch (err) {
      const e: Error = err as unknown as Error;

      if (e.message.includes('already')) {
        res.status(400).json(new ResponseData(true, e.message));
      } else if (e.message.includes('could not')) {
        res.status(500).json(new ResponseData(true, e.message));
      } else {
        logger.warn('A possibly unhandled edge-case exception was thrown.', e);
        res.status(500).json(new ResponseData(true, 'An error occured'));
      }
    }
  }
);

app.get('/orders/:pageSize/:pageNumber', checkAuth, async (req, res) => {
  try {
    const result = await getOrdersPaginated(
      parseInt(req.params.pageSize),
      parseInt(req.params.pageNumber),
      req.tokenData!.uid,
      req.tokenData!.region
    );
    res.json(
      new ResponseData(false, `Returning ${result.results.length} orders out of a total of ${result.total}`, result)
    );
  } catch (err) {
    const e: Error = err as unknown as Error;
    logger.error(e);
    res.status(500).json(new ResponseData(true, 'An error occured.'));
  }
});
