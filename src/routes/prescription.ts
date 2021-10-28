import { app } from '..';
import Logger from '../logger';
import ResponseData from '../objects/response-data';
import Prescription from '../database/models/Prescription';
import { database } from 'firebase-admin';
import { Response, Request } from 'express';

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

  const results = await prescription
    .$relatedQuery('product')
    .withSchema(req.tokenData!.region.replace(/ /g, '_').toUpperCase())
    .select('name', 'vendorId', 'description', 'price', 'photoUrl');

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
