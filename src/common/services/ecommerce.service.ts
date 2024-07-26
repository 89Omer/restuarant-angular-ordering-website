import { Injectable, Optional } from '@angular/core';
import { MyAddress } from '../models/address.model';
import { Coupon } from '../models/coupon.model';
import { OrderRequest } from '../models/order-request.model';
import { PaymentMethod } from '../models/payment-method.model';
import { Product } from '../models/product.model';
import { HelperService } from './helper.service';
import { CommonService } from './common.service';
import { Constants } from '../models/constants.model';

export class CartItemAddOn {
  id: number;
  title: string;
  price: number;
  priceToShow: string;
  addon_choices: any[];
  choose_group_choice?: any;
  choices_style?: string;

  constructor(
    id: number,
    title: string,
    price: number,
    priceToShow: string,
    addon_choices: any[],
    choose_group_choice: any
  ) {
    this.id = id;
    this.title = title;
    this.price = price;
    this.priceToShow = priceToShow;
    this.addon_choices = addon_choices;
    this.choose_group_choice = choose_group_choice;
  }
}

export class CartItem {
  id: string = '';
  title: string = '';
  subtitle: string = '';
  image: string = '';
  price: number = 0;
  priceAddOn: number = 0;
  priceToShow: string = '';
  quantity: number = 0;
  total: number = 0;
  addOns: Array<CartItemAddOn> = [];
  addons_new: Array<any> = [];
  product: any;
  meta: any; // add new customization "meta"
  constructor(public helper: HelperService) {}
  setQuantity(newQuantity: number) {
    this.quantity = newQuantity;
    this.total = (this.price + this.priceAddOn) * this.quantity;
  }

  getTotal(fixFloatingPoint: boolean): number {
    return fixFloatingPoint
      ? Number(this.helper.toFixedNumber(Number(this.total)))
      : this.total;
  }

  getTotalBase(fixFloatingPoint: boolean): number {
    let totalBase = this.price * this.quantity;
    return fixFloatingPoint
      ? Number(this.helper.toFixedNumber(Number(totalBase)))
      : totalBase;
  }

  public static fromSaved(savedCartItem: CartItem): CartItem {
    let helper: HelperService = new HelperService();
    let toReturn: CartItem = new CartItem(helper);
    toReturn.id = savedCartItem.id;
    toReturn.title = savedCartItem.title;
    toReturn.subtitle = savedCartItem.subtitle;
    toReturn.image = savedCartItem.image;
    toReturn.price = savedCartItem.price;
    toReturn.priceAddOn = savedCartItem.priceAddOn;
    toReturn.priceToShow = savedCartItem.priceToShow;
    toReturn.quantity = savedCartItem.quantity;
    toReturn.total = savedCartItem.total;
    toReturn.product = savedCartItem.product;
    toReturn.addOns = savedCartItem.addOns; // add new customization "verdor"
    toReturn.meta = savedCartItem.meta;
    return toReturn;
  }
}

export class ExtraCharge {
  id: string = '';
  title: string = '';
  price: number = 0;
  isPercent: boolean = false;
  priceToShow: string = '';
  extraChargeObject: any;
}

export class Cart {
  static KEY_CART: string = 'hungerz_cart_three';
  reachingTime: number = 0;
  cartItems: Array<CartItem> = [];
  extraCharges: Array<ExtraCharge> = [];
  deliveryType: string = 'normal';
  static restore(): Cart {
    let toReturn = new Cart();
    toReturn.cartItems = new Array<CartItem>();
    toReturn.extraCharges = new Array<ExtraCharge>();
    toReturn.deliveryType = 'normal';
    let savedCart = Cart.getSavedCart();
    if (savedCart) {
      if (savedCart.extraCharges && savedCart.extraCharges.length)
        toReturn.extraCharges = savedCart.extraCharges;
      if (savedCart.cartItems && savedCart.cartItems.length)
        for (let sCi of savedCart.cartItems)
          toReturn.cartItems.push(CartItem.fromSaved(sCi));
    }

    return toReturn;
  }

