import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin, map, Subscription } from 'rxjs';
import { MyAddress } from 'src/common/models/address.model';
import { BaseListResponse } from 'src/common/models/base-list.model';
import { Category } from 'src/common/models/category.model';
import { Product } from 'src/common/models/product.model';
import { Vendor } from 'src/common/models/vendor.model';
import { CommonService } from 'src/common/services/common.service';
import { ECommerceService } from 'src/common/services/ecommerce.service';
import { HelperService } from 'src/common/services/helper.service';
import { UiElementsService } from 'src/common/services/ui-elements.service';
import { VendorsService } from 'src/common/services/vendors.service';
import { DataService } from '../data.service';
import { Constants } from 'src/common/models/constants.model';
import * as moment from 'moment';
import { AppoiBookRequest } from 'src/common/models/table-booking.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  weekDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  persons!: Array<number>;

  // restaurants: any[] = [
  //   {
  //     id: 1,
  //     name: 'Food world',
  //     banner: 'assets/img/gallery/food-world.png',
  //     image: 'assets/img/gallery/food-world-logo.png',
  //     ratingCount: 46,
  //     rating: 4.5,
  //   },
  //   {
  //     id: 2,
  //     name: 'Pizza hub',
  //     banner: 'assets/img/gallery/pizza-hub.png',
  //     image: 'assets/img/gallery/pizzahub-logo.png',
  //     ratingCount: 50,
  //     rating: 4,
  //   },
  //   {
  //     id: 3,
  //     name: 'Donuts hut',
  //     banner: 'assets/img/gallery/donuts-hut.png',
  //     image: 'assets/img/gallery/donuts-hut-logo.png',
  //     ratingCount: 40,
  //     rating: 5,
  //   },
  //   {
  //     id: 4,
  //     name: 'Ruby tuesday',
  //     banner: 'assets/img/gallery/ruby-tuesday.png',
  //     image: 'assets/img/gallery/ruby-tuesday-logo.png',
  //     ratingCount: 60,
  //     rating: 3.5,
  //   },
  //   {
  //     id: 5,
  //     name: 'Kuakata Fried Chicken',
  //     banner: 'assets/img/gallery/kuakata.png',
  //     image: 'assets/img/gallery/kuakata-logo.png',
  //     ratingCount: 50,
  //     rating: 4.5,
  //   },
  //   {
  //     id: 6,
  //     name: 'Taco bell',
  //     banner: 'assets/img/gallery/taco-bell.png',
  //     image: 'assets/img/gallery/taco-bell-logo.png',
  //     ratingCount: 42,
  //     rating: 5,
  //   },
  // ];
  // categories: Category[]=[];
  categories: Array<{ category: Category; menu_items: Array<Product> }> = [];
  private pageNo = 1;
  filteredCategories: Array<{
    category: Category;
    menu_items: Array<Product>;
  }> = [];
  private subscriptions = new Array<Subscription>();
  private loadedCount = 0;
  selectedLocation!: MyAddress;
  vendor!: Vendor;
  isLoading = true;
  private allDone = false;
  private startTime: string = 'N/A';
  private endTime: string = 'N/A';

  foods = new Array<Product>();
  private vendorTypes = [
    { name: 'new', title: 'new' },
    { name: 'popular', title: 'most_popular' },
    { name: 'ratings', title: 'best_rated' },
    { name: 'discounted', title: 'discounted_restaurant' },
  ];
  vendorsArray = new Array<{
    vendorType: { name: string; title: string };
    vendors_fir: Array<Vendor>;
    vendors_sec: Array<Vendor>;
  }>();
  public search: boolean = false;
  id: number = this.commonService.vendorId?this.commonService.vendorId:Constants.VENDOR_ID;
  tabIndexString = '';
  private activeCatId = -1;
  dIsOpen = true;
  vendors = new Array<Vendor>();
  products: any[] = [];
  showSkeleton: boolean = true;
  dates: Array<{ month: number; monthText: string; dates: Array<Date> }> = [];
  appointmentRequest = new AppoiBookRequest();
  datesToShow: Array<Date> = [];
  dateSelected!: Date;
  timeSelected!: string;
  select_month: string = '2';
  monthSelected = 0;
  availabilityTimes = new Array<{ time: string; timeValue: string }>();
  private use24HourFormat = true;
  private minutesApart = 30;

  constructor(
    public router: Router,
    public commonService: CommonService,
    private vendorService: VendorsService,
    private helper: HelperService,
    private translate: TranslateService,
    private uiElementService: UiElementsService,
    private spinnerService: NgxSpinnerService,
    private eComService: ECommerceService,
    private route: ActivatedRoute,
    private _dataService: DataService,
    private modalService: NgbModal,
  ) {}

  slideConfig = {
    slidesToShow: 4,
    slidesToScroll: 4,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    margin: '15px',
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  slides = [
    {
      img: 'assets/gallery/images/banner-01.jpg',
      /* title: 'Non - Veg',*/
    },
    {
      img: 'assets/gallery/images/banner-02.jpg',
    },
    {
      img: 'assets/gallery/images/banner-03.jpg',
    },
    {
      img: 'assets/gallery/images/banner-04.jpg',
    },
    {
      img: 'assets/gallery/images/banner-05.jpg',
    },
    {
      img: 'assets/gallery/images/banner-06.jpg',
    },
  ];

  slideBannerConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 2000,
    infinite: true,
    cssEase: 'ease-in-out',
    loop: true,
    arrows: true,
    fade: true,
    margin: '0px',
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

testimonials = [
    {
      title: '.You are really great. Most pizza shops are like car mechanics. Dirty shops and dirty clothes... but you are great.  I was the last customer of this store tonight, all the extras are thrown away and thats what made me write my review. I drive 6 miles to buy from you because cleanliness and quality are very important to me. Sometimes I wait twenty minutes, but Im happy.  I eat clean food and your staff are polite and friendly. I love your chicken pizza and spicy pepperoni.thank',
      customerName:'Majid Ali',
      /* title: 'Non - Veg',*/
    },
    {
      title: 'If you happen to be at Chillingham Road and youre looking for straightforward takeaway pizzas, this is a place Id recommend',
      customerName: 'Docs on Vacay',
    },
    {
      title: 'No matter the time, its 110% best around.! From Pizza to Kababs, you are gonna love it,  if you re a garlic sauce lover, then W.T.S 😋Enjoy. Superb staff. ',
      customerName: 'S Ri',
    },
    {
      title: 'Excellent food and service, I would recommend it to everyone',
      customerName: 'Miran Ali',
    },
    {
      title: 'Ordered 5 chicken strips and got 6. Best day of my life',
      customerName: 'Coonor',
    },
    {
      title: 'Pure lush pizza in kebab chilli garlic lush salad would of been a bit better with red in white cabbage but enjoyed it thank you',
      customerName: 'Brian Anderson',
    },
    {
      title: 'First time ordering from here and it wont be the last I ordered a tandoori chicken kebab which arrived on time and hot aswell as being extremely fresh it tasted amazing the service from the guy on the phone was fantastic I will be telling my friends about this place for sure',
      customerName: 'Kevin Buck',
    },
  ];


  slideTestimonialConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 2000,
    infinite: true,
    loop: true,
    arrows: false,
    fade: false,
    margin: '20px',
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
        },
      },
    ],
  };

  ngOnInit(): void {
    if (this.router.url.includes('search')) {
      this.search = true;
      this.route.queryParams.subscribe((param) => {
        if (param['searchQuery']) {
          let query = param['searchQuery'];
          this.doSearch(query);
          this.showSkeleton = false;
        }
      });
    } else {
      this.search = false;
    }
    this.selectedLocation = this.helper.getAddressSelected();
    this.translate.get('loading').subscribe((value) => {
      this.uiElementService.presentLoading(value);
      //  this.loadCategories();
      this.getVendorById(this.id);

      // this.loadMenu();
    });
    // this.spinnerService.show();
    this.commonService.branchUpdate.subscribe(resp=>{
      if(resp){
        this.id=this.commonService.vendorId?this.commonService.vendorId:Constants.VENDOR_ID;
        this.getVendorById(this.id,true);

      }})

  }

  loadMenu() {
    const products = localStorage.getItem('products');
    let params = {
      vendor: this.id,
      page: this.pageNo,
    };
    // if (!products)
    //   this.subscriptions.push(
    //     this.commonService.getPaginatedMenu(params).subscribe(
    //       (res: any) => {
    //         if (res?.data)
    //           localStorage.setItem('products', JSON.stringify(res?.data));
    //         //this.products = res.data;
    //         res.data.forEach((product: any) => {
    //           this.products.push(product);
    //         });
    //         //this.loadProducts();
    //         if (this.products) {
    //           this.loadProducts();
    //         }
    //         //  Helper.setHomeCategories(res);
    //       },
    //       (err) => {
    //         console.log('getCategoriesParents', err);
    //         // this.isLoading = false;
    //         this.uiElementService.dismissLoading();
    //       }
    //     )
    //   );

    if (products) {
      this.products = JSON.parse(products);
      // this.loadProducts();
      if (this.products) {
        this.loadProducts();
      }
    }
  }

  private loadProducts() {
    // this.uiElementService.presentLoading('loading');
    this.showSkeleton = false;
    this.productsRes({ data: this.getHomePageProducts(20) });
    this.productsRes({ data: this.getHomePageProducts(24) });
    this.productsRes({ data: this.getHomePageProducts(26) });
    this.productsRes({ data: this.getHomePageProducts(28) });
    this.productsRes({ data: this.getHomePageProducts(49) });
    this.productsRes({ data: this.getHomePageProducts(51) });
    this.productsRes({ data: this.getHomePageProducts(61) });
    this.productsRes({ data: this.getHomePageProducts(79) });
    this.productsRes({ data: this.getHomePageProducts(117) });
    // this.uiElementService.dismissLoading();
    // this.subscriptions.push(
    //   forkJoin([
    //     this.vendorService.getHomePageProducts(this.id, 55), //Garlic Kebabs
    //     this.vendorService.getHomePageProducts(this.id, 53), //Sundries
    //     this.vendorService.getHomePageProducts(this.id, 54), //kabab
    //     this.vendorService.getHomePageProducts(this.id, 56), //dips
    //   ])
    //     .pipe(
    //       map((responses) => {
    //         responses.forEach((res) => {
    //           this.productsRes(res);
    //         });
    //       })
    //     )
    //     .subscribe()
    // );
  }

  getHomePageProducts(categoryId: number) {
    const pro = this.products.filter(
      (i: any) => i.categories[0].id == categoryId
    );
    return pro;
  }

  private productsRes(res: any) {
    if (!this.router.url.includes('search')) {
      this.foods = this.foods.concat(res.data);
    }
    this.allDone = res?.meta?.current_page == res?.meta?.last_page;
    if (!this.categories || !this.categories.length) {
      this.categories = [];
      if (!this.vendor) {
        if (localStorage.getItem('vendors')) {
          this.vendor = JSON.parse(localStorage.getItem('vendors') as string);
        } else {
          this.getVendorById(this.id);
        }
      }
      for (let cat of this.vendor.product_categories)
        this.categories.push({ category: cat, menu_items: [] });
    }
    for (let pro of res.data) {
      //   if (!this.bookTableOnly)
      pro.quantity = this.eComService.getCartProductQuantity(
        pro.vendor_products && pro.vendor_products[0]
          ? pro.vendor_products[0].id
          : pro.id
      );
      this.updateOrAddInList(pro);
      // }
      this.categories = this.categories.sort(
        (
          cmi1: { category: Category; menu_items: Array<Product> },
          cmi2: { category: Category; menu_items: Array<Product> }
        ) => {
          return cmi1.menu_items.length < cmi2.menu_items.length
            ? 1
            : cmi1.menu_items.length > cmi2.menu_items.length
            ? -1
            : 0;
        }
      );
      if (this.categories.length) {
        setTimeout(() => {
          let nowIndex = 0;
          if (this.tabIndexString.length && this.activeCatId > 0) {
            nowIndex = this.getActiveCatIndex();
            if (nowIndex == -1) nowIndex = 0;
          }
          this.activeCatId = this.categories[nowIndex].category.id;
          this.tabIndexString = 'segment_index_' + this.activeCatId;
          //this.slider.slideTo(nowIndex);
          //   document.getElementById("segment_button_" + this.activeCatId).scrollIntoView({
          //     behavior: 'smooth',
          //     block: 'center',
          //     inline: 'center'
          //   });
        }, 250);
        this.isLoading = false;
        this.uiElementService.dismissLoading();
        //this.loadMore();
        this.filteredCategories = this.categories
        .filter(
          (f) =>
            f.category.title.toLocaleLowerCase().includes('soups') ||
            f.category.title.toLocaleLowerCase().includes('cold starter') ||
            f.category.title.toLocaleLowerCase().includes('hot starter') ||
            f.category.title.toLocaleLowerCase().includes('salad')||
            f.category.title.toLocaleLowerCase().includes('fish & seafood')||
            f.category.title.toLocaleLowerCase().includes('main course')||
            f.category.title.toLocaleLowerCase().includes('platter')||
            f.category.title.toLocaleLowerCase().includes('wraps')||
            f.category.title.toLocaleLowerCase().includes('lunch time')
        );
      } else {
        this.uiElementService.dismissLoading();
      }
    }
  }

  onScrollDown() {}

  private updateOrAddInList(product: Product) {
    if (this.categories) {
      for (let catPro of product.categories) {
        let catProExistsAtIndex = -1;
        for (let i = 0; i < this.categories.length; i++) {
          if (
            this.categories[i].category &&
            this.categories[i].category.id == catPro.id
          ) {
            catProExistsAtIndex = i;
            break;
          }
        }
        if (catProExistsAtIndex == -1)
          this.categories.unshift({ category: catPro, menu_items: [] });
        this.updateOrAddInMenuItems(
          catProExistsAtIndex == -1 ? 0 : catProExistsAtIndex,
          product
        );
      }
    }
  }

  private updateOrAddInMenuItems(indexInMenuItems: number, product: Product) {
    let existingIndex = -1;
    for (
      let i = 0;
      i < this.categories[indexInMenuItems].menu_items.length;
      i++
    ) {
      if (this.categories[indexInMenuItems].menu_items[i].id == product.id) {
        existingIndex = i;
        break;
      }
    }
    if (existingIndex == -1) {
      this.categories[indexInMenuItems].menu_items.unshift(product);
    } else {
      this.categories[indexInMenuItems].menu_items[existingIndex] = product;
    }
  }

  private productsErr(err: any) {
    // if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
    this.isLoading = false;
    this.uiElementService.dismissLoading();
  }

  getVendorById(id: number,isVendorChanged?:boolean) {
    const vendor: any = localStorage.getItem('vendors');
    type deliveryAvailability = Array<{
      delivery_timings_from: string;
      delivery_timings_to: string;
    }>;
    if (!vendor)
      this.subscriptions.push(
        this.vendorService.getVendorById(this.id).subscribe(
          (res) => {
            if (res) {
              this.vendorService.setupVendor(res, this.selectedLocation);
              this.vendor = res;
              localStorage.setItem('vendors', JSON.stringify(this.vendor));
              this.commonService.productsUpdate.subscribe((resp) => {
                if (resp) {
                  this.loadMenu();
                }
              });
              this.isResturantOpenOrClose(res?.availability);
              const deliveryAvailability: Array<{
                delivery_timings_from: string;
                delivery_timings_to: string;
              }> = [
                {
                  delivery_timings_from: res?.meta.delivery_timings_from,
                  delivery_timings_to: res?.meta.delivery_timings_to,
                },
              ];
              this.isDeliveryOpenOrClose(deliveryAvailability);
              // this.loadProducts();
            }
            this.uiElementService.dismissLoading();
          },
          (error) => {
            this.uiElementService.dismissLoading();
          }
        )
      );
    if (vendor) {
      this.uiElementService.dismissLoading();
      this.commonService.productsUpdate.subscribe((res) => {
        if (res) {
          this.loadMenu();
        }
      });
      this.vendor = JSON.parse(vendor);
      if(isVendorChanged){
        this.loadMenu();
      }
      this.isResturantOpenOrClose(this.vendor?.availability);
      const deliveryAvailability: Array<{
        delivery_timings_from: string;
        delivery_timings_to: string;
      }> = [
        {
          delivery_timings_from: this.vendor.meta.delivery_timings_from,
          delivery_timings_to: this.vendor.meta.delivery_timings_to,
        },
      ];
      this.isDeliveryOpenOrClose(deliveryAvailability);
      //this.loadProducts();
    }
  }
  //To check whether resturant open or close it depends on availability from vendor array
  isResturantOpenOrClose = (availability: any[] = []) => {
    //this.isOpen = false;
    var dt = new Date();
    const currentDay = this.weekDays[dt.getDay()];
    this._dataService.setAvailablity(availability);
    let foundToday = availability.find((i: any) => i.days == currentDay);
    if (foundToday) {
      this.startTime = foundToday.from;
      this.endTime = foundToday.to;

      this._dataService.setStartTime(this.startTime.substring(0, 5));
      this._dataService.setEndTime(this.endTime.substring(0, 5));

      localStorage.setItem('startTime', this.startTime.substring(0, 5));
      localStorage.setItem('endTime', this.endTime.substring(0, 5));

      var s = this.startTime.split(':');
      var dt1 = new Date(
        dt.getFullYear(),
        dt.getMonth(),
        dt.getDate(),
        parseInt(s[0]),
        parseInt(s[1]),
        parseInt(s[2])
      );

      var e = this.endTime.split(':');
      var dt2 = new Date(
        dt.getFullYear(),
        dt.getMonth(),
        dt.getDate(),
        parseInt(e[0]),
        parseInt(e[1]),
        parseInt(e[2])
      );
      // if (dt >= dt1 && dt <= dt2) this.isOpen = true;
    }
  };
  //To check whether resturant delivery open or close it depends on delivery availability from vendor array
  isDeliveryOpenOrClose(
    deliveryAvailability: Array<{
      delivery_timings_from: string;
      delivery_timings_to: string;
    }>
  ) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    for (let i = 0; i < deliveryAvailability.length; i++) {
      const deliveryFromParts =
        deliveryAvailability[i].delivery_timings_from.split(':');
      const deliveryToParts =
        deliveryAvailability[i].delivery_timings_to.split(':');
      const deliveryFromHour = parseInt(deliveryFromParts[0]);
      const deliveryFromMinute = parseInt(deliveryFromParts[1]);
      const deliveryToHour = parseInt(deliveryToParts[0]);
      const deliveryToMinute = parseInt(deliveryToParts[1]);
      let dFromDT= new Date(now.getFullYear(),now.getMonth(),now.getDate(),deliveryFromHour,deliveryFromMinute);
     let dToDT= new Date(now.getFullYear(),now.getMonth(),now.getDate(),deliveryToHour,deliveryToMinute);
      if(deliveryToHour<=12 && deliveryFromHour>deliveryToHour){
       dToDT=new Date(dToDT.setDate(dToDT.getDate()+1));
      }
      if(now.getHours() <=12 && now<dToDT){
        now.setHours(now.getHours()+24)
      }
       if ( now>=dFromDT && now<=dToDT)  {
        this.dIsOpen = true; // Delivery is open
      } else {
        this.dIsOpen = false; // Delivery is closed
      }
    }
  }

  private getActiveCatIndex(): number {
    let toReturn = -1;
    for (let i = 0; i < this.categories.length; i++) {
      if (this.categories[i].category.id == this.activeCatId) {
        toReturn = i;
        break;
      }
    }
    return toReturn;
  }
  private loadMore() {
    if (!this.isLoading && !this.allDone) {
      this.isLoading = true;
      this.pageNo += 1;
      this.loadProducts();
    } else if (this.allDone) {
      this.uiElementService.dismissLoading();
    }
  }

  doSearch(query: string) {
    this.foods = [];
    this.subscriptions.push(
      this.vendorService
        .getVendorProducts(this.id, 0, 50, query)
        .subscribe((res) => {
          this.foods = this.foods.concat(res.data);
        })
    );
  }

  navigateToMenu() {
    this.router.navigate(['/restaurant']);
  }

  navTableBooking(bookATableContent: any) {
    this.persons = Array(15)
      .fill(0)
      .map((x, i) => i + 1);
    for (let i = 0; i < 90; i++) {
      let d = new Date();
      d.setDate(d.getDate() + i);
      this.insertDate(d);
    }
    if (localStorage.getItem('appointmentRequest')) {
      this.appointmentRequest = JSON.parse(
        localStorage.getItem('appointmentRequest') as string
      );
    }
    this.monthSelected = this.dates[0].month;
    this.datesToShow = this.dates[0].dates;
    if (this.appointmentRequest && this.appointmentRequest.date) {
      let date: Date = this.datesToShow.find(
        (f) =>
          moment(f).format('YYYY-MM-DD') ==
          moment(new Date(this.appointmentRequest.date)).format('YYYY-MM-DD')
      ) as Date;
      if (date) {
        this.markSelected(date);
      }
    } else {
      this.markSelected(this.datesToShow[0]);
      // this.markSelected()
    }
    if (
      this.helper.getAddressSelected() &&
      this.helper.getAddressSelected().latitude &&
      this.helper.getAddressSelected().longitude
    ) {
      // let navigationExtras: NavigationExtras = { queryParams: { list_for: "table_booking" } };
      // this.router.navigate(['./restaurants'], navigationExtras);
      this.onBookTabelClick(bookATableContent, this.vendor);
    } else {
      this.translate
        .get('select_location')
        .subscribe((value) => this.uiElementService.presentErrorAlert(value));
    }
  }

  private insertDate(date: Date) {
    let index = -1;
    for (let i = 0; i < this.dates.length; i++) {
      if (this.dates[i].month == date.getMonth()) {
        index = i;
        break;
      }
    }

    if (index == -1)
      this.dates.push({
        month: date.getMonth(),
        monthText: moment(date).format('MMM'),
        dates: [date],
      });
    else this.dates[index].dates.push(date);
  }

  checkSelectedDate(d: any): boolean {
    return this.appointmentRequest.date === moment(new Date(d)).format();
  }

  markSelected(date: Date) {
    this.dateSelected = date;
    this.appointmentRequest.date = moment(this.dateSelected).format();

    this.availabilityTimes = new Array<{ time: string; timeValue: string }>();
    let openingHour, openingMinute, closingHour, closingMinute;
    if (
      this.vendor?.meta?.opening_time &&
      Number(this.vendor?.meta?.opening_time)
    ) {
      let openingMoment = moment(Number(this.vendor?.meta?.opening_time));
      openingHour = openingMoment.format('HH');
      openingMinute = openingMoment.format('mm');
    }
    let dateStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      Number(openingHour ? openingHour : '07'),
      Number(openingMinute ? openingMinute : '00'),
      0
    );
    if (
      this.vendor?.meta.closing_time &&
      Number(this.vendor?.meta.closing_time)
    ) {
      let closingMoment = moment(Number(this.vendor?.meta.closing_time));
      closingHour = closingMoment.format('HH');
      closingMinute = closingMoment.format('mm');
    }
    let dateEnd = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      Number(closingHour ? closingHour : '23'),
      Number(closingMinute ? closingMinute : '00'),
      0
    );

    let time: number = dateStart.getTime();
    while (time <= dateEnd.getTime()) {
      let dateIn = new Date(time);
      let toDay =
        moment(dateIn).format('DD-MM-YYYY') == moment().format('DD-MM-YYYY');
      let showToDayTime =
        moment(dateIn).format('HH:mm') > moment().format('HH:mm');
      if (toDay) {
        if (showToDayTime) {
          this.availabilityTimes.push({
            time: moment(dateIn).format('HH:mm'),
            timeValue: moment(dateIn).format(
              this.use24HourFormat ? 'HH:mm' : 'hh:mm a'
            ),
          });
        }
      } else {
        this.availabilityTimes.push({
          time: moment(dateIn).format('HH:mm'),
          timeValue: moment(dateIn).format(
            this.use24HourFormat ? 'HH:mm' : 'hh:mm a'
          ),
        });
      }

      time = time + this.minutesApart * 60000;
    }
  }

  onBookTabelClick(content: any, restaurant: Vendor) {
    this.vendor = restaurant;
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          if (result == 'yes') {
            this.submitBookingRequest();
            //this.addProCart(this.selectedFood);
          }
        },
        (reason: any) => {}
      );
  }

  submitBookingRequest() {
    // console.log(Helper.formatTimestampDateDayTime(this.appointmentRequest.date, this.apiService.locale), ">>>",this.appointmentRequest.time_from)
    // console.log(moment(this.appointmentRequest.date).format("DD-MM-YYYY"), ">>>",this.appointmentRequest.time_from ,"==", moment().format("DD-MM-YYYY HH:mm"),">>", )
    if (!this.appointmentRequest.date || !this.appointmentRequest.date.length) {
      this.translate
        .get('select_date_time')
        .subscribe((value: any) =>
          this.uiElementService.presentErrorAlert(value)
        );
    } else if (!this.appointmentRequest.meta.person) {
      this.translate
        .get('select_person')
        .subscribe((value: any) =>
          this.uiElementService.presentErrorAlert(value)
        );
    } else if (
      !this.appointmentRequest.time_from ||
      !this.appointmentRequest.time_from.length
    ) {
      this.translate
        .get('select_date_time')
        .subscribe((value: any) =>
          this.uiElementService.presentErrorAlert(value)
        );
    } else {
      let toDay =
        moment(this.appointmentRequest.date).format('DD-MM-YYYY') ==
        moment().format('DD-MM-YYYY');
      let selectedTime =
        this.appointmentRequest.time_from > moment().format('HH:mm');
      if (toDay) {
        if (selectedTime) {
          this.createAppointment();
        } else {
          this.translate
            .get('err_field_timeslot_passed')
            .subscribe((value) =>
              this.uiElementService.presentErrorAlert(value)
            );
        }
      } else {
        this.createAppointment();
      }
    }
  }

  private createAppointment() {
    if (!this.helper.getLoggedInUser()) {
      this.appointmentRequest.vendor_id = this.vendor.id;
      localStorage.setItem(
        'appointmentRequest',
        JSON.stringify(this.appointmentRequest)
      );
      this.uiElementService.presentErrorAlert(
        'Please login to continue your booking'
      );
      this.router.navigate(['/auth/login']);
    } else {
      localStorage.removeItem('appointmentRequest');
      let bookReq = {
        vendor_id: this.vendor.id,
        amount: 0,
        date: this.appointmentRequest.date.split('T')[0],
        duplicate_slots_allowed: -1,
        meta: JSON.stringify({
          person: this.appointmentRequest.meta.person,
          note: this.appointmentRequest.meta.note,
        }),
        time_from: this.appointmentRequest.time_from,
        time_to: '00:00',
      };
      this.translate
        .get([
          'booking_your_table',
          'your_table_is_booked',
          'booking_your_table_err',
        ])
        .subscribe((values) => {
          this.uiElementService.presentLoading(values['booking_your_table']);
          this.commonService.createAppointment(bookReq).subscribe(
            () => {
              this.uiElementService.dismissLoading();
              this.uiElementService.presentSuccessToast(
                values['your_table_is_booked']
              );
              this.router.navigate(['/table-booked']);
              // this.navCtrl.navigateRoot(['./table-booked']);
            },
            (err) => {
              this.uiElementService.dismissLoading();
              this.uiElementService.presentErrorAlert(
                values['booking_your_table_err']
              );
            }
          );
        });
    }
  }

  onOptionSelect(event: any, type: string) {
    if (event.target.value) {
      if (type == 'person') {
        this.appointmentRequest.meta.person = event.target.value;
      } else if (type == 'date') {
        // this.dateSelected=event.target.value;
        let date = new Date(event.target.value);
        this.markSelected(date);
      } else if (type == 'time') {
        this.appointmentRequest.time_from = event.target.value;
      }
    }
  }
}


