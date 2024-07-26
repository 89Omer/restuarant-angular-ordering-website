import { PaymentMethod } from "./payment-method.model";
import { User } from "./user.model";
import { Vendor } from "./vendor.model";

export class AppoiBookRequest {
  vendor_id: number=0;
  amount: number;
  date: string='';
  time_from: string='';
  time_to: string;
  duplicate_slots_allowed: number;
  meta: any;
  // is_guest: boolean;
  // customer_name: string;
  // customer_email: string;
  // customer_mobile: string;
  constructor() {
      this.meta = { person: "", note: "" };
      // this.is_guest = false;
      this.amount = 0;
      this.duplicate_slots_allowed = -1;
      this.time_to = "00:00";
  }
}

export class AppointeeList {
  id: number=0;
  meta: any;
  amount: number=0;
  amount_meta: number=0;
  date: string='';
  time_from: string='';
  time_to: string='';
  status: string='';
  is_guest: boolean=false;
  customer_name: string='';
  customer_email: string='';
  customer_mobile: string='';
  payment?: PaymentMethod;
  user?: User;
  vendor?: Vendor;
  created_at: string='';
  updated_at: string='';

  momentAppointment: any;
  type: string='';
  isPassed: boolean=false;
}
