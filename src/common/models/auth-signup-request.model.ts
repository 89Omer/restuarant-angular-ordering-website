import { Constants } from "./constants.model";

export class SignUpRequest {
  name: string;
  email: string;
  password: string;
  mobile_number: string;
  image_url: string='';
  role: string;

  constructor() {
      this.name = "";
      this.email = "";
      this.password = "";
      this.mobile_number = "";
      this.role = Constants.ROLE_USER;
  }
}
