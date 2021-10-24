/**
 * The CartItem is not a database model, so this is just an interface.
 */

export interface CartItem {
  productId: string;
  productName: string;
  productQuantity: number;
  productPrice: number;
  amount: number;
}
