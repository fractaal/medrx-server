import { app } from '..';
import Logger from '../logger';
import ResponseData from '../objects/response-data';
import Product from '../database/models/Product';
import Vendor from '../database/models/Vendor';

const logger = Logger('Vendor');

app.get('/vendor/:id/:pageNumber', async (req, res) => {
  if (!req.isAuthenticated) {
    res.status(401).json(new ResponseData(true, 'You are not logged in!'));
    return;
  }

  if (!req.params.id) {
    res.status(400).json(new ResponseData(true, 'You did not specify vendor ID!'));
    return;
  }

  try {
    const vendor = await Vendor.query()
      .withSchema(req.tokenData!.region.replace(/ /g, '_').toUpperCase())
      .findById(req.params.id);

    const products = await vendor
      .$relatedQuery('product')
      .withSchema(req.tokenData!.region.replace(/ /g, '_').toUpperCase())
      .page(parseInt(req.params.pageNumber ?? 0), 10);

    if (vendor) res.json(new ResponseData(false, 'Vendor successfully retrieved', { vendor, products }));
    else res.json(new ResponseData(false, 'No such vendor with supplied ID', null));

    logger.log(`Returning ${req.params.id} vendor for user ${req.tokenData?.email} @ ${req.tokenData?.region}`);
    // res.json(products);
  } catch (err) {
    res.json(new ResponseData(true, 'Something went wrong with your request', null));
    logger.log(`Failed to process request for ${req.tokenData?.email} - ${(err as Error).message}`);
  }
});
