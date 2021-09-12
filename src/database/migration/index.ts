/**
 * This file should handle database migrations for uninitialized databases. 
 */
import { knex } from '../';
import Logger from '../../logger';
import { migrations } from './migrations';

const activeSchemaVersion = migrations.length;

const logger = Logger('Migration');

export async function getDbSchemaVersion(): Promise<string> {
  let value: string;
  try {
    value = (await knex('metadata').where({key: 'schemaVersion'}).first().then()).value;
  } catch(err) {
    value = '0';
  }
  return value;
}

export async function dbStatusCheck() {
  logger.log("Checking database status...");
  try {
    const metadataTableExists = await knex.schema.hasTable("metadata");

    if (!metadataTableExists) {
      logger.log("This seems to be a fresh new database (for me!) Performing migrations...")
      await migrateToLatest();
    } else {
      logger.log("Existing compatible database found. Checking its schema version against mine...");
      const value = await getDbSchemaVersion();
      logger.log(`Active schema version: ${activeSchemaVersion} | Database schema version: ${value}`)
      if (activeSchemaVersion == parseInt(value)) {
        logger.success("Schema versions match! We are good to go!");
      } else if (activeSchemaVersion > parseInt(value)) {
        logger.warn(`Schema version mismatch ${activeSchemaVersion} > ${parseInt(value)}. Performing migrations...`);
        await migrateToLatest();
      } else {
        logger.error(`Schema version mismatch ${activeSchemaVersion} < ${parseInt(value)}
        A newer version of this server may be present. Use that version instead.
        For data safety, I cannot continue. Exiting...`);
        process.exit(1);
      }
      /**
       * Metadata table exists. This means that this backend has worked on this database before. However, the versions may not be alike. 
       * If they aren't, perform migrations that make it up to date. 
       * If the version is higher, refuse to start backend. 
       */
    }
  } catch(err) {
    logger.error(`While trying to determine database status - ${err}`);
    process.exit(1);
  }
}

export async function migrateToLatest() {
  let activeSchemaVersion = parseInt(await getDbSchemaVersion());
  if (activeSchemaVersion === migrations.length) {
    logger.warn('Database schema version is already the latest version.');
    return;
  } else if (activeSchemaVersion > migrations.length) {
    logger.error('Database schema version has a version higher than the latest version known by this server!');
    throw new Error('Database schema version higher than latest schema version in database migrations.');
  } else {
    for (let i = activeSchemaVersion+1; i<(migrations.length+1); i++) {
      await migrate(i);
    }
  }
}

export async function migrate(version: number) {
  const activeSchemaVersion = parseInt(await getDbSchemaVersion());

  logger.log(`Performing migration to version ${version} (from version ${activeSchemaVersion})`)
  logger.log(`Schema v${version} desription: ${migrations[version-1].description}`);

  if (version == activeSchemaVersion) {
    logger.warn('Version to migrate to and database schema version is the same! Aborting...');
    return;
  } else if (Math.abs(version - activeSchemaVersion) !== 1) {
    logger.warn('Version to migrate to and database schema version are not adjacent (Version diff is not 1)! For data safety, this operation is aborted.');
    return;
  } else if ((version - activeSchemaVersion) === -1) {
    logger.warn('Version to migrate to is lower than the database schema version! For data safety, this operation is aborted.');
    return;
  }
  
  await migrations[version-1].up(knex);

  if (await getDbSchemaVersion() === '0') {
    await knex.insert({key: 'schemaVersion', value: version.toString()}).into('metadata');
  } else {
    await knex('metadata').select('*').where({key: 'schemaVersion'}).first().update({key: 'schemaVersion', value: version.toString()}).then();
  }

  logger.success(`Migration to version ${version} complete!`);
}