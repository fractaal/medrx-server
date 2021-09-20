import Knex from 'knex';
import Logger from '../logger';
import { initialize as _initialize } from './migration';
import { getDbConfig } from '../db-config';

const logger = Logger('Database');

// Init knex
logger.log('Initializing SQL query builder...');

const dbConfig = getDbConfig();

const connection = dbConfig.connectionString
  ? {
      connectionString: dbConfig.connectionString,
      ssl: dbConfig.useSSL ? { rejectUnauthorized: false } : false,
    }
  : {
      host: dbConfig.host,
      user: dbConfig.user,
      port: dbConfig.port,
      password: dbConfig.password,
      database: dbConfig.database,
      ssl: dbConfig.useSSL ? { rejectUnauthorized: false } : false,
    };

if (connection.connectionString) {
  logger.log(
    `Using the database connection string as it is present instead of the individual database connection options.`
  );
} else {
  logger.log(`Using individual database connection options.`);
}

export const knex = Knex({
  client: 'pg',
  useNullAsDefault: true,
  connection,
  pool: {
    max: 5,
  },
});

export async function initialize() {
  logger.log('Initializing database...');
  await _initialize();
}
