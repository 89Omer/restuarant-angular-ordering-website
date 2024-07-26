import { MyAddress } from "./address.model";
import { PaymentMethod } from "./payment-method.model";
import { Product } from "./product.model";
import { User } from "./user.model";
import { Vendor } from "./vendor.model";

export type OrderDeliveryProfile ={
    id: number;
    order_id: number;
    status: string;
    delivery: { id: number; latitude: string; longitude: string; meta: string; user: User };
}
export type OrderProductVendor ={
    id: number;
    price: number;
    sale_price: string;
    product_id: number;
    vendor_id: number;
    product: Product;
    vendor: Vendor;

    priceToShow: string;
    sale_priceToShow: string;
}
export type OrderProduct ={
    id: number;
    quantity: number;
    total: number;
    subtotal: number;
    order_id: number;
    vendor_product_id: number;
    vendor_product: OrderProductVendor;
    addon_choices: Array<OrderAddonChoices>;

    total_toshow: string;
    addonChoiceToShow: string;
}
export type OrderAddonChoices= {
    id: number;
    addon_choice: AddonChoice;
}
export type AddonChoice ={
    id: number;
    price: number;
    product_addon_group_id: number;
    title: string;
    created_at: string;
    updated_at: string;
    showChoicePrice: string;
}
export type OrderPayment= {
    id: number;
    payable_id: number;
    payer_id: number;
    amount: number;
    status: string;
    payment_method: PaymentMethod;
}
export type Order ={
    id: number;
    notes: string;
    meta: any;
    subtotal: number;
    taxes: number;
    delivery: OrderDeliveryProfile;
    delivery_fee: number;
    total: number;
    discount: number;
    type: string;
    scheduled_on: string;
    status: string;
    vendor_id: number;
    user: User;
    user_id: number;
    created_at: string;
    updated_at: string;
    vendor: Vendor;
    address: MyAddress;
    payment: OrderPayment;
    products: Array<OrderProduct>;

    total_toshow: string;
    subtotal_toshow: string;
    delivery_fee_toshow: string;
    discount_toshow: string;
    taxes_toshow: string;
    orderProgress: number;
    reviewed: boolean;
    order_type: string;
    is_guest: number;
}
