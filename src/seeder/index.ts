import Product from '../database/models/Product';
import Vendor from '../database/models/Vendor';
import faker from 'faker';
import Logger from '../logger';
import fs from 'fs';
import path from 'path';
import { knex } from '../database';

const log = Logger('Seeder');

const mercuryDesc = fs.readFileSync(path.resolve(__dirname, 'mercury.txt'), { encoding: 'utf-8' });
const roseDesc = fs.readFileSync(path.resolve(__dirname, 'rose.txt'), { encoding: 'utf-8' });
const tgpDesc = fs.readFileSync(path.resolve(__dirname, 'tgp.txt'), { encoding: 'utf-8' });
const watsonsDesc = fs.readFileSync(path.resolve(__dirname, 'watsons.txt'), { encoding: 'utf-8' });

export default async () => {
  const hasAlreadyBeenSeeded =
    (await knex('metadata').withSchema('REGION_X').where({ key: 'seeded' }).first())?.value ?? 'false';

  if (hasAlreadyBeenSeeded == 'true') {
    log.log('Database has already been seeded! Cancelling...');
    return;
  }

  await Vendor.query()
    .withSchema('REGION_X')
    .insert({ name: 'Mercury Drug Store', content: mercuryDesc, city: 'Cagayan de Oro City' });
  await Vendor.query()
    .withSchema('REGION_X')
    .insert({ name: 'Rose Pharmacy', content: roseDesc, city: 'Cagayan de Oro City' });
  await Vendor.query()
    .withSchema('REGION_X')
    .insert({ name: 'The Generics Pharmacy', content: tgpDesc, city: 'Cagayan de Oro City' });
  await Vendor.query()
    .withSchema('REGION_X')
    .insert({ name: 'Watsons', content: watsonsDesc, city: 'Cagayan de Oro City' });

  const vendors = await Vendor.query().withSchema('REGION_X').select();

  const photoUrls = [
    'https://admin.americanaddictioncenters.org/wp-content/uploads/2016/02/Pills-3209654.jpg',
    'https://assets.unilab.com.ph/uploads/Common/Products/Biogesic/Biogesic-Tablet-Product-Shot-New.jpg',
    'https://www.rosepharmacy.com/ph1/wp-content/uploads/2016/09/67195.jpg',
    'https://images.theconversation.com/files/256057/original/file-20190129-108364-17hlc1x.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=1200&h=900.0&fit=crop',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWnZD5Zxu4B5L9npIBbT0nrDJB0wcyP4-JqOh-vahp90LdMHnrvwjaCeqeaDelB2-tqrs&usqp=CAU',
    'https://www.history.com/.image/ar_4:3%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_1200/MTU3ODc3NjU2MjA5NjYzMzA1/fast-facts-about-the-war-on-drugs.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxIHwxBr5aNCt4y68LmWHog-0sim3YfOVxir4nFutLe36us8WEsjsEala4yOw3UtvnVs0&usqp=CAU',
    'https://images.news18.com/ibnlive/uploads/2020/09/1599377768_weed.jpeg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnLU7AZjk4QpX2flxtSsL_8hlS1IbRT8BPXA&usqp=CAU',
    'https://rehabs.com/static/explore/meth-before-and-after-drugs/img/block1_img.png',
    'https://www.thetimes.co.uk/imageserver/image/%2Fmethode%2Ftimes%2Fprod%2Fweb%2Fbin%2F22c44eda-ad0f-11e6-a67d-ec9aa6156041.jpg?crop=1500%2C1000%2C0%2C0',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLZpbxPRJNcaePkzq8Oj9eWK5BVlPKbAqvhg&usqp=CAU',
  ];

  // const names = [
  //   'Paracetamol 10mg Variation',
  //   'Penicillin 28419824mg Variation',
  //   'Airbus A320 CFM Leap Variation',
  //   'Alnix',
  //   'Biogesic',
  //   'Centrum',
  //   'Cherifer',
  //   'Celine',
  //   'Pfizer Vaccine',
  //   'Moderna Vaccine',
  //   'J&J Vaccine',
  //   'Astrazeneca Vaccine',
  //   'Sinovac Vaccine',
  //   'Free 5G Installations',
  //   'Aspirin',
  //   'OBAMIUM',
  // ];

  for (let i = 0; i < 100; i++) {
    const idx = Math.floor(Math.random() * (vendors.length - 1));
    const vendor = vendors[idx];
    log.log(`Foreign key ${vendor.id}`);

    const productName = faker.commerce.productAdjective() + ' ' + faker.commerce.productName();
    const photoUrl = photoUrls[Math.floor(Math.random() * (photoUrls.length - 1))];

    const toInsert = {
      name: productName,
      description: `${productName} is ${faker.commerce.productDescription()}`,
      photoUrl,
      isPrescriptionRequired: false,
      price: Math.floor(Math.random() * 1000 + 50),
      vendorId: vendor.id,
    };

    log.log('(PRODUCT) Inserting', toInsert);

    await Product.query().withSchema('REGION_X').insert(toInsert);
  }

  await knex('metadata').withSchema('REGION_X').where({ key: 'seeded' }).first().update({ value: 'true' });

  log.success('Seed complete');
};
