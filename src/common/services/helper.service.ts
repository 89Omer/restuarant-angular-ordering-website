import { Injectable } from '@angular/core';
import { MyAddress } from '../models/address.model';
import { AuthResponse } from '../models/auth-response.model';
import { Category } from '../models/category.model';
import { Constants } from '../models/constants.model';
import { MyMeta } from '../models/meta.model';
import { MyNotification } from '../models/notification.model';
import { User } from '../models/user.model';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class HelperService {
  registerPhone: BehaviorSubject<any> = new BehaviorSubject({});
  constructor() { }

  toFixedNumber(no: number) {
    //return Math.round(no * Math.pow(10, 2)) / Math.pow(10, 2);
    return no.toFixed(2);
  }
  getHomeBanners(): Array<Category> {
    let adl: Array<Category> = window.localStorage.getItem(Constants.KEY_SAVED_BANNER) ? JSON.parse(window.localStorage.getItem(Constants.KEY_SAVED_BANNER) as string) : [];
    return (adl && adl.length) ? adl : new Array<Category>();
  }
  setHomeBanners(banners: Array<Category>) {
    window.localStorage.setItem(Constants.KEY_SAVED_BANNER, JSON.stringify(banners));
  }
  getHomeCategories(): Array<Category> {
    let adl: Array<Category> = window.localStorage.getItem(Constants.KEY_SAVED_CATEGORY) ? JSON.parse(window.localStorage.getItem(Constants.KEY_SAVED_CATEGORY) as string) : [];
    return (adl && adl.length) ? adl : new Array<Category>();
  }
  setHomeCategories(cats: Array<Category>) {
    window.localStorage.setItem(Constants.KEY_SAVED_CATEGORY, JSON.stringify(cats));
  }
  formatPhone(phone: string): string {
    let toReturn = phone.replace(/\s/g, '');
    while (toReturn.startsWith("0")) toReturn = toReturn.substring(1);
    return toReturn;
  }
  formatDistance(distance: number, distanceMetric: string): string {
    if (!distance) distance = 0;
    //let divider: number = (distanceMetric == "km") ? 1000 : 1609.34;
    let divider: number = (distanceMetric == "miles") ? 1000 : 1609.34;
    // console.log('Distane is'+distanceMetric);
    //return this.toFixedNumber(Number(distance / divider)).toString();
    return this.toFixedNumber(Number(distance)).toString();

  }
  setSearchHistory(sh: Array<string>) {
    window.localStorage.setItem(Constants.KEY_SEARCH_HISTORY, JSON.stringify(sh));
  }
  getSearchHistory(): Array<string> {
    let adl: Array<string> = window.localStorage.getItem(Constants.KEY_SEARCH_HISTORY) ? JSON.parse(window.localStorage.getItem(Constants.KEY_SEARCH_HISTORY) as string) : [];
    return (adl && adl.length) ? adl : new Array<string>();
  }
  getReviewedProductIds(): Array<string> {
    let adl: Array<string> = window.localStorage.getItem(Constants.KEY_REVIEWED_PRODUCTS) ? JSON.parse(window.localStorage.getItem(Constants.KEY_REVIEWED_PRODUCTS) as string) : [];
    return (adl && adl.length) ? adl : new Array<string>();
  }
  addReviewedProductId(id: string) {
    let adl: Array<string> = this.getReviewedProductIds();
    adl.push(id);
    window.localStorage.setItem(Constants.KEY_REVIEWED_PRODUCTS, JSON.stringify(adl));
  }
  getReviewedVendorIds(): Array<string> {
    let adl: Array<string> = JSON.parse(window.localStorage.getItem(Constants.KEY_REVIEWED_VENDORS) as string);
    return (adl && adl.length) ? adl : new Array<string>();
  }
  addReviewedVendorId(id: string) {
    let adl: Array<string> = this.getReviewedVendorIds();
    adl.push(id);
    window.localStorage.setItem(Constants.KEY_REVIEWED_PRODUCTS, JSON.stringify(adl));
  }
  setAddresses(addresses: Array<MyAddress>) {
    window.localStorage.setItem(Constants.KEY_ADDRESSES, JSON.stringify(addresses));
  }
  getAddresses(): Array<MyAddress> {
    let adl: Array<MyAddress> = JSON.parse(window.localStorage.getItem(Constants.KEY_ADDRESSES) as string);
    return (adl && adl.length) ? adl : new Array<MyAddress>();
  }
  setSettings(settings: Array<MyMeta>) {
    window.localStorage.setItem(Constants.KEY_SETTINGS, JSON.stringify(settings));
  }
  getSettings(): Array<MyMeta> {
    return JSON.parse(window.localStorage.getItem(Constants.KEY_SETTINGS) as string);
  }
  setLoggedInUser(user: User) {
    window.localStorage.setItem(Constants.KEY_USER, JSON.stringify(user));
  }
  setLoggedInUserResponse(authRes: AuthResponse | null) {
    window.localStorage.removeItem(Constants.KEY_USER);
    window.localStorage.removeItem(Constants.KEY_TOKEN);
    //window.localStorage.removeItem(Constants.KEY_ADDRESS);
    //window.localStorage.removeItem(Constants.KEY_ADDRESSES);
    window.localStorage.removeItem(Constants.KEY_NOTIFICATIONS);

    if (authRes && authRes.user && authRes.token) {
      window.localStorage.setItem(Constants.KEY_USER, JSON.stringify(authRes.user));
      window.localStorage.setItem(Constants.KEY_TOKEN, authRes.token);
    }
  }
  getToken() {
    return window.localStorage.getItem(Constants.KEY_TOKEN);
  }
  getChatChild(userId: string, myId: string) {
    //example: userId="9" and myId="5" -->> chat child = "5-9"
    let values = [userId, myId];
    values.sort((one, two) => (one > two ? -1 : 1));
    return values[0] + "-" + values[1];
  }
  getLoggedInUser(): User {
    return JSON.parse(window.localStorage.getItem(Constants.KEY_USER) as string);
  }
  getAddressSelected(): MyAddress {
    return JSON.parse(window.localStorage.getItem(Constants.KEY_ADDRESS) as string);
  }
  getSetectedAddress(): MyAddress {
    return JSON.parse(window.localStorage.getItem(Constants.KEY_SETECT_ADDRESS) as string);
  }
  getLocale(): string {
    let sl = window.localStorage.getItem(Constants.KEY_LOCALE);
    return sl && sl.length ? sl : "en";
  }
  getLanguageDefault(): string {
    return window.localStorage.getItem(Constants.KEY_DEFAULT_LANGUAGE) as string;
  }
  setLanguageDefault(language: string) {
    window.localStorage.setItem(Constants.KEY_DEFAULT_LANGUAGE, language);
  }
  setLocale(lc: string) {
    window.localStorage.setItem(Constants.KEY_LOCALE, lc);
  }
  setAddressSelected(location: MyAddress) {
    window.localStorage.setItem(Constants.KEY_ADDRESS, JSON.stringify(location));
  }
  seThemeMode(status: string) {
    window.localStorage.setItem(Constants.KEY_DARK_MODE, status);
  }
  getThemeMode(defaultTheme: string) {
    let toReturn = window.localStorage.getItem(Constants.KEY_DARK_MODE);
    if (!toReturn) toReturn = defaultTheme;
    return toReturn;
  }
  getSetting(settingKey: string) {
    let settings: Array<MyMeta> = this.getSettings();
    let toReturn: string = '';
    if (settings) {
      for (let s of settings) {
        if (s.key == settingKey) {
          toReturn = (settingKey == 'currency_icon') ? s.value + " " : s.value;
          break;
        }
      }
    }
    return toReturn;
  }
  saveNotification(notiTitle: string, notiBody: string, notiTime: string) {
    let notifications: Array<MyNotification> = JSON.parse(window.localStorage.getItem(Constants.KEY_NOTIFICATIONS) as string);
    if (!notifications) notifications = new Array<MyNotification>();
    notifications.push(new MyNotification(notiTitle, notiBody, notiTime));
    window.localStorage.setItem(Constants.KEY_NOTIFICATIONS, JSON.stringify(notifications));
  }
  formatMillisDayDateTime(millis: number, locale: string): string {
    return moment(millis).locale(locale).format("ddd, MMM D, HH:mm");
  }
  formatMillisDateTime(millis: number, locale: string): string {
    return moment(millis).locale(locale).format("MMM D, HH:mm");
  }
  formatTimestampDateDayTime(timestamp: string, locale: string): string {
    return moment.utc(timestamp).locale(locale).format("ddd, MMM D, HH:mm");
  }
  formatTimestampDateTime(timestamp: string, locale: string): string {
    return moment.utc(timestamp).locale(locale).format("MMM D, HH:mm");
  }
  formatTimestampDayMonth(timestamp: string, locale: string): string {
    return moment.utc(timestamp).locale(locale).format("MMM D");
  }
  formatMillisDate(millis: number, locale: string): string {
    return moment(millis).locale(locale).format("Do MMM YYYY");
  }
  formatTimestampDate(timestamp: string, locale: string): string {
    return moment.utc(timestamp).locale(locale).format("Do MMM YYYY");
  }
  formatMillisTime(millis: number, locale: string): string {
    return moment(millis).locale(locale).format("HH:mm");
  }
  formatTimestampTime(timestamp: string, locale: string): string {
    return moment.utc(timestamp).locale(locale).format("HH:mm");
  }

  // getDistanceBetweenTwoCoordinates(lat1: number, lon1: number, lat2: number, lon2: number) {
  //   let R = 6371; // Radius of the earth in km
  //   let dLat = (lat2 - lat1) * (Math.PI / 180);  // deg2rad below
  //   let dLon = (lon2 - lon1) * (Math.PI / 180);
  //   let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  //   let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  //   let d = R * c; // Distance in km
  //   return d * 1000; // Returning in meters
  // }
  //This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
  getDistanceBetweenTwoCoordinates(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371; // km
    var dLat = this.toRad(lat2 - lat1);
    var dLon = this.toRad(lon2 - lon1);
    var lat1 = this.toRad(lat1);
    var lat2 = this.toRad(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
  }
  getCustomdistance(lat1: number, lon1: number, lat2: number, lon2: number, unit: string) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
      return 0;
    }
    else {
      var radlat1 = Math.PI * lat1 / 180;
      var radlat2 = Math.PI * lat2 / 180;
      var theta = lon1 - lon2;
      var radtheta = Math.PI * theta / 180;
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = dist * 180 / Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit == "K") { dist = dist * 1.609344 }
      if (unit == "N") { dist = dist * 0.8684 }
      if (unit == 'mile') { dist = dist * 0.000621 }
      return dist;
    }
  }

  // Converts numeric degrees to radians
  toRad(Value: number) {
    return Value * Math.PI / 180;
  }
}

