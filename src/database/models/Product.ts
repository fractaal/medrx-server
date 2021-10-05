import { Model } from 'objection';
import { Base } from './Base';

export default class Product extends Base {
  id!: number;
  vendorId!: number;

  name!: string;
  description!: string;
  price!: number;
  metadata!: Record<string, any>;
  isPrescriptionRequired!: boolean;

  static get tableName() {
    return 'products';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      vendor: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'Vendor',
        join: {
          from: 'products.vendorId',
          to: 'vendors.id',
        },
      },
    };
  }
}
