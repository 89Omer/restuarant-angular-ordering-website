import { CommonService } from "../services/common.service";
import { Constants } from "./constants.model";
export class OrderRequest {

  address_id: number = 0;
  payment_method_id: number = 0;
  payment_method_slug: string = '';
  coupon_code: string = '';
  products: Array<{
    id: number;
    quantity: number;
    addons: Array<{ choice_id: number }>;
    addons_new: Array<any>;
  }>;
  meta: string = '';
  notes: string = ''; // add new customization "notes"
  order_type: string = ''; // add new customization "order type"
  new_amount_from_user: any;
  vendor_id:number=CommonService.vendorId?CommonService.vendorId:Constants.VENDOR_ID;
  branch_id?:number=0;
  commonService: any;
  constructor() {
    this.products = new Array<{
      id: number;
      quantity: number;
      addons: Array<{ choice_id: number }>;
      addons_new:Array<any>;
    }>();
  }
}
