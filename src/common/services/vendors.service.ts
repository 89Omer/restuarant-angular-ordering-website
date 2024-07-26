import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { catchError, forkJoin, map, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MyAddress } from '../models/address.model';
import { BaseListResponse } from '../models/base-list.model';
import { Category } from '../models/category.model';
import { Order } from '../models/order.model';
import { Product, ProductAddon } from '../models/product.model';
import { AppointeeList } from '../models/table-booking.model';
import { Vendor } from '../models/vendor.model';
import { HelperService } from './helper.service';

@Injectable({
  providedIn: 'root'
})
export class VendorsService {
  private distance_metric = "mile";
  private reviewedIds = new Array<string>();
  private uuid: string = "xxx";
  private platform: string = "web";
  private currency_icon: string = '';
  public locale: string = '';

  constructor(private http: HttpClient,
    private helper: HelperService) { }

  public getVendorsForTypes(location: MyAddress, types: Array<string>) {
    //this.reloadSetting();
    let requests = [];
    for (let type of types) requests.push(this.getVendorsSort(location, type));
    return forkJoin(requests).pipe(catchError(error => of(error)));
  }

  reloadSetting() {
    this.currency_icon = this.helper.getSetting("currency_icon");
    this.locale = this.helper.getSetting("locale");
    let dm = this.helper.getSetting("distance_metric");
    if (dm) this.distance_metric = dm.toLowerCase();
  }

  public getVendorsSort(location: MyAddress, type: string, page?: number): Observable<Array<BaseListResponse>> {
    let urlParams = new URLSearchParams();
    urlParams.append("sort", String(type));
    urlParams.append("lat", String(location.latitude));
    urlParams.append("long", String(location.longitude));
    if (page) urlParams.append("page", String(page)); else urlParams.append("pagination", String(0));
    return this.http.get<Array<BaseListResponse>>(environment.apiBase + "api/vendors/list?" + urlParams.toString()).pipe(tap((data: any) => {
      //let locale = Helper.getLocale();
      if (data.data && data.data.length) data.data.map((vendor: any) => this.setupVendor(vendor, location));
    })
    );
  }

  public getVendorsFavorite(): Observable<Array<Vendor>> {
    let currentLocation = this.helper.getAddressSelected();
    return this.http.get<Array<Vendor>>(environment.apiBase + "api/vendors/favourites/list").pipe(tap(data => {
      let locale = this.helper.getLocale();
      if (data && data.length) data.map(vendor => { this.setupVendor(vendor, currentLocation, locale); });
    })
      //, catchError(this.handleError<BaseListResponse>('getProductsWithCategoryId', this.getTestProducts()))
    );
  }

  setupVendor(vendor: Vendor, location: MyAddress, locale?: string) {
    if (!vendor.mediaurls || !vendor.mediaurls.images) vendor.mediaurls = { images: [] };
    vendor.image = "assets/images/empty_image.png";
    for (let imgObj of vendor.mediaurls.images) if (imgObj["default"]) { vendor.image = imgObj["default"]; break; }

    if (!vendor.ratings) vendor.ratings = 0.0;
    vendor.ratings = Number(this.helper.toFixedNumber(Number(vendor.ratings)));

    vendor.categories_text = '';
    if (vendor.categories && vendor.categories.length)
      for (let cat of vendor.categories)
        vendor.categories_text += cat.title + ', ';
    if (vendor.categories_text.length)
      vendor.categories_text = vendor.categories_text.substring(
        0,
        vendor.categories_text.length - 2
      );
      let branches:any[]=[];
      if(vendor.meta['branchForm']){
        for(let i=0; i<vendor.meta['branchForm']?.branches?.length;i++){
          let branch=vendor.meta['branchForm']?.branches[i];
          if(branch.latitude && branch.longitude){
            branch['distance']=this.helper.getCustomdistance( Number(branch.latitude),
      Number(branch.longitude),
      location ? Number(location.latitude) : 0,
      location ? Number(location.longitude) : 0,
      this.distance_metric);
      branch['distance_toshow']=this.helper.formatDistance(branch?.distance, this.distance_metric) +
      ' ' +
      this.distance_metric;
      branches.push(branch);
          }
        }
        branches= branches.sort((a,b)=>{
          return a.distance-b.distance;
        });
      }
    vendor.distance = this.helper.getCustomdistance(
      Number(vendor.latitude),
      Number(vendor.longitude),
      location ? Number(location.latitude) : 0,
      location ? Number(location.longitude) : 0,
      this.distance_metric
    );
    // if(branches.length>0){
    //   vendor.branches=branches;
    // }
    // else{
      vendor.branches=branches;
      vendor.distance_toshow =
      this.helper.formatDistance(vendor.distance, this.distance_metric) +
      ' ' +
      this.distance_metric;
    // }



    if (typeof vendor.meta == "string") vendor.meta = JSON.parse(vendor.meta as string);
    if (!vendor.meta) vendor.meta = {};
    if (vendor.meta.opening_time) vendor.opening_time_toshow = this.helper.formatMillisTime(Number(vendor.meta.opening_time), locale ? locale : "en").toString();
    if (vendor.meta.closing_time) vendor.closing_time_toshow = this.helper.formatMillisTime(Number(vendor.meta.closing_time), locale ? locale : "en").toString();
  }
  public getVendorsWithQuery(location: MyAddress, query: string, page?: number): Observable<BaseListResponse> {
    //  this.reloadSetting();
    let urlParams = new URLSearchParams();
    urlParams.append("search", query);
    if (page) urlParams.append("page", String(page)); else urlParams.append("pagination", "0");
    urlParams.append("lat", String(location.latitude));
    urlParams.append("long", String(location.longitude));
    return this.http.get<BaseListResponse>(environment.apiBase + "api/vendors/list?" + urlParams.toString()).pipe(tap(data => {
      let locale = this.helper.getLocale();
      if (data && data.data && data.data.length) { data.data.map(vendor => this.setupVendor(vendor, location, locale)); }
    })
      //, catchError(this.handleError<BaseListResponse>('getProductsWithCategoryId', this.getTestProducts()))
    );
  }

