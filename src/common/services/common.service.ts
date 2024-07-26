import { Injectable } from '@angular/core';
import {
  catchError,
  Observable,
  of,
  tap,
  concat,
  shareReplay,
  map,
  forkJoin,
  BehaviorSubject,
} from 'rxjs';
import { Country } from '../models/country.model';
import { HttpClient } from '@angular/common/http';
import { Category } from '../models/category.model';
import { environment } from 'src/environments/environment';
import { MyAddress } from '../models/address.model';
import { HelperService } from './helper.service';
import { Vendor } from '../models/vendor.model';
import { AuthResponse } from '../models/auth-response.model';
import { PaymentMethod } from '../models/payment-method.model';
import { OrderRequest } from '../models/order-request.model';
import { OrderMultiVendor } from '../models/order-multi-vendor.model';
import {
  PaymentSenseData,
  PaymentSenseResponse,
} from '../models/paymentSense.model';
import { MyMeta } from '../models/meta.model';
import { Router } from '@angular/router';
import { SignUpRequest } from '../models/auth-signup-request.model';
import { Order } from '../models/order.model';
import { AppoiBookRequest } from '../models/table-booking.model';
import { concatMap, toArray } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdressPopupComponent } from '../components/adress-popup/adress-popup.component';
import { Constants } from '../models/constants.model';
import { Title } from '@angular/platform-browser';
import { SelectBranchComponent } from '../components/select-branch/select-branch.component';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  coords: any;
  selectedVendor!: Vendor;
  productsUpdate: BehaviorSubject<any> = new BehaviorSubject({});
  branchUpdate: BehaviorSubject<any> = new BehaviorSubject({});
  favIcon: HTMLLinkElement | null = document.querySelector('#favIcon');
 public vendorId!:number;
  static vendorId: any;
  constructor(
    private http: HttpClient,
    private helper: HelperService,
    private router: Router,
    private modalService: NgbModal,
    private titleService: Title
  ) {}
  checkUpdateLocation() {
    if (!localStorage.getItem('lat') && !localStorage.getItem('long')) {
      this.getCurrentLocation();
    }
  }

  getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(
      this.successCallback,
      this.errorCallback
    );
  }

  successCallback = (position: any) => {
    this.coords = position.coords;
    localStorage.setItem('lat', position.coords.latitude);
    localStorage.setItem('long', position.coords.longitude);
    localStorage.setItem('accuracy', position.coords.accuracy);
    this.router.navigate(['add-address']);
    // let myAddress:MyAddress={}
    //    this.helper.setAddressSelected()
  };
  errorCallback = (error: any) => {
    console.log(error);
  };

  public getCountries(): Observable<Array<Country>> {
    return this.http.get<Array<Country>>('./assets/json/countries.json').pipe(
      tap((data) => {
        let indiaIndex = -1;
        // if (data) {
        //   for (let i = 0; i < data.length; i++) {
        //     if (data[i].name == "India") {
        //       indiaIndex = i;
        //       break;
        //     }
        //   }
        // }
        if (indiaIndex != -1) data.unshift(data.splice(indiaIndex, 1)[0]);
      }),
      catchError(this.handleError<Array<Country>>('getCountries', []))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      // TODO: better job of transforming error for user consumption
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  public getCategoriesParents(scope?: string): Observable<Array<Category>> {
    let urlParams = new URLSearchParams();
    urlParams.append('pagination', '0');
    urlParams.append('parent', '1');
    if (scope) urlParams.append('scope', scope);
    return this.http
      .get<Array<Category>>(
        environment.apiBase + 'api/categories?' + urlParams.toString()
      )
      .pipe(
        tap((data) => {
          if (data && data.length)
            for (let cat of data) this.setupCategory(cat);
        })
        //, catchError(this.handleError<Array<Category>>('getCategoriesParents', this.getTestCategories()))
      );
  }

  private setupCategory(category: Category) {
    if (category.mediaurls && category.mediaurls.images)
      for (let imgObj of category.mediaurls.images)
        if (imgObj['default']) {
          category.image = imgObj['default'];
          break;
        }
    if (!category.image) category.image = 'assets/images/empty_image.png';
  }

  public getDemoAddress(): MyAddress {
    let toReturn: MyAddress = {
      id: -1,
      formatted_address: 'New York',
      latitude: '40.6971494',
      longitude: '-74.2598655',
      user_id: 0,
      title: '',
    };
    return toReturn;
  }

  public checkUser(checkUserRequest: any): Observable<{}> {
    return this.http.post<{}>(
      environment.apiBase + 'api/check-user',
      checkUserRequest
    );
  }

  public loginUser(loginTokenRequest: {
    token: string;
    role: string;
  }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(environment.apiBase + 'api/login', loginTokenRequest)
      .pipe(tap((data) => this.setupUserMe(data.user)));
  }

  private setupUserMe(data: any) {
    if (!data.mediaurls || !data.mediaurls.images)
      data.mediaurls = { images: [] };
    if (!data.image_url)
      for (let imgObj of data.mediaurls.images)
        if (imgObj['default']) {
          data.image_url = imgObj['default'];
          break;
        }
  }

  public getPaymentMethods(): Observable<Array<PaymentMethod>> {
    return this.http.get<Array<PaymentMethod>>(
      environment.apiBase + 'api/payment/methods'
    );
  }

  public getBalance(): Observable<{ balance: number }> {
    return this.http
      .get<{ balance: number }>(environment.apiBase + 'api/user/wallet/balance')
      .pipe(
        tap((data) => {
          if (!data.balance) data.balance = 0;
          data.balance = Number(
            this.helper.toFixedNumber(Number(data.balance))
          );
        })
      );
  }

  public createOrder(orderRequest: OrderRequest): Observable<OrderMultiVendor> {
    return this.http.post<OrderMultiVendor>(
      environment.apiBase + 'api/orders',
      orderRequest
    );
  }

  public getPaymentSenseData(payload: PaymentSenseData) {
    return this.http.post<PaymentSenseResponse>(
      environment.apiBase +
        'api/user/' +
        Constants.PAYMENT_SENSE +
        '/paymentsense/payment',
      payload
    );
  }
  public getStripeData(payload: any) {
    return this.http.post<any>(
      environment.apiBase + 'api/payment/stripe/' + Constants.STRIPE,
      payload
    );
  }

  public addressAdd(address: any): Observable<MyAddress> {
    delete address.user_id;
    delete address.meta;
    return this.http.post<MyAddress>(
      environment.apiBase + 'api/addresses',
      address
    );
  }

  public addressUpdate(address: any): Observable<MyAddress> {
    if (address == null) {
      address.meta = {};
    }
    return this.http.put<MyAddress>(
      environment.apiBase + 'api/addresses/' + address.id,
      address
    );
  }

  public getAddresses(): Observable<Array<MyAddress>> {
    return this.http.get<Array<MyAddress>>(
      environment.apiBase + 'api/addresses'
    );
  }

  public calculateDeliveryFee(
    vendorId: any,
    sourceLat: any,
    sourceLng: any,
    destLat: any,
    destLng: any
  ): Observable<{ delivery_fee: any }> {
    let urlParams = new URLSearchParams();
    urlParams.append('vendor_id', String(vendorId));
    urlParams.append('source_lat', String(sourceLat));
    urlParams.append('source_lng', String(sourceLng));
    urlParams.append('dest_lat', String(destLat));
    urlParams.append('dest_lng', String(destLng));
    urlParams.append('order_type', 'NORMAL'); //'order_type' => 'required|in:CUSTOM,NORMAL'

    // let distanceInMeter=this.helper.getDistanceBetweenTwoCoordinates(Number(sourceLat),Number(sourceLng),Number(destLat),Number(destLng))
    // let distance=this.helper.toFixedNumber(distanceInMeter/1000);
    // let settings=this.helper.getSettings();
    // let deliveryFee=Number(settings.find(f=>f.key=='delivery_fee')?.value)
    // let deliveryFeePerKm=Number(settings.find(f=>f.key=='delivery_fee_per_km_charge')?.value)
    // if(distance>1){
    //   let totalDeliveryFee=deliveryFeePerKm*(distance-1)
    //   deliveryFee=deliveryFee+ totalDeliveryFee
    // }
    // return of({delivery_fee:deliveryFee})
    return this.http.get<{ delivery_fee: any }>(
      environment.apiBase +
        'api/orders/calculate-delivery-fee?' +
        urlParams.toString()
    );
  }

  public getSettings(): Observable<Array<MyMeta>> {
    return this.http.get<Array<MyMeta>>(environment.apiBase + 'api/settings');
  }

  public createUser(signUpRequest: SignUpRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(environment.apiBase + 'api/register', signUpRequest)
      .pipe(tap((data) => this.setupUserMe(data.user)));
  }
  public login(payload: any): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(environment.apiBase + 'api/login/email', payload)
      .pipe(tap((data) => this.setupUserMe(data.user)));
  }

  public createAppointment(
    appointmentRequest: AppoiBookRequest,
    type?: string
  ): Observable<Order> {
    return this.http.post<Order>(
      `${environment.apiBase}api/${type ? type + '/booking' : 'appointment'}`,
      appointmentRequest
    );
    
  }

  public toggleVendorFavorite(productId: number): Observable<any> {
    return this.http.post<any>(
      environment.apiBase + 'api/vendors/favourites/' + productId,
      {}
    );
  }

  public getMenuItem(id?: number): Observable<Array<any>> {
    let vendorId = id ? id?.toString() : Constants.VENDOR_ID;
    return this.http
      .get<Array<any>>(environment.apiBase + 'api/products?vendor=' + vendorId)
      .pipe(
        tap((data) => {
          if (data && data.length) for (let cat of data) this.getMenuItem();
        })
        //, catchError(this.handleError<Array<Category>>('getCategoriesParents', this.getTestCategories()))
      );
  }
  public getPaginatedMenu(params: any): Observable<Array<any>> {
    return this.http
      .get<Array<any>>(environment.apiBase + 'api/products', { params: params })
      .pipe(
        tap((data) => {
          // if (data && data.length)
          //   for (let cat of data) {
          //     this.getMenuItem();
          //   }
        })
        //, catchError(this.handleError<Array<Category>>('getCategoriesParents', this.getTestCategories()))
      );
  }

  openAddressPopup(message?: any) {
    const modalRef = this.modalService.open(AdressPopupComponent, {
      windowClass: 'address-popup',
      centered: true,
      backdrop: true,
    });
    if (message) {
      modalRef.componentInstance.data = message;
    }
  }
  openBranchPopup(message?: any) {
    const modalRef = this.modalService.open(SelectBranchComponent, {
      windowClass: 'address-popup',
      centered: true,
      scrollable: true,
      backdrop: 'static',
      keyboard: false,
    });
    if (message) {
      modalRef.componentInstance.data = message;
    }
    modalRef.closed.subscribe(res=>{
      this.branchUpdate.next(true);
    })
  }

  setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  setFavIcon() {
    let vendor = localStorage.getItem('vendors')
      ? JSON.parse(localStorage.getItem('vendors') as string)
      : null;
    if (this.favIcon) {
      this.favIcon.href = vendor?.image
        ? vendor.image
        : 'assets/images/favicon_porto.ico';
    }
  }
}
