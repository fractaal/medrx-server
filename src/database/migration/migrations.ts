import { Knex } from 'knex';

export const migrations = [
  
] as {version: number; description: string; up(knex: Knex): Promise<any>; down(knex: Knex): Promise<any>}[];
