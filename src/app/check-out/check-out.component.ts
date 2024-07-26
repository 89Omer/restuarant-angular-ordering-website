import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { StripeInstance, StripeService } from 'ngx-stripe';
import { Subscription, timer } from 'rxjs';
import { CardInfo } from 'src/common/models/card-info.model';
import { PaymentMethod } from 'src/common/models/payment-method.model';
import { PaymentSenseData } from 'src/common/models/paymentSense.model';
import { Product } from 'src/common/models/product.model';
import { CommonService } from 'src/common/services/common.service';
import {
  CartItem,
  ECommerceService,
} from 'src/common/services/ecommerce.service';
import { HelperService } from 'src/common/services/helper.service';
import { LazyLoadService } from 'src/common/services/lazy-load.service';
import { UiElementsService } from 'src/common/services/ui-elements.service';
import { environment } from 'src/environments/environment';
import {
  ConnectCardInfoComponent,
  PAYCONFIG,
} from '../card-info/connect-card-info/connect-card-info.component';
import { VendorsService } from 'src/common/services/vendors.service';
import { Constants } from 'src/common/models/constants.model';
import { LoginPopupComponent } from 'src/common/components/login-popup/login-popup.component';
import { CardInfoComponent } from '../card-info/card-info/card-info.component';
declare var Connect: any;

@Component({
  selector: 'app-check-out',
  templateUrl: './check-out.component.html',
  styleUrls: ['./check-out.component.scss'],
})
export class CheckOutComponent implements OnInit {
  cartItems: any[] = [
    { id: 1, name: 'Your Pizza Bar', count: 2, price: 12 },
    { id: 2, name: 'Shwarma', count: 1, price: 6 },
  ];
  deliveryFee: number = 0;
  serviceFee: number = 0;
  paymentMethods = new Array<PaymentMethod>();
  private subscriptions = new Array<Subscription>();
  paymentMethoIdSelected = -1;
  accessToken: string = '';
  connectE: any;
  order: any;
  allCartItems: any;
  isCard_payment: boolean = true;
  vendor: any;
  private stripeCardTokenId: string = '';

  notes: string = '';
  constructor(
    public ecomService: ECommerceService,
    private translate: TranslateService,
    private uiElementService: UiElementsService,
    private commonService: CommonService,
    private router: Router,
    private helper: HelperService,
    private modalService: NgbModal,
    private lazyLoadScriptService: LazyLoadService,
    private spinnerService: NgxSpinnerService,
    private vendorsService: VendorsService,
    private stripe: StripeService
  ) {
    this.translate.get('loading').subscribe((value) => {
      this.uiElementService.presentLoading(value);
      this.subscriptions.push(
        this.commonService.getPaymentMethods().subscribe(
          (res) => {
            const payments = this.spliceFor(res, []);
            setTimeout(() => {
              const vendor = localStorage.getItem('vendors');
              if (vendor) {
                let v = JSON.parse(vendor);
                this.vendor = v;

                this.paymentMethods = payments;
                if (!this.checkCOD) {
                  this.paymentMethods = this.paymentMethods.filter(
                    (f) => f.slug != 'cod'
                  );
                }
                if (!v.meta.card_payment) {
                  this.paymentMethods = this.paymentMethods.filter(
                    (f) => f.id != 4
                  );
                }
                //this.paymentMethods = payments;
                //this.isCard_payment = v.meta.card_payment;
              }
              this.uiElementService.dismissLoading();
            }, 500);
          },
          (err) => {
            this.uiElementService.dismissLoading();
          }
        )
      );
    });
  }