  removeExtraCharge(extraChargeId: string) {
    let currIndex = -1;
    for (let i = 0; i < this.extraCharges.length; i++) {
      if (this.extraCharges[i].id == extraChargeId) {
        currIndex = i;
        break;
      }
    }
    if (currIndex != -1) this.extraCharges.splice(currIndex, 1);
  }

  addExtraCharge(extraCharge: ExtraCharge) {
    this.extraCharges.unshift(extraCharge);
  }

  getTotalCartItems(fixFloatingPoint: boolean): number {
    let helper: HelperService = new HelperService();
    let toReturn = 0;
    for (let ci of this.cartItems) {
      let itemPrice = +ci.price;
      ci.addOns.forEach((addon: any) => {
        itemPrice += +addon.price;
        if (addon && addon.addon_choices)
          addon.addon_choices.forEach((choice: any) => {
            // if (choice.quanity == undefined || !choice.quanity) {
            //   choice.quanity = 1;
            // }
            if (choice.quanity) {
              choice.quantity = choice.quanity;
            }
            if (!choice.quantity) {
              choice.quantity = 1;
            }

            itemPrice += +choice.price * choice.quantity; // quanity is added
          });
      });
      itemPrice *= ci.quantity;
      toReturn += itemPrice;
    }
    return fixFloatingPoint
      ? Number(helper.toFixedNumber(Number(toReturn)))
      : toReturn;
  }

  getTotalCardWithOut() {}

  getTotalCart(fixFloatingPoint: boolean): number {
    let subTotal = this.getTotalCartItems(false);
    let tax_in_percent = 0;
    let delivery_fee = 0;
    let coupon = 0;
    let service_fee = 0;
    for (let ec of this.extraCharges) {
      if (ec.id == 'tax_in_percent') {
        tax_in_percent = ec.isPercent ? (subTotal * ec.price) / 100 : ec.price;
        //tax_in_percent = 0.6;
        continue;
      }
      if (ec.id == 'delivery_fee') {
        //delivery_fee = ec.price;
        delivery_fee = ec.price;
        continue;
      }
      if (ec.id == 'coupon') {
        coupon = ec.isPercent ? (subTotal * ec.price) / 100 : ec.price;
        continue;
      }
      if (ec.id == 'service_fee') {
        service_fee = ec.price;
      }
    }

    let helper: HelperService = new HelperService();

    let toReturn =
      subTotal + tax_in_percent + delivery_fee + service_fee - coupon;
    return fixFloatingPoint
      ? Number(helper.toFixedNumber(Number(toReturn)))
      : toReturn;
  }

  static getSavedCart(): Cart {
    return JSON.parse(window.localStorage.getItem(Cart.KEY_CART) as string);
  }

  static setSavedCart(cartToSave: Cart | null) {
    let cache:[]=[];
    window.localStorage.setItem(Cart.KEY_CART, JSON.stringify(cartToSave,(key, value)=> {
      //this function is for circular reference error
      if (typeof value === "object" && value !== null) {
        if (cache.indexOf(value as never) !== -1) {
          // Circular reference found, discard key
          return;
        }
        // Store value in our collection
        cache.push(value as never);
      }
      return value;
    })
   );
   cache=[];
  }
}

@Injectable({
  providedIn: 'root',
})
export class ECommerceService {
  private myCart!: Cart;
  private orderRequest: OrderRequest | null = null;
  private orderMeta: any;

  constructor(private helper: HelperService) {
    this.initialize();
  }

