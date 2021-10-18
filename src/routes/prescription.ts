import { app } from '..';
import Logger from '../logger';
import ResponseData from '../objects/response-data';
import Prescription from '../database/models/Prescription';

const logger = Logger('Prescription');

// TODO: Actually do this
app.get('/prescription', async (req, res) => {
  if (!req.isAuthenticated) {
    res.status(401).json(new ResponseData(true, 'You are not logged in!'));
    return;
  }

  const prescription = await Prescription.query()
    .withSchema(req.tokenData!.region.replace(/ /g, '_').toUpperCase())
    .findById(req.tokenData!.uid);

  if (!prescription) {
    res.json(new ResponseData(false, 'No prescription for this user', []));
    return;
  }

  const results = await prescription
    .$relatedQuery('product')
    .withSchema(req.tokenData!.region.replace(/ /g, '_').toUpperCase())
    .select('name', 'vendorId', 'description', 'price', 'photoUrl');

  res.json(new ResponseData(false, `Got ${results.length} items`, results));
});
