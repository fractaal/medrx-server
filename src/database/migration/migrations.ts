import { Knex } from 'knex';

export const migrations = [
  {
    version: 1,
    description: 'Insert product table & vendors',
    up: async (knex, schema) => {
      await knex.schema.withSchema(schema).createTable('vendors', (t) => {
        t.uuid('id').primary().notNullable().defaultTo(knex.raw('gen_random_uuid()'));

        t.string('name').notNullable();
        t.string('content', 1000);
        t.string('city').notNullable();
        t.integer('rating');

        t.string('photoUrl');

        t.json('metadata');

        t.timestamp('updatedAt');
        t.timestamp('createdAt');
      });

      await knex.schema.withSchema(schema).createTable('products', (t) => {
        t.uuid('id').primary().notNullable().defaultTo(knex.raw('gen_random_uuid()'));
        t.uuid('vendorId').references('id').inTable(`${schema}.vendors`);

        t.string('name').notNullable();
        t.string('description');
        t.integer('price').notNullable();
        t.json('metadata');
        t.boolean('isPrescriptionRequired').notNullable();

        t.string('photoUrl');

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