  initialize() {
    this.myCart = Cart.restore();
    let tax_in_percent = this.helper.getSetting('tax_in_percent');
    let delivery_fee = this.helper.getSetting('delivery_fee');
    let currency_icon = this.helper.getSetting('currency_icon');
    let subTotal = this.getCartItemsTotal(false);

    this.myCart.removeExtraCharge('delivery_fee');
    this.myCart.removeExtraCharge('tax_in_percent');
    if (tax_in_percent != null && Number(tax_in_percent) > 0) {
      let ec = new ExtraCharge();
      ec.extraChargeObject = tax_in_percent;
      ec.id = 'tax_in_percent';
      ec.title = 'Service Fee';
      ec.isPercent = true;
      ec.price = Number(tax_in_percent);
      // ec.priceToShow = ec.price + "%";
      ec.priceToShow = currency_icon + (subTotal * ec.price) / 100;
      this.myCart.addExtraCharge(ec);
    }
    if (delivery_fee != null && Number(delivery_fee) > 0) {
      let ec = new ExtraCharge();
      ec.extraChargeObject = delivery_fee;
      ec.id = 'delivery_fee';
      ec.title = 'Delivery Fee';
      ec.isPercent = false;
      ec.price = Number(delivery_fee);
      ec.priceToShow = currency_icon + ec.price;
      this.myCart.addExtraCharge(ec);
    }
  }

  clearCart() {
    Cart.setSavedCart(null);
    this.initialize();
    this.orderMeta = null;
    this.orderRequest = null;
  }

  getCartItemsWithProductId(proId: number): Array<CartItem> {
    let toReturn: Array<CartItem> = [];
    for (let ci of this.myCart.cartItems)
      if (this.getProductIdFromCartItemId(ci.id) == proId) toReturn.push(ci);
    return toReturn;
  }

  removeCartItemWithProductId(proId: number): boolean {
    let index = -1;
    for (let i = 0; i < this.myCart.cartItems.length; i++) {
      if (
        this.getProductIdFromCartItemId(this.myCart.cartItems[i].product.id) ==
        proId
      ) {
        index = i;
        break;
      }
    }
    if (index != -1) {
      this.myCart.cartItems.splice(index, 1);
      Cart.setSavedCart(this.myCart);
    }
    return index != -1;
  }

  removeCartItemWithId(cartId: any) {
    let itemIndex = this.myCart.cartItems.findIndex((f) => f.id == cartId);
    if (itemIndex != -1) {
      this.myCart.cartItems.splice(itemIndex, 1);
      Cart.setSavedCart(this.myCart);
    }
  }

  getCartItems(): Array<CartItem> {
    for (let index = 0; index < this.myCart.cartItems.length; index++) {
      if (this.myCart.cartItems[index].quantity == 0) {
        this.myCart.cartItems.splice(index);
      }
    }
    return this.myCart.cartItems;
  }

  getDeliveryTpe(): string {
    return Cart.getSavedCart() ? Cart.getSavedCart().deliveryType : 'normal';
  }

  getReachingTime(): number {
    return Cart.getSavedCart() ? Cart.getSavedCart().reachingTime : 5;
  }

  setReachingTime(time: number) {
    this.myCart.reachingTime = time;
    Cart.setSavedCart(this.myCart);
  }

