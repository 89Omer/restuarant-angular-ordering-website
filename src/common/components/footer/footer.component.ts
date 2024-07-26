import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/data.service';
import { Constants } from 'src/common/models/constants.model';
import { CommonService } from 'src/common/services/common.service';
import { Vendor } from 'src/common/models/vendor.model';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  constructor(public router: Router, private _dataService: DataService,private commonService:CommonService) {}

  startTime: string = 'N/A';
  endTime: string = 'N/A';
  availablities: any[] = [];
  address: string = Constants.FOOTER_ADDRESS;
  phone: string = Constants.PHONE;
  ngOnInit(): void {
    this._dataService.getAvailablity.subscribe((data: any[]) => {
      this.availablities = data;
    });

    if (localStorage.getItem('availablity')) {
      this.availablities = JSON.parse(
        localStorage.getItem('availablity') as string
      );
    }
    // this._dataService.getStartTime.subscribe((data: string) => {
    //   this.startTime = data;
    // });

    // this._dataService.getEndTime.subscribe((data: string) => {
    //   this.startTime = data;
    // });

    // if (localStorage.getItem('startTime'))
    //   this.startTime = String(localStorage.getItem('startTime'));

    // if (localStorage.getItem('endTime'))
    //   this.endTime = String(localStorage.getItem('endTime'));
    this.commonService.branchUpdate.subscribe(resp=>{
      if(resp){
       let vendor=this.commonService.selectedVendor;
      if(vendor){
        this.address=vendor.address;
      }
      }});
  }
}
