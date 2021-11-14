import { Knex } from 'knex';

export const migrations = [
  {
    version: 1,
    description: 'Insert product table & vendors',
    up: async (knex, schema) => {
      await knex.schema.withSchema(schema).createTable('vendors', (t) => {
        t.uuid('id').primary().notNullable().defaultTo(knex.raw('gen_random_uuid()'));

        t.string('name').notNullable();
        t.string('content', 5000);
        t.string('city').notNullable();
        t.integer('rating');

        t.string('photoUrl', 1000);

        t.json('metadata');

        t.timestamp('dateUpdated');
        t.timestamp('dateCreated');
      });

      await knex.schema.withSchema(schema).createTable('products', (t) => {
        t.uuid('id').primary().notNullable().defaultTo(knex.raw('gen_random_uuid()'));
        t.uuid('vendorId').references('id').inTable(`${schema}.vendors`);

        t.string('name').notNullable();
        t.string('description', 5000);
        t.integer('price').notNullable();
        t.json('metadata');
        t.boolean('isPrescriptionRequired').notNullable();

        t.string('photoUrl', 1000);

        t.timestamp('dateUpdated');
        t.timestamp('dateCreated');
      });
    },
    down: async (knex, schema) => {
      await knex.schema.withSchema(schema).dropTable('products');
      await knex.schema.withSchema(schema).dropTable('vendors');
    },
  },
  {
    description: 'Add prescriptions table and prescription-products table',
    version: 2,
    up: async (knex, schema) => {
      await knex.schema.withSchema(schema).createTable('prescriptions', (t) => {
        // t.string('id').primary().notNullable();
        t.uuid('id').primary().notNullable().defaultTo(knex.raw('gen_random_uuid()'));
        t.string('userId').notNullable();
        t.timestamp('dateUpdated');
        t.timestamp('dateCreated');

        t.json('products');

        t.boolean('isValid').defaultTo(true);
        t.boolean('isConfirmed');

        t.timestamp('dateSubmitted');
        t.timestamp('dateConfirmedOrCancelled');
      });

      // await knex.schema.withSchema(schema).createTable('prescriptionsProducts', (t) => {
      //   t.uuid('productId').references('id').inTable(`${schema}.products`).onUpdate('cascade').onDelete('cascade');
      //   t.uuid('prescriptionId')
      //     .references('id')
      //     .inTable(`${schema}.prescriptions`)
      //     .onUpdate('cascade')
      //     .onDelete('cascade');

      //   t.timestamp('dateUpdated');
      //   t.timestamp('dateCreated');
      // });
    },
    down: async (knex, schema) => {
      await knex.schema.withSchema(schema).dropTable('prescriptions');
      // await knex.schema.withSchema(schema).dropTable('prescriptionsProducts');
    },
  },
] as Migration[];

export type Migration = {
  version: number;
  description: string;
  up(knex: Knex, schema: string): Promise<any>;
  down(knex: Knex, schema: string): Promise<any>;
};