  setDeliveryType(type: string) {
    this.myCart.deliveryType = type;
    if (type == 'takeaway') {
      this.myCart.removeExtraCharge('delivery_fee');
    } else {
      let delivery_fee = this.helper.getSetting('delivery_fee');
      let currency_icon = this.helper.getSetting('currency_icon');
      let ec = new ExtraCharge();
      if (localStorage.getItem('vendors')) {
        let vendor = JSON.parse(localStorage.getItem('vendors') as string);
        if(vendor.branches?.length && vendor.branches[0].distance<vendor.distance)
        {
          if (
            vendor.branches[0].distance <= vendor.exceeding_delivery_distance &&
            this.myCart.getTotalCartItems(true) >= vendor.maximum_delivery_amount
          ) {
            delivery_fee = '0';
          } else if (
            vendor.branches[0].distance >= 0 &&
            vendor.branches[0].distance < 1 &&
            vendor.branches[0].distance > vendor.exceeding_delivery_distance
          ) {
            delivery_fee = vendor.mile_0;
          } else if (vendor.branches[0].distance >= 1 && vendor.branches[0].distance < 2) {
            delivery_fee = vendor.mile_1;
          } else if (vendor.branches[0].distance >= 2 && vendor.branches[0].distance < 3) {
            delivery_fee = vendor.mile_2;
          } else if (vendor.branches[0].distance >= 3 && vendor.branches[0].distance < 4) {
            delivery_fee = vendor.mile_3;
          } else if (vendor.branches[0].distance >= 4 && vendor.branches[0].distance < 5) {
            delivery_fee = vendor.mile_4;
          } else if (vendor.branches[0].distance >= 5 && vendor.branches[0].distance < 6) {
            delivery_fee = vendor.mile_5;
          } else if (vendor.branches[0].distance >= 6 && vendor.branches[0].distance < 7) {
            delivery_fee = vendor.mile_6;
          } else if (vendor.branches[0].distance >= 7) {
            delivery_fee = vendor.mile_7;
          }
        }
        else if (
          vendor.distance <= vendor.exceeding_delivery_distance &&
          this.myCart.getTotalCartItems(true) >= vendor.maximum_delivery_amount
        ) {
          delivery_fee = '0';
        } else if (
          vendor.distance >= 0 &&
          vendor.distance < 1 &&
          vendor.distance > vendor.exceeding_delivery_distance
        ) {
          delivery_fee = vendor.mile_0;
        } else if (vendor.distance >= 1 && vendor.distance < 2) {
          delivery_fee = vendor.mile_1;
        } else if (vendor.distance >= 2 && vendor.distance < 3) {
          delivery_fee = vendor.mile_2;
        } else if (vendor.distance >= 3 && vendor.distance < 4) {
          delivery_fee = vendor.mile_3;
        } else if (vendor.distance >= 4 && vendor.distance < 5) {
          delivery_fee = vendor.mile_4;
        } else if (vendor.distance >= 5 && vendor.distance < 6) {
          delivery_fee = vendor.mile_5;
        } else if (vendor.distance >= 6 && vendor.distance < 7) {
          delivery_fee = vendor.mile_6;
        } else if (vendor.distance >= 7) {
          delivery_fee = vendor.mile_7;
        }
      }
      ec.extraChargeObject = delivery_fee;
      ec.id = 'delivery_fee';
      ec.title = 'Delivery Fee';
      ec.isPercent = false;
      ec.price = Number(delivery_fee);
      ec.priceToShow = currency_icon + ec.price;
      if (!this.myCart.extraCharges.find((f) => f.id != ec.id)) {
        this.myCart.addExtraCharge(ec);
      }
    }
    if (localStorage.getItem('vendors')) {
      let vendor = JSON.parse(localStorage.getItem('vendors') as string);
      let currency_icon = this.helper.getSetting('currency_icon');
      this.myCart.removeExtraCharge('service_fee');
      if (vendor.service_fees) {
        let ec = new ExtraCharge();
        ec.id = 'service_fee';
        ec.title = 'Service Fee';
        ec.isPercent = false;
        ec.price =
          (this.getCartItemsTotal(true) * Number(vendor.service_fees)) / 100;
        ec.priceToShow = currency_icon + ec.price;
        if (!this.myCart.extraCharges.find((f) => f.id != ec.id)) {
          this.myCart.addExtraCharge(ec);
        }
      }
    }
    Cart.setSavedCart(this.myCart);
  }

