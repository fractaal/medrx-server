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
    'https://images.theconversation.com/files/369567/original/file-20201116-23-18wlnv.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=1200&h=1200.0&fit=crop',
    'https://www.afd.fr/sites/afd/files/styles/visuel_principal/public/2019-10-09-27-46/flickr-marco-verch.jpg?itok=XH4x7-Y4',
    'https://i0.wp.com/post.medicalnewstoday.com/wp-content/uploads/sites/3/2021/07/ulcerative_colitis_GettyImages569038309_Thumb-732x549.jpg?w=1155',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6VNPl1YijpoJCaXgl2-PjOiCPjWaImubOfQ&usqp=CAU',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfLp3J8udkG047My_eUsU-4fCnONE_w4CQQPq2EcEX2MdSPiFpUILvzL_EjnRDcSmbMIA&usqp=CAU',
    'https://www.medicaldevice-network.com/wp-content/uploads/sites/11/2021/02/shutterstock_544348294-1.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdPMkXdVkpox58iaDEPWcXvmJjCq4SfDEguaq11ZKK6QW3O-RYsRyMlJrmEvyMbgrdz8Q&usqp=CAU',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsFA12gy18e_fE7CEvURM59-BcUu47wZ5jJg&usqp=CAU',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAt84uHYBrR01wDvz-NHeokjlFldUgaPnwNw&usqp=CAU',
    'https://ichef.bbci.co.uk/news/976/cpsprodpb/15DA3/production/_115370598_tv038457905.jpg',
    'https://cdn.vox-cdn.com/thumbor/PcwIpwPY1k6td83nhkRZ-iBRU3U=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/22047683/amazon_pharmacy.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMZvUIlbS64_Fuw7DvEzyJ32l0syKs-9zweQ&usqp=CAU',
  ];

  const names = [
    'Paracetamol 10mg Variation',
    'Penicillin 100mg Variation',
    'Alnix',
    'Biogesic',
    'Centrum',
    'Cherifer',
    'Celine',
    'Aspirin',
  ];

  for (let i = 0; i < 100; i++) {
    const idx = Math.floor(Math.random() * (vendors.length - 1));
    const vendor = vendors[idx];
    log.log(`Foreign key ${vendor.id}`);

    const randomName = names[Math.floor(Math.random() * names.length)];

    const productName = faker.commerce.productAdjective() + ' ' + randomName;
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