  ngOnInit(): void {
    this.allCartItems = this.ecomService.getCartItems();
    if (!this.vendor) {
      this.commonService.branchUpdate.subscribe(resp=>{
        if(resp){
          this.vendorsService
          .getVendorById(this.commonService.vendorId?this.commonService.vendorId:Constants.VENDOR_ID)
          .subscribe((res) => {
            this.vendorsService.setupVendor(
              res,
              this.helper.getAddressSelected()
            );
            // this.vendor = res;
            localStorage.setItem('vendors', JSON.stringify(res));
            this.vendor = JSON.parse(localStorage.getItem('vendors') as string);
            if (this.ecomService.getDeliveryTpe() == 'normal') {
              if (
                this.helper.getLoggedInUser() &&
                this.helper.getAddressSelected()
              ) {
                this.subscriptions.push(
                  this.commonService
                    .calculateDeliveryFee(
                      this.commonService.vendorId?this.commonService.vendorId:Constants.VENDOR_ID,
                      this.vendor?.latitude,
                      this.vendor.longitude,
                      +this.helper.getAddressSelected().latitude,
                      +this.helper.getAddressSelected().longitude
                    )
                    .subscribe((res) => {
                      let deliveryFee: number = 0;
                      try {
                        deliveryFee = Number(res.delivery_fee);
                      } catch (e) {
                        console.log('invalid number: ', res);
                      } finally {
                        deliveryFee = Number(res.delivery_fee);
                        if (deliveryFee != 0) {
                          this.ecomService.setDeliveryFee(deliveryFee);
                        } else {
                          this.ecomService.setDeliveryFee(deliveryFee);
                        }
                      }
                    })
                );
              }
            }
          });
        }
      })
      this.vendorsService
        .getVendorById(this.commonService.vendorId?this.commonService.vendorId:Constants.VENDOR_ID)
        .subscribe((res) => {
          this.vendorsService.setupVendor(
            res,
            this.helper.getAddressSelected()
          );
          // this.vendor = res;
          localStorage.setItem('vendors', JSON.stringify(res));
          this.vendor = JSON.parse(localStorage.getItem('vendors') as string);
          if (this.ecomService.getDeliveryTpe() == 'normal') {
            if (
              this.helper.getLoggedInUser() &&
              this.helper.getAddressSelected()
            ) {
              this.subscriptions.push(
                this.commonService
                  .calculateDeliveryFee(
                    this.commonService.vendorId?this.commonService.vendorId:Constants.VENDOR_ID,
                    this.vendor?.latitude,
                    this.vendor.longitude,
                    +this.helper.getAddressSelected().latitude,
                    +this.helper.getAddressSelected().longitude
                  )
                  .subscribe((res) => {
                    let deliveryFee: number = 0;
                    try {
                      deliveryFee = Number(res.delivery_fee);
                    } catch (e) {
                      console.log('invalid number: ', res);
                    } finally {
                      deliveryFee = Number(res.delivery_fee);
                      if (deliveryFee != 0) {
                        this.ecomService.setDeliveryFee(deliveryFee);
                      } else {
                        this.ecomService.setDeliveryFee(deliveryFee);
                      }
                    }
                  })
              );
            }
          }
        });
    }
    // if (!this.vendor.distance) {
    //   this.vendorsService.setupVendor(
    //     this.vendor,
    //     this.helper.getAddressSelected()
    //   );
    // }
    else {
      if (this.ecomService.getDeliveryTpe() == 'normal') {
        if (this.helper.getLoggedInUser() && this.helper.getAddressSelected()) {
          this.subscriptions.push(
            this.commonService
              .calculateDeliveryFee(
                this.commonService.vendorId?this.commonService.vendorId:Constants.VENDOR_ID,
                this.vendor?.latitude,
                this.vendor.longitude,
                +this.helper.getAddressSelected().latitude,
                +this.helper.getAddressSelected().longitude
              )
              .subscribe((res) => {
                let deliveryFee: number = 0;
                try {
                  deliveryFee = Number(res.delivery_fee);
                } catch (e) {
                  console.log('invalid number: ', res);
                } finally {
                  deliveryFee = Number(res.delivery_fee);
                  if (deliveryFee != 0) {
                    this.ecomService.setDeliveryFee(deliveryFee);
                  } else {
                    this.ecomService.setDeliveryFee(deliveryFee);
                  }
                }
              })
          );
        }
      }
    }
    if (this.checkDisabled) {
      this.modalService.open(LoginPopupComponent);
    }
  }