  getExtraCharges(): Array<ExtraCharge> {
    if (localStorage.getItem('vendors')) {
      let vendor = JSON.parse(localStorage.getItem('vendors') as string);
      let currency_icon = this.helper.getSetting('currency_icon');
      if (vendor.service_fees) {
        let ec = new ExtraCharge();
        ec.id = 'service_fee';
        ec.title = 'Service Fee';
        ec.isPercent = false;
        ec.price =
          (this.getCartItemsTotal(true) * Number(vendor.service_fees)) / 100;
        ec.priceToShow = currency_icon + ec.price;
        if (!this.myCart.extraCharges.find((f) => f.id == 'service_fee')) {
          this.myCart.addExtraCharge(ec);
        }
      }
    }
    if (Cart.getSavedCart().deliveryType == 'takeaway') {
      this.myCart.removeExtraCharge('delivery_fee');
    } else {
      let delivery_fee = this.helper.getSetting('delivery_fee');
      let currency_icon = this.helper.getSetting('currency_icon');
      let ec = new ExtraCharge();
      if (localStorage.getItem('vendors')) {
        let vendor = JSON.parse(localStorage.getItem('vendors') as string);
        if (
          vendor.distance <= vendor.exceeding_delivery_distance &&
          this.myCart.getTotalCartItems(true) >= vendor.maximum_delivery_amount
        ) {
          delivery_fee = '0';
        } else if (vendor.distance >= 0 && vendor.distance < 1) {
          delivery_fee = vendor.mile_0;
        } else if (vendor.distance >= 1 && vendor.distance < 2) {
          delivery_fee = vendor.mile_1;
        } else if (vendor.distance >= 2 && vendor.distance < 3) {
          delivery_fee = vendor.mile_2;
        } else if (vendor.distance >= 3 && vendor.distance < 4) {
          delivery_fee = vendor.mile_3;
        } else if (vendor.distance >= 4 && vendor.distance < 5) {
          delivery_fee = vendor.mile_4;
        } else if (vendor.distance >= 5 && vendor.distance < 6) {
          delivery_fee = vendor.mile_5;
        } else if (vendor.distance >= 6 && vendor.distance < 7) {
          delivery_fee = vendor.mile_6;
        } else if (vendor.distance >= 7) {
          delivery_fee = vendor.mile_7;
        }
      }
      ec.extraChargeObject = delivery_fee;
      ec.id = 'delivery_fee';
      ec.title = 'Delivery Fee';
      ec.isPercent = false;
      ec.price = Number(delivery_fee);
      ec.priceToShow = currency_icon + ec.price;
      if (!this.myCart.extraCharges.find((f) => f.id == 'delivery_fee')) {
        this.myCart.addExtraCharge(ec);
      } else if (
        this.myCart.extraCharges.find((f) => f.id == 'delivery_fee')?.price !=
        Number(delivery_fee)
      ) {
        this.myCart.removeExtraCharge('delivery_fee');
        this.myCart.addExtraCharge(ec);
      }
    }

    return this.myCart.extraCharges;
  }

  getCartItemsCount(): number {
    return this.myCart.cartItems.length;
  }

  getCartItemsTotal(fixFloatingPoint: boolean): number {
    return this.myCart.getTotalCartItems(fixFloatingPoint);
  }

  getCartTotal(fixFloatingPoint: boolean): number {
    return this.myCart.getTotalCart(fixFloatingPoint);
  }

  calculateExtraChargePiceToShow(
    ec: ExtraCharge,
    fixFloatingPoint: boolean
  ): number {
    let totalPrice = 0;
    this.myCart.cartItems.forEach((f) => {
      let itemsPrice = 0;
      itemsPrice += +f.price;
      f.addOns.forEach((ao) => {
        itemsPrice += +ao.price;
        ao.addon_choices.forEach((choice: any) => {
          itemsPrice += +choice.price;
        });
      });
      itemsPrice = itemsPrice * f.quantity;
      totalPrice = totalPrice + itemsPrice;
    });
    //let ecCharge = 0.6; //price fixed client requirement
    let ecCharge = 0; //price fixed client requirement

    if (ec.id == 'tax_in_percent') {
      ecCharge = (totalPrice * ec.price) / 100;
    }

    if (ec.id !== 'tax_in_percent')
      ecCharge = ec.isPercent ? (totalPrice * ec.price) / 100 : ec.price;
    return fixFloatingPoint
      ? Number(this.helper.toFixedNumber(Number(ecCharge)))
      : ecCharge;
  }

