import { Base } from './Base';

export default class Prescription extends Base {
  id!: string;
  userId!: string;
  isValid!: boolean;
  isConfirmed!: boolean;
  dateSubmitted!: string;
  dateConfirmedOrCancelled!: string;
  products!: any[];
  remarks!: string;

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
