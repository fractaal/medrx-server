import Product from '../database/models/Product';
import Vendor from '../database/models/Vendor';
import faker from 'faker';
import Logger from '../logger';
import fs from 'fs';
import path from 'path';
import { knex } from '../database';

const log = Logger('Seeder');

export default async () => {
  const hasAlreadyBeenSeeded =
    (await knex('metadata').withSchema('REGION_X').where({ key: 'seeded' }).first())?.value ?? 'false';

  if (hasAlreadyBeenSeeded == 'true') {
    log.log('Database has already been seeded! Cancelling...');
    return;
  }

  await Vendor.query()
    .withSchema('REGION_X')
    .insert({ name: 'Mercury Drug Store', content: MERCURY, city: 'Cagayan de Oro City' });
  await Vendor.query()
    .withSchema('REGION_X')
    .insert({ name: 'Rose Pharmacy', content: ROSE, city: 'Cagayan de Oro City' });
  await Vendor.query()
    .withSchema('REGION_X')
    .insert({ name: 'The Generics Pharmacy', content: TGP, city: 'Cagayan de Oro City' });
  await Vendor.query()
    .withSchema('REGION_X')
    .insert({ name: 'Watsons', content: WATSONS, city: 'Cagayan de Oro City' });

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

var MERCURY = `History
Mercury Drug began from a bottle of sulfathiazole, which was considered a wonder drug after the war.

It was 1945, and Manila had just been liberated from the Japanese occupation. The city was devastated and medicines were scarce and expensive. Mariano Que, who worked in a drugstore before the war, saw the need. He went to Bambang St., Manila, where the action was then, on advice of a friend, and saw a peddler selling sulfathiazole there. He recognized it as the 'wonder drug' believed to cure all diseases. Seeing a 'W' on the tablets, he knew it was the genuine sulfathiazole. He tried to buy a bottle for P100, the only money in his pocket.


The peddler wanted more but as Mariano Que had only P100, the peddler agreed to sell to him. He then sold these tablets by piece or “tingi-tingi” to make the medicine more affordable. With some profit, he was able to purchase other medicines and eventually a pushcart, which he loaded with his growing supply of pharmaceutical goods.

From these humble beginnings, the first Mercury Drug store opened on March 1, 1945 in Bambang St.`

var ROSE = `About Us
Welcome To Rose Pharmacy - A New Experience In Health, Beauty And Well-Being.
With over 300 branches in strategic locations all over the country, Rose Pharmacy is recognized as one of the Philippines’ top pharmaceutical retailers, providing customers with easy access to quality health and beauty products.

Rose Pharmacy recently joined forces with Robinsons Retail Holdings Inc. (RRHI), the second largest retailer in the country, in October 2020. Committed to offering the best health and beauty shopping experience to customers with the unique touch of passionate care, Rose Pharmacy continues to expand its services beyond conventional limits – serving customers at the comfort of their own homes with RosExpress Delivery, fulfilling health and beauty needs across the country with the Rose Pharmacy Online Store’s nationwide delivery, and providing round-the-clock service with 24-Hour stores.

With a strong focus on bringing value to customers, Rose Pharmacy has launched Rose Pharmacy Generics, ensuring high-quality prescription and over-the-counter medicines are made widely available for everyday affordable prices. The Guardian line of personal care products bring gentle, quality care for every member of the family at consistently low prices as well. Rose Pharmacy’s monthly Hot Deals, SuperSavers, and Buy More Save More promotions and special offers further provide great value to customers both in-store and online.`

var TGP = `THE GENERICS PHARMACY (TGP) started out as small pharmaceutical company in 1949. Acknowledging the dire need for quality medicines but at affordable prices, the company focused on generic medicines to provide the Filipino with a more affordable alternative.

In 2001, the company ventured into retail, starting only with a single outlet. As demand grew, the company decided to bring their medicines more accessible to all the far reaches of the country through the FRANCHISING business model. The historic year was 2007, starting with 20 outlets within Metro Manila.

Now as TGP, it revolutionized the entire Pharmaceutical healthcare industry and pharmaceutical retail with its bold and different path for growth. Who would think that a pharmacy or a drugstore with pure generic drugs rapidly take off? After the initial struggles and birth pains, the healthcare landscape has embraced and accepted generic medicine as it has proven to be effective and of high quality standards and yet, truly affordable for every Juan.

Now only on its 10th year in full pharmacy retail and franchising, TGP has dotted the entire archipelago with more than 1900 strong outlets, making healthcare accessible to every Filipino. As expansion grew rapidly, so with the numerous awards and recognition TGP received from various entrepreneurship, retail, franchising and marketing organizations. This is solid proof that TGP is now well accepted and trusted as source of quality and affordable generic medicines. The massive reach and accessibility made TGP a friendly neighborhood pharmacy outlet. TGP is now the largest retail pharmacy chain in the country.

We carry on with the vision to hit 2000 strong outlets to serve the Filipino.`

var WATSONS = `About Us
Welcome To Rose Pharmacy - A New Experience In Health, Beauty And Well-Being.
With over 300 branches in strategic locations all over the country, Rose Pharmacy is recognized as one of the Philippines’ top pharmaceutical retailers, providing customers with easy access to quality health and beauty products.

Rose Pharmacy recently joined forces with Robinsons Retail Holdings Inc. (RRHI), the second largest retailer in the country, in October 2020. Committed to offering the best health and beauty shopping experience to customers with the unique touch of passionate care, Rose Pharmacy continues to expand its services beyond conventional limits – serving customers at the comfort of their own homes with RosExpress Delivery, fulfilling health and beauty needs across the country with the Rose Pharmacy Online Store’s nationwide delivery, and providing round-the-clock service with 24-Hour stores.

With a strong focus on bringing value to customers, Rose Pharmacy has launched Rose Pharmacy Generics, ensuring high-quality prescription and over-the-counter medicines are made widely available for everyday affordable prices. The Guardian line of personal care products bring gentle, quality care for every member of the family at consistently low prices as well. Rose Pharmacy’s monthly Hot Deals, SuperSavers, and Buy More Save More promotions and special offers further provide great value to customers both in-store and online.`