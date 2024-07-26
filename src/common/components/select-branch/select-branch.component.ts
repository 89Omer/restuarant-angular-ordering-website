import { MapsAPILoader } from '@agm/core';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MyAddress } from 'src/common/models/address.model';
import { Constants } from 'src/common/models/constants.model';
import { CommonService } from 'src/common/services/common.service';
import { HelperService } from 'src/common/services/helper.service';
import { UiElementsService } from 'src/common/services/ui-elements.service';
import { VendorsService } from 'src/common/services/vendors.service';

@Component({
  selector: 'app-select-branch',
  templateUrl: './select-branch.component.html',
  styleUrls: ['./select-branch.component.scss'],
})
export class SelectBranchComponent implements OnInit {
  @Input() data?: any;
  private subscriptions = new Array<Subscription>();
  branches: any[] = [];
  selectedBranch: any;

  constructor(
    public activeModal: NgbActiveModal,
    private commonService: CommonService,
    public helper: HelperService,
    private router: Router,
    private vendorService: VendorsService
  ) {}

  ngOnInit(): void {
    this.getBranches();
  }

  convertToNumber(latlng: string): number {
    return Number(latlng);
  }

  private setCurrentLocation() {}

  getAddress(latitude: number, longitude: number) {}
  save() {}

  createAddress() {}

  updateAddress() {}
  selectAddress(address: MyAddress) {
    window.localStorage.setItem('let_refresh', 'true');
    this.helper.setAddressSelected(address);
    this.router.navigate(['/restaurant']);
    this.activeModal.close();
    // this.close();
  }

  loadAddresses() {}

  onSaveClick() {
    if(this.selectedBranch){
      this.commonService.selectedVendor=this.branches.find(f=>f.id==this.selectedBranch);
      this.commonService.vendorId= this.selectedBranch;
      let selectedLocation = this.helper.getAddressSelected();
      this.vendorService.getVendorById(this.commonService.vendorId ? this.commonService.vendorId : Constants.VENDOR_ID).subscribe((res) => {
        if (res) {
          this.vendorService.setupVendor(res, selectedLocation);
          this.commonService.selectedVendor=res;
          localStorage.setItem('vendors', JSON.stringify(res));
          this.commonService.setTitle(res.name);
          this.commonService.setFavIcon();
          // this.setCategories(this.vendor, id);
          this.activeModal.close(true);
        }
      })
    }
  }
  getBranches() {
    this.vendorService
      .getVendorBranches(Constants.VENDOR_ID)
      .subscribe((res) => {
        if (res.data) {
          this.vendorService.getVendorById(Constants.VENDOR_ID).subscribe(resp=>{
            this.branches.push(resp);
             res.data.forEach(f=>{
              this.branches.push(f);
             })
          });
        }
      });
  }
}