  public getVendorProducts(vendor_id: number, page?: number, per_page?: number, title?: string): Observable<BaseListResponse> {
    // this.reloadSetting();
    let urlParams = new URLSearchParams();
    urlParams.append("vendor", String(vendor_id));
    if (page) {
      urlParams.append("page", String(page));
    }
    if (per_page) {
      urlParams.append('ppage', String(per_page))
    }
    if (title) {
      urlParams.append('title', title);
    }
    return this.http.get<BaseListResponse>(environment.apiBase + "api/products?" + urlParams.toString()).pipe(tap(data => {
      if (data && data.data && data.data.length) for (let pro of data.data) this.setupProduct(pro);
    })
      //, catchError(this.handleError<BaseListResponse>('getProductsWithCategoryId', this.getTestProducts()))
    );
  }

  public getHomePageProducts(id: number, category: number): Observable<BaseListResponse> {
    // this.reloadSetting();
    let queryParams = `vendor=${id}&category=${category}`;
    return this.http.get<BaseListResponse>(environment.apiBase + "api/products?" + queryParams).pipe(tap(data => {
      if (data && data.data && data.data.length) for (let pro of data.data) this.setupProduct(pro);
    })
      //, catchError(this.handleError<BaseListResponse>('getProductsWithCategoryId', this.getTestProducts()))
    );
  }

  public setupProduct(product: Product) {
    if (product.addon_groups) {
      product.addon_groups = product.addon_groups.sort((g1: ProductAddon, g2: ProductAddon) => {
        return g1.min_choices < g2.min_choices ? 1 : (g1.min_choices > g2.min_choices ? -1 : 0);
      });
      for (let group of product.addon_groups) {
        if (!product.addOnChoicesIsMust) product.addOnChoicesIsMust = group.min_choices > 0;
        if (group.addon_choices) {
          for (let choice of group.addon_choices) {
            if (!choice.price) choice.price = 0;
            choice.priceToShow = this.currency_icon + this.helper.toFixedNumber(Number(choice.price));
          }
        }
      }
    }

    product.vendorText = "";
    if (product.vendor_products && product.vendor_products.length) {
      for (let vp of product.vendor_products) {
        if (vp.vendor && vp.sale_price) product.sale_price = vp.sale_price;
        vp.priceToShow = this.currency_icon + this.helper.toFixedNumber(Number(vp.price));
        product.in_stock = vp.stock_quantity != 0;

        if (vp.vendor) {
          if (!vp.vendor.mediaurls || !vp.vendor.mediaurls.images) vp.vendor.mediaurls = { images: [] };
          vp.vendor.image = "assets/images/empty_image.png";
          for (let imgObj of vp.vendor.mediaurls.images) if (imgObj["default"]) { vp.vendor.image = imgObj["default"]; break; }

          product.vendorText += (vp.vendor.name + ", ");
        }
      }
    }
    if (product.vendorText.length) product.vendorText = product.vendorText.substring(0, product.vendorText.length - 2);

    if (!product.ratings) product.ratings = 0;
    if (!product.ratings_count) product.ratings_count = 0;
    if (!product.price) product.price = 0;
    // if (product.priceWithAddon) {
    //   product.priceWithAddonToShow = this.currency_icon + product.priceWithAddon.toFixed(2);
    // } else {
    //   product.priceWithAddon = 0;
    // };
    product.ratings = Number(this.helper.toFixedNumber(Number(product.ratings)));

    product.priceToShow = this.currency_icon + this.helper.toFixedNumber(Number(product.price));
    if (product.sale_price) product.sale_priceToShow = this.currency_icon + this.helper.toFixedNumber(Number(product.sale_price));

    if (product.categories && product.categories.length) {
      for (let cat of product.categories) this.setupCategory(cat);
    }

    product.images = new Array<string>();
    if (product.mediaurls && product.mediaurls.images) for (let imgObj of product.mediaurls.images) if (imgObj["default"]) product.images.push(imgObj["default"]);
    if (!product.images.length) product.images.push("assets/images/empty_image.png");

    if (typeof product.meta == "string") product.meta = JSON.parse(product.meta as string);
    if (!product.meta) product.meta = {};
    if (!product.meta.food_type) product.meta.food_type = "veg";
    product.meta.food_type = String(product.meta.food_type).includes("non") ? "non_veg" : "veg";
    if (!product.meta.ingredients) product.meta.ingredients = [];
    try {
      delete product.meta.discounted_price;
    } catch (e) { console.log(e); }
  }

