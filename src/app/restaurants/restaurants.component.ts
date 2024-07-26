import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { MyAddress } from 'src/common/models/address.model';
import { Category } from 'src/common/models/category.model';
import { AppoiBookRequest } from 'src/common/models/table-booking.model';
import { Vendor } from 'src/common/models/vendor.model';
import { CommonService } from 'src/common/services/common.service';
import { HelperService } from 'src/common/services/helper.service';
import { UiElementsService } from 'src/common/services/ui-elements.service';
import { VendorsService } from 'src/common/services/vendors.service';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.scss']
})
export class RestaurantsComponent implements OnInit {
  // restaurants:any[]=[
  //   {id:1,name:'Food world',banner:'assets/img/gallery/food-world.png',image:'assets/img/gallery/food-world-logo.png',ratingCount:46,rating:4.5},
  //   {id:2,name:'Pizza hub',banner:'assets/img/gallery/pizza-hub.png',image:'assets/img/gallery/pizzahub-logo.png',ratingCount:50,rating:4},
  //   {id:3,name:'Donuts hut',banner:'assets/img/gallery/donuts-hut.png',image:'assets/img/gallery/donuts-hut-logo.png',ratingCount:40,rating:5},
  //   {id:4,name:'Ruby tuesday',banner:'assets/img/gallery/ruby-tuesday.png',image:'assets/img/gallery/ruby-tuesday-logo.png',ratingCount:60,rating:3.5},
  //   {id:5,name:'Kuakata Fried Chicken',banner:'assets/img/gallery/kuakata.png',image:'assets/img/gallery/kuakata-logo.png',ratingCount:50,rating:4.5},
  //   {id:6,name:'Taco bell',banner:'assets/img/gallery/taco-bell.png',image:'assets/img/gallery/taco-bell-logo.png',ratingCount:42,rating:5},
  // ];
  vendors = new Array<Vendor>();
  private nextUrl: string = '';
  listFor: string = '';
  private selectedLocation!: MyAddress;
  category!: Category;
  private urlParams!: URLSearchParams;
  pageHeading: string = '';
  private subscriptions = new Array<Subscription>();
  private use24HourFormat = true;
  private minutesApart = 30;
  weekDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  private monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  monthSelected = 0;
  dates: Array<{ month: number, monthText: string, dates: Array<Date> }> = [];
  datesToShow: Array<Date> = [];
  dateSelected!: Date;
  timeSelected!: string;
  select_month: string = "2";
  availabilityTimes = new Array<{ time: string, timeValue: string }>();
  persons!: Array<number>;
  appointmentRequest = new AppoiBookRequest()
  vendor!: Vendor;
  constructor(public router: Router,
    private helper: HelperService,
    private vendorsService: VendorsService,
    private route: ActivatedRoute,
    private uiElementService:UiElementsService,
    private commonService:CommonService,
     private modalService: NgbModal,
     public translate: TranslateService,) { }
  ngOnInit(): void {
    this.selectedLocation = this.helper.getAddressSelected();
    // if(history.state.list_for){

    //   this.listFor =history.state.list_for ;
    // }
    // if(history.state.category){
    //   this. category = history.state.category;
    // }
    let vendor_type: any;
    this.route.queryParams.subscribe((res: any) => {
      if (res.list_for) {
        this.listFor = res.list_for;
      }
      if (res.category) {
        this.category = res.category;
      }
      if (res.vendor_type) {
        if (JSON.parse(res.vendor_type)) {
          vendor_type = JSON.parse(res.vendor_type);
        }
      }
    })
    let vendorType: { name: string; title: string; } = vendor_type
    if (this.selectedLocation && this.listFor) {
      switch (this.listFor) {
        case "vendor_type":
          this.urlParams = new URLSearchParams();
          this.urlParams.append("sort", String(vendorType.name));
          this.urlParams.append("lat", String(this.selectedLocation.latitude));
          this.urlParams.append("long", String(this.selectedLocation.longitude));
          this.pageHeading = vendorType.title;
          break;
        case "category":
          this.urlParams = new URLSearchParams();
          this.urlParams.append("category", String(this.category.id));
          this.urlParams.append("lat", String(this.selectedLocation.latitude));
          this.urlParams.append("long", String(this.selectedLocation.longitude));
          this.pageHeading = this.category.title;
          break;
        case "table_booking":
          this.urlParams = new URLSearchParams();
          this.urlParams.append("meta[table_booking]", "true");
          //this.urlParams.append("lat", String(this.selectedLocation.latitude));
          //this.urlParams.append("long", String(this.selectedLocation.longitude));
          this.pageHeading = "table_booking";
          break;
        case "favorites":
          this.pageHeading='favorites';
          this.urlParams = new URLSearchParams();
          this.urlParams.append("meta[table_booking]", "true");
          this.urlParams.append("lat", String(this.selectedLocation.latitude));
          this.urlParams.append("long", String(this.selectedLocation.longitude));
          break;
      }
      if (this.urlParams && this.listFor!=='favorites')
      {
        this.uiElementService.presentLoading('loading');
        this.subscriptions.push(this.vendorsService.getVendors(this.urlParams).subscribe(res => this.handleRes(res), err => this.handleErr(err)));
      }
      else if(this.listFor=='favorites') {
        this.loadFavorites();
      }
    } else {
    }
    this.persons = Array(15).fill(0).map((x, i) => i + 1);
    for (let i = 0; i < 90; i++) {
      let d = new Date();
      d.setDate(d.getDate() + i);
      this.insertDate(d);
    }

    this.monthSelected = this.dates[0].month;
    this.datesToShow = this.dates[0].dates;
    this.markSelected(this.datesToShow[0]);
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
      this.dates.push({ month: date.getMonth(), monthText: moment(date).format("MMM"), dates: [date] });
    else
      this.dates[index].dates.push(date);
  }

