import { Model } from 'objection';
import { knex } from '..';
import path from 'path';

Model.knex(knex);

export class Base extends Model {
  dateUpdated!: string;
  dateCreated!: string;

  static get modelPaths() {
    return [__dirname];
  }

  $beforeUpdate() {
    this.dateUpdated = new Date().toISOString();
  }

  $beforeInsert() {
    this.dateCreated = new Date().toISOString();
  }
}