  private setupCategory(category: Category) {
    if (category.mediaurls && category.mediaurls.images) for (let imgObj of category.mediaurls.images) if (imgObj["default"]) { category.image = imgObj["default"]; break; }
    if (!category.image) category.image = "assets/images/empty_image.png";
  }

  public getVendors(urlParams: URLSearchParams): Observable<BaseListResponse> {
    this.reloadSetting();
    return this.http.get<BaseListResponse>(environment.apiBase + "api/vendors/list?" + urlParams.toString());
  }

  public getVendorById(id: number): Observable<Vendor> {
    return this.http.get<Vendor>(environment.apiBase + "api/vendors/" + id);
  }
  public getVendorBranches(id: number):  Observable<BaseListResponse> {
    return this.http.get<BaseListResponse>(environment.apiBase + "api/vendors/list?parent_id=" + id);
  }

  getVendor(id: number): Observable<boolean> {
    return this.getVendorById(id).pipe(map((res: any) => {
      if (res) {
        localStorage.setItem('vendors', JSON.stringify(res));
        return true;
      }
      else {
        return false;
      }
    }));
  }
  public getOrders(userId: string): Observable<BaseListResponse> {
    this.reloadSetting();
    this.reloadItemsReviewed();
    let urlParams = new URLSearchParams();
    // urlParams.append("user", String(userId));
    // urlParams.append("page", String(pageNo));
    return this.http.get<BaseListResponse>(environment.apiBase + "api/orders?" + urlParams).pipe(tap(data => {
      if (data && data.data && data.data.length) this.setupOrderRemoveUnfilled(data.data);
      for (let order of data.data) this.setupOrder(order);
    }));
  }
  reloadItemsReviewed() {
    this.reviewedIds = this.helper.getReviewedProductIds();
  }
  private setupOrderRemoveUnfilled(data: Array<Order>) {
    let found = false;
    for (let i = 0; i < data.length; i++) {
      if (!data[i].products || !data[i].products.length || !data[i].vendor) {
        found = true;
        data.splice(i, 1);
      }
    }
    if (found) this.setupOrderRemoveUnfilled(data);
  }