  markSelected(date: Date) {
    this.dateSelected = date;
    this.appointmentRequest.date = moment(this.dateSelected).format();

    this.availabilityTimes = new Array<{ time: string, timeValue: string }>();
    let openingHour, openingMinute, closingHour, closingMinute;
    if (this.vendor?.meta?.opening_time && Number(this.vendor?.meta?.opening_time)) {
      let openingMoment = moment(Number(this.vendor.meta.opening_time));
      openingHour = openingMoment.format("HH");
      openingMinute = openingMoment.format("mm");
    }
    let dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Number(openingHour ? openingHour : "07"), Number(openingMinute ? openingMinute : "00"), 0);
    if (this.vendor?.meta?.closing_time && Number(this.vendor?.meta?.closing_time)) {
      let closingMoment = moment(Number(this.vendor.meta.closing_time));
      closingHour = closingMoment.format("HH");
      closingMinute = closingMoment.format("mm");
    }
    let dateEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Number(closingHour ? closingHour : "23"), Number(closingMinute ? closingMinute : "00"), 0);

    let time: number = dateStart.getTime();
    while (time <= dateEnd.getTime()) {
      let dateIn = new Date(time);
      let toDay = moment(dateIn).format("DD-MM-YYYY") == moment().format("DD-MM-YYYY");
      let showToDayTime = moment(dateIn).format("HH:mm") > moment().format("HH:mm");
      if (toDay) {
        if (showToDayTime) {
          this.availabilityTimes.push({ time: moment(dateIn).format("HH:mm"), timeValue: moment(dateIn).format(this.use24HourFormat ? "HH:mm" : "hh:mm a") });
        }
      } else {
        this.availabilityTimes.push({ time: moment(dateIn).format("HH:mm"), timeValue: moment(dateIn).format(this.use24HourFormat ? "HH:mm" : "hh:mm a") });
      }

      time = time + (this.minutesApart * 60000);
    }
  }

  loadFavorites() {
    this.subscriptions.push(this.vendorsService.getVendorsFavorite().subscribe(res => {
      this.vendors = res;
    //  this.isLoading = false;
      this.uiElementService.dismissLoading();
    }, err => {
      this.uiElementService.dismissLoading();
    }));
  }
  getRestaurantUrl(restaurantName: string): string {
    return restaurantName.replace(/ /g, "_");
  }
  ngOnDestroy() {
    for (let sub of this.subscriptions) sub.unsubscribe();
  }

  private handleRes(res: any) {
    if (res && res.data && res.data.length) for (let pro of res.data) this.vendorsService.setupVendor(pro, this.selectedLocation);

    this.vendors = this.vendors.concat(res.data);
    this.nextUrl = res.links.next;
    this.uiElementService.dismissLoading()
  }

  private handleErr(err: any) {
    this.uiElementService.dismissLoading
    //this.isLoading = false;
    // if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
  }

  getRestDetailURL(restaurant: any) {
    return this.listFor!='table_booking'? 'restaurant/'+restaurant.id+'/'+this.getRestaurantUrl(restaurant.name):`restaurant/${restaurant.id}/${this.getRestaurantUrl(restaurant.name)}/table_booking`
    // let params: any = {
    //   restaurant: this.getRestaurantUrl(restaurant.name),
    //   id: restaurant.id,
    //   forTableBooking: this.listFor == 'table_booking'
    // }
    // if (this.listFor != 'table_booking') {
    //   delete (params.forTableBooking);
    // }
    // return params;
  }

  onOptionSelect(event:any,type:string){
    if(event.target.value){
      if(type=='person'){
        this.appointmentRequest.meta.person=event.target.value;
      }
      else if(type=='date'){
        this.dateSelected=event.target.value;
      }
      else if(type=='time'){
        this.appointmentRequest.time_from=event.target.value
      }
    }
  }

  submitBookingRequest() {
    // console.log(Helper.formatTimestampDateDayTime(this.appointmentRequest.date, this.apiService.locale), ">>>",this.appointmentRequest.time_from)
    // console.log(moment(this.appointmentRequest.date).format("DD-MM-YYYY"), ">>>",this.appointmentRequest.time_from ,"==", moment().format("DD-MM-YYYY HH:mm"),">>", )
    if (!this.appointmentRequest.date || !this.appointmentRequest.date.length) {
      this.translate.get("select_date_time").subscribe((value:any) => this.uiElementService.presentErrorAlert(value));
    } else if (!this.appointmentRequest.meta.person) {
      this.translate.get("select_person").subscribe((value:any) => this.uiElementService.presentErrorAlert(value));
    } else if (!this.appointmentRequest.time_from || !this.appointmentRequest.time_from.length) {
      this.translate.get("select_date_time").subscribe((value:any) => this.uiElementService.presentErrorAlert(value));
    } else {
      let toDay = moment(this.appointmentRequest.date).format("DD-MM-YYYY") == moment().format("DD-MM-YYYY");
      let selectedTime = this.appointmentRequest.time_from > moment().format("HH:mm");
      if (toDay) {
        if (selectedTime) {
          this.createAppointment();
        } else {
          this.translate.get("err_field_timeslot_passed").subscribe(value => this.uiElementService.presentErrorAlert(value));
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
      date: this.appointmentRequest.date.split("T")[0],
      duplicate_slots_allowed: -1,
      meta: JSON.stringify({ person: this.appointmentRequest.meta.person, note: this.appointmentRequest.meta.note }),
      time_from: this.appointmentRequest.time_from,
      time_to: "00:00"
    }
    this.translate.get(["booking_your_table", "your_table_is_booked", "booking_your_table_err"]).subscribe(values => {
      this.uiElementService.presentLoading(values["booking_your_table"]);
      this.commonService.createAppointment(bookReq).subscribe(res => {
        this.uiElementService.dismissLoading();
        this.uiElementService.presentSuccessToast(values["your_table_is_booked"]);
        this.router.navigate(['/table-booked']);
        // this.navCtrl.navigateRoot(['./table-booked']);
      }, err => {
        this.uiElementService.dismissLoading();
        this.uiElementService.presentErrorAlert(values["booking_your_table_err"]);
      });
    });
  }
  onBookTabelClick(content:any,restaurant:Vendor){
    this.vendor=restaurant;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      let closeResult = `Closed with: ${result}`;
      if (result == 'yes') {
        this.submitBookingRequest();
        //this.addProCart(this.selectedFood);
      }
    }, (reason:any) => {
      let closResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
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

}
