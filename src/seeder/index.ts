import Product from '../database/models/Product';
import Vendor from '../database/models/Vendor';
import faker from 'faker';
import Logger from '../logger';

const log = Logger('Seeder');

export default async () => {
  for (let i = 0; i < 5; i++) {
    const toInsert = {
      city: 'Cagayan de Oro City',
      content: faker.company.catchPhrase(),
      name: faker.company.companyName(),
      rating: -1,
    };

    log.log('(VENDOR) Inserting', toInsert);

    await Vendor.query().withSchema('REGION_X').insert(toInsert);
  }

  const ids = await Vendor.query().withSchema('REGION_X').select('id');

  console.log(ids);

  for (let i = 0; i < 100; i++) {
    const idx = Math.round(Math.random() * ids.length - 1);
    const id = ids[idx].id;
    log.log(`Foreign key ${id}`);

    const toInsert = {
      name: faker.commerce.product(),
      description: faker.commerce.productDescription(),
      isPrescriptionRequired: false,
      price: Math.round(Math.random() * 1000 + 50),
      vendorId: id,
    };

    log.log('(PRODUCT) Inserting', toInsert);

    await Product.query().withSchema('REGION_X').insert(toInsert);
  }

  log.success('Seed complete');
};
