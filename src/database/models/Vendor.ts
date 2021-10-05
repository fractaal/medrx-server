import { Model } from 'objection';
import { Base } from './Base';

export default class Vendor extends Base {
  id!: number;

  name!: string;
  content!: string;
  city!: string;
  rating!: number;

  static get tableName() {
    return 'vendors';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      vendor: {
        relation: Model.HasManyRelation,
        modelClass: 'Product',
        join: {
          from: 'vendors.id',
          to: 'products.vendorId',
        },
      },
    };
  }
}
