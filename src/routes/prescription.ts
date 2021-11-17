import { app } from '..';
import Logger from '../logger';
import ResponseData from '../objects/response-data';
import Prescription from '../database/models/Prescription';
import { database } from 'firebase-admin';
import { Response, Request } from 'express';

// TODO: Use express validator in other routes?
import { body } from 'express-validator';
import validationHandler from '../util/validation-handler';

const logger = Logger('Prescription');

// TODO: Actually do this

app.get('/prescription/*', async (req, res, next) => {
  if (!req.isAuthenticated) {
    res.status(401).json(new ResponseData(true, 'You are not logged in!'));
    return;
  } else {
    next();
  }
});

const controller = async (req: Request, res: Response, latest = false) => {
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

  const results = prescription.products;

  res.json(new ResponseData(false, `Got ${results.length} items`, results));
};

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
  });
  logger.log(
    `User ${req.tokenData?.email} confirmed a prescription ${latestPrescription.id} and has put out a delivery request.`
  );
  res.json(new ResponseData(false, 'Created a delivery for this user'));
});

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

app.get('/prescription/latest', async (req, res) => controller(req, res, true));
app.get('/prescription/:id', async (req, res) => controller(req, res));

app.post(
  '/prescription/',

  body('products').isArray(), //
  body('userId').isString(),

  async (req, res) => {
    if (!req.tokenData?.roles.includes('pharmacist')) {
      logger.warn(`User ${req.tokenData?.email} tried to create a prescription, but they are not a pharmacist.`);
      res.status(401).json(new ResponseData(true, 'User is not a pharmacist.'));
      return;
    }

    // @ts-ignore - stupid request body ts compiler error.
    if (!validationHandler(req, res)) return;

    // req.body.products is an array of { productId: string, productQuantity: number }. Verify validity of data.
    req.body.products.forEach((product: { productId: string; productQuantity: number }) => {
      if (!product.productId || !product.productQuantity) {
        logger.warn(
          `User ${req.tokenData?.email} tried to create a prescription, but they did not provide the correct data.`
        );
        res.status(400).json(new ResponseData(true, 'User did not provide the correct data.'));
        return;
      }
    });

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
        products: JSON.stringify(req.body.products),
        isValid: true,
        isConfirmed: false,
      });

    logger.log(`Pharmacist ${req.tokenData?.email} created a prescription ${prescription.id} for ${req.body.userId}`);
    res.json(new ResponseData(false, 'Created a prescription', prescription));
  }
);