  isExistsCartItem(ci: CartItem): boolean {
    let index = -1;
    for (let i = 0; i < this.myCart.cartItems.length; i++) {
      if (this.myCart.cartItems[i].id == ci.id) {
        index = i;
        break;
      }
    }
    return index != -1;
  }

  getCartProductQuantity(proId: number): number {
    let quantity = 0;
    for (let ci of this.getCartItemsWithProductId(proId))
      quantity += ci.quantity;
    return quantity;
  }

  addOrIncrementCartItem(ci: CartItem): boolean {
    let index = -1;
    for (let i = 0; i < this.myCart.cartItems.length; i++) {
      if (this.myCart.cartItems[i].id == ci.id) {
        index = i;
        break;
      }
    }
    if (index == -1) {
      this.myCart.cartItems.push(ci);
    } else {
      this.myCart.cartItems[index].setQuantity(ci.quantity);
      // ci.setQuantity(this.myCart.cartItems[index].quantity);
      this.myCart.cartItems[index] = ci;
    }
    Cart.setSavedCart(this.myCart);
    return index == -1;
  }

  removeOrDecrementCartItem(ci: CartItem): boolean {
    let index = -1;
    for (let i = 0; i < this.myCart.cartItems.length; i++) {
      if (this.myCart.cartItems[i].id == ci.id) {
        index = i;
        break;
      }
    }
    let removed = false;
    if (index != -1) {
      if (this.myCart.cartItems[index].quantity > 1) {
        ci.setQuantity(this.myCart.cartItems[index].quantity - 1);
        this.myCart.cartItems[index] = ci;
      } else {
        removed = true;
        this.myCart.cartItems.splice(index, 1);
      }
      Cart.setSavedCart(this.myCart);
    }
    return removed;
  }

  //custom IMPLEMENTATION below.

  setDeliveryFee(deliveryFee: any) {
    if (deliveryFee) {
      let deliveryFeeExtraChargeIndex = -1;
      for (let i = 0; i < this.myCart.extraCharges.length; i++) {
        if (this.myCart.extraCharges[i].id == 'delivery_fee') {
          deliveryFeeExtraChargeIndex = i;
          break;
        }
      }
      if (deliveryFeeExtraChargeIndex != -1) {
        this.myCart.extraCharges[deliveryFeeExtraChargeIndex].price =
          deliveryFee;
        this.myCart.extraCharges[deliveryFeeExtraChargeIndex].priceToShow =
          this.helper.getSetting('currency_icon') + deliveryFee;
      } else {
        let ec: ExtraCharge = {
          id: 'delivery_fee',
          price: deliveryFee,
          title: 'Delivery fee',
          priceToShow: deliveryFee,
          isPercent: false,
          extraChargeObject: {},
        };
        this.myCart.addExtraCharge(ec);
      }
    }
  }

  removeCoupon() {
    this.myCart.removeExtraCharge('coupon');
    Cart.setSavedCart(this.myCart);
  }

  //custom COUPON implementation below

  applyCoupon(coupon: Coupon) {
    this.myCart.removeExtraCharge('coupon');

    if (coupon != null) {
      let ec = new ExtraCharge();
      ec.extraChargeObject = coupon;
      ec.id = 'coupon';
      ec.title = coupon.title;
      ec.isPercent = coupon.type == 'percent';
      ec.price = Number(coupon.reward);
      ec.priceToShow = ec.price + '%';

      this.myCart.addExtraCharge(ec);

      this.setupOrderRequestBase();
      if (this.orderRequest) {
        this.orderRequest.coupon_code = coupon.code;
      }
    } else {
      this.setupOrderRequestBase();
      if (this.orderRequest) {
        this.orderRequest.coupon_code = '';
      }
    }

    Cart.setSavedCart(this.myCart);
  }

  //custom PRODUCT implementation below

