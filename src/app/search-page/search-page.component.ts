import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Category } from 'src/common/models/category.model';
import { Constants } from 'src/common/models/constants.model';
import { Product } from 'src/common/models/product.model';
import { CommonService } from 'src/common/services/common.service';
import { VendorsService } from 'src/common/services/vendors.service';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss']
})
export class SearchPageComponent implements OnInit {
  public search: boolean = false;
  foods = new Array<Product>();
  private subscriptions = new Array<Subscription>();
  showSkeleton: boolean = true;
  id: number = this.commonService.vendorId?this.commonService.vendorId:Constants.VENDOR_ID;
  categories: Array<{ category: Category; menu_items: Array<Product> }> = [];
  private pageNo = 1;
  filteredCategories: Array<{
    category: Category;
    menu_items: Array<Product>;
  }> = [];

  constructor(   
     public router: Router,
     private route: ActivatedRoute,
     private vendorService: VendorsService,
     public commonService: CommonService,



  ) { }
  

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

}
