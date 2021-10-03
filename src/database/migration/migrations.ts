import { Knex } from 'knex';

export const migrations = [
  {
    version: 1,
    description: 'Insert product table & vendors',
    up: async (knex, schema) => {
      await knex.schema.withSchema(schema).createTable('vendors', (t) => {
        t.increments('id').primary().notNullable();

        t.string('name').notNullable();
        t.string('content', 1000);
        t.string('city').notNullable();
        t.integer('rating');

        t.timestamp('updatedAt');
        t.timestamp('createdAt');
      });

      await knex.schema.withSchema(schema).createTable('products', (t) => {
        t.increments('id').primary().notNullable();
        t.integer('vendorId').references('id').inTable(`${schema}.vendors`);

        t.string('name').notNullable();
        t.string('description');
        t.integer('price').notNullable();
        t.json('metadata');
        t.boolean('isPrescriptionRequired').notNullable();

        t.timestamp('updatedAt');
        t.timestamp('createdAt');
      });
    },
    down: async (knex, schema) => {
      await knex.schema.withSchema(schema).dropTable('products');
      await knex.schema.withSchema(schema).dropTable('vendors');
    },
  },
] as Migration[];

export type Migration = {
  version: number;
  description: string;
  up(knex: Knex, schema: string): Promise<any>;
  down(knex: Knex, schema: string): Promise<any>;
};
