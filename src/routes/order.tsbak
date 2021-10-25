import { app } from '..';
import { CartItem } from '../database/models/CartItem';
import { firestore } from 'firebase-admin';
import Product from '../database/models/Product';
import Prescription from '../database/models/Prescription';
import ResponseData from '../objects/response-data';
import Logger from '../logger';

const log = Logger('Order');

// TODO: I wrote this in a very bad state of mind. This shouldn't be the order route - this should be regarding prescriptions. Make the appropriate name change!

app.get('/placeOrder', async (req, res) => {
  if (!req.isAuthenticated) {
    res.status(401).json(new ResponseData(true, 'You are not logged in!'));
    return;
  }

  const cart: Record<string, CartItem> =
    (await firestore().doc(`/users/${req.tokenData?.uid}`).get()).data()!.cart ?? {};
  const validProducts: Product[] = [];

  // Checking validity of products
  for (const productId in cart) {
    const product = await Product.query()
      .withSchema(req.tokenData!.region.replace(/ /g, '_').toUpperCase())
      .findById(productId);
    if (!product) {
      log.warn(`Order placed by ${req.tokenData?.email} has an invalid product ID.`);
      continue;
    } else {
      validProducts.push(product);
    }
  }

  if (validProducts.length === 0) {
    log.warn(`Order placed by ${req.tokenData?.email} has no valid products. Cancelling order!`);
    res.status(400).json(new ResponseData(true, 'Your cart was invalid!'));
    return;
  }

  // Checking for existing prescription entry
  let prescription = await Prescription.query()
    .withSchema(req.tokenData!.region.replace(/ /g, '_').toUpperCase())
    .findById(req.tokenData!.uid);

  if (prescription) {
    log.warn(`Cannot create new order for ${req.tokenData?.email} - an order for them already exists!`);
    res
      .status(400)
      .json(new ResponseData(true, 'You cannot create a new order while you still have your existing one.'));
    return;
  }

  prescription = await Prescription.query()
    .withSchema(req.tokenData!.region.replace(/ /g, '_').toUpperCase())
    .insert({ id: req.tokenData!.uid });

  // Relate the existing valid products to the new prescription!
  const related = await prescription
    .$relatedQuery('product')
    .withSchema(req.tokenData!.region.replace(/ /g, '_').toUpperCase())
    .relate(validProducts.map((x) => x.id));

  log.log(related);

  res.json(new ResponseData(false, `Successfully created order!`));
});
