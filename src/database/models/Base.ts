import { Model } from 'objection';
import { knex } from '..';
import path from 'path';

Model.knex(knex);

export class Base extends Model {
  updatedAt!: string;
  createdAt!: string;

  static get modelPaths() {
    return [__dirname];
  }

  $beforeUpdate() {
    this.updatedAt = new Date().toISOString();
  }

  $beforeInsert() {
    this.createdAt = new Date().toISOString();
  }
}