  onQuantityChange(type: string, pro: CartItem) {
    //let itemIndex=this.cartItems.findIndex(f=>f.id==itemId);
    let productId = this.ecomService.getProductIdFromCartItemId(pro.id);
    let existingCartItems =
      this.ecomService.getCartItemsWithProductId(productId);
    if (existingCartItems) {
      if (type == 'add') {
        pro.quantity = pro.quantity + 1;
        this.ecomService.addOrIncrementCartItem(pro);
      }
      if (type == 'subtract') {
        this.ecomService.removeOrDecrementCartItem(pro);
      }
    }
  }

  // onAddonsQuantityChange(type: string, pro: any) {
  //   if (type == 'add') {
  //     pro.quantity = pro.quantity + 1;
  //   }
  //   if (type == 'subtract') {
  //     this.ecomService.removeOrDecrementCartItem(pro);
  //   }
  // }

  get totalAmount(): number {
    let total = 0;
    this.cartItems.forEach((f) => {
      total = total + f.price;
    });
    total = total + this.deliveryFee + this.serviceFee;
    return total;
  }

  private spliceFor(
    pgs: Array<PaymentMethod>,
    removeFor: Array<string>
  ): Array<PaymentMethod> {
    let indexToRemove = -1;
    for (let i = 0; i < pgs.length; i++) {
      if (removeFor.includes(pgs[i].slug) || pgs[i].enabled != 1) {
        indexToRemove = i;
        break;
      }
    }
    if (indexToRemove != -1) {
      pgs.splice(indexToRemove, 1);
      return this.spliceFor(pgs, removeFor);
    } else {
      return pgs;
    }
  }

  onPaymentMethodSelected(event: any) {
    if (event.target && event.target.value) {
      this.paymentMethoIdSelected = Number(event.target.value);
    }
  }

  confirmOrder(cardModal?: any) {
    let selectedPaymentMethod = this.getSelectedPaymentMethod();
    if (selectedPaymentMethod != null) {
      this.ecomService.setupOrderRequestPaymentMethod(selectedPaymentMethod);
      if (selectedPaymentMethod.slug == 'cod') {
        this.proceedPlaceOrder();
      } else if (selectedPaymentMethod.slug == 'wallet') {
        this.translate
          .get(['just_moment', 'insufficient_wallet'])
          .subscribe((values) => {
            this.uiElementService.presentLoading(values['just_moment']);
            this.subscriptions.push(
              this.commonService.getBalance().subscribe(
                (res) => {
                  this.uiElementService.dismissLoading();
                  if (res.balance >= this.ecomService.getCartTotal(true)) {
                    this.ecomService.setupOrderRequestPaymentMethod(
                      selectedPaymentMethod
                    );
                    this.proceedPlaceOrder();
                  } else {
                    this.uiElementService.presentToast(
                      values['insufficient_wallet']
                    );
                  }
                },
                (err) => {
                  this.uiElementService.dismissLoading();
                  this.uiElementService.presentToast(
                    values['insufficient_wallet']
                  );
                }
              )
            );
          });
      } else if (selectedPaymentMethod.slug == 'payu') {
        let keysMeta;
        try {
          keysMeta = JSON.parse(selectedPaymentMethod.meta);
        } catch (e) {
          console.log(e);
        }
        if (keysMeta && keysMeta.public_key && keysMeta.private_key) {
          this.proceedPlaceOrder();
        } else {
          this.translate
            .get('payment_setup_fail')
            .subscribe((value) =>
              this.uiElementService.presentErrorAlert(value)
            );
        }
      } else if (selectedPaymentMethod.slug == 'paystack') {
        this.proceedPlaceOrder();
      } else if (selectedPaymentMethod.slug == 'stripe') {
        let keysMeta: any;
        try {
          keysMeta = JSON.parse(selectedPaymentMethod.meta);
        } catch (e) {
          console.log(e);
        }
        if (keysMeta && keysMeta.public_key) {
          if (this.stripeCardTokenId) {
            this.proceedPlaceOrder();
          } else {
            this.modalService
              .open({ component: CardInfoComponent })
              .result.then((data: any) => {
                // modalElement.onDidDismiss().then((data:any) => {
                console.log(data);
                if (data && data.data) {
                  // this.generateStripeCardIdToken(data.data, keysMeta.public_key);
                } else {
                  this.translate
                    .get('card_info_err')
                    .subscribe((value) =>
                      this.uiElementService.presentToast(value)
                    );
                }
              });
            //  modalElement.present();
            //  });
          }
        } else {
          this.translate
            .get('payment_setup_fail')
            .subscribe((value) => this.uiElementService.presentToast(value));
        }
      } else if (selectedPaymentMethod.slug == 'payment_sense') {
        if (this.vendor.meta?.stripe_key) {
          this.modalService.open(CardInfoComponent).result.then(
            (data: any) => {
              // modalElement.onDidDismiss().then((data:any) => {
              console.log(data);
              if (data && data.data) {
                // this.generateStripeCardIdToken(data.data, keysMeta.public_key);
              } else {
                this.translate
                  .get('card_info_err')
                  .subscribe((value) =>
                    this.uiElementService.presentToast(value)
                  );
              }
            },
            (reason) => {
              this.uiElementService.presentLoading('');
              this.proceedPlaceOrderStripe(reason);
            }
          );
        } else {
          this.proceedPlaceOrderPaymentSense(cardModal);
        }
      } else {
        this.translate
          .get('payment_setup_fail')
          .subscribe((value) => this.uiElementService.presentToast(value));
      }
    } else {
      this.translate
        .get('select_payment_method')
        .subscribe((value) => this.uiElementService.presentToast(value));
    }
  }

