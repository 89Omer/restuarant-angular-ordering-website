import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { MyAddress } from 'src/common/models/address.model';
import { Category } from 'src/common/models/category.model';
import { Constants } from 'src/common/models/constants.model';
import { Product } from 'src/common/models/product.model';
import { AppoiBookRequest } from 'src/common/models/table-booking.model';
import { Vendor } from 'src/common/models/vendor.model';
import { CommonService } from 'src/common/services/common.service';
import {
  CartItem,
  CartItemAddOn,
  ECommerceService,
} from 'src/common/services/ecommerce.service';
import { HelperService } from 'src/common/services/helper.service';
import { UiElementsService } from 'src/common/services/ui-elements.service';
import { VendorsService } from 'src/common/services/vendors.service';
import { DataService } from '../data.service';

declare var $: any;

@Component({
  selector: 'app-restaurant-details',
  templateUrl: './restaurant-details.component.html',
  styleUrls: ['./restaurant-details.component.scss'],
})

export class RestaurantDetailsComponent implements OnInit {

  ReadMore: boolean = true
  visible: boolean = false
  onclick()
  {
    this.ReadMore = !this.ReadMore;
    this.visible = !this.visible
  }

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
  // restaurant: any = {};
  // foods:any[]=[{name:'Your Pizza Bar',image:'assets/img/gallery/search-pizza.png',price:'£ 6'},{name:'Your Pizza Bar',image:'assets/img/gallery/search-pizza.png',price:'£ 6'},{name:'Your Pizza Bar',image:'assets/img/gallery/search-pizza.png',price:'£ 6'},{name:'Your Pizza Bar',image:'assets/img/gallery/search-pizza.png',price:'£ 6'}]
  foods = new Array<Product>();
  tabIndexString = '';
  private activeCatId = -1;
  isLoading = true;
  reachTimeArray = new Array<{ key: string; value: number }>();
  reachTime: number = 10;
  cartItems: any[] = [{ id: 1, name: 'Your Pizza Bar', count: 2, price: 12 }];
  //   categories:any[]=[
  //     {id:1,name:'FISH & SEAFOOD',linkId:'#fish&seaFood'},
  //     {id:2,name:'SHAWARMA',linkId:'#shwarma'},
  //     {id:3,name:'WRAPS',linkId:'#wraps'},
  //     {id:4,name:'HOT MEZZA',linkId:'#hotmezza'},
  //     {id:5,name:'NON-VEG',linkId:'#nonveg'},
  // ]
  categories: Array<{ category: Category; menu_items: Array<Product> }> = [];
  activeCategoryId: number | null = null;
  selectedCategory: any; // Property to hold the details of the selected category

  selectedFood: any = {};
  itemCount: number = 1;
  private subscriptions = new Array<Subscription>();
  vendor!: Vendor;
  private pageNo = 1;
  private allDone = false;
  bookTableOnly = false;
  id: number = this.commonService.vendorId?this.commonService.vendorId:Constants.VENDOR_ID;
  orderType: string = 'normal';
  selectedLocation!: MyAddress;
  addOns: any[] = [];
  selectedChoices: any[] = [];

  private use24HourFormat = true;
  private minutesApart = 30;
  weekDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  private monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  monthSelected = 0;
  dates: Array<{ month: number; monthText: string; dates: Array<Date> }> = [];
  datesToShow: Array<Date> = [];
  dateSelected!: Date;
  timeSelected!: string;
  select_month: string = '2';
  availabilityTimes = new Array<{ time: string; timeValue: string }>();
  persons!: Array<number>;
  appointmentRequest = new AppoiBookRequest();
  newCategories: any[] = [];
  isOpen = true;
  dIsOpen = true;
  deliveryTimeFrom!: string;
  deliveryTimeTo!: string;
  constructor(
    private router: ActivatedRoute,
    private modalService: NgbModal,
    private vendorsService: VendorsService,
    public eComService: ECommerceService,
    private helper: HelperService,
    private route: Router,
    public translate: TranslateService,
    private uiElementService: UiElementsService,
    private commonService: CommonService,
    private _dataService: DataService
  ) {
    for (let i = 20; i < 60; i = i + 5)
      this.reachTimeArray.push({ key: i + ' min', value: i });
  }

