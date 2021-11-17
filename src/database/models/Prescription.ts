import { Model } from 'objection';
import { Base } from './Base';
import Product from './Product';

export default class Prescription extends Base {
  id!: string;
  userId!: string;

  isValid!: boolean;
  isConfirmed!: boolean;

  dateSubmitted!: string;
  dateConfirmedOrCancelled!: string;

  products!: any[];

  static get tableName() {
    return 'prescriptions';
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
      // product: {
      //   relation: Model.ManyToManyRelation,
      //   modelClass: 'Product',
      //   join: {
      //     from: 'prescriptions.id',
      //     through: {
      //       from: 'prescriptionsProducts.prescriptionId',
      //       to: 'prescriptionsProducts.productId',
      //     },
      //     to: 'products.id',
      //   },
      // },
    };
  }
}
