// ///<reference types="@types/google.maps" />
import { MapsAPILoader } from '@agm/core';
import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { getDemoAddress, MyAddress } from 'src/common/models/address.model';
import { CommonService } from 'src/common/services/common.service';
import { HelperService } from 'src/common/services/helper.service';
import { UiElementsService } from 'src/common/services/ui-elements.service';
import * as firebase from 'firebase/auth';
import { ECommerceService } from 'src/common/services/ecommerce.service';
import { MyEventsService } from 'src/common/events/my-events.service';
import { Vendor } from 'src/common/models/vendor.model';
import { AppoiBookRequest } from 'src/common/models/table-booking.model';
import * as moment from 'moment';
import { VendorsService } from 'src/common/services/vendors.service';
import { Constants } from 'src/common/models/constants.model';

declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  selectedLocation!: MyAddress;

  @ViewChild('pleaseConnect', { static: true }) pleaseConnect:
    | ElementRef
    | undefined;
  @ViewChild('map', { static: true }) mapElement: ElementRef | undefined;
  address: string = '';
  private geoCoder: any;
  private subscriptions = new Array<Subscription>();
  addresses = new Array<MyAddress>();

  private use24HourFormat = true;
  private minutesApart = 30;
  weekDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  monthSelected = 0;
  dates: Array<{ month: number; monthText: string; dates: Array<Date> }> = [];
  datesToShow: Array<Date> = [];
  dateSelected!: Date;
  timeSelected!: string;
  select_month: string = '2';
  availabilityTimes = new Array<{ time: string; timeValue: string }>();
  persons!: Array<number>;
  appointmentRequest = new AppoiBookRequest();
  vendor!: Vendor;
  id: number = this.commonService.vendorId?this.commonService.vendorId:Constants.VENDOR_ID;
  searchQuery: string = '';
  showDiningSection: boolean = false;
  showTakeawaySection: boolean = false;
  showBranchesSection: boolean = false;

  constructor(
    public router: Router,
    public helper: HelperService,
    private modalService: NgbModal,
    private uiElementService: UiElementsService,
    private translate: TranslateService,
    private commonService: CommonService,
    public eComService: ECommerceService,
    private myEvent: MyEventsService,
    private vendorsService: VendorsService
  ) { }

  ngOnInit(): void {
    // this.getVendorById(this.id);
    // this.selectedLocation=getDemoAddress();
    if (this.helper.getLoggedInUser()) {
      this.loadAddresses();
    }
    this.commonService.branchUpdate.subscribe(resp=>{
      if(resp){
        this.id=this.commonService.vendorId?this.commonService.vendorId:Constants.VENDOR_ID;
        this.getVendorById(this.id);
      }});

    const vendorFromLocalStorage: string | null = localStorage.getItem('vendors');
    if (!vendorFromLocalStorage) {
      this.getVendorById(Constants.VENDOR_ID);
    } else {
      this.vendor = JSON.parse(vendorFromLocalStorage);
      this.setupComponentWithVendor();
    }
  }

  getVendorById(id: number): void {
    this.vendorsService.getVendorById(id).subscribe((res: Vendor) => {
      if (res) {
        this.vendor = res;
        localStorage.setItem('vendors', JSON.stringify(res));
        this.setupComponentWithVendor();
      }
    });
  }

  // Method to set up the component with vendor data
  private setupComponentWithVendor(): void {
    // Determine which section to show based on the meta properties of the vendor
    if (this.vendor && this.vendor.meta) {
      if (this.vendor.meta.dinning) {
        this.showDiningSection = true;
      }
      if (this.vendor.meta.takeaway) {
        this.showTakeawaySection = true;
      }
      if (this.vendor.meta.show_branches) {
        this.showBranchesSection = true;
      }
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
  onLocationClicked() {
    if (this.helper.getLoggedInUser()) {
      this.router.navigate(['/saved-addresses']);
    } else {
      this.router.navigate(['/saved-addresses']);
    }
    //this.initMap();
    //  setTimeout(() => {
    //   //this.searchElementRef.nativeElement=document.getElementById('searchAddress');
    //   ViewChild('search')
    // let searchEl: ElementRef<HTMLInputElement> = {} as ElementRef;
    //  // let searchEl=document.getElementById('searchAddress') as HTMLInputElement;
    //    let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef && this.searchElementRef.nativeElement?this.searchElementRef.nativeElement:searchEl.nativeElement);
    //     autocomplete.addListener("place_changed", () => {
    //       this.ngZone.run(() => {
    //         //get the place result
    //         let place: google.maps.places.PlaceResult = autocomplete.getPlace();

    //         //verify result
    //         if (place.geometry === undefined || place.geometry === null) {
    //           return;
    //         }

    //         //set latitude, longitude and zoom
    //         if(this.selectedLocation){
    //           this.selectedLocation.latitude = place.geometry.location.lat().toString();
    //           this.selectedLocation.longitude = place.geometry.location.lng().toString();
    //         }
    //         //this.zoom = 12;
    //       });
    //     });
    //  }, 100);
    // this.modalService.open(content,{ariaLabelledBy:'modal-basic-title'}).result.then((result) => {
    //   let closeResult = `Closed with: ${result}`;
    //   if(result=='ok'){
    //     this.helper.setAddressSelected(this.selectedLocation);
    //     this.save();
    // // this.addProCart(this.selectedFood);
    //   }
    // }, (reason) => {
    //   let closResult = `Dismissed ${this.getDismissReason(reason)}`;
    // });
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

  convertToNumber(latlng: string): number {
    return Number(latlng);
  }

  getAddress(latitude: number, longitude: number) {
    this.geoCoder.geocode(
      { location: { lat: latitude, lng: longitude } },
      (results: any, status: any) => {
        if (status === 'OK') {
          if (results[0]) {
            //this.zoom = 12;
            this.address = results[0].formatted_address;
            this.selectedLocation.formatted_address = this.address;
            this.selectedLocation.title = results[0].formatted_address;
            this.save();
          } else {
            window.alert('No results found');
          }
        } else {
          window.alert('Geocoder failed due to: ' + status);
        }
      }
    );
  }

  save() {
    if (
      this.helper.getLoggedInUser() &&
      this.selectedLocation.formatted_address &&
      this.selectedLocation.formatted_address.length > 2
    ) {
      if (this.selectedLocation.title) {
        if (this.selectedLocation.id == -1) {
          this.createAddress();
        } else {
          this.updateAddress();
        }
      } else {
        this.translate
          .get('err_field_address_title')
          .subscribe((value) => this.uiElementService.presentToast(value));
      }
    } else {
      this.translate
        .get('err_field_address')
        .subscribe((value) => this.uiElementService.presentToast(value));
    }
  }

  createAddress() {
    // this.translate.get(["address_creating", "something_wrong"]).subscribe(values => {
    //   this.uiElementService.presentLoading(values["address_creating"]);
    //   this.subscriptions.push(this.commonService.addressAdd(this.selectedLocation).subscribe(res => {
    //     this.uiElementService.dismissLoading();
    //     this.selectAddress(res);
    //   }, err => {
    //     console.log("addressAdd", err);
    //     this.uiElementService.dismissLoading();
    //     this.uiElementService.presentToast(values["something_wrong"]);
    //   }));
    // });
  }

  updateAddress() {
    this.translate
      .get(['address_updating', 'something_wrong'])
      .subscribe((values) => {
        this.uiElementService.presentLoading(values['address_updating']);
        this.subscriptions.push(
          this.commonService.addressUpdate(this.selectedLocation).subscribe(
            (res) => {
              this.uiElementService.dismissLoading();
              this.selectAddress(res);
            },
            (err) => {
              this.uiElementService.dismissLoading();
              this.uiElementService.presentToast(values['something_wrong']);
            }
          )
        );
      });
  }

  selectAddress(address: MyAddress) {
    window.localStorage.setItem('let_refresh', 'true');
    this.helper.setAddressSelected(address);
    // this.close();
  }

  loadAddresses() {
    this.subscriptions.push(
      this.commonService.getAddresses().subscribe(
        (res) => {
          this.uiElementService.dismissLoading();
          this.addresses = res ? res.reverse() : [];
          if (!this.selectedLocation) {
            this.selectedLocation = this.addresses[0];
          }
        },
        (err) => {
          this.uiElementService.dismissLoading();
          // this.isLoading = false;
        }
      )
    );
  }

  onLogoutClick() {
    try {
      (<any>window).FirebasePlugin.signOutUser(
        function () {
        },
        function (error: any) {
          console.error('Failed to sign out user: ' + error);
        }
      );
    } catch (e) {
      console.log('fireSignout', e);
    }
    try {
      let auth = firebase.getAuth();
      firebase.signOut(auth).then(
        function () {
        },
        function (error) {
          console.error('Sign Out Error', error);
        }
      );
    } catch (e) {
      console.log('fireSignout', e);
    }
    this.eComService.clearCart();
    this.helper.setLoggedInUserResponse(null);
    this.myEvent.setUserMeData(null);
    this.router.navigate(['/home']);
  }

  navTableBooking(bookATableContent: any, type?: string) {
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
      this.onBookTabelClick(bookATableContent, this.vendor, type);
    } else {
      this.translate
        .get('select_location')
        .subscribe((value) => this.uiElementService.presentErrorAlert('Login/Update your location first.'));
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

  submitBookingRequest(type?: string) {
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
          this.createAppointment(type);
        } else {
          this.translate
            .get('err_field_timeslot_passed')
            .subscribe((value) =>
              this.uiElementService.presentErrorAlert(value)
            );
        }
      } else {
        this.createAppointment(type);
      }
    }
  }

  private createAppointment(type?: string) {
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
          this.commonService.createAppointment(bookReq, type).subscribe(
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
  onBookTabelClick(content: any, restaurant: Vendor, type?: string) {
    this.vendor = restaurant;
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          if (result == 'yes') {
            this.submitBookingRequest(type);
            //this.addProCart(this.selectedFood);
          }
        },
        (reason: any) => { }
      );
  }

  changeMonth() {
    let index = -1;
    for (let i = 0; i < this.dates.length; i++) {
      if (this.dates[i].month == this.monthSelected) {
        index = i;
        break;
      }
    }
    if (index != -1) {
      this.datesToShow = this.dates[index].dates;
      this.markSelected(this.datesToShow[0]);
    }
  }

  doSearch() {
    if (this.searchQuery) {
      this.router.navigate(['/search'], {
        queryParams: { searchQuery: this.searchQuery },
      });
    }
  }


  get getLogo(): string {
    if (localStorage.getItem('vendors') && JSON.parse(localStorage.getItem('vendors') as string) && !this.vendor) {
      this.vendor = JSON.parse(localStorage.getItem('vendors') as string)
    }
    //console.log(this.vendor.mediaurls.images[0].default);

    return this.vendor?.mediaurls.images[0].default ? this.vendor?.mediaurls.images[0].default : 'assets/images/logo.jpg';
  }
  navigateToUrl() {
    const url = 'https://takeaway.lebaneat.co.uk';
    window.open(url, '_blank'); // Open the URL in a new tab
  }
}




$(window).scroll(function () {
  var scroll = $(window).scrollTop();
  if (scroll >= 10) {
    $('.navbar').addClass('backdrop');
  } else {
    $('.navbar').removeClass('backdrop');
  }
});
