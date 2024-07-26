import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as firebase from 'firebase/database';
import { Subscription } from 'rxjs';
import { Order } from 'src/common/models/order.model';
import { AppointeeList } from 'src/common/models/table-booking.model';
import { User } from 'src/common/models/user.model';
import { CommonService } from 'src/common/services/common.service';
import { HelperService } from 'src/common/services/helper.service';
import { UiElementsService } from 'src/common/services/ui-elements.service';
import { VendorsService } from 'src/common/services/vendors.service';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit {
  private subscriptions = new Array<Subscription>();
  private refresher: any;
  orders = new Array<Order>();
  isLoading = true;
  isLoadingAppointments = true;
  expandedOrderId = -1;
  private pageNo = 1;
  private pageNoAppointments = 1;
  private doneAll = false;
  private doneAllAppointments = false;
  // private myOrdersRef: firebase.;
  userMe!: User;
  appointments = new Array<AppointeeList>();

  constructor(private helper: HelperService,
    private translate: TranslateService,
    private vendorsService: VendorsService,
    public router: Router,
    private uiElementService: UiElementsService
  ) { }

  ngOnInit(): void {
    this.userMe = this.helper.getLoggedInUser();
    this.userMe = this.helper.getLoggedInUser();
    if (this.userMe != null && (!this.orders || !this.orders.length) && this.router.url.includes('my-orders')) {
      this.translate.get("loading").subscribe(value => {
        // this.uiElementService.presentLoading(value);
        this.getOrders();
        //  this.myOrdersRef = firebase.database().ref("users").child(this.userMe.id).child("orders");
      });
    }
    else if (this.router.url.includes('my-bookings')) {
      this.getAppointments();
    }
    else {
      this.isLoading = false;
      //  this.alertLogin();
    }
  }

  getOrders() {
    this.uiElementService.presentLoading('loading')

    this.vendorsService.getOrders(this.userMe.id).subscribe(res => {
      this.orders = this.orders.concat(res.data);
      // this.doneAll = (!res.data || !res.data.length);
      this.doneAll = !res.links.next;
      this.reFilter();
      this.uiElementService.dismissLoading();
      this.isLoading = false;
    }, err => {

      this.uiElementService.dismissLoading();
    });
  }

  getAppointments() {
    this.uiElementService.presentLoading('loading')
    this.subscriptions.push(this.vendorsService.getAppointmentList(this.userMe.id, this.pageNoAppointments).subscribe((res: any) => {
      this.appointments = this.appointments.concat(res.data);
      this.doneAllAppointments = !res.links.next;
      this.reFilterAppointments();
      // if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
      // if (this.refresher) this.refresher.target.complete();
      this.isLoadingAppointments = false;
      this.uiElementService.dismissLoading();
      //this.uiElementService.dismissLoading();
    }, err => {
      console.log("getAppointmentList", err);
      //if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
      //if (this.refresher) this.refresher.target.complete();
      this.isLoadingAppointments = false;
      this.uiElementService.dismissLoading();
      //this.uiElementService.dismissLoading();
    }));

  }

  private reFilterAppointments() {
    let appointmentUpcoming = new AppointeeList();
    appointmentUpcoming.id = -1;
    appointmentUpcoming.type = "upcoming_appointments";
    let appointmentPast = new AppointeeList();
    appointmentPast.id = -2;
    appointmentPast.type = "past_appointments";

    let statusesPast = "cancelled,rejected,complete";

    let allAppointments = new Array<AppointeeList>();
    allAppointments.push(appointmentUpcoming);
    for (let order of this.appointments) if (order.id && order.id > 0 && (!statusesPast.includes(order.status) && !order.isPassed)) allAppointments.push(order);
    allAppointments.push(appointmentPast);
    for (let order of this.appointments) if (order.id && order.id > 0 && (statusesPast.includes(order.status) || order.isPassed)) allAppointments.push(order);

    if (allAppointments[1].id < 0) allAppointments.splice(0, 1);
    if (allAppointments[allAppointments.length - 1].id < 0) allAppointments.splice(allAppointments.length - 1, 1);
    this.appointments = allAppointments.length ? allAppointments : [];
  }

  private reFilter() {
    if (this.orders.length > 0) {
      let orderProgress: any = { id: -1, type: "orders_in_process" };
      // orderProgress.id = -1;
      // orderProgress.type = "orders_in_process";
      let orderPast: any = { id: -2, type: 'past_orders' };
      // orderPast.id = -2;
      // orderPast.type = "past_orders";

      let statusesPast = "cancelled,rejected,refund,failed,complete";

      let allOrders = new Array<Order>();
      //allOrders.push(orderProgress);
      for (let order of this.orders) if (order.id && order.id > 0 && !statusesPast.includes(order.status)) allOrders.push(order);
      // allOrders.push(orderPast);
      for (let order of this.orders) if (order.id && order.id > 0 && statusesPast.includes(order.status)) allOrders.push(order);

      if (allOrders[1]?.id < 0) allOrders.splice(0, 1);
      if (allOrders[allOrders.length - 1].id < 0) allOrders.splice(allOrders.length - 1, 1);
      this.orders = allOrders.length ? allOrders : [];
    }
  }

  toggleOrderExpansion(order: Order) {
    // this.expandedOrderId = Number((this.expandedOrderId == order.id) ? -1 : order.id);
    let navigationExtras: NavigationExtras = { state: { order: order } };
    this.router.navigate(['/order-detail'], navigationExtras);
  }

  get getTitle():string {
    let title:string = this.router.url.includes('my-bookings') ? 'my_bookings' : 'my_orders';
    return title;
  }

}