  getSelectedPaymentMethod(): PaymentMethod {
    let toReturn: PaymentMethod = new PaymentMethod();
    for (let pm of this.paymentMethods)
      if (this.paymentMethoIdSelected == pm.id) {
        toReturn = pm;
        break;
      }
    return toReturn;
  }

  proceedPlaceOrder() {
    let orderRequest = this.ecomService.getOrderRequest();
    if (this.notes) {
      this.ecomService.setupOrderRequestNotes(this.notes);
    }
    this.translate
      .get(['order_placing', 'order_placed', 'order_place_err'])
      .subscribe((values) => {
        this.uiElementService.presentLoading(values['order_placing']);
        if (orderRequest && orderRequest.address_id) {
          this.commonService.createOrder(orderRequest).subscribe(
            (res) => {
              this.uiElementService.dismissLoading();
              let navigationExtras: NavigationExtras = {
                state: { order: res.order, payment: res.payment },
              };
              this.router.navigate(['/order-placed'], navigationExtras);
            },
            (err) => {
              this.uiElementService.dismissLoading();
              this.uiElementService.presentToast(values['order_place_err']);
            }
          );
        } else {
          this.commonService.openAddressPopup({
            title: '',
            lastPage: 'check-out',
          });
          this.uiElementService.dismissLoading();
        }
      });
  }

  // private generateStripeCardIdToken(cardInfo: CardInfo, stripeKey: string) {
  //   this.translate.get(["verifying_card", "invalid_card"]).subscribe(values => {
  //     this.uiElementService.presentLoading(values["just_moment"]);
  //     this.stripe.(stripeKey);
  //     this.stripe.createToken(cardInfo as StripeCardTokenParams).then(token => {
  //       this.uiElementService.dismissLoading();
  //       this.stripeCardTokenId = token.id;
  //       this.confirmOrder();
  //     }).catch(error => {
  //       this.uiElementService.dismissLoading();
  //       this.uiElementService.presentToast(values["invalid_card"]);
  //       console.error(error);
  //     });
  //   });
  // }

