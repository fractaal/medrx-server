import { app } from '..';
import Logger from '../logger';
import ResponseData from '../objects/response-data';
import Product from '../database/models/Product';

const logger = Logger('Product');

app.get('/product/:id', async (req, res) => {
  if (!req.isAuthenticated) {
    res.status(401).json(new ResponseData(true, 'You are not logged in!'));
    return;
  }

  if (!req.params.id) {
    res.status(400).json(new ResponseData(true, 'You did not specify product ID!'));
    return;
  }

  const product = await Product.query()
    .withSchema(req.tokenData!.region.replace(/ /g, '_').toUpperCase())
    .findById(req.params.id);

  if (product) res.json(product);
  else res.json(null);

  logger.log(`Returning ${req.params.id} product for user ${req.tokenData?.email} @ ${req.tokenData?.region}`);
  // res.json(products);
});
