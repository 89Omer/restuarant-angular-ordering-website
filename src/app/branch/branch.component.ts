import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Constants } from 'src/common/models/constants.model';
import { Vendor } from 'src/common/models/vendor.model';
import { CommonService } from 'src/common/services/common.service';
import { HelperService } from 'src/common/services/helper.service';
import { VendorsService } from 'src/common/services/vendors.service';

@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss']
})
export class BranchComponent implements OnInit {

  branches: any[] = [];
  selectedBranch: any;
  isLoading = true;
  vendor!: Vendor;


  constructor(private router: Router, private vendorService: VendorsService, private helper: HelperService, private commonService: CommonService,) { }

  ngOnInit(): void {
    var javathis = this;
    window.onscroll = function (ev) {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 50
      ) {
        // you're at the bottom of the page
        if (javathis.isLoading) return;
      }
    };

    if (!localStorage.getItem(Constants.KEY_BRANCH)) {
      this.getBranches();
    } else {
      let branches = localStorage.getItem(Constants.KEY_BRANCH)
        ? JSON.parse(localStorage.getItem(Constants.KEY_BRANCH) as string)
        : undefined;

      branches.forEach((data: any) => {
        this.branches.push(data);
      });
    }
  }

  getBranches() {
    this.isLoading = true;
    this.vendorService.getVendorBranches(Constants.VENDOR_ID).subscribe((res) => {
      if (res.data) {
        this.vendorService.getVendorById(Constants.VENDOR_ID).subscribe((resp) => {
          this.branches.push(resp);
          res.data.forEach((f) => {
            this.branches.push(f);
          });
          localStorage.setItem('branches', JSON.stringify(this.branches));
          this.isLoading = false;
        });
      }
    });
  }

  selectBranch(branchId: number) {
    if (branchId) {
      let localBranches = localStorage.getItem('branches');

      if (!localBranches) {
        this.vendorService.getVendorById(branchId).subscribe((vendor: Vendor) => {
          if (vendor) {
            this.vendorService.setupVendor(vendor, this.helper.getAddressSelected());
            localStorage.setItem('vendors', JSON.stringify(vendor));
            this.commonService.setTitle(vendor.name);
            this.commonService.setFavIcon();
            this.router.navigate(['/restaurant']);

            // Update Constants.VENDOR_ID with the selected branch's ID
            Constants.VENDOR_ID = branchId;
            Constants.FOOTER_ADDRESS = vendor.address;
            Constants.PHONE = vendor.user.mobile_number;
          }
        });
      }

      else {
        let branches = JSON.parse(localBranches);
        let vendor = this.branches.find(restaurant => restaurant.id === branchId);
        this.vendorService.setupVendor(vendor, this.helper.getAddressSelected());
        localStorage.setItem('vendors', JSON.stringify(vendor));
        this.commonService.setTitle(vendor.name);
        this.commonService.setFavIcon();
        this.router.navigate(['/restaurant']);

        // Update Constants.VENDOR_ID with the selected branch's ID
        Constants.VENDOR_ID = branchId;
        Constants.FOOTER_ADDRESS = vendor.address;
        Constants.PHONE = vendor.user.mobile_number;
      }
    }
  }

  get getLogo(): string {
    if (localStorage.getItem('vendors') && JSON.parse(localStorage.getItem('vendors') as string) && !this.vendor) {
      this.vendor = JSON.parse(localStorage.getItem('vendors') as string)
    }
    //console.log(this.vendor.mediaurls.images[0].default);

    return this.vendor?.mediaurls.images[0].default ? this.vendor?.mediaurls.images[0].default : 'assets/images/logo.jpg';
  }
}
