import { app } from '..';
import Logger from '../logger';
import ResponseData from '../objects/response-data';
import Prescription from '../database/models/Prescription';
import { database } from 'firebase-admin';
import { Response, Request } from 'express';

// TODO: Use express validator in other routes?
import { body } from 'express-validator';
import validationHandler from '../util/validation-handler';
import Product from '../database/models/Product';

const logger = Logger('Prescription');

// Authentication middleware
app.get('/prescription/*', async (req, res, next) => {
  if (!req.isAuthenticated) {
    res.status(401).json(new ResponseData(true, 'You are not logged in!'));
    return;
  } else {
    next();
  }
});

// Create controller
app.post(
  '/prescription/',

  body('products').isArray(), //
  body('userId').isString(),
  body('extraRemarks').isString(),

  async (req, res) => {
    // Validation handler
    // @ts-ignore - stupid request body ts compiler error.
    if (!validationHandler(req, res)) return;

    // Role check
    if (!req.tokenData?.roles.includes('pharmacist')) {
      logger.warn(`User ${req.tokenData?.email} tried to create a prescription, but they are not a pharmacist.`);
      res.status(401).json(new ResponseData(true, 'User is not a pharmacist.'));
      return;
    }

    // Find if an already existing latest prescription is valid
    const latestPrescription = await Prescription.query()
      .withSchema(req.tokenData!.region.replace(/ /g, '_').toUpperCase())
      .orderBy('dateCreated')
      .first();

    if (latestPrescription?.isValid) {
      logger.warn(
        `User ${req.tokenData?.email} tried to create a prescription for user ${req.body.userId}, but they already have a valid one.`
      );
      res.status(400).json(new ResponseData(true, 'User already has a valid prescription.'));
      return;
    }

    const cartItems: any[] = [];

    // Further data validation
    // req.body.products is an array of { productId: string, productQuantity: number }. Verify validity of data.
    // TODO: This can be optimized by awaiting all promises at once.
    for (const product of req.body.products) {
      const dbProduct = await Product.query()
        .withSchema(req.tokenData!.region.replace(/ /g, '_').toUpperCase())
        .findById(product.productId);

      if (!dbProduct) {
        logger.warn(`User ${req.tokenData?.email} has an invalid product in their transcription`);
        return;
      }

      cartItems.push({
        productId: dbProduct.id,
        productName: dbProduct.name,
        productQuantity: product.productQuantity,
        productPrice: dbProduct.price,
      });
    }

    // Update firebase database prescription request to confirmed
    try {
      database()
        .ref(`/${req.tokenData?.region}/${req.tokenData?.city}/${req.tokenData?.uid}/prescriptionRequests`)
        .update({
          status: 'OK',
        });
    } catch (err) {
      logger.error(
        `Pharmacist ${req.tokenData.email} tried to create a prescription for ${req.body.userId}, but an error occured trying to update Firebase: ${err}`
      );
      res.status(500).json(new ResponseData(true, 'An error occured on our end. Please try again.'));
      return;
    }

    const prescription = await Prescription.query()
      .withSchema(req.tokenData!.region.replace(/ /g, '_').toUpperCase())
      .insert({
        dateSubmitted: new Date().toISOString(),
        userId: req.body.userId,
        products: JSON.stringify(cartItems),
        isValid: true,
        isConfirmed: false,
        extraRemarks: req.body.extraRemarks,
      });

    logger.log(`Pharmacist ${req.tokenData?.email} created a prescription ${prescription.id} for ${req.body.userId}`);
    res.json(new ResponseData(false, 'Created a prescription', prescription));
  }
);

// Read controllers
const readController = async (req: Request, res: Response, latest = false) => {
  const prescriptionPromise = Prescription.query().withSchema(req.tokenData!.region.replace(/ /g, '_').toUpperCase());
  // .orderBy('dateCreated')
  // .first();

  if (latest) {
    prescriptionPromise.orderBy('dateCreated').first();
  } else {
    prescriptionPromise.findById(req.params.id);
  }

  const prescription = (await prescriptionPromise) as unknown as Prescription;

  if (!prescription) {
    res.json(new ResponseData(false, 'No prescription found', []));
    return;
  }

  res.json(new ResponseData(false, 'Returned prescription', prescription));
};

app.get('/prescription/latest', async (req, res) => readController(req, res, true));
app.get('/prescription/:id', async (req, res) => readController(req, res));

// Update controllers (Confirm)
app.get('/prescription/confirm', async (req, res) => {
  const latestPrescription = await Prescription.query()
    .withSchema(req.tokenData!.region.replace(/ /g, '_').toUpperCase())
    .orderBy('dateCreated')
    .first();

  if (!latestPrescription?.isValid) {
    logger.log(`User ${req.tokenData?.email} tried to confirm a prescription, but they do not have a valid one.`);
    res.status(401).json(new ResponseData(true, 'User does not have a valid prescription.'));
    return;
  }

  database().ref(`/${req.tokenData?.region}/${req.tokenData?.city}/${req.tokenData?.uid}/deliveries`).set({
    __dummy: true,
    isAccepted: false,
    products: latestPrescription.products,
  });

  logger.log(
    `User ${req.tokenData?.email} confirmed a prescription ${latestPrescription.id} and has put out a delivery request.`
  );
  res.json(new ResponseData(false, 'Created a delivery for this user'));
});

// Update controllers (cancel)
app.get('/prescription/cancel', async (req, res) => {
  const latestPrescription = await Prescription.query()
    .withSchema(req.tokenData!.region.replace(/ /g, '_').toUpperCase())
    .orderBy('dateCreated')
    .first();

  if (!latestPrescription?.isValid) {
    logger.log(`User ${req.tokenData?.email} tried to cancel a prescription, but they do not have a valid one.`);
    res.status(401).json(new ResponseData(true, 'User does not have a valid prescription.'));
    return;
  }

  latestPrescription.$query().patch({ isValid: false });
  logger.log(`User ${req.tokenData?.email} cancelled a prescription ${latestPrescription.id}.`);
  res.json(new ResponseData(false, 'Cancelled this prescription'));
});

// Delete controller
app.delete('/prescription/:id', async (req, res) => {
  // Only the user who owns the prescription can delete it.
  try {
    await Prescription.transaction(async (trx) => {
      const numDeleted = await Prescription.query(trx)
        .withSchema(req.tokenData!.region.replace(/ /g, '_').toUpperCase())
        .delete()
        .where({ id: req.params.id, userId: req.tokenData?.uid })
        .first();

      if (numDeleted === 1) {
        logger.log(`User ${req.tokenData?.email} deleted a prescription ${req.params.id}.`);
        res.json(new ResponseData(false, 'Deleted prescription'));
      } else if (numDeleted === 0) {
        logger.warn(
          `User ${req.tokenData?.email} tried to delete a prescription ${req.params.id}, but it does not exist.`
        );
        res.status(404).json(new ResponseData(true, 'Prescription does not exist'));
      } else {
        // More than 1 prescription was deleted. This is potentially dangerous. We should never get here.
        throw new Error(
          'More than one prescription was deleted. This is potentially dangerous, therefore a rollback was triggered.'
        );
      }
    });
  } catch (err) {
    logger.error(
      `User ${req.tokenData?.email} tried to delete a prescription ${req.params.id}, but an error occured: ${err}`
    );
    res.status(500).json(new ResponseData(true, 'An error occured on our end. Please try again.'));
  }
});