  genCartItemFromProduct(
    product: Product,
    addOns: Array<CartItemAddOn>
  ): CartItem {
    let addonsSelected = product.addon_groups.filter((f) => f.selected);
    let addons_new = [];
    for (let ao of addonsSelected) {
      addons_new.push({ group_id: ao.id });
    }
    let ci = new CartItem(this.helper);
    ci.addons_new = addons_new;
    ci.addOns = addOns && addOns.length ? addOns : [];
    // if (product.addon_groups) {
    //   for (let group of product.addon_groups) {
    //     if (group.addon_choices) {
    //       for (let choice of group.addon_choices) {
    //         if (choice.selected) ci.addOns.push({ id: choice.id, title: choice.title, price: choice.price, priceToShow: choice.priceToShow });
    //         choice.selected = false;
    //       }
    //     }
    //   }
    // }
    ci.id = String(
      product.vendor_products && product.vendor_products[0]
        ? product.vendor_products[0].id
        : product.id
    );
    if (ci.addOns.length) {
      ci.id += '+';
      for (let ao of ci.addOns) ci.id += ao.id + '_';
      ci.id.substring(0, ci.id.lastIndexOf('_'));
    }
    let addOnPrice = 0;
    for (let ao of ci.addOns) addOnPrice += ao.price;
    ci.price = product.price;
    //sale_price adjustment
    if (product.sale_price) {
      ci.price -= product.price;
      ci.price += product.sale_price;
    }
    ci.priceAddOn = addOnPrice;
    ci.title = product.title;
    ci.subtitle =
      product.categories && product.categories[0]
        ? product.categories[0].title
        : product.detail;
    ci.image = product.images?.[0];
    ci.product = product;
    ci.meta = product.meta; // add new customization "meta"
    let vendor =
      product.vendor_products &&
      product.vendor_products[0] &&
      product.vendor_products[0].vendor
        ? product.vendor_products[0].vendor
        : null;
    if (vendor) {
      ci.meta['vendor_id'] = vendor.id;
      ci.meta['vendor_name'] = vendor.name;
      ci.meta['vendor_lat'] = Number(vendor.latitude);
      ci.meta['vendor_lng'] = Number(vendor.longitude);
    }
    if (product.quantity == 0) {
      ci.setQuantity(0);
    } else {
      ci.setQuantity(1);
    }
    return ci;
  }

  //custom ORDERREQUEST implementation below

  getOrderRequest(): OrderRequest | null {
    if (this.orderRequest) {
      this.orderRequest.products = [];
      if (!this.orderRequest.order_type) {
        let cartstringify = localStorage.getItem('hungerz_cart_three');
        if (cartstringify && JSON.parse(cartstringify)) {
          let cart = JSON.parse(cartstringify);
          this.myCart.deliveryType = cart.deliveryType;
          this.orderRequest.order_type = cart.deliveryType;
        }
        // this.orderRequest.order_type = this.myCart.deliveryType;
      }
      for (let ci of this.myCart.cartItems) {
        ci.addons_new = [];
        let addonChoiceId = [];
        if (ci.addOns)
          for (let ciAddOn of ci.addOns) {
            ci.addons_new.push({ group_id: ciAddOn.id });
            if (ci.product.addon_groups) {
              for (let addon_choices of ciAddOn.addon_choices) {

                if (addon_choices.quantity > 0) {
                  for (var it = 0; it < addon_choices.quantity; it++)
                    addonChoiceId.push({ choice_id: addon_choices?.id });
                } else {
                  addonChoiceId.push({ choice_id: addon_choices?.id });
                }
              }
            }
          }
        this.orderRequest.products.push({
          id: this.getProductIdFromCartItemId(ci.id),
          quantity: ci.quantity,
          addons: addonChoiceId,
          addons_new: ci.addons_new,
        });
        if (this.helper.getAddressSelected()) {
          this.orderRequest.address_id = this.helper.getAddressSelected().id;
        }
      }
      let vendor = JSON.parse(localStorage.getItem('vendors') as string);
      if(vendor.id){
        this.orderRequest.vendor_id=vendor.id;
      }
      if(vendor.branches?.length && vendor.branches[0].distance<vendor.distance){
        this.orderRequest.branch_id=vendor.branches[0].branch_id
      }
      else {
        delete(this.orderRequest.branch_id);
      }
    }
    if (this.orderRequest) {
      this.orderRequest.new_amount_from_user =
        this.applyingDiscountOnTotalPrice(
          this.getCartTotal(true),
          this.getDiscount(this.getCartItems())
        ).toFixed(2);
      if (this.orderMeta != null)
        this.orderRequest.meta = JSON.stringify(this.orderMeta);
    }
    return this.orderRequest;
  }

