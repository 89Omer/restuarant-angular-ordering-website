import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { CardInfo } from 'src/common/models/card-info.model';
import { UiElementsService } from 'src/common/services/ui-elements.service';
import {
  StripeCardElementChangeEvent,
  StripeCardElementOptions,
  StripeElementsOptions,
} from '@stripe/stripe-js';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StripeCardComponent, StripeService } from 'ngx-stripe';

@Component({
  selector: 'app-card-info',
  templateUrl: './card-info.component.html',
  styleUrls: ['./card-info.component.scss'],
})
export class CardInfoComponent implements OnInit {
  cardInfo!: CardInfo;
  cardOptions: StripeCardElementOptions = {
    hidePostalCode: true,
    style: {
      base: {
        iconColor: '#ffb30e',
        color: '#00000',
        fontWeight: 500,
        fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
        fontSize: '18px',
        fontSmoothing: 'antialiased',
        '::placeholder': { color: '#CFD7E0' },
      },
    },
  };
  stripeTest!: FormGroup;
  @ViewChild(StripeCardComponent) card!: StripeCardComponent;

  constructor(
    private modelController: NgbModal,
    private translate: TranslateService,
    private uiElementService: UiElementsService,
    private stripeService: StripeService,
    private formBuilder: FormBuilder
  ) {
    let vendor = localStorage.getItem('vendors')
      ? JSON.parse(localStorage.getItem('vendors') as string)
      : undefined;
    if (vendor?.meta?.stripe_key) {
      this.stripeService.setKey(vendor?.meta?.stripe_key);
    }
    // this.cardInfo = CardInfo.getSavedCard();
  }

  ngOnInit(): void {
    this.uiElementService.presentLoading('loading');
    this.stripeTest = this.formBuilder.group({
      name: ['', [Validators.required]]
    });
  }

  dismiss() {
    this.modelController.dismissAll();
  }

  proceed() {
    this.uiElementService.presentLoading('loading');
    const name = this.stripeTest.get('name')?.value;
    this.stripeService
      .createToken(this.card.element, { name })
      .subscribe((result) => {
        this.uiElementService.dismissLoading();
        if (result.token) {
          let token = result.token;
          let payload: any = {
            token_id: token?.id,
            last4: token?.card?.last4,
          };
          //this.cardInfo = payload;
          this.modelController.dismissAll(token?.id);
          //this.addCardToken(result.token);
        } else if (result.error) {
          // Error creating the token
          this.uiElementService.presentErrorAlert(result.error.message as string)
          // console.log(result.error.message);
        }
      });
    // if (this.cardInfo.areFieldsFilled()) {
    //   CardInfo.setSavedCard(this.cardInfo);
    //   this.modelController.dismissAll(this.cardInfo);
    // } else {
    //   this.translate
    //     .get('card_info_err')
    //     .subscribe((value) => this.uiElementService.presentToast(value));
    // }
  }

  onReadyEvent(event: any) {
    // this.spinnserService.spinnerHide();
    this.uiElementService.dismissLoading();
  }

  onChange(event: any) {
    const displayError = document.getElementById('card-errors');
    if (event.error && displayError) {
      displayError.textContent = event.error.message;
    } else {
      displayError ? (displayError.textContent = '') : null;
    }
  }
}