  ngOnInit(): void {
    this.vendor = history.state.vendor;
    this.orderType = this.eComService.getDeliveryTpe();
    this.reachTime = this.eComService.getReachingTime();
    window.scroll(0, 0);
    this.router.params.subscribe((param: any) => {
      if (param.id) {
        let id = param.id;
        this.id = id;
        //this.restaurant = this.restaurants[0];
      }
      if (param.forTableBooking) {
        this.bookTableOnly = true;
      }
    });

    // this.loadProducts();
    this.selectedLocation = this.helper.getAddressSelected();
    if (localStorage.getItem('vendors')) {
      let vendor = JSON.parse(localStorage.getItem('vendors') as string);
      if (!vendor || vendor?.id != this.id) {
        this.getVendorById(this.id);
      } else {
        // this.vendorsService.setupVendor(vendor, this.selectedLocation);
        this.vendor = vendor;
        this.setCategories(this.vendor, this.vendor.id);
        this.vendorsService.setupVendor(vendor, this.selectedLocation);
      }
    } else {
      // this.getVendorById(this.id);
    }

    this.persons = Array(15)
      .fill(0)
      .map((x, i) => i + 1);
    for (let i = 0; i < 90; i++) {
      let d = new Date();
      d.setDate(d.getDate() + i);
      this.insertDate(d);
    }

    this.monthSelected = this.dates[0].month;
    this.datesToShow = this.dates[0].dates;
    this.markSelected(this.datesToShow[0]);

    var javathis = this;
    window.onscroll = function (ev) {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 50
      ) {
        // you're at the bottom of the page
        if (javathis.isLoading) return;

        if (!window.location.href.includes('restaurant')) return;
        // var length = javathis.newCategories.length;
        //if (length == javathis.vendor.categories.length) return;

        // for (const element of javathis.vendor.categories) {
        //   if (javathis.newCategories.every((i) => i.id != element.id)) {
        //     javathis.newCategories.push(element);
        //     console.log(element.id, javathis.id);
        //     javathis.getProductsByCategory(element.id, javathis.id);
        //     break;
        //   }
        // }
        //
        // javathis.vendor.categories.forEach((element: any) => {
        //   if (!!javathis.newCategories.find((i: any) => i.id != element.id)) {
        //     return;
        //   }
        // });
      }
    };
    let vendor = JSON.parse(localStorage.getItem('vendors') as string);
    if (!vendor || vendor?.id != this.id) {
      this.id=this.commonService.vendorId?this.commonService.vendorId:Constants.VENDOR_ID
      this.getVendorById(this.id);
    } else {
      // this.vendorsService.setupVendor(vendor, this.selectedLocation);
      this.vendor = vendor;
      this.setCategories(this.vendor, this.vendor.id);
      this.vendorsService.setupVendor(vendor, this.selectedLocation);
    }
  }

  selectCategory(category: any) {
    this.selectedCategory = category;
  }

  getFirstImageUrl(category: any): string {
    const images = category?.category?.mediaurls?.images || [];
    if (images.length > 0) {
      return images[0]?.default || '';
    } else {
      return 'assets/img/gallery/order.png';
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

  markSelected(date: Date) {
    this.dateSelected = date;
    this.appointmentRequest.date = moment(this.dateSelected).format();

    this.availabilityTimes = new Array<{ time: string; timeValue: string }>();
    let openingHour, openingMinute, closingHour, closingMinute;
    if (
      this.vendor?.meta?.opening_time &&
      Number(this.vendor?.meta?.opening_time)
    ) {
      let openingMoment = moment(Number(this.vendor.meta.opening_time));
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
      this.vendor?.meta?.closing_time &&
      Number(this.vendor?.meta?.closing_time)
    ) {
      let closingMoment = moment(Number(this.vendor.meta.closing_time));
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

  get countTotal(): number {
    let subTotal: number = 0;
    this.cartItems.forEach((item) => {
      subTotal = subTotal + item.price;
    });
    return subTotal;
  }

  // getVendorById(id: number) {
  //   this.subscriptions.push(this.vendorsService.getVendorById(this.id).subscribe(res => {
  //     if (res) {
  //       this.vendorsService.setupVendor(res, this.selectedLocation)
  //       this.vendor = res
  //       this.loadProducts();
  //     }
  //   }));
  // }

  onFoodClick(id: number, content: any) {
    if (!this.bookTableOnly) {
      this.selectedFood = this.foods.find((f) => f.id == id);
      // this.selectedFood.quantity=1;
      this.addOns = this.selectedFood.addon_groups;
      let product = this.selectedFood;
      // let cartFood = this.eComService.getCartItemsWithProductId(
      //   this.selectedFood.vendor_products &&
      //     this.selectedFood.vendor_products[0]
      //     ? this.selectedFood.vendor_products[0].id
      //     : this.selectedFood.id
      // );
      // if (cartFood.length > 0) {
      //   this.selectedFood.quantity = cartFood[0].quantity;
      // }
      this.modalService
        .open(content, { ariaLabelledBy: 'modal-basic-title' })
        .result.then(
          (result) => {
            let closeResult = `Closed with: ${result}`;
            if (result == 'ok') {
              this.mapProductChoicesToCart(this.selectedFood);
              this.resetSelectedGroup();
              // if(this.selectedFood.quantity==1){
              //   this.addProCart(this.selectedFood);
              // }
            }
          },
          (reason) => {
            let closResult = `Dismissed ${this.getDismissReason(reason)}`;
          }
        );
    }
  }

  hancleChangeCheckbox(group: any) {
    if (group.selected) {
      group.addon_choices.forEach((element: any) => {
        element.selected = false;
        element.quantity = 0;
      });
    }
  }

  onRadioClick(group: any) {
    group.selected = !group.selected;
    if (!group.selected) {
      group.addon_choices.forEach((element: any) => {
        element.selected = false;
        element.quantity = 0;
      });
    }
  }

  hancleChangeGroupCheckbox(event: any, group: any) {
    if (group.selected) {
      if (group.choose_group_choice === 1) {
        let radioGroups = this.selectedFood.addon_groups.filter(
          (f: any) =>
            f.choose_group_choice == 1 && f.selected && f.id != group.id
        );
        radioGroups.forEach((rg: any) => {
          rg.selected = false;
          rg.addon_choices.forEach((rc: any) => {
            rc.quantity = 0;
            rc.selected = false;
          });
        });
      }
      // for (let item of this.selectedFood.addon_groups) {
      //   // if (this.selectedFood.addOns) {
      //   //   let selectedAddon = this.selectedFood.addOns.find(
      //   //     (f: any) => f.id == group.id
      //   //   );
      //   //   if (selectedAddon && selectedAddon.id != item.id) {
      //   //     this.selectedFood.addOns = this.selectedFood.addOns.filter(
      //   //       (f: any) => f.id == selectedAddon.id
      //   //     );
      //   //   }
      //   // }
      //   if (group.id == item.id) continue;
      //   item.selected = false;
      // }
    } else {
      group.addon_choices.forEach((element: any) => {
        element.selected = false;
        element.quantity = 0;
      });
    }
  }

  onBookTabelClick(content: any) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          let closeResult = `Closed with: ${result}`;
          if (result == 'yes') {
            this.submitBookingRequest();
            //this.addProCart(this.selectedFood);
          }
        },
        (reason) => {
          let closResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  addProCart(pro: Product, clearCartWarning?: any) {
    //this.selectedFood = undefined;

    if (
      this.eComService.getCartItems().length >= 1 &&
      Number(this.commonService.vendorId ? this.commonService.vendorId : Constants.VENDOR_ID) != pro.vendor_products[0].vendor_id
    ) {
      return this.clearCart(clearCartWarning);
    }
    //if (this.helper.getLoggedInUser() != null) {
    if (pro.cartId) {
      //this.eComService.removeCartItemWithProductId(pro.id);
      this.eComService.removeCartItemWithId(pro.cartId);
    }
    let existingCartItems = this.eComService.getCartItemsWithProductId(
      pro.vendor_products && pro.vendor_products[0]
        ? pro.vendor_products[0].id
        : pro.id
    );
    // if (existingCartItems.length && (existingCartItems.length > 1 || existingCartItems[0].addOns.length)) {
    //   this.confirmVariationSelectionMode(pro, existingCartItems);
    // }
    // else if (pro.addOnChoicesIsMust) {
    //   this.proceedVariationSelection(pro);
    // }
    // else {
    let ciChoices = [];

    for (let proChoice of this.selectedChoices) {
      proChoice.addon_choices.forEach((ch: any) => {
        ch.selected = true;
      });

      ciChoices.push(
        new CartItemAddOn(
          proChoice.id,
          proChoice.title,
          proChoice.price,
          proChoice.priceToShow,
          proChoice.addon_choices,
          proChoice.choose_group_choice
        )
      );
    }
    if (
      existingCartItems.length > 0 &&
      pro.quantity < existingCartItems[0].quantity
    ) {
      this.removeItem(pro);
    } else {
      let currentCartItem = this.eComService.genCartItemFromProduct(
        pro,
        ciChoices
      );
      currentCartItem.quantity = pro.quantity;
      this.eComService.addOrIncrementCartItem(currentCartItem);
      //pro.quantity += 1;
    }

    // }
    //}
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  onQuantityChange(
    type: string,
    toppingsContent?: any,
    clearCartWarning?: any
  ) {
    if (type == 'add') {
      // let existingCartItems = this.eComService.getCartItemsWithProductId(
      //   this.selectedFood.vendor_products &&
      //     this.selectedFood.vendor_products[0]
      //     ? this.selectedFood.vendor_products[0].id
      //     : this.selectedFood.id
      // );
      // if (
      //   existingCartItems.length &&
      //   (existingCartItems.length > 1 || existingCartItems[0].addOns.length)
      // ) {
      //   this.confirmVariationSelectionMode(
      //     this.selectedFood,
      //     existingCartItems,
      //     toppingsContent,
      //     clearCartWarning
      //   );
      //   this.itemCount = this.itemCount + 1;
      //   this.selectedFood.quantity = this.selectedFood.quantity + 1;
      // } else if (this.selectedFood.addon_groups.length > 0) {
      //   this.proceedVariationSelection(
      //     this.selectedFood,
      //     toppingsContent,
      //     clearCartWarning
      //   );
      //   this.itemCount = this.itemCount + 1;
      //   this.selectedFood.quantity = this.selectedFood.quantity + 1;
      // } else {
      //   this.itemCount = this.itemCount + 1;
      //   this.selectedFood.quantity = this.selectedFood.quantity + 1;
      //   this.addProCart(this.selectedFood, clearCartWarning);
      // }
      this.itemCount = this.itemCount + 1;
      this.selectedFood.quantity = this.selectedFood.quantity + 1;
      // this.selectedFood.quantity=0;
    }
    if (type == 'subtract' && this.selectedFood.quantity >= 1) {
      this.itemCount = this.itemCount - 1;
      this.selectedFood.quantity = this.selectedFood.quantity - 1;
      this.removeItem(this.selectedFood);
    } else if (type == 'subtract' && this.selectedFood.quantity == 0) {
      this.removeItem(this.selectedFood);
    }
  }

  onChoiceQuantityChange(
    type: string,
    choiceContent?: any,
    group?: any,
    event?: any
  ) {
    if (
      choiceContent.quanity != undefined &&
      choiceContent.quantity == undefined
    ) {
      choiceContent.quantity = choiceContent.quanity;
    }
    if (event) {
      if (event?.target.checked) {
        type = 'add';
      } else {
        type = 'subtract';
      }
    }
    if (type == 'add') {
      if (choiceContent.quantity == undefined) {
        choiceContent.quantity = 0;
      }
      let selectedCounts = 0;
      let selectedChoices = group.addon_choices.filter(
        (f: any) => f.quantity > 0
      );
      selectedChoices.forEach((cho: any) => {
        selectedCounts = selectedCounts + cho.quantity;
      });
      if (
        group.max_choices > choiceContent.quantity &&
        selectedCounts < group.max_choices &&
        !selectedChoices.find((f: any) => f.quantity >= group.max_choices)
      ) {
        choiceContent.quantity++;
        selectedCounts++;
        if (
          group.max_choices == choiceContent.quantity ||
          group.max_choices == selectedCounts
        ) {
          let currentIndex = this.selectedFood?.addon_groups.findIndex(
            (f: any) => f.id == group.id
          );
          if (currentIndex || currentIndex == 0) {
            let focusToId =
              this.selectedFood?.addon_groups[currentIndex + 1]?.id;
            if (focusToId) {
              setTimeout(() => {
                document.getElementById(`${focusToId}`)?.scrollIntoView();
                document.getElementById(`${focusToId}`)?.focus();
                //document.getElementById(`${focusToId}`)?.click();
                if (!group.min_choices) {
                  let ao = this.selectedFood.addon_groups.findIndex(
                    (f: any) => f.id == focusToId
                  );
                  if (ao.max_choices > 0 && ao.min_choices) {
                    let inputEl = document.getElementById(
                      `${focusToId}`
                    ) as HTMLInputElement;
                    if (inputEl) {
                      inputEl.checked = true;
                    }
                    let aoIndex = this.selectedFood.addon_groups.findIndex(
                      (f: any) => f.id == focusToId
                    );
                    if (this.selectedFood.addon_groups[currentIndex + 1]) {
                      this.selectedFood.addon_groups[
                        currentIndex + 1
                      ].selected = true;
                    }
                    this.hancleChangeGroupCheckbox(
                      {},
                      this.selectedFood.addon_groups[aoIndex]
                    );
                  }
                } else {
                  let inputEl = document.getElementById(
                    `${focusToId}`
                  ) as HTMLInputElement;
                  if (inputEl) {
                    inputEl.checked = true;
                  }
                  let aoIndex = this.selectedFood.addon_groups.findIndex(
                    (f: any) => f.id == focusToId
                  );
                  this.selectedFood.addon_groups[currentIndex + 1].selected =
                    true;
                  this.hancleChangeGroupCheckbox(
                    {},
                    this.selectedFood.addon_groups[aoIndex]
                  );
                }
                // this.selectedFood.addon_groups.forEach(
                //   (ao: any, index: number) => {
                //     if (index > selectGroupIndex) {
                //       let aoInput = document.getElementById(
                //         ao.id
                //       ) as HTMLInputElement;
                //       aoInput.checked = false;
                //       ao.addon_choices.forEach((choice: any) => {
                //         choice.selected = false;
                //         choice.quantity = 0;
                //       });
                //     }
                //   }
                // );
                // this.selectedFood.addon_groups[currentIndex].selected = true;
              }, 200);
            }
          }
        }
      } else if (
        selectedChoices.find((f: any) => f.quantity == group.max_choices)
      ) {
        let previousIndex = group.addon_choices.findIndex(
          (f: any) => f.quantity == group.max_choices
        );
        if (previousIndex || previousIndex == 0) {
          group.addon_choices[previousIndex].selected = false;
          group.addon_choices[previousIndex].quantity =
            group.addon_choices[previousIndex].quantity - 1 >= 0
              ? group.addon_choices[previousIndex].quantity - 1
              : 0;
          let previousId = group.addon_choices[previousIndex].id;
          let prevEl = document.getElementById(previousId) as HTMLInputElement;
          prevEl.checked = false;
          choiceContent.quantity++;
          if (
            group.max_choices == choiceContent.quantity ||
            group.max_choices == selectedCounts
          ) {
            let currentIndex = this.selectedFood?.addon_groups.findIndex(
              (f: any) => f.id == group.id
            );
            if (currentIndex || currentIndex == 0) {
              this.selectedFood.addon_groups[currentIndex].addon_choices[
                previousIndex
              ].selected = false;
              this.selectedFood.addon_groups[currentIndex].addon_choices[
                previousIndex
              ].quantity =
                this.selectedFood.addon_groups[previousIndex].quantity - 1 >= 0
                  ? group.addon_choices[previousIndex].quantity - 1
                  : 0;

              let focusToId =
                this.selectedFood?.addon_groups[currentIndex + 1]?.id;
              if (focusToId) {
                setTimeout(() => {
                  document.getElementById(`${focusToId}`)?.scrollIntoView();
                  document.getElementById(`${focusToId}`)?.focus();
                  //  document.getElementById(`${focusToId}`)?.click();
                  if (!group.min_choices) {
                    let ao = this.selectedFood.addon_groups.findIndex(
                      (f: any) => f.id == focusToId
                    );
                    if (ao.max_choices > 0 && ao.min_choices) {
                      let inputEl = document.getElementById(
                        `${focusToId}`
                      ) as HTMLInputElement;
                      inputEl.checked = true;
                      let aoIndex = this.selectedFood.addon_groups.findIndex(
                        (f: any) => f.id == focusToId
                      );
                      this.selectedFood.addon_groups[
                        currentIndex + 1
                      ].selected = true;
                      this.hancleChangeGroupCheckbox(
                        {},
                        this.selectedFood.addon_groups[aoIndex]
                      );
                    }
                  } else {
                    let inputEl = document.getElementById(
                      `${focusToId}`
                    ) as HTMLInputElement;
                    inputEl.checked = true;
                    let aoIndex = this.selectedFood.addon_groups.findIndex(
                      (f: any) => f.id == focusToId
                    );
                    this.selectedFood.addon_groups[currentIndex + 1].selected =
                      true;
                    this.hancleChangeGroupCheckbox(
                      {},
                      this.selectedFood.addon_groups[aoIndex]
                    );
                  }
                }, 200);
              }
            }
          }
        }
      }
      choiceContent.selected = true;
      // if (group.max_choices == 1 && group.choose_group_choice == 2) {
      //   let doubleDeal = this.selectedFood.addon_groups.filter(
      //     (f: any) => f.choose_group_choice == 2
      //   );
      //   if (doubleDeal && doubleDeal.length) {
      //     let choices: any[] = [];
      //     doubleDeal.forEach((deal: any) => {
      //       let foundCho = deal.addon_choices.find(
      //         (cho: any) => cho.selected == true
      //       );
      //       choices.push(foundCho);
      //     });
      //     if (choices.length > 1) {
      //       let doubleDealPrice = Number(
      //         doubleDeal.find((f: any) => Number(f.price) > 0).price
      //       );
      //       choices.sort((a, b) => {
      //         return b.price - a.price;
      //       });
      //       let priceToReduce = choices[1].price - doubleDealPrice;
      //       if (priceToReduce && priceToReduce > 0) {
      //         choices[1].price = `${choices[1].price}-${priceToReduce}=${doubleDealPrice}`;
      //       }
      //       console.log('double deal price', doubleDealPrice);
      //     }
      //     console.log('double choices ', choices);
      //     console.log('double deal ', doubleDeal);
      //   }
      // }
    }
    if (type == 'subtract') {
      if (choiceContent.quantity == undefined) {
        choiceContent.quantity = 0;
      }
      choiceContent.quantity > 0 ? choiceContent.quantity-- : 0;
    }
    if (choiceContent.quantity == 0) choiceContent.selected = false;
    if (event) {
      event.target.checked = choiceContent.selected;
    }
  }

  // getTotalCartItemPrice() {
  //   let cartItemsTotal = 0.0;
  //   if (
  //     this.eComService.getCartItems() &&
  //     this.eComService.getCartItems().length > 0
  //   ) {
  //     this.eComService.getCartItems().forEach((f) => {
  //       let price = f.price;
  //       let addonPrice = 0.0;
  //       f.addOns.forEach((ao) => {
  //         addonPrice = addonPrice + ao.price;
  //         price = price + ao.price;
  //       });
  //       price = price * f.quantity;
  //       cartItemsTotal = cartItemsTotal + price;
  //     });
  //   }
  //   return cartItemsTotal.toFixed(2);
  // }
  getChoicePrice(group: any, cho: any, item: any) {
    if (group.choose_group_choice == 2) {
      let doubleDeal = item.addon_groups
        ? item.addon_groups.filter((f: any) => f.choose_group_choice == 2)
        : item.addOns?.filter((f: any) => f.choose_group_choice == 2);
      if (doubleDeal && doubleDeal.length) {
        let choices: any[] = [];
        doubleDeal.forEach((deal: any) => {
          let foundCho = deal.addon_choices.find(
            (cho: any) => cho.selected == true
          );
          choices.push(foundCho);
        });
        if (choices.length > 1) {
          let doubleDealPrice = Number(
            doubleDeal.find((f: any) => Number(f.price) > 0).price
          );
          choices.sort((a, b) => {
            return b.price - a.price;
          });
          if (choices[1] == cho) {
            let priceToReduce = choices[1].price - doubleDealPrice;
            if (priceToReduce && priceToReduce > 0) {
              return `${choices[1].price}-${priceToReduce.toFixed(1)}`;
            }
            return cho.price;
          }
          return cho.price;
        }
        // console.log('double choices ', choices);
        // console.log('double deal ', doubleDeal);
        return cho.price;
      }
    }
    return cho.price;
  }

  removeItem(pro: Product, isDelete?: boolean) {
    // if (this.helper.getLoggedInUser() != null) {
    let existingCartItems = this.eComService.getCartItemsWithProductId(
      pro.vendor_products && pro.vendor_products[0]
        ? pro.vendor_products[0].id
        : pro.id
    );
    // if (existingCartItems.length > 1) {
    //   this.translate.get(['remove_item_title', 'remove_item_msg', 'go_cart', 'cancel']).subscribe(text => {
    //     this.alertCtrl.create({
    //       header: text["remove_item_title"],
    //       message: text['remove_item_msg'],
    //       buttons: [{
    //         text: text['cancel'],
    //         handler: () => { },
    //         role: 'cancel'
    //       }, {
    //         text: text["go_cart"],
    //         handler: () => this.navCtrl.navigateForward(['./confirm-order'])
    //       }]
    //     }).then(alert => alert.present());
    //   });
    // } else {
    if (isDelete) {
      pro.quantity = 0;
      this.eComService.removeCartItemWithProductId(pro.id);
    } else {
      this.eComService.removeOrDecrementCartItem(
        this.eComService.genCartItemFromProduct(
          pro,
          existingCartItems.length ? existingCartItems[0].addOns : []
        )
      );
    }
    // pro.quantity = pro.quantity == 0 ? 0 : pro.quantity - 1;
    // }
    // }
    // else {
    //   this.route.navigate(['/auth/login'])
    // }
  }

  scrollTo(id: string) {
    let el = document.getElementById(id);
    if (!el) {
      const food = this.vendor.categories.find((i) => i.id == id);
      this.newCategories.push(food);
      this.getProductsByCategory(id, this.id);
    }

    setTimeout(() => {
      let el2 = document.getElementById(id);
      if (el2) {
        el2.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }
    }, 500);
  }

  private loadProducts() {
    this.uiElementService.presentLoading('loading');
    this.subscriptions.push(
      this.vendorsService.getVendorProducts(this.id, this.pageNo).subscribe(
        (res) => this.productsRes(res),
        (err) => this.productsErr(err)
      )
    );
  }

  private productsRes(res: any) {
    this.foods = this.foods.concat(res.data);
    this.allDone = res?.meta?.current_page == res?.meta?.last_page;
    if (!this.categories || !this.categories.length) {
      this.categories = [];
      for (let cat of this.vendor.categories)
        this.categories.push({ category: cat, menu_items: [] });
      console.log(this.categories)
    }
    if (this.categories && this.categories.length > 0 && !this.selectedCategory) {
      this.selectedCategory = this.categories[0];
    }
    if (res && Array.isArray(res.data)) { // Check if res and res.data are defined and res.data is an array

      for (let pro of res.data) {
        if (!this.bookTableOnly)
          pro.quantity = this.eComService.getCartProductQuantity(
            pro.vendor_products && pro.vendor_products[0]
              ? pro.vendor_products[0].id
              : pro.id
          );
        this.updateOrAddInList(pro);
      }
    }

    this.isLoading = false;
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
      //this.loadMore();
    } else {
      // this.uiElementService.dismissLoading()
    }
  }

  private productsErr(err: any) {
    // if (this.infiniteScrollEvent) this.infiniteScrollevent?.target.complete();
    this.isLoading = false;
    this.uiElementService.dismissLoading();
  }

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

  confirmVariationSelectionMode(
    product: Product,
    existingCartsItem: Array<CartItem>,
    toppingsContent?: any,
    clearCartWarning?: any
  ) {
    let addOns: any[] = [];
    for (let ci of existingCartsItem) addOns = addOns.concat(ci.addOns);
    // this.addOns=addOns;
    this.modalService
      .open(toppingsContent, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          let closeResult = `Closed with: ${result}`;
          if (result == 'ok') {
            this.addChoice();
            this.addProCart(this.selectedFood, clearCartWarning);
            //this.addProCart(this.selectedFood);
          }
        },
        (reason) => {
          let closResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
    // this.modalController.create({ component: VariationSelectionAlertPage, componentProps: { product: product, add_ons_existing: addOns } }).then((modalElement) => {
    //   modalElement.onDidDismiss().then(data => {
    //     if (data && data.data) {
    //       if (data.data == "repeat") {
    //         this.eComService.addOrIncrementCartItem(existingCartsItem[existingCartsItem.length - 1]);
    //         product.quantity = this.eComService.getCartProductQuantity((product.vendor_products && product.vendor_products[0]) ? product.vendor_products[0].id : product.id);
    //       } else if (data.data == "new") {
    //         this.proceedVariationSelection(product);
    //       }
    //     }
    //   });
    //   modalElement.present();
    // });
  }

  proceedVariationSelection(
    product: Product,
    toppingsContent?: any,
    clearCartWarning?: any
  ) {
    // this.addOns=[];
    this.modalService
      .open(toppingsContent, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          let closeResult = `Closed with: ${result}`;
          if (result == 'ok') {
            this.addChoice();
            this.addProCart(this.selectedFood, clearCartWarning);
            //  this.addProCart(this.selectedFood);
          }
        },
        (reason) => {
          let closResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
    // this.modalController.create({ component: VariationSelectionPage, componentProps: { product: product, add_ons_existing: [] } }).then((modalElement) => {
    //   modalElement.onDidDismiss().then(data => {
    //     if (data && data.data) {
    //       let ciChoices = [];
    //       for (let proChoice of data.data) ciChoices.push(new CartItemAddOn(proChoice.id, proChoice.title, proChoice.price, proChoice.priceToShow));
    //       this.eComService.addOrIncrementCartItem(this.eComService.genCartItemFromProduct(product, ciChoices));
    //       product.quantity += 1;
    //     }
    //   });
    //   modalElement.present();
    // });
  }

  private clearCart(clearCartWarning: any) {
    this.modalService
      .open(clearCartWarning, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          let closeResult = `Closed with: ${result}`;
          if (result == 'yes') {
            this.eComService.clearCart();
            //  this.addProCart(this.selectedFood);
          }
        },
        (reason) => {
          let closResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
    // this.translate.get(['clear_cart_message', 'clear_now', 'cancel']).subscribe(text => {
    //   this.alertCtrl.create({
    //     message: text['clear_cart_message'],
    //     buttons: [
    //       {
    //         text: text["cancel"],
    //         handler: () => { },
    //         role: 'cancel'
    //       }, {
    //         text: text['clear_now'],
    //         handler: () => this.eComService.clearCart()
    //       }]
    //   }).then(alert => alert.present());
    // });
  }
  onOrderTypeSelected(event: any) {
    if (event?.target && event?.target.value) {
      this.orderType = event?.target.value;
      this.eComService.setupOrderRequestOrder_type(
        this.orderType.toLocaleUpperCase()
      );
      this.eComService.setDeliveryType(this.orderType);
      if (this.selectedLocation) {
        this.eComService.setupOrderRequestAddress(this.selectedLocation);
      }
    }
  }
  onReachTimeSelect(event: any) {
    if (event?.target && event?.target.value) {
      this.reachTime = event?.target.value;
      //if(this.orderType=='takeaway'){
      this.eComService.setupOrderRequestMeta(
        'reach_time',
        this.reachTime.toString()
      );
      this.eComService.setReachingTime(this.reachTime);
      // }
    }
  }

  onCheckoutClick() {
    if (this.isDisableCheckout()) {
      this.uiElementService.presentErrorAlert(this.getReason);
    } else {
      if (
        localStorage.getItem(Constants.KEY_ADDRESS) &&
        !this.selectedLocation
      ) {
        this.selectedLocation = this.helper.getAddressSelected();
      }
      if (this.helper.getLoggedInUser()) {
        if (!this.selectedLocation) {
          this.commonService.openAddressPopup({
            title: '',
            lastPage: 'restaurant',
          });
        } else {
          if (this.orderType) {
            this.eComService.setupOrderRequestOrder_type(
              this.orderType.toLocaleUpperCase()
            );
            if (this.orderType.toLowerCase() == 'normal') {
              if (!this.selectedLocation) {
                this.commonService.openAddressPopup({
                  title: '',
                  lastPage: 'restaurant',
                });
              } else {
                this.eComService.setupOrderRequestAddress(
                  this.selectedLocation
                );
                this.route.navigate(['/check-out']);
              }
            } else if (this.orderType.toLocaleLowerCase() == 'takeaway') {
              this.eComService.setupOrderRequestMeta('reach_time', '');
              this.route.navigate(['/check-out']);
            }
          }
        }
      } else {
        // this.route.navigate(['/auth/login']);
        this.route.navigate(['/check-out']);
      }
    }
  }

  checkDisabled(group: any, choice: any): boolean {
    let selectedChoices = group.addon_choices.filter(
      (f: any) => f.selected == true
    );
    return !choice.selected && selectedChoices.length >= group.max_choices;
  }

  onDeleteClick(item: CartItem) {
    let product = item.product;
    // this.eComService.removeCartItemWithProductId(product?.id);
    let foodIndex = this.foods.findIndex((f) => f.id == product.id);
    if (foodIndex >= 0) {
      this.foods[foodIndex].quantity = 0;
      this.foods[foodIndex].addon_groups.forEach((ao) => {
        ao.selected = false;
        ao.addon_choices.forEach((cho) => {
          cho.quantity = 0;
          cho.selected = false;
        });
      });
    }
    this.eComService.removeCartItemWithId(item.id);
  }

  radioChange(event: any, group: any) {
    if (event?.target.value)
      for (let choice of group.addon_choices)
        choice.selected = choice.id == event?.target.value;
    if (event?.target && event?.target.value)
      for (let choice of group.addon_choices)
        choice.selected = choice.id == event?.target.value;
  }

  addChoice() {
    this.selectedChoices = [];
    let canProceed = true;
    for (let group of this.selectedFood.addon_groups) {
      let groupChoicesSelected = [];
      if (group.addon_choices)
        for (let choice of group.addon_choices)
          if (choice.selected) groupChoicesSelected.push(choice);
      if (group.min_choices > groupChoicesSelected.length) {
        this.translate
          .get('addon_choices_lessthan_err')
          .subscribe((value) =>
            this.uiElementService.presentToast(
              group.title + ' ' + value + ' ' + group.min_choices
            )
          );
        this.selectedChoices = [];
        canProceed = false;
        break;
      } else if (groupChoicesSelected.length > group.max_choices) {
        this.translate
          .get('addon_choices_morethan_err')
          .subscribe((value) =>
            this.uiElementService.presentToast(
              group.title + ' ' + value + ' ' + group.max_choices
            )
          );
        this.selectedChoices = [];
        canProceed = false;
        break;
      } else {
        this.selectedChoices =
          this.selectedChoices.concat(groupChoicesSelected);
      }
    }
    if (canProceed) {
      // this.modalController.dismiss(selectedChoices);
    }
  }

  mapProductChoicesToCart(selectedFood: any) {
    this.selectedChoices = [];
    let canProceed = true;
    let groupChoicesSelected = [];
    for (let group of selectedFood.addon_groups) {
      if (!group.selected) continue;
      let obj = {
        id: group.id,
        max_choices: group.max_choices,
        min_choices: group.min_choices,
        price: group.price,
        product_id: group.product_id,
        selected: group.selected,
        title: group.title,
        toppings: group.toppings,
        choose_group_choice: group.choose_group_choice,
        addon_choices: group.addon_choices.filter((i: any) => i.selected),
        addons_new: [{ group_id: group.id }],
      };
      groupChoicesSelected.push(obj);
      let counts = 0;
      obj.addon_choices.forEach((aoc: any) => {
        counts = counts + aoc.quantity;
      });
      // if (group.addon_choices)
      //   for (let choice of group.addon_choices)
      //     if (choice.selected) groupChoicesSelected.push(choice);
      if (group.min_choices > counts) {
        this.translate
          .get('addon_choices_lessthan_err')
          .subscribe((value) =>
            this.uiElementService.presentToast(
              group.title + ' ' + value + ' ' + group.min_choices
            )
          );
        this.selectedChoices = [];
        canProceed = false;
        break;
      } else if (obj?.addon_choices?.length > group.max_choices) {
        this.translate
          .get('addon_choices_morethan_err')
          .subscribe((value) =>
            this.uiElementService.presentToast(
              group.title + ' ' + value + ' ' + group.max_choices
            )
          );
        this.selectedChoices = [];
        canProceed = false;
        break;
      } else {
        // this.selectedChoices =     what do we need this ?
        //   this.selectedChoices.concat(groupChoicesSelected);
      }
    }
    if (canProceed) {
      this.selectedChoices = groupChoicesSelected;
      // if (this.selectedFood.addOns) {
      //   this.addProCart(this.selectedFood.product);
      // } else {
      this.addProCart(this.selectedFood, null);
      // }
      // this.modalController.dismiss(selectedChoices);
    }
  }

  onOptionSelect(event: any, type: string) {
    if (event?.target.value) {
      if (type == 'person') {
        this.appointmentRequest.meta.person = event?.target.value;
      } else if (type == 'date') {
        this.dateSelected = event?.target.value;
      } else if (type == 'time') {
        this.appointmentRequest.time_from = event?.target.value;
      }
    }
  }

  submitBookingRequest() {
    if (!this.appointmentRequest.date || !this.appointmentRequest.date.length) {
      this.translate
        .get('select_date_time')
        .subscribe((value) => this.uiElementService.presentErrorAlert(value));
    } else if (!this.appointmentRequest.meta.person) {
      this.translate
        .get('select_person')
        .subscribe((value) => this.uiElementService.presentErrorAlert(value));
    } else if (
      !this.appointmentRequest.time_from ||
      !this.appointmentRequest.time_from.length
    ) {
      this.translate
        .get('select_date_time')
        .subscribe((value) => this.uiElementService.presentErrorAlert(value));
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
          (res) => {
            this.uiElementService.dismissLoading();
            this.uiElementService.presentSuccessToast(
              values['your_table_is_booked']
            );
            this.route.navigate(['/table-booked']);
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

  toggleFavorite() {
    if (this.helper.getLoggedInUser() != null) {
      this.translate.get('just_moment').subscribe((value) => {
        this.uiElementService.presentLoading(value);
        this.subscriptions.push(
          this.commonService.toggleVendorFavorite(this.vendor.id).subscribe(
            (res) => {
              this.vendor.is_favourite = !this.vendor.is_favourite;
              this.uiElementService.dismissLoading();
            },
            (err) => {
              this.uiElementService.dismissLoading();
            }
          )
        );
      });
    }
  }

  getFavClass() {
    return this.vendor.is_favourite ? 'fa' : 'far';
  }

  //scorilling
  getVendorById(id: number) {
    const vendor = localStorage.getItem('vendors');
    if (!vendor)
      this.subscriptions.push(
        this.vendorsService.getVendorById(this.id).subscribe((res) => {
          if (res) {
            this.vendorsService.setupVendor(res, this.selectedLocation);
            this.vendor = res;
            localStorage.setItem('vendors', JSON.stringify(this.vendor));
            this.setCategories(this.vendor, id);
            if (!this.checkIsDelivery) {
              this.orderType = 'takeaway';
              this.eComService.setDeliveryType('takeaway');
            }
          }
        })
      );
    if (vendor) {
      this.vendor = JSON.parse(vendor);
      this.setCategories(this.vendor, id);
    }
  }

  setCategories(res: any, id: number) {
    localStorage.setItem('availablity', JSON.stringify(res.availability));
    this._dataService.setAvailablity(res?.availability);
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
    res.categories.forEach((cate: any, index: number) => {
      // if (index > 1) return;
      this.newCategories.push(cate);
      this.getProductsByCategory(cate.id, id);
    });
  }

  loadMenu() {
    const products: any = localStorage.getItem('products');
    if (!products) {
      this.subscriptions.push(this.commonService.getMenuItem(this.commonService.vendorId ? this.commonService.vendorId : Constants.VENDOR_ID).subscribe(
        (res: any) => {
          if (res?.data)
            localStorage.setItem('products', JSON.stringify(res?.data));
          // this.loadProducts();
          //  Helper.setHomeCategories(res);
        },
        (err) => {
          console.log('getCategoriesParents', err);
          // this.isLoading = false;
          this.uiElementService.dismissLoading();
        }
      )
      );
    } else {
      let pros = JSON.parse(products);
      this.subscriptions.push(pros.data);
    }

  }

  getProductsByCategory(categoryId: any, id: number) {
    this.isLoading = true;
    let vendorId = id;
    const allProducts = localStorage.getItem('products');
    let reqProducts = [];
    if (allProducts) {
      let products = JSON.parse(allProducts);
      reqProducts = products.filter(
        (i: any) => i.categories?.[0]?.id == categoryId
      );
    }

    var category = this.newCategories.filter((i) => i.id == categoryId)[0];
    if (reqProducts.length == 0) {
      this.loadMenu();
      this.uiElementService.presentLoading('loading');
      this.vendorsService
        .getProductsByCategory(vendorId, categoryId)
        .subscribe((res) => {
          if (res) {
            category.product = res.data.sort(
              (a, b) => a.sort_order - b.sort_order
            );

            this.uiElementService.dismissLoading();
          }
          this.productsRes(res);
        });
    }

    if (reqProducts.length > 0) {
      category.product = reqProducts.sort(
        (a: any, b: any) => a.sort_order - b.sort_order
      );
      this.productsRes({ data: reqProducts });
      this.uiElementService.dismissLoading();
    }
  }

  onScroll(event: any): void {
    let el = document.getElementById('dialogContentForScroll1');
    let lastScrollTop = 0;
    if (!el) return;
    if (el?.scrollTop < lastScrollTop) {
      // upscroll
      return;
    }
    lastScrollTop = el?.scrollTop <= 0 ? 0 : el?.scrollTop;
    if (el?.scrollTop + el.offsetHeight >= el?.scrollHeight) {
      if (this.isLoading) return;
      var length = this.newCategories.length;
      if (length == this.vendor.categories.length) return;
      for (let x = length; x < length + 1; x++) {
        this.newCategories.push(this.vendor.categories[x]);
        this.getProductsByCategory(this.vendor.categories[x].id, this.id);
      }
    }
  }

  //new methods

  handleAccordiontitle(category: any) {
    if (category.product) {
      const arr = category.product.map((item: any) => {
        return item['title'];
      });
      arr.join(',');
      return arr;
    }
    return null;
  }

  truncateText = (data: any, limit: any) => {
    let text = data;
    if (text) {
      text = text.toString();
      text = text.trim();
      if (text.length > limit) text = text.substring(0, limit) + '...';
    }
    return text;
  };

  calculateCartItemPrice(item: any) {
    let quantity = 1;
    let price = Number(item?.price);
    item.addOns.forEach((ao: any) => {
      if (ao.choose_group_choice != 2) {
        price += +ao.price;
      }
      ao.addon_choices.forEach((ch: any) => {
        let chPrice = this.getChoicePrice(ao, ch, item);
        if (typeof chPrice == 'string' && chPrice.includes('-')) {
          let priceToReduce = Number(chPrice.split('-')[1]);
          price += +(ch.price - priceToReduce);
        } else {
          price += +(ch?.quantity > 0 ? ch?.quantity * ch?.price : ch?.price);
        }
      });
    });

    if (item.quantity > 0) quantity = item.quantity;
    price *= quantity;
    //price += this.addOns.find(i=> i.selected).price;
    return price.toFixed(2) || 0.0;
  }

  // calculatePrice(item: any) {
  //   // if (item?.title?.toLowerCase() == 'jl pizza') console.log('JL pizza', item);
  //   //console.log('selectedAddons', this.addOns);
  //   let price = Number(item?.price);
  //   let group = this.addOns.find((i) => i.selected);
  //   //console.log('group', group);
  //   if (group) {
  //     price += +group.price;
  //     group.addon_choices.forEach((el: any) => {
  //       if (el.selected) price += +el.price;
  //     });
  //   }
  //   //price += this.addOns.find(i=> i.selected).price;
  //   return price || 0.0;
  // }

  calculatePrice(item: any) {
    // if (item?.title?.toLowerCase() == 'jl pizza') console.log('JL pizza', item);
    //console.log('selectedAddons', this.addOns);
    let price = Number(item?.price);
    // if (item?.addOns) {
    //   item.addOns.forEach((ao: any) => {
    //     let selectedAddon = this.addOns.find((f: any) => f.id == ao.id);
    //     if (selectedAddon) {
    //       let aoIndex = this.addOns.findIndex((f) => f.id == selectedAddon.id);
    //       selectedAddon.selected = ao.selected;
    //       this.addOns[aoIndex].selected = selectedAddon.selected;
    //       ao.addon_choices.forEach((cho: any) => {
    //         let chIndex = selectedAddon.addon_choices.findIndex(
    //           (f: any) => f.id == cho.id
    //         );
    //         selectedAddon.addon_choices[chIndex].selected = cho.selected;
    //         selectedAddon.addon_choices[chIndex].quantity = cho.quantity;
    //         this.addOns[aoIndex].addon_choices[chIndex].selected = cho.selected;
    //         this.addOns[aoIndex].addon_choices[chIndex].quantity = cho.quantity;
    //       });
    //     }
    //   });
    // }
    let groups = this.addOns.filter((i) => i.selected);
    if (groups.length > 0)
      groups.forEach((group) => {
        if (group.choose_group_choice != 2) {
          price += +group?.price || 0;
        }
        group?.addon_choices.forEach((el: any) => {
          let chPrice = this.getChoicePrice(group, el, item);
          if (typeof chPrice == 'string' && chPrice.includes('-')) {
            let priceToReduce = Number(chPrice.split('-')[1]);
            price += +(el.price - priceToReduce);
          } else {
            //   price += +el.price;
            if (el.selected)
              price +=
                +(el?.quantity > 0 ? el?.quantity * el?.price : el?.price) || 0;
          }
        });
      });
    //price += this.addOns.find(i=> i.selected).price;
    return price.toFixed(2) || 0.0;
  }

  handleSetPrice(price: any) {
    // console.log('handleSetPrice', price);
    // this.selectedFood = {
    //   quantity: 0,
    // };
    // this.resetSelectedGroup();
  }

  onProceedClicked(selectedFood: any): boolean {
    if (selectedFood) {
      let requiredGroups = selectedFood.addon_groups.filter(
        (group: any) => group.max_choices > 0 && group.min_choices > 0
      );
      if (requiredGroups?.length) {
        let radioGroups = requiredGroups.filter(
          (group: any) => group.choose_group_choice
        );
        if (radioGroups?.length == requiredGroups.length) {
          let selected = radioGroups.find((f: any) => f.selected);
          if (selected) {
            return true;
          } else {
            this.uiElementService.presentErrorAlert(
              'Please select Required Addons first'
            );
            return false;
          }
        }
        let groupSelected = requiredGroups.filter(
          (group: any) => group.selected
        );
        if (groupSelected.length == requiredGroups.length) {
          let choiceselectedCount = 0;
          groupSelected.forEach((group: any) => {
            let choiceSelected = group.addon_choices.find(
              (ch: any) => ch.selected && ch.quantity > 0
            );
            choiceselectedCount = choiceSelected
              ? choiceselectedCount + 1
              : choiceselectedCount;
          });
          if (choiceselectedCount < requiredGroups.length) {
            this.uiElementService.presentErrorAlert(
              'Please select Required Addons first'
            );
          }
          return choiceselectedCount >= requiredGroups.length;
        } else {
          this.uiElementService.presentErrorAlert(
            'Please select Required Addons first'
          );
          return false;
        }
      } else {
        return true;
      }
    } else {
      this.uiElementService.presentErrorAlert(
        'Please select Required Addons first'
      );
      return false;
    }
  }

  resetSelectedGroup() {
    let group = this.addOns.find((i) => i.selected);
    //console.log('group', group);
    if (group) {
      group.selected = false;
      group.addon_choices.forEach((el: any) => {
        if (el.selected) el.selected = false;
      });
    }
  }

  radioGroupChange(event: any, group: any, product: any) {
    // console.log('groups', this.addOns);
    this.addOns.forEach((el) => {
      if (group.id != el.id) {
        el.selected = false;
        el.addon_choices.forEach((element: any) => {
          element.selected = false;
        });
      }
    });
  }

  isResturantOpenOrClose = (availability: any[] = []) => {
    // this.isOpen = false;
    // var dt = new Date();
    // const currentDay = this.weekDays[dt.getDay()];

    // let foundToday = availability.find((i: any) => i.days == currentDay);
    // if (foundToday) {
    //   var startTime = foundToday.from;
    //   var endTime = foundToday.to;
    //   console.log(startTime);
    //   console.log(endTime);

    //   var s = startTime.split(':');
    //   var dt1 = new Date(
    //     dt.getFullYear(),
    //     dt.getMonth(),
    //     dt.getDate(),
    //     parseInt(s[0]),
    //     parseInt(s[1]),
    //     parseInt(s[2])
    //   );

    //   var e = endTime.split(':');
    //   var dt2 = new Date(
    //     dt.getFullYear(),
    //     dt.getMonth(),
    //     dt.getDate(),
    //     parseInt(e[0]),
    //     parseInt(e[1]),
    //     parseInt(e[2])
    //   );

    //   if (dt >= dt1 && dt <= dt2) this.isOpen = true;
    // }
    this.isOpen = false;
    const now = new Date();
    const currentDay = this.weekDays[now.getDay()];
    if (availability.length == 0) {
      this.isOpen = true;
    }
    const foundToday = availability.find((i: any) => i.days == currentDay);
    if (foundToday) {
      const [startHour, startMinute, startSecond] = foundToday.from
        .split(':')
        .map(Number);
      const [endHour, endMinute, endSecond] = foundToday.to
        .split(':')
        .map(Number);

      let start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        startHour,
        startMinute,
        startSecond
      );
      let end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        endHour,
        endMinute,
        endSecond
      );

      if (endHour < startHour) {
        end.setHours(end.getHours() + 24);
      }

      if (now.getHours() <= 12 && now < end) {
        now.setHours(now.getHours() + 24)
      }
      if (now >= start && now <= end) {
        this.isOpen = true;
      }
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
      this.deliveryTimeFrom = deliveryAvailability[i].delivery_timings_from;
      this.deliveryTimeTo = deliveryAvailability[i].delivery_timings_to;
      let dFromDT = new Date(now.getFullYear(), now.getMonth(), now.getDate(), deliveryFromHour, deliveryFromMinute);
      let dToDT = new Date(now.getFullYear(), now.getMonth(), now.getDate(), deliveryToHour, deliveryToMinute);
      if (deliveryToHour <= 12 && deliveryFromHour > deliveryToHour) {
        dToDT = new Date(dToDT.setDate(dToDT.getDate() + 1));
      }
      if (now.getHours() <= 12 && now < dToDT) {
        now.setHours(now.getHours() + 24)
      }
      if (now >= dFromDT && now <= dToDT) {
        this.dIsOpen = true; // Delivery is open
        // console.log('Im open' + this.dIsOpen);
      } else {
        this.dIsOpen = false; // Delivery is closed
        // console.log('Im closed ' + this.dIsOpen);
        //  console.log(!this.dIsOpen);
      }
    }
    if (!this.dIsOpen) {
      this.orderType = 'takeaway';
      this.eComService.setDeliveryType(this.orderType);
    }
  }

  totalPrice(a: any, b: any) {
    if (a == undefined || b == undefined) return 0;
    return (a * b).toFixed(2);
  }

  getTotalCartItemPrice() {
    let cartItemsTotal = 0.0;
    if (
      this.eComService.getCartItems() &&
      this.eComService.getCartItems().length > 0
    ) {
      this.eComService.getCartItems().forEach((f) => {
        let quantity = 1;
        let price = this.calculateCartItemPrice(f);
        cartItemsTotal = cartItemsTotal + +price;
      });
    }
    return cartItemsTotal.toFixed(2);
  }

  oneditClick(item: any, content: any) {
    this.uiElementService.presentLoading('loading');
    //let category = this.categories.find((category) => category.menu_items.find((f: any) => f.id == item.product.id));

    // let foodItem = this.foods.find((f) => f.id == item.product.id);
    // let foodItem = category?.menu_items.find((f: any) => f.id == item.product.id);
    let foodItem = item.product;
    // item.addOns.forEach((ao: any) => {
    //   ao.selected = true;
    // });
    if (foodItem) {
      foodItem.quantity = item.quantity;
      foodItem.cartId = item.id;
    }
    item.addOns.forEach((cItem: any) => {
      if (foodItem && foodItem.addon_groups) {
        let addOn = foodItem?.addon_groups.findIndex(
          (f: any) => f.id == cItem.id
        );
        foodItem.addon_groups[addOn].selected = true;
        foodItem.addon_groups[addOn].addon_choices.forEach((ch: any) => {
          let findCh = cItem.addon_choices.find((f: any) => f.id == ch.id);
          if (findCh) {
            ch.selected = true;
            ch.quantity = findCh.quantity;
            setTimeout(() => {
              let inputEl = document.getElementById(ch.id) as HTMLInputElement;
              if (inputEl) {
                inputEl.checked = true;
              }
            }, 900);
          }
        });
      }
    });
    setTimeout(() => {
      this.uiElementService.dismissLoading();
    }, 900);
    //  this.addOns = item.addOns;
    this.selectedFood = foodItem;
    this.addOns = this.selectedFood.addon_groups;
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          let closeResult = `Closed with: ${result}`;
          if (result == 'ok') {
            this.mapProductChoicesToCart(this.selectedFood);
            this.resetSelectedGroup();
            this.selectedFood.addOns = [];
            this.selectedFood.quantity = 0;
            // if(this.selectedFood.quantity==1){
            //   this.addProCart(this.selectedFood);
            // }
          }
        },
        (reason) => {
          let closResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  checkedit(group: any) {
    // if (this.selectedFood?.addOns) {
    //   let findAddon = this.selectedFood.addOns.find(
    //     (f: any) => f.id == group.id
    //   );
    //   if (findAddon) {
    //     group.selected = true;
    //   }
    // }
    return group.selected;
  }

  checkEditQuantity(choice: any, group: any) {
    // if (this.selectedFood.addOns) {
    //   let findAddon = this.selectedFood.addOns.find(
    //     (f: any) => f.id == group.id
    //   );
    //   if (findAddon) {
    //     let selectedChoice = findAddon.addon_choices.find(
    //       (f: any) => f.id == choice.id
    //     );
    //     if (selectedChoice) {
    //       choice.selected = selectedChoice.selected;
    //       choice.quantity = selectedChoice.quantity;
    //     }
    //   }
    // }
    return choice.quantity == undefined ? 0 : choice.quantity;
  }

  showHowTo(howToModal: any) {
    this.modalService.open(howToModal, { ariaLabelledBy: 'modal-basic-title' });
  }

  checkQuantity(choiceItem: any) {
    return choiceItem.quantity >= 1 ? true : false;
  }

  checkDisabledGroup(index: number, group: any): boolean {
    let requiredGroups = this.selectedFood.addon_groups.filter(
      (group: any) => group.max_choices > 0 && group.min_choices > 0
    );
    let lastGroup: any;
    if (!group.is_parent) {
      lastGroup = requiredGroups.find(
        (f: any) => f.id != group.id && !f.selected
      );
      if (lastGroup?.is_parent && !this.checkParent(lastGroup)) {
        lastGroup = requiredGroups.find(
          (f: any) =>
            f.id != group.id &&
            !f.selected &&
            f.id != lastGroup.id &&
            this.checkParent(f)
        );
      }
    } else if (group.is_parent) {
      let parentGroup = group.is_parent.includes('_')
        ? group.is_parent.split('_')[0]
        : group.is_parent;
      lastGroup = requiredGroups.find(
        (f: any) => f.id != group.id && !f.selected && f.title == parentGroup
      );
    }
    if (lastGroup) {
      let lastInex = this.selectedFood.addon_groups.findIndex(
        (ag: any) => ag.id == lastGroup.id
      );

      if (index > lastInex) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isDisableCheckout(): boolean {
    return (
      !this.isOpen ||
      this.eComService.getCartItems().length == 0 ||
      (this.checkMinimum() && this.vendor.minimum_order > 0) ||
      (this.eComService.getDeliveryTpe() == 'normal' &&
        this.checkMaxDelivery() &&
        this.vendor.maximum_delivery_distance > 0)
    );
  }

  get getReason(): string {
    let errorMessage = '';
    errorMessage = !this.isOpen
      ? 'Sorry we are closed'
      : this.checkMinimum() && this.vendor.minimum_order > 0
        ? `Minimum Order is £${this.vendor.minimum_order}`
        : this.checkMaxDelivery() && this.vendor.maximum_delivery_distance > 0
          ? `Maximum Delivery is ${this.vendor.maximum_delivery_distance} miles`
          : '';
    return errorMessage;
  }

  checkMinimum(): boolean {
    return (
      this.vendor &&
      Number(this.getTotalCartItemPrice()) < this.vendor.minimum_order
    );
  }

  checkParent(group: any) {
    if (!group.is_parent) {
      return true;
    } else {
      if (group.is_parent && group.is_parent.includes('_')) {
        let groupTitle = group.is_parent.split('_')[0];
        let parent_choice = group.is_parent.split('_')[1];
        let parentGroup = this.selectedFood.addon_groups.find(
          (f: any) => f.title == groupTitle
        );
        if (parentGroup?.selected) {
          let parentChoice = parentGroup.addon_choices.find(
            (f: any) => f.title == parent_choice
          );
          return parentChoice?.selected;
        } else {
          return false;
        }
      }
    }
  }

  checkMaxDelivery(): boolean {
    if (this.vendor.branches?.length && this.vendor.branches[0].distance < this.vendor.distance) {
      return this.vendor.branches[0].distance >= this.vendor.maximum_delivery_distance;
    }
    return this.vendor.distance >= this.vendor.maximum_delivery_distance;
  }
  /* for getting collection/delivery-time */
  getDeliveryTime(type: string): string {
    let deliveryTime: string = '';
    if (this.vendor?.meta[type]) {
      deliveryTime = this.vendor?.meta[type];
    } else {
      deliveryTime = type == 'collection_time' ? '30 Mins' : '45 Mins';
    }
    return deliveryTime;
  }

  get checkIsDelivery(): boolean {
    let isDelivery: boolean = true;
    if (
      this.vendor?.meta['is_delivery'] == undefined ||
      this.vendor?.meta['is_delivery']
    ) {
      isDelivery = true;
    } else {
      isDelivery = false;
    }
    return isDelivery;
  }

  get showVendorDistance(): string {
    return this.vendor.branches?.length && this.vendor.branches[0].distance < this.vendor.distance ? this.vendor.branches[0].distance_toshow
      : this.vendor.distance_toshow;
  }

  get showVendorAddress(): string {
    return this.vendor.branches?.length && this.vendor.branches[0].distance < this.vendor.distance ? this.vendor.branches[0].address
      : this.vendor.address;
  }



  mainMenuCarousel = {
    slidesToShow: 3,
    slidesToScroll: 2,
    autoplay: false,
    arrows: false,
    margin: '0px',
    responsive: [
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 500,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  menuDetailItemsCarousel = {
    slidesToShow: 3,
    slidesToScroll: 2,
    autoplay: false,
    arrows: false,
    margin: '0px',
    responsive: [
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 500,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };


}

$(window).scroll(function () {
  var scroll = $(window).scrollTop();
  if (scroll >= 182) {
    $('.stickyBar,.stickyBarRight').addClass('fixed');
    if ($('.stickyBar').height() >= 450) {
      $('.stickyBar').addClass('scroll');
    }
  } else {
    $('.stickyBar,.stickyBarRight').removeClass('fixed');
    $('.stickyBar').removeClass('scroll');
  }
  // $('app-restaurant-details').next('app-footer').hide();
});



$(document).on("click", ".mainMenuItem", function () {
  $(".accordion-header .accordion-button").click();
});