import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, tap } from 'rxjs';
import { VendorsService } from '../services/vendors.service';
import { Vendor } from '../models/vendor.model';
import { ECommerceService } from '../services/ecommerce.service';
import { Constants } from '../models/constants.model';
import { CommonService } from '../services/common.service';

@Injectable({
  providedIn: 'root',
})
export class RoutingGuard implements CanActivate {
  vendor!: Vendor;
  weekDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  constructor(
    private router: Router,
    private vendorsService: VendorsService,
    public eComService: ECommerceService,
    private commonService:CommonService,
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (localStorage.getItem('vendors')) {
      this.vendor = JSON.parse(localStorage.getItem('vendors') as string);
    }
    if (state.url.includes('home')) {
      if (this.vendor) {
        let meta = this.vendor.meta;
        if (!meta?.home_page && meta?.home_page != undefined) {
          this.router.navigate(['restaurant']);
          return false;
        } else {
          return true;
        }
      } else {
        return this.vendorsService.getVendor(this.commonService.vendorId?this.commonService.vendorId:Constants.VENDOR_ID).pipe(
          tap((isVendor: boolean) => {
            if (isVendor) {
              this.vendor = JSON.parse(
                localStorage.getItem('vendors') as string
              );
              if (
                this.vendor.meta.home_page ||
                this.vendor.meta.home_page == undefined
              ) {
                return (
                  this.vendor.meta.home_page ||
                  this.vendor.meta.home_page == undefined
                );
              } else {
                this.router.navigate(['restaurant']);
                return false;
              }
            } else {
              return false;
            }
          })
        );
      }
    } else if (state.url.includes('check-out')) {
      if (this.vendor) {
        return this.isResturantOpenOrClose(this.vendor?.availability) &&
          this.eComService.getCartItems().length &&
          Number(this.getTotalCartItemPrice()) >= this.vendor?.minimum_order
          ? true
          : false;
      } else {
        return this.vendorsService.getVendor(this.commonService.vendorId?this.commonService.vendorId:Constants.VENDOR_ID).pipe(
          tap((isVendor: boolean) => {
            if (isVendor) {
              this.vendor = JSON.parse(
                localStorage.getItem('vendors') as string
              );
              return this.isResturantOpenOrClose(this.vendor?.availability) &&
                this.eComService.getCartItems().length &&
                Number(this.getTotalCartItemPrice()) >=
                  this.vendor?.minimum_order
                ? true
                : false;
            } else {
              return false;
            }
          })
        );
      }
    } else {
      return true;
    }
  }
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
          price += +ch.price;
        }
      });
    });

    if (item.quantity > 0) quantity = item.quantity;
    price *= quantity;
    //price += this.addOns.find(i=> i.selected).price;
    return price.toFixed(2) || 0.0;
  }

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

  isResturantOpenOrClose(availability: any[]): boolean {
    let isOpen = false;
    const now = new Date();
    const currentDay = this.weekDays[now.getDay()];
    if (availability.length == 0) {
      isOpen = true;
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
        now.setHours(now.getHours() + 24);
      }
      if (now >= start && now <= end) {
        isOpen = true;
      }
    }
    return isOpen;
  }
}
