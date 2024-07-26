import { MapsAPILoader } from '@agm/core';
import {
  Component,
  ElementRef,
  EventEmitter,
  NgZone,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MyAddress } from 'src/common/models/address.model';
import { CommonService } from 'src/common/services/common.service';
import { HelperService } from 'src/common/services/helper.service';
import { UiElementsService } from 'src/common/services/ui-elements.service';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss'],
})
export class MapsComponent implements OnInit {
  @ViewChild('map', { static: true }) mapElement: ElementRef | undefined;
  @ViewChild('searchAddress') searchElementRef: ElementRef<HTMLInputElement> =
    {} as ElementRef;
  private geoCoder: any;
  private subscriptions = new Array<Subscription>();
  addresses = new Array<MyAddress>();
  address: string = '';
  @Output() savedAddressEvent = new EventEmitter<any>();
  selectedLocation: MyAddress = {
    id: 0,
    user_id: 0,
    title: '',
    formatted_address: '',
    latitude: '',
    longitude: '',
  };
  zoom: number = 12;
  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private uiElementService: UiElementsService,
    private translate: TranslateService,
    private commonService: CommonService,
    public helper: HelperService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.selectedLocation = this.helper.getAddressSelected();
    this.mapsAPILoader.load().then(() => {
      this.setCurrentLocation();
      this.geoCoder = new google.maps.Geocoder();
      let autocomplete = new google.maps.places.Autocomplete(
        this.searchElementRef.nativeElement,
        {
          componentRestrictions: { country: 'uk' }, // Restrict results to the UK
          types: ['geocode'], // Limit suggestions to geographic locations
        }
      );

      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          // Manually set the input field value to the selected suggestion
         // this.searchElementRef.nativeElement.value = place.name ? place.name : '';
          let currentLocation:MyAddress={
            id: -1,
            formatted_address: place.formatted_address ? place.formatted_address : '',
            title: place.name ? place.name : '',
            latitude: place.geometry.location.lat().toString(),
            longitude: place.geometry.location.lng().toString(),
            user_id: this.helper.getLoggedInUser() ? Number(this.helper.getLoggedInUser().id) : -1
          }

          this.selectedLocation=currentLocation;
          //set latitude, longitude and zoom
          // if (this.selectedLocation) {
          //   this.selectedLocation.latitude = place.geometry.location
          //     .lat()
          //     .toString();
          //   this.selectedLocation.longitude = place.geometry.location
          //     .lng()
          //     .toString();
          //   this.getAddress(
          //     place.geometry?.location.lat(),
          //     place.geometry?.location.lng()
          //   );
          //   debugger;

          // }
          // else {
          //   // this.selectedLocation = {
          //   //   formatted_address: place.formatted_address ? place.formatted_address : '',
          //   //   latitude: place.geometry.location.lat().toString(),
          //   //   longitude: place.geometry.location.lng().toString(),
          //   // };
          //   this.selectedLocation = {
          //     id: -1,
          //     formatted_address: place.formatted_address ? place.formatted_address : '',
          //     title: place.formatted_address ? place.formatted_address : '',
          //     latitude: place.geometry.location.lat().toString(),
          //     longitude: place.geometry.location.lng().toString(),
          //     user_id: this.helper.getLoggedInUser() ? Number(this.helper.getLoggedInUser().id) : -1,
          //   };
          //   this.getAddress(
          //     place.geometry.location.lat(),
          //     place.geometry.location.lng()
          //   );
          //   // this.getAddress(
          //   //   place.geometry?.location.lat(),
          //   //   place.geometry?.location.lng()
          //   // );

          // }
          this.zoom = 18;
        });
      });
    });
  }

  convertToNumber(latlng: string): number {
    return Number(latlng);
  }

  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      // navigator.geolocation.getCurrentPosition((position) => {
      if (!this.selectedLocation) {
        if (this.helper.getLoggedInUser()) {
          this.selectedLocation = this.addresses[0];
        }
        // else{
        //   this.selectedLocation=this.commonService.getDemoAddress();
        // }
      }
      if (this.selectedLocation) {
        // this.selectedLocation.latitude = position.coords.latitude.toString();
        // this.selectedLocation.longitude =
        //   position.coords.longitude.toString();
        this.getAddress(
          Number(this.selectedLocation.latitude),
          Number(this.selectedLocation.longitude)
        );
      }
      //  });
    }
  }

  getAddressOld(latitude: number, longitude: number) {
    if (!this.geoCoder) {
      this.geoCoder = new google.maps.Geocoder();
    }
    this.geoCoder?.geocode(
      { location: { lat: latitude, lng: longitude } },
      (results: any, status: any) => {
        if (status === 'OK') {
          if (results[0]) {
            //this.zoom = 12;
            this.address = results[0].formatted_address;
            if (this.selectedLocation) {
              this.selectedLocation.id = -1;
              this.selectedLocation.latitude = latitude.toString();
              this.selectedLocation.longitude = longitude.toString();
              this.selectedLocation.formatted_address = this.address;
              this.selectedLocation.title = results[0].formatted_address;
              this.searchElementRef.nativeElement.value =
                results[0].formatted_address;
              this.selectedLocation.user_id = this.helper.getLoggedInUser()
                ? Number(this.helper.getLoggedInUser().id)
                : -1;
            } else {
              this.selectedLocation = {
                id: -1,
                formatted_address: results[0].formatted_address,
                title: results[0].formatted_address,
                latitude: latitude.toString(),
                longitude: longitude.toString(),
                user_id: this.helper.getLoggedInUser()
                  ? Number(this.helper.getLoggedInUser().id)
                  : -1,
              };
              this.searchElementRef.nativeElement.value =
                this.selectedLocation.formatted_address;
            }
            //  this.save();
          } else {
            window.alert('No results found');
          }
        } else {
          window.alert('Geocoder failed due to: ' + status);
        }
      }
    );
  }
  getAddress(latitude: number, longitude: number) {
    if (!this.geoCoder) {
      this.geoCoder = new google.maps.Geocoder();
    }
    this.geoCoder.geocode(
      { location: { lat: latitude, lng: longitude } },
      (results: any, status: any) => {
        if (status === 'OK') {
          if (results[0]) {
            this.address = results[0].formatted_address;

            if (this.selectedLocation) {
              this.selectedLocation.id = -1;
              this.selectedLocation.latitude = latitude.toString();
              this.selectedLocation.longitude = longitude.toString();
              this.selectedLocation.formatted_address = this.address;
              this.selectedLocation.title = this.address; // Use the address as title
              this.searchElementRef.nativeElement.value = this.address;
              this.selectedLocation.user_id = this.helper.getLoggedInUser()
                ? Number(this.helper.getLoggedInUser().id)
                : -1;
            } else {
              this.selectedLocation = {
                id: -1,
                formatted_address: this.address,
                title: this.address,
                latitude: latitude.toString(),
                longitude: longitude.toString(),
                user_id: this.helper.getLoggedInUser()
                  ? Number(this.helper.getLoggedInUser().id)
                  : -1,
              };
              this.searchElementRef.nativeElement.value = this.address;
            }
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
          this.helper.setAddressSelected(this.selectedLocation);
          this.uiElementService.presentSuccessToast('Address Saved');
          // this.router.navigate(['/home']);
        } else {
          //this.updateAddress();
        }
      } else {
        this.translate
          .get('err_field_address_title')
          .subscribe((value) => this.uiElementService.presentToast(value));
      }
    } else {
      this.uiElementService.presentSuccessToast('Address Saved');
      // this.router.navigate(['/home']);
      // this.translate
      //   .get('err_field_address')
      //   .subscribe((value) => this.uiElementService.presentToast(value));
    }
  }

  createAddress() {
    this.translate
      .get(['address_creating', 'something_wrong'])
      .subscribe((values) => {
        this.uiElementService.presentLoading(values['address_creating']);
        this.subscriptions.push(
          this.commonService.addressAdd(this.selectedLocation).subscribe(
            (res) => {
              this.uiElementService.dismissLoading();
              this.selectAddress(res);
              this.savedAddressEvent.emit(res);
            },
            (err) => {
              this.uiElementService.dismissLoading();
              this.uiElementService.presentToast(values['something_wrong']);
            }
          )
        );
      });
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
              //  this.savedAddressEvent.emit(res)
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

  onSaveClick() {
    if (this.selectedLocation) {
      this.helper.setAddressSelected(this.selectedLocation);
      this.save();
    }
  }

  onAddressTypeChange(event: any) {
    if (event.target && event.target.value) {
      this.selectedLocation.title = event.target.value;
      this.helper.setAddressSelected(this.selectedLocation);
    }
  }
}
