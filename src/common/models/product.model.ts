import { Category } from './category.model';
import { ProductVendor } from './vendor-product.model';

export type Product = {
  id: number;
  title: string;
  detail: string;
  meta: any;
  price: number;
  sale_price: number;
  ratings: number;
  ratings_count: number;
  owner: string; //admin,vendor
  parent_id: number;
  attribute_term_id: number;
  mediaurls: { images: Array<any> };
  created_at: string;
  updated_at: string;
  categories: Array<Category>;
  vendor_products: Array<ProductVendor>;
  is_favourite: boolean;
  addon_groups: Array<ProductAddon>;

  reviewed: boolean;
  priceToShow: string;
  sale_priceToShow: string;
  images: Array<string>;
  vendorText: string;
  quantity: number;
  in_stock: boolean;
  addOnChoicesIsMust: boolean;
  cartId?: any;
};
export type ProductAddon = {
  id: number;
  title: string;
  product_id: number;
  min_choices: number;
  max_choices: number;
  addon_choices: Array<AddonChoices>;
  choose_group_choice?: any;
  selected?: boolean;
  addonToShow: string;
  choiceIdSelected: number;
  choices_style?: string;
};
export type AddonChoices = {
  id: number;
  title: string;
  price: number;
  product_addon_group_id: number;
  created_at: string;
  updated_at: string;
  quantity: number;
  priceToShow: string;
  selected: boolean;
};
