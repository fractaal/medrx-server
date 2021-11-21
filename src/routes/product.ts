import checkAuth from '../util/check-auth';
import { app } from '..';
import Logger from '../logger';
import ResponseData from '../objects/response-data';
import Product from '../database/models/Product';
import Vendor from '../database/models/Vendor';

const logger = Logger('Product');

app.get('/product/:id', checkAuth, async (req, res) => {
  if (!req.params.id) {
    res.status(400).json(new ResponseData(true, 'You did not specify product ID!'));
    return;
  }

  try {
    const product = await Product.query()
      .withSchema(req.tokenData!.region.replace(/ /g, '_').toUpperCase())
      .findById(req.params.id);

    if (!product) {
      res.status(404).json(new ResponseData(true, 'Product not found!'));
      return;
    }

    const vendor = (await product
      .$relatedQuery('vendor')
      .select('name')
      .withSchema(req.tokenData!.region.replace(/ /g, '_').toUpperCase())) as unknown as Vendor;

    if (product)
      res.json(new ResponseData(false, 'Product successfully retrieved', { ...product, vendorName: vendor.name }));
    else res.json(new ResponseData(false, 'No such product with supplied ID', null));

    logger.log(`Returning ${req.params.id} product for user ${req.tokenData?.email} @ ${req.tokenData?.region}`);
    // res.json(products);
  } catch (err) {
    res.json(new ResponseData(true, 'Something went wrong with your request', null));
    logger.log(`Failed to process request for ${req.tokenData?.email} - ${(err as Error).message}`);
  }
});
