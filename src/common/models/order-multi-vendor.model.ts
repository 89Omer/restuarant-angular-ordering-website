import { Order, OrderPayment } from "./order.model";

export type OrderMultiVendor= {
  payment: OrderPayment;
  order: Order;
}
