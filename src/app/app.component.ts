import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MyEventsService } from 'src/common/events/my-events.service';
import { MyAddress, getDemoAddress } from 'src/common/models/address.model';
import { CommonService } from 'src/common/services/common.service';
import { HelperService } from 'src/common/services/helper.service';
import * as firebase from 'node_modules/firebase/app';
import { environment } from 'src/environments/environment';
import { ECommerceService } from 'src/common/services/ecommerce.service';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { UiElementsService } from 'src/common/services/ui-elements.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdressPopupComponent } from 'src/common/components/adress-popup/adress-popup.component';
import { Constants } from 'src/common/models/constants.model';
import { VendorsService } from 'src/common/services/vendors.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'customer-web';
  rtlSide = 'left';
  windowScrolled = false;
  products: any[] = [];
  page: number = 1;
  subscriptions: Subscription = new Subscription();
  selectedLocation!: MyAddress;
  isLoading = false;
  percentage = 0;
  private routerSubscription: Subscription | undefined;
  private timer: any; // Timer variable

  constructor(
    private commonService: CommonService,
    private helper: HelperService,
    private translate: TranslateService,
    private myEvent: MyEventsService,
    private ecomService: ECommerceService,
    public router: Router,
    private uiElementService: UiElementsService,
    private vendorsService: VendorsService,
    private loadingController: NgxSpinnerService
    // private modalService: NgbModal,
  ) {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
    localStorage.removeItem('vendors');
    this.getVendorById()
    // for cache
    //localStorage.removeItem('products');
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.windowScrolled = this.isBranchComponent();
      }
    });
  }
  ngOnInit(): void {
    if (!this.helper.getAddressSelected()) {
      //this.commonService.openAddressPopup();
    }
    //this.commonService.openBranchPopup();
    let productsLoaded = false; // Flag to track if products are already loaded

    this.commonService.branchUpdate.subscribe(resp => {
      if (Object.keys(resp).length !== 0) {
        localStorage.removeItem('products');
        this.products = [];
        this.loadProducts();
        productsLoaded = true;
      }
    });


    // Check if products are not already loaded before calling loadProducts()
    if (!productsLoaded) {
      this.loadProducts();
      productsLoaded = true; // Set the flag to true to indicate that products are loaded
    }
    window.addEventListener('scroll', () => {
      this.windowScrolled = window.pageYOffset !== 0;
    });
    this.myEvent.getLanguageObservable().subscribe((value: any) => {
      this.globalize(value);
    });
    if (!this.helper.getAddressSelected()) {
      //this.helper.setAddressSelected(getDemoAddress())
    }
    // this.commonService.checkUpdateLocation();
    firebase.initializeApp({
      apiKey: environment.firebaseConfig.apiKey,
      authDomain: environment.firebaseConfig.authDomain,
      databaseURL: environment.firebaseConfig.databaseURL,
      projectId: environment.firebaseConfig.projectId,
      storageBucket: environment.firebaseConfig.storageBucket,
      messagingSenderId: environment.firebaseConfig.messagingSenderId,
    });
    this.refreshSettings();

    this.uiElementService.loadingStatus.subscribe((status: boolean) => {
      this.isLoading = status;
      if (status) {
        // Show spinner
        this.loadingController.show();
      } else {
        // Hide spinner
        this.loadingController.hide();
        // Reset percentage
        this.percentage = 0;
      }
    });

    // Subscribe to percentage changes
    this.uiElementService.percentage.subscribe((value: number) => {
      this.percentage = value;
    });
    this.uiElementService.setTotalSteps(10); // Set the total steps
    this.uiElementService.presentLoading('Loading');
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.urlAfterRedirects === '/restaurant') {
        // Start a timer when navigation to the restaurant page occurs
        this.timer = setTimeout(() => {
          // Check if the user is not logged in
          if (!this.helper.getLoggedInUser()) {
            // Show the address popup
            this.commonService.openAddressPopup();
          }
        }, 10000);
      }
    });
  }

  isBranchComponent(): boolean {
    return this.router.url.startsWith('/branch');
  }

  refreshSettings() {
    this.commonService.getSettings().subscribe(
      (res: any) => {

        this.helper.setSettings(res);
        this.ecomService.initialize();
      },
      (err) => console.log('getSettings', err)
    );
  }

  globalize(languagePriority: any) {
    this.translate.setDefaultLang('en');
    let defaultLangCode = 'en';
    this.translate.use(
      languagePriority && languagePriority.length
        ? languagePriority
        : defaultLangCode
    );
    this.setDirectionAccordingly(
      languagePriority && languagePriority.length
        ? languagePriority
        : defaultLangCode
    );
    this.helper.setLocale(
      languagePriority && languagePriority.length
        ? languagePriority
        : defaultLangCode
    );
    this.helper.setLanguageDefault(
      languagePriority && languagePriority.length
        ? languagePriority
        : defaultLangCode
    );
  }

  setDirectionAccordingly(lang: string) {
    switch (lang) {
      case 'ar': {
        this.rtlSide = 'rtl';
        break;
      }
      default: {
        this.rtlSide = 'ltr';
        break;
      }
    }
  }

  scrollToTop() {
    window.scrollTo(0, 0);
  }

  loadProducts() {
    let localProds = localStorage.getItem('products');

    if (!localProds) {
      this.getProducts();
    }
    else if (localProds) {
      let pros = JSON.parse(localProds);
      let vendorId=this.commonService.vendorId?this.commonService.vendorId:Constants.VENDOR_ID;
      if (pros[0]?.vendor_products[0]?.vendor?.id != vendorId) {
        localStorage.removeItem('products')
        this.loadProducts();
      }
      else {
        let lastUpdated = JSON.parse(
          localStorage.getItem('lastUpdated') as string
        ) as Date;
        if (lastUpdated) {
          // lastUpdated= new Date('04-01-2023')
          let currentDate = new Date();
          let Difference_In_Time =
            currentDate.getTime() - new Date(lastUpdated).getTime();
          // const diffTime = Math.abs(currentDate - lastUpdated);
          const diffDays = Difference_In_Time / (1000 * 3600 * 24);
          if (diffDays >= 1) {
            this.getProducts();
          }
        }
      }
      //setTimeout(() => {
      this.commonService.productsUpdate.next(true);
      // }, 1000);
    }
  }

  getProducts() {
    let vendorId=this.commonService.vendorId?this.commonService.vendorId: Constants.VENDOR_ID;
    let params = {
      vendor:vendorId,
      is_pagination: true,
      ppage: 200
    };
    this.subscriptions.add(
      this.commonService.getPaginatedMenu(params).subscribe(
        (res: any) => {
          vendorId=this.commonService.vendorId?this.commonService.vendorId: Constants.VENDOR_ID;
          this.uiElementService.dismissLoading();
          if (res) {
            //this.products = res.data;
            res.data.forEach((product: any) => {
              if(product?.vendor_products){
                if(product?.vendor_products[0]?.vendor_id==vendorId){
                  this.products.push(product);
                }
              }
              else{

                this.products.push(product);
              }
            });
            localStorage.setItem('products', JSON.stringify(this.products));
            localStorage.setItem('lastUpdated', JSON.stringify(new Date()));
            this.commonService.productsUpdate.next(true);
          }
          // if (this.page < res.meta?.last_page) {
          //   this.page = this.page + 1;
          //   this.loadProducts();
          // }
          //this.loadProducts();
          // if (this.products) {
          //   this.loadProducts();
          // }
          //  Helper.setHomeCategories(res);
        },
        (err) => {
          console.log('getCategoriesParents', err);
          this.uiElementService.dismissLoading();
          // this.isLoading = false;
        }
      )
    );
  }

  getVendorById() {
    this.selectedLocation = this.helper.getAddressSelected();
    const vendor = localStorage.getItem('vendors');
    if (!vendor)
      this.subscriptions.add(
        this.vendorsService.getVendorById(this.commonService.vendorId ? this.commonService.vendorId : Constants.VENDOR_ID).subscribe((res) => {
          if (res) {
            this.vendorsService.setupVendor(res, this.selectedLocation);
            localStorage.setItem('vendors', JSON.stringify(res));
            this.commonService.setTitle(res.name);
            this.commonService.setFavIcon();
            // this.setCategories(this.vendor, id);
          }
        })
      );
  }
}