  proceedPlaceOrderPaymentSense(connectModal?: any) {
    let orderRequest = this.ecomService.getOrderRequest();
    this.translate
      .get(['order_placing', 'order_placed', 'order_place_err'])
      .subscribe((values) => {
        //   this.uiElementService.presentLoading(values["order_placing"]);
        // this.spinnerService.show('cardUI')
        if (orderRequest) {
          this.uiElementService.dismissLoading();
          //const amount = this.ecomService.getCartTotal(true);
          //User will pay the discounted price
          // Calculate the total discount
          const totalDiscount =
            this.getDiscount(this.ecomService.getCartItems()) +
            this.calculateDiscount();

          // Calculate the discounted total price
          const discountedTotalPrice = this.applyingDiscountOnTotalPrice(
            this.ecomService.getCartTotal(true),
            totalDiscount
          );
          //// Convert to cents and remove the decimal portion
          const amount = Math.trunc(discountedTotalPrice * 100);

          let user = this.helper.getLoggedInUser();
          let products = JSON.parse(JSON.stringify(orderRequest?.products));
          const details: PaymentSenseData = {
            //amount: Number(this.helper.toFixedNumber(Number(amount * 100))),// Convert dollars to cents and remove the decimal portion
            amount: amount,
            transactionType: 'SALE',
            orderId: `user_${user.id}`,
            orderDescription: products.map((p: any) => p.id).join(', '),
          };
          this.commonService
            .getPaymentSenseData(details)
            .subscribe((tokenData) => {
              this.accessToken = tokenData.id;
              // this.order = order;
              setTimeout(() => {
                this.connectCard();
              }, 1000);

              this.modalService
                .open(connectModal, { ariaLabelledBy: 'modal-basic-title' })
                .result.then((res) => {
                  if (res == 'ok') {
                    if (orderRequest)
                      this.commonService.createOrder(orderRequest).subscribe(
                        (order) => {
                          let navigationExtras: NavigationExtras = {
                            state: { order: this.order.order, payment: null },
                          };
                          this.router.navigate(
                            ['/order-placed'],
                            navigationExtras
                          );
                        },
                        (err) => {
                          //     this.uiElementService.dismissLoading();
                          this.uiElementService.presentToast(
                            values['order_place_err']
                          );
                        }
                      );
                    //  this.proceed(order);
                  }
                  // modalElement.onDidDismiss().then((data:any) => {
                  //   if (data && data.data) {
                  //     let navigationExtras: NavigationExtras = { state: { order: order.order, payment: null } };
                  //     this.router.navigate(['./order-placed'], navigationExtras);
                  //   } else {
                  //     this.translate.get("card_info_err").subscribe(value => this.uiElementService.presentToast(value));
                  //   }
                  // });
                  // modalElement.present();
                });
            });
        }
      });
  }
  proceedPlaceOrderStripe(token: any) {
    let orderRequest = this.ecomService.getOrderRequest();
    this.translate
      .get(['order_placing', 'order_placed', 'order_place_err'])
      .subscribe((values) => {
        //   this.uiElementService.presentLoading(values["order_placing"]);
        // this.spinnerService.show('cardUI')
        if (orderRequest) {
          //   this.uiElementService.dismissLoading();
          //const amount = this.ecomService.getCartTotal(true);
          //User will pay the discounted price
          // Calculate the total discount
          const totalDiscount =
            this.getDiscount(this.ecomService.getCartItems()) +
            this.calculateDiscount();

          // Calculate the discounted total price
          const discountedTotalPrice = this.applyingDiscountOnTotalPrice(
            this.ecomService.getCartTotal(true),
            totalDiscount
          );
          //// Convert to cents and remove the decimal portion
          const amount = discountedTotalPrice;

          let user = this.helper.getLoggedInUser();
          let products = JSON.parse(JSON.stringify(orderRequest?.products));
          let description = `Paid by user ${user.name} having mobile number ${user.mobile_number}`;
          const details: any = {
            //amount: Number(this.helper.toFixedNumber(Number(amount * 100))),// Convert dollars to cents and remove the decimal portion
            amount: amount,
            token: token,
            description: description,
          };
          this.commonService.getStripeData(details).subscribe(
            (res: any) => {
              if (res)
                if (orderRequest)
                  this.commonService.createOrder(orderRequest).subscribe(
                    (order) => {
                      this.order = order.order;
                      this.uiElementService.dismissLoading();
                      let navigationExtras: NavigationExtras = {
                        state: {
                          order: this.order,
                          payment: this.order.payment,
                        },
                      };
                      this.router.navigate(['/order-placed'], navigationExtras);
                    },
                    (err) => {
                      this.uiElementService.dismissLoading();
                      //     this.uiElementService.dismissLoading();
                      this.uiElementService.presentErrorAlert(
                        values['order_place_err']
                      );
                    }
                  );
            },
            (error) => {
              this.uiElementService.dismissLoading();
              this.uiElementService.presentErrorAlert(
                error.error?.message ? error.error?.message : error.message
              );
            }
          );
        }
      });
  }