  private setupOrder(order: Order) {
    order.created_at = this.helper.formatTimestampDateTime(order.created_at, this.locale);
    if (order.scheduled_on) order.scheduled_on = this.helper.formatTimestampDate(order.scheduled_on, this.locale);

    order.total_toshow = this.currency_icon + this.helper.toFixedNumber(Number(order.total));
    order.subtotal_toshow = this.currency_icon + this.helper.toFixedNumber(Number(order.subtotal));
    if (order.delivery_fee) order.delivery_fee_toshow = this.currency_icon + this.helper.toFixedNumber(Number(order.delivery_fee));
    if (order.discount) order.discount_toshow = this.currency_icon + this.helper.toFixedNumber(Number(order.discount));
    if (order.taxes) order.taxes_toshow = this.currency_icon + this.helper.toFixedNumber(Number(order.taxes));

    for (let product of order.products) {
      if (product.addon_choices && product.addon_choices.length) {
        product.addon_choices.map(group => {
          product.addonChoiceToShow = product.addonChoiceToShow ? product.addonChoiceToShow + ", " + group.addon_choice.title : group.addon_choice.title;
          group.addon_choice.showChoicePrice = this.currency_icon + group.addon_choice.price;
        })
      }
      product.total_toshow = this.currency_icon + this.helper.toFixedNumber(Number(product.total));
      if (product.vendor_product) {
        if (!product.vendor_product.price) product.vendor_product.price = 0;
        product.vendor_product.priceToShow = this.currency_icon + this.helper.toFixedNumber(Number(product.vendor_product.price));
        if (product.vendor_product.sale_price) product.vendor_product.sale_priceToShow = this.currency_icon + this.helper.toFixedNumber(Number(product.vendor_product.sale_price));
        if (product.vendor_product.product) {
          if (!product.vendor_product.product.price) product.vendor_product.product.price = 0;
          product.vendor_product.product.priceToShow = this.currency_icon + this.helper.toFixedNumber(Number(product.vendor_product.product.price));

          product.vendor_product.product.images = new Array<string>();
          if (product.vendor_product.product.mediaurls && product.vendor_product.product.mediaurls.images) for (let imgObj of product.vendor_product.product.mediaurls.images) if (imgObj["default"]) product.vendor_product.product.images.push(imgObj["default"]);
          if (!product.vendor_product.product.images.length) product.vendor_product.product.images.push("assets/images/empty_image.png");
        }
      }

    }
    //custom
    order.reviewed = (this.reviewedIds && this.reviewedIds.includes(String(String(order.vendor_id) + String(order.id))));

    let address: MyAddress = order.address;
    if (order.address && order.address.latitude) address.latitude = order.address.latitude;
    if (order.address && order.address.longitude) address.longitude = order.address.longitude;
    if (order.vendor) this.setupVendor(order.vendor, address);

    if (order.delivery) {
      order.delivery.delivery.user.image_url = "assets/images/empty_dp.png";
      if (!order.delivery.delivery.user.mediaurls || !order.delivery.delivery.user.mediaurls.images) order.delivery.delivery.user.mediaurls = { images: [] };
      for (let imgObj of order.delivery.delivery.user.mediaurls.images) if (imgObj["default"]) { order.delivery.delivery.user.image_url = imgObj["default"]; break; }
    }

    if (order.user) {
      if (!order.user.mediaurls || !order.user.mediaurls.images) order.user.mediaurls = { images: [] };
      order.user.image_url = "assets/images/empty_dp.png";
      for (let imgObj of order.user.mediaurls.images) if (imgObj["default"]) { order.user.image_url = imgObj["default"]; break; }
    }

    if (order.order_type) order.order_type = order.order_type.toLowerCase();
    //order.order_type = order.order_type.toLowerCase();
  }

  public getAppointmentList(userId: string, pageNo: number): Observable<BaseListResponse> {
    let urlParams = new URLSearchParams();
    urlParams.append("appointer", String(userId));
    if (pageNo) urlParams.append("page", String(pageNo));
    return this.http.get<BaseListResponse>(environment.apiBase + "api/appointment?" + urlParams).pipe(tap(data => {
      if (data && data.data && data.data.length) this.setupAppointmenRemoveUnfilled(data.data);
      for (let appoint of data.data) this.setupAppointment(appoint, moment());
    }));
  }

  private setupAppointmenRemoveUnfilled(data: Array<Order>) {
    let found = false;
    for (let i = 0; i < data.length; i++) {
      if (!data[i].vendor) {
        found = true;
        data.splice(i, 1);
      }
    }
    if (found) this.setupAppointmenRemoveUnfilled(data);
  }

  setupAppointment(appointment: AppointeeList, momentNow: moment.Moment) {
    if (!appointment.meta) appointment.meta = {};
    if (!appointment.status) appointment.status = "pending";
    appointment.momentAppointment = moment(appointment.date + " " + appointment.time_from);
    appointment.isPassed = momentNow > appointment.momentAppointment;

    appointment.updated_at = this.helper.formatTimestampDateTime(appointment.updated_at, this.locale);
    appointment.time_from = this.helper.formatTimestampTime(appointment.date + 'T' + appointment.time_from + 'Z', this.locale);
    appointment.date = this.helper.formatTimestampDayMonth(appointment.date, this.locale);
    if (appointment.user) {
      if (!appointment.user.mediaurls || !appointment.user.mediaurls.images) appointment.user.mediaurls = { images: [] };
      appointment.user.image_url = "assets/images/empty_dp.png";
      for (let imgObj of appointment.user.mediaurls.images) if (imgObj["default"]) { appointment.user.image_url = imgObj["default"]; break; }
    }
    if (appointment.vendor) {
      if (!appointment.vendor.mediaurls || !appointment.vendor.mediaurls.images) appointment.vendor.mediaurls = { images: [] };
      appointment.vendor.image = "assets/images/empty_dp.png";
      for (let imgObj of appointment.vendor.mediaurls.images) if (imgObj["default"]) { appointment.vendor.image = imgObj["default"]; break; }
    }
  }

  public getProductsByCategory(
    vendorId: number,
    categoryId: number
  ): Observable<BaseListResponse> {
    return this.http.get<BaseListResponse>(
      environment.apiBase +
      `api/products?vendor=${vendorId}&category=${categoryId}`
    );
  }
}
