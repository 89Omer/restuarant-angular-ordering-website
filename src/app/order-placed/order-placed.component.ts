import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ECommerceService } from 'src/common/services/ecommerce.service';

@Component({
  selector: 'app-order-placed',
  templateUrl: './order-placed.component.html',
  styleUrls: ['./order-placed.component.scss']
})
export class OrderPlacedComponent implements OnInit {
  processing: boolean = false;
  paymentDone: boolean = false;
  constructor(public router: Router,
    private eComService:ECommerceService) { }

  ngOnInit(): void {
    if (history.state.order && this.router.url.includes('order-placed')) {
      let order = history.state.order;
      let orderPayment =history.state.payment;
      let stripeTokenId = history.state.stripeTokenId;
      let authorizeNetCard =history.state.authorizeNetCard;
      if (!orderPayment) orderPayment = order.payment;
      this.paymentDone = orderPayment.payment_method.slug == "cod" || orderPayment.payment_method.slug == "payment_sense";
      this.processing = orderPayment.payment_method.slug != "cod" && orderPayment.payment_method.slug != "payment_sense";
      if (orderPayment.payment_method.slug == "cod" || orderPayment.payment_method.slug == "payment_sense") {
        this.eComService.clearCart();
      } else {
        let payuMeta;
        if (orderPayment.payment_method.slug == "payu") {
          payuMeta = {
            name: order.user.name.replace(/\s/g, ''),
            mobile: order.user.mobile_number.replace(/\s/g, ''),
            email: order.user.email.replace(/\s/g, ''),
            bookingId: String(Math.floor(Math.random() * (99 - 10 + 1) + 10)) + String(order.id),
            productinfo: order.vendor.name.replace(/\s/g, ''),
          };
        }
        let navigationExtras: NavigationExtras = { state: { payment: orderPayment, payuMeta: payuMeta, stripeTokenId: stripeTokenId, authorizeNetCard: authorizeNetCard } };
        this.router.navigate(['/check-out'], navigationExtras);
      }
    }
  }
  ngAfterViewInit(){
    let listenProcessPayment = window.localStorage.getItem("listen_process_payment");
    if (listenProcessPayment && listenProcessPayment.length && this.router.url.includes('order-placed')) {
      let resultProcessPayment = window.localStorage.getItem("result_process_payment");
      this.paymentDone = resultProcessPayment && resultProcessPayment == "true"?true:false;
      this.processing = false;
      if (this.paymentDone) this.eComService.clearCart();
      window.localStorage.removeItem("listen_process_payment");
    }
  }


}
