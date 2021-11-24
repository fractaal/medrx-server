import { app } from '..';
import Logger from '../logger';
import ResponseData from '../objects/response-data';
import Product from '../database/models/Product';
import { regionClaimsToSchema } from '../util/name-transforms';

const logger = Logger('Storefront');

app.get('/storefront', async (req, res) => {
  if (!req.isAuthenticated) {
    res.status(401).json(new ResponseData(true, 'You are not logged in!'));
    return;
  }

  const products = await Product.query()
    .withSchema(regionClaimsToSchema(req.tokenData!.region))
    .orderBy('products.dateUpdated')
    .select([
      'products.name',
      'price',
      'description',
      'products.id',
      'vendorId',
      'vendor.name as vendorName',
      'products.photoUrl',
    ])
    .limit(15)
    .joinRelated('vendor');

  logger.log(`Returning ${products.length} products for user ${req.tokenData?.email} @ ${req.tokenData?.region}`);

  res.json(new ResponseData(false, 'Returned storefront', products));
});
