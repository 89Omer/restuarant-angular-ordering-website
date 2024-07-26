import { Vendor } from "./vendor.model";


export type ProductVendor ={
    id: number;
    price: number;
    sale_price: number;
    sale_price_from: number;
    sale_price_to: number;
    stock_quantity: number;
    stock_low_threshold: number;
    product_id: number;
    vendor_id: number;
    vendor: Vendor;

    priceToShow: string;
    sale_priceToShow: string;
}
