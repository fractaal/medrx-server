import { app } from '..';
import Logger from '../logger';
import ResponseData from '../objects/response-data';
import Product from '../database/models/Product';

const logger = Logger('Search');

app.post('/search', async (req, res) => {
  if (!req.isAuthenticated) {
    res.status(401).json(new ResponseData(true, 'You are not logged in!'));
    return;
  }

  if (!req.body.searchTerm) {
    res.status(400).json(new ResponseData(true, 'Search term is missing!'));
    return;
  }

  const products = await Product.query()
    .withSchema(req.tokenData!.region.replace(/ /g, '_').toUpperCase())
    .where('name', 'ilike', `%${req.body.searchTerm}%`)
    .orWhere('description', 'ilike', `%${req.body.searchTerm}%`)
    .orderBy('updatedAt')
    .select(['name', 'price', 'description', 'id'])
    .page(req.body.pageNumber ?? 0, 10);

  logger.log(
    `Returning ${products.results.length} products for user ${req.tokenData?.email} @ ${req.tokenData?.region} (out of a total of ${products.total})`
  );

  res.json(new ResponseData(false, `Returned ${products.results.length} products (total ${products.total})`, products));
});
