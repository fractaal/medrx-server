import { app } from '..';
import Logger from '../logger';
import ResponseData from '../objects/response-data';
import Product from '../database/models/Product';
import Vendor from '../database/models/Vendor';
import checkAuth from '../util/check-auth';

const logger = Logger('Vendor');

app.get('/vendor/:id', checkAuth, async (req, res) => {
  if (!req.params.id) {
    res.status(400).json(new ResponseData(true, 'You did not specify vendor ID!'));
    return;
  }

  try {
    const vendor = await Vendor.query()
      .withSchema(req.tokenData!.region.replace(/ /g, '_').toUpperCase())
      .findById(req.params.id);

    if (vendor) res.json(new ResponseData(false, 'Vendor successfully retrieved', vendor));
    else res.json(new ResponseData(false, 'No such vendor with supplied ID', null));

    logger.log(`Returning ${req.params.id} vendor for user ${req.tokenData?.email} @ ${req.tokenData?.region}`);
    // res.json(products);
  } catch (err) {
    res.json(new ResponseData(true, 'Something went wrong with your request', null));
    logger.log(`Failed to process request for ${req.tokenData?.email} - ${(err as Error).message}`);
  }
});

app.get('/vendor/:id/products/:pageNumber', checkAuth, async (req, res) => {
  if (!req.params.id) {
    res.status(400).json(new ResponseData(true, 'You did not specify vendor ID!'));
    return;
  }

  try {
    const products = await Product.query()
      .withSchema(req.tokenData!.region.replace(/ /g, '_').toUpperCase())
      .where({ vendorId: req.params.id })
      .page(parseInt(req.params.pageNumber ?? 0), 10);

    res.json(new ResponseData(false, 'Products successfully retrieved', products));
  } catch (err) {
    res.json(new ResponseData(true, 'Something went wrong with your request', null));
    logger.log(`Failed to process request for ${req.tokenData?.email} - ${(err as Error).message}`);
  }
});
