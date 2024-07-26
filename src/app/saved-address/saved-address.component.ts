import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MyEventsService } from 'src/common/events/my-events.service';
import { MyAddress } from 'src/common/models/address.model';
import { Constants } from 'src/common/models/constants.model';
import { CommonService } from 'src/common/services/common.service';
import { ECommerceService } from 'src/common/services/ecommerce.service';
import { HelperService } from 'src/common/services/helper.service';
import { UiElementsService } from 'src/common/services/ui-elements.service';
import { VendorsService } from 'src/common/services/vendors.service';

@Component({
  selector: 'app-saved-address',
  templateUrl: './saved-address.component.html',
  styleUrls: ['./saved-address.component.scss'],
})
export class SavedAddressComponent implements OnInit {
  addresses = new Array<MyAddress>();
  private subscriptions = new Array<Subscription>();

  constructor(
    private uiElementService: UiElementsService,
    private apiService: CommonService,
    private eComService: ECommerceService,
    private Helper: HelperService,
    private myEventService: MyEventsService,
    private router: Router,
    private vendorsService: VendorsService
  ) {}

  ngOnInit(): void {
    if (this.Helper.getLoggedInUser()) {
      this.getAddressList();
    }
  }

  getAddressList() {
    this.uiElementService.presentLoading('loading...');

    this.subscriptions.push(
      this.apiService.getAddresses().subscribe(
        (res) => {
          this.uiElementService.dismissLoading();
          this.addresses = res ? res.reverse() : [];
          this.uiElementService.dismissLoading();
        },
        (err) => {
          this.uiElementService.dismissLoading();
        }
      )
    );
  }

  addressSelected(addressSelected: MyAddress) {
    if (addressSelected != null) {
      // if (this.pick_location) {
      this.selectAddress(addressSelected);
      this.myEventService.setAddressData(addressSelected);
      this.getVendorById(addressSelected);
      // } else if (this.drop_location) {
      //   this.navCtrl.pop();
      // this.myEventService.setLocationDrop(addressSelected);
      // } else {
      //   this.refreshAddresses = false;
      //   let navigationExtras: NavigationExtras = { state: { address: addressSelected, pick_location: false } };
      //  // this.navCtrl.navigateForward(['./set-location'], navigationExtras);
      // }
      this.router.navigate(['/home']);
    }
  }

  getVendorById(addressSelected: MyAddress) {
    this.vendorsService.getVendorById(this.apiService.vendorId?this.apiService.vendorId:Constants.VENDOR_ID).subscribe((res) => {
      if (res) {
        this.vendorsService.setupVendor(res, addressSelected);
        // this.vendor = res;
        localStorage.setItem('vendors', JSON.stringify(res));
      }
    });
  }

  selectAddress(address: MyAddress) {
    this.Helper.setAddressSelected(address);
    this.getVendorById(address)
    // this.eComService.setupOrderRequestAddress(address);
    //this.navCtrl.pop();
  }

  onAddressSaved(event: any) {
    if (this.addresses?.length > 0) {
      let addresses = [
        ...this.addresses.slice(0, 0),
        event,
        ...this.addresses.slice(0),
      ];
      this.addresses = addresses;
    }
    this.addresses.push(event);
  }
}
