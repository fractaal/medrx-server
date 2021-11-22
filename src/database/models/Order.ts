import { Base } from './Base';
import { CartItem } from './CartItem';

export default class Order extends Base {
  id!: string;
  userId!: string;
  prescriptionId!: string;

  isActive!: boolean;
  status!: string;
  products!: CartItem[];

  static get tableName() {
    return 'prescriptions';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {};
  }
}
