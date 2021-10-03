import { app } from '..';
import ResponseData from '../objects/response-data';
import Product from '../database/models/Product';

app.post('/storefront', async (req, res) => {
  if (!req.isAuthenticated) {
    res.status(401).json(new ResponseData(true, 'You are not logged in!'));
    return;
  }

  const products = await Product.query()
    .withSchema(req.tokenData!.region.replace(/ /g, '_').toUpperCase())
    .limit(10)
    .select();

  console.log(products);

  res.json(products);
});