  connectCard() {
    this.spinnerService.show('cardUI');
    this.subscriptions.push(
      this.lazyLoadScriptService
        .loadScript(environment.paymentSenseScript)
        .subscribe((res) => {
          const errors = (errors: any) => {
            const errorsDiv = document.getElementById('errors');
            if (errorsDiv) {
              errorsDiv.innerHTML = '';
              if (errors && errors.length) {
                const list = document.createElement('ul');
                for (const error of errors) {
                  const item = document.createElement('li');
                  item.innerText = error.message;
                  list.appendChild(item);
                }
                errorsDiv.appendChild(list);
              }
            }
          };
          PAYCONFIG.paymentDetails.paymentToken = this.accessToken;
          this.connectE = new Connect.ConnectE(PAYCONFIG, errors);
          timer(1000).subscribe((res: any) => {
            const cardDiv = document.getElementById('demo-payment');
            const loader = document.getElementById('demo-payment-loading');
            setTimeout(() => {
              this.spinnerService.hide('cardUI');
            }, 10000);
            if (cardDiv) cardDiv.style.display = 'block';
            if (loader) loader.style.display = 'none';
          });
        })
    );
  }

  onOkClick(modal: any) {
    this.proceed(modal);
  }

  proceed(modal: any) {
    this.uiElementService.presentLoading('Payment');
    try {
      this.connectE
        .executePayment()
        .then((data: any) => {
          this.uiElementService.dismissLoading();
          //  modal.dismiss();
          if (data && data.statusCode == 0) {
            this.uiElementService.presentSuccessToast('Payment success');
            modal.dismiss('ok');
            this.proceedPlaceOrder();
            setTimeout(() => {
              // let navigationExtras: NavigationExtras = {
              //   state: { order: this.order.order, payment: null },
              // };
              // this.router.navigate(['/order-placed'], navigationExtras);
            }, 2000);
          } else {
            this.translate
              .get('card_info_err')
              .subscribe((value) =>
                this.uiElementService.presentToast(data.message)
              );
          }
        })
        .catch((data: any) => {
          this.uiElementService.dismissLoading();
          if (typeof data === 'string') {
            let errorsElement = document.getElementById('errors');
            if (errorsElement) {
              errorsElement.innerText = data;
              this.uiElementService.presentErrorAlert(data);
            }
          }
          if (data && data.message) {
            let errorsElement = document.getElementById('errors');
            if (errorsElement) {
              errorsElement.innerText = data.message;
              this.uiElementService.presentErrorAlert(data.message);
            }
          }
        });
    } catch (error: any) {
      this.uiElementService.dismissLoading();
      let errorsElement = document.getElementById('errors');
      if (errorsElement) {
        errorsElement.innerText = error;
        this.uiElementService.presentErrorAlert(error);
      }

      if (error && error.message) {
        let errorsElement = document.getElementById('errors');
        if (errorsElement) {
          errorsElement.innerText = error.message;
          this.uiElementService.presentErrorAlert(error.message);
        }
      }
    }
  }
  getCartItemPrice(item: CartItem) {
    return item.price * item.quantity;
  }
  getAddOnPrice(addOnPrice: any, quantity: number) {
    return this.helper.toFixedNumber(Number(addOnPrice * quantity));
  }
  //This method calculates discount for every vendor seperately
  calculateDiscount() {
    let finalVal;
    if (Constants.VENDOR_ID == 17 || this.commonService.vendorId==17) {
      const total = this.ecomService.getCartItemsTotal(true);
      finalVal = (10 * total) / 100;
    } else if (Constants.VENDOR_ID == 23 || this.commonService.vendorId==23) {
      //Porto
      //const total = this.ecomService.getCartItemsTotal(true);
      // return (20 * total) / 100;
      finalVal = 0;
    } else if (Constants.VENDOR_ID == 26 || this.commonService.vendorId==26) {
      //Pizza Guys
      const total = this.ecomService.getCartItemsTotal(true);
      finalVal = (10 * total) / 100;
      // finalVal.toFixed(2)
    } else {
      finalVal = 0;
    }
    return finalVal;
  }

