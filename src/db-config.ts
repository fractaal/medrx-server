import Logger from './logger'

const logger = Logger("DatabaseConfig")

export interface DatabaseConfig {
    connectionString: string;
    host: string;
    user: string;
    port: number;
    password: string;
    database: string;
    useSSL: boolean;
}

export function getDbConfig(): DatabaseConfig {
    
    let DB_URL = process.env.DB_URL ?? process.env.DATABASE_URL ?? process.env.CONNECTION_STRING

    if (
        (DB_URL || ( process.env.DB_HOST && process.env.DB_PASSWORD && process.env.DB_PORT && process.env.DB_USER ))
    ) {
        return {
            connectionString: DB_URL as string,
            host: process.env.DB_HOST as string,
            password: process.env.DB_PASSWORD as string,
            port: process.env.DB_PORT as unknown as number,
            user: process.env.DB_USER as string,
            database: process.env.DB_NAME ?? 'medrx-db' as string,
            useSSL: !!(process.env.DB_SSL ?? false)
        } as DatabaseConfig;
    } else {
        logger.error(`Database environment variables not set! Please set them before starting MedRx Server.`);
        process.exit(1);
    }
}
