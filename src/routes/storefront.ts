import { app } from '..';
import Logger from '../logger';
import ResponseData from '../objects/response-data';
import Product from '../database/models/Product';

const logger = Logger('Storefront');

app.get('/storefront', async (req, res) => {
  if (!req.isAuthenticated) {
    res.status(401).json(new ResponseData(true, 'You are not logged in!'));
    return;
  }

  const products = await Product.query()
    .withSchema(req.tokenData!.region.replace(/ /g, '_').toUpperCase())
    .orderBy('products.updatedAt')
    .select(['products.name', 'price', 'description', 'products.id', 'vendorId', 'vendor.name as vendorName'])
    .limit(15)
    .joinRelated('vendor');

  logger.log(`Returning ${products.length} products for user ${req.tokenData?.email} @ ${req.tokenData?.region}`);

  res.json(products);
});