  applyingDiscountOnTotalPrice(total: number, disscount: number) {
    return total - disscount;
  }

  getCalculateAddOnPrice(
    addon: any,
    quantity: number,
    group?: any,
    item?: any
  ) {
    let addonPrice = addon.price;

    // addon.addon_choices.forEach((element: any) => {
    //   addonPrice += element.price;
    // });
    if (group?.choose_group_choice == 2) {
      let doubleDeal = item.addOns.filter(
        (f: any) => f.choose_group_choice == 2
      );

      if (doubleDeal && doubleDeal.length) {
        let choices: any[] = [];
        doubleDeal.forEach((deal: any) => {
          let foundCho = deal.addon_choices[0];
          choices.push(foundCho);
        });
        if (choices.length > 1) {
          let doubleDealPrice = Number(
            doubleDeal.find((f: any) => Number(f.price) > 0).price
          );
          choices.sort((a, b) => {
            return b.price - a.price;
          });
          if (choices[1] == addon) {
            let priceToReduce = choices[1].price - doubleDealPrice;
            if (priceToReduce && priceToReduce > 0) {
              return choices[1].price - priceToReduce;
            }
            return addonPrice * quantity;
          }
          return addonPrice * quantity;
        }
        // console.log('double choices ', choices);
        // console.log('double deal ', doubleDeal);
        return addonPrice * quantity;
      }
    }

    if (!addon.title) console.log('getCalculateAddOnPrice', addon);

    return addon.choose_group_choice == 2 ? 0 : addonPrice * quantity;
  }

  getDiscount(items: any[]): number {
    let discount = 0;
    items.forEach((item) => {
      let doubleDeal = item.addOns.filter(
        (f: any) => f.choose_group_choice == 2
      );
      if (doubleDeal && doubleDeal.length) {
        let choices: any[] = [];
        doubleDeal.forEach((deal: any) => {
          discount = discount + Number(deal.price);
          let foundCho = deal.addon_choices[0];
          choices.push(foundCho);
        });
        if (choices.length > 1) {
          let doubleDealPrice = Number(
            doubleDeal.find((f: any) => Number(f.price) > 0).price
          );
          choices.sort((a, b) => {
            return b.price - a.price;
          });
          let priceToReduce = choices[1].price - doubleDealPrice;
          if (priceToReduce && priceToReduce > 0) {
            discount = discount + priceToReduce;
          }
        }
        // return addonPrice * quantity;
      }
    });
    return discount;
  }

  get checkDisabled(): boolean {
    return localStorage.getItem('saleemsc_user') &&
      localStorage.getItem('saleemsc_token')
      ? false
      : true;
  }

  onLoginClick() {
    this.router.navigate(['/login']);
  }

  get getMobile(): string {
    let phoneNumber = '';
    let user = this.helper.getLoggedInUser();
    if (user) {
      phoneNumber = user.mobile_number;
    }
    return phoneNumber;
  }

  get getAddress(): string {
    let address = '';
    if (this.helper.getAddressSelected()) {
      let addressObj = this.helper.getAddressSelected();
      address = addressObj.title;
    }
    return address;
  }

  get checkIsDelivery(): boolean {
    let isDelivery: boolean = true;
    if (
      this.vendor?.meta['is_delivery'] == undefined ||
      this.vendor?.meta['is_delivery']
    ) {
      isDelivery = true;
    } else {
      isDelivery = false;
    }
    return isDelivery;
  }

  get checkCOD(): boolean {
    let isCOD: boolean = true;
    if (
      this.vendor?.meta['cash_payment'] == undefined ||
      this.vendor?.meta['cash_payment']
    ) {
      isCOD = true;
    } else {
      isCOD = false;
    }
    return isCOD;
  }
}
