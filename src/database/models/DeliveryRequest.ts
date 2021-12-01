import { CartItem } from './CartItem';

export interface Delivery {
  userId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  lat: number;
  lng: number;
  isAccepted: boolean;
  products: CartItem[];
}