  applyingDiscountOnTotalPrice(total: number, disscount: number) {
    // return +total - +disscount;
    return total - disscount;
  }

  getDiscount(items: any[]): number {
    let discount = 0;
    items.forEach((item) => {
      let doubleDeal = item.addOns.filter(
        (f: any) => f.choose_group_choice == 2
      );
      if (doubleDeal && doubleDeal.length) {
        let choices: any[] = [];
        doubleDeal.forEach((deal: any) => {
          discount = discount + Number(deal.price);
          let foundCho = deal.addon_choices[0];
          choices.push(foundCho);
        });
        if (choices.length > 1) {
          let doubleDealPrice = Number(
            doubleDeal.find((f: any) => Number(f.price) > 0).price
          );
          choices.sort((a, b) => {
            return b.price - a.price;
          });
          let priceToReduce = choices[1].price - doubleDealPrice;
          if (priceToReduce && priceToReduce > 0) {
            discount = discount + priceToReduce;
          }
        }
        // return addonPrice * quantity;
      }
    });
    return discount;
  }

  setupOrderRequestBase() {
    if (this.orderRequest == null) this.orderRequest = new OrderRequest();
    if (this.orderMeta == null) this.orderMeta = {};
  }

  setupOrderRequestAddress(address: MyAddress) {
    if (address) {
      this.setupOrderRequestBase();
      if (this.orderRequest) this.orderRequest.address_id = address.id;
    }
  }

  setupOrderRequestPaymentMethod(paymentMethod: PaymentMethod) {
    this.setupOrderRequestBase();
    if (this.orderRequest) {
      this.orderRequest.payment_method_id = paymentMethod.id;
      this.orderRequest.payment_method_slug = paymentMethod.slug;
      const hungerz_cart_three: any =
        localStorage.getItem('hungerz_cart_three');
      if (hungerz_cart_three)
        this.orderRequest.order_type = hungerz_cart_three.deliveryType;
    }
  }

  setupOrderRequestMeta(key: string, value: string) {
    this.setupOrderRequestBase();
    this.orderMeta[key] = value;
  }

  hasOrderRequestMetaKey(key: string): boolean {
    this.setupOrderRequestBase();
    return this.orderMeta[key] != null;
  }

  removeOrderRequestMeta(key: string) {
    this.setupOrderRequestBase();
    this.orderMeta[key] = null;
  }
  // add new customization "notes"
  setupOrderRequestNotes(value: string) {
    this.setupOrderRequestBase();
    if (this.orderRequest) this.orderRequest.notes = value;
  }

  // add new customization "order type"
  setupOrderRequestOrder_type(value: string) {
    this.setupOrderRequestBase();
    if (this.orderRequest) this.orderRequest.order_type = value;
    if (this.orderRequest && this.orderRequest.order_type == 'NORMAL')
      this.initialize();
    else this.myCart.removeExtraCharge('delivery_fee');
  }
  getOrderRequestOrder_type() {
    return this.orderRequest?.order_type;
  }

  getProductIdFromCartItemId(cartItemId: any): number {
    let ciId = String(cartItemId);
    return Number(ciId.includes('+') ? ciId.split('+')[0] : ciId);
  }
}
