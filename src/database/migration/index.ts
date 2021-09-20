import { knex } from '../'; // Get knex instance initialized by the database module
import { firestore } from 'firebase-admin';
import { migrations, Migration } from './migrations';
import Logger from '../../logger';

const logger = Logger('Migrations');

export const initialize = async () => {
  // Get regions registered in Firestore
  const regions = (await firestore().doc('/service/regions').get()).data();

  await Promise.all(
    Object.keys(regions as Record<string, any>).map(async (region, index) => {
      const transformedRegionName = region.replace(/ /g, '_').toUpperCase();
      logger.log(`🏁 Initializing schema for region ${region} (Schema name: ${transformedRegionName})`);
      await initializeSchema(transformedRegionName);
    })
  );
};

const initializeSchema = async (schema: string) => {
  logger.log(`⌛ Checking migrations and metadata statuses for ${schema}...`);
  await createMetadataTable(schema);

  const trueSchemaVersion = await getTrueSchemaVersion();
  const dbSchemaVersion = await getDbSchemaVersion(schema);

  if (dbSchemaVersion === trueSchemaVersion) {
    logger.success(`${schema} schema up to date.`);
  } else if (dbSchemaVersion > trueSchemaVersion) {
    logger.error(`Schema version mismatch! 
    ${schema} Schema Version: ${dbSchemaVersion} 
    True Schema Version: ${trueSchemaVersion}
    A newer version of this server may be present. Use that version instead.
    For data safety, I cannot continue. Exiting...`);
    process.exit(1);
  } else if (dbSchemaVersion < trueSchemaVersion) {
    for (let i = dbSchemaVersion; i < trueSchemaVersion; i++) {
      await migrate(migrations[i], schema);
    }
    logger.success(`${schema} schema update complete.`);
  } else {
    logger.error(`Something really weird happened...
    Database Schema Version: ${dbSchemaVersion}
    True Schema Version: ${trueSchemaVersion}
    This shouldn't happen at all...`);
    process.exit(1);
  }
};

const migrate = async (migration: Migration, schema: string, up = true) => {
  logger.log(
    `Updating ${schema} to version ${migration.version} - ${migration.description ?? 'No description provided'}`
  );
  await migration[up ? 'up' : 'down'](knex, schema);
  await knex('metadata')
    .withSchema(schema)
    .where({ key: 'schemaVersion' })
    .first()
    .update({ value: migration.version });
};

const createMetadataTable = async (schema: string) => {
  await knex.schema.createSchemaIfNotExists(schema);

  if (!(await knex.schema.withSchema(schema).hasTable('metadata'))) {
    logger.log(`${schema} seems to be a fresh new schema: Setting it up...`);
    await knex.schema.withSchema(schema).createTable('metadata', (t) => {
      t.string('key').notNullable();
      t.string('value').notNullable();
      t.increments('id').primary();
    });
    await knex('metadata').withSchema(schema).insert({ key: 'schemaVersion', value: '0' }).then();
  } else {
    logger.log(`${schema} looks like a compatible schema.`);
  }
};

const getDbSchemaVersion = async (schema: string) =>
  parseInt((await knex('metadata').withSchema(schema).where({ key: 'schemaVersion' }).first()).value) ?? 0;

const getTrueSchemaVersion = async () => migrations.length;
