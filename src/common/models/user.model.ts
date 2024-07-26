export type User ={
  id: string;
  active: number;
  confirmed: number;
  mobile_verified: number;
  fcm_registration_id: string;
  name: string;
  email: string;
  mobile_number: string;
  mediaurls: { images: Array<any> };
  ratings: number;
  ratingscount: number;
  language: string;

  image_url: string;
}
