import { Model } from 'objection';
import { knex } from '..';

Model.knex(knex);

export class Base extends Model {
  updatedAt!: string;
  createdAt!: string;

  $beforeUpdate() {
    this.updatedAt = new Date().toISOString();
  }

  $beforeInsert() {
    this.createdAt = new Date().toISOString();
  }
}
