import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, timer } from 'rxjs';
import { LazyLoadService } from 'src/common/services/lazy-load.service';
import { UiElementsService } from 'src/common/services/ui-elements.service';
import { environment } from 'src/environments/environment';
declare var Connect: any;

@Component({
  selector: 'app-connect-card-info',
  templateUrl: './connect-card-info.component.html',
  styleUrls: ['./connect-card-info.component.scss']
})
export class ConnectCardInfoComponent implements OnInit {
  accessToken: string='';
  connectE: any;
  private subscriptions = new Array<Subscription>();
  constructor(private lazyLoadScriptService: LazyLoadService,
    private uiElementService: UiElementsService,
    public translate: TranslateService,
    private modalController: NgbModal) { }

  ngOnInit(): void {
    this.subscriptions.push(this.lazyLoadScriptService.loadScript(environment.paymentSenseScript).subscribe(res => {
      const errors = (errors:any) => {
        const errorsDiv = document.getElementById('errors');
        if(errorsDiv){
          errorsDiv.innerHTML = '';
          if (errors && errors.length) {
            const list = document.createElement("ul");
            for (const error of errors) {
              const item = document.createElement("li");
              item.innerText = error.message;
              list.appendChild(item);
            }
            errorsDiv.appendChild(list);
          }
        }
      }
      PAYCONFIG.paymentDetails.paymentToken = this.accessToken;
      this.connectE = new Connect.ConnectE(PAYCONFIG, errors);
      timer(1000).subscribe((res:any) => {
        const cardDiv = document.getElementById('demo-payment');
        const loader = document.getElementById('demo-payment-loading');
        if(cardDiv)
        cardDiv.style.display = 'block';
        if(loader)
        loader.style.display = 'none';

      });
    }));
  }

  ngOnDestroy() {
    for (let sub of this.subscriptions) sub.unsubscribe();
  }

    proceed() {
    this.uiElementService.presentLoading("Payment");
    this.connectE.executePayment().then((data:any) => {
      this.uiElementService.dismissLoading();
      this.modalController.dismissAll(data);
    }).catch((data:any) => {
      this.uiElementService.dismissLoading();
      if (typeof data === 'string') {
        let errorsElement=document.getElementById("errors");
        if(errorsElement){

         errorsElement.innerText = data;
        }
      }
      if (data && data.message) {
        let errorsElement=document.getElementById("errors");
        if(errorsElement){
          errorsElement.innerText = data.message;
        }
      }
    }
    );
  }

  dismiss() {
    this.modalController.dismissAll();
  }

}

export const PAYCONFIG = {
  paymentDetails: {
    paymentToken: ""/*access token here*/,
    styles: {
      base: {
        color: "#B00",
        backgroundColor: 'black',
      }
    }

  },
  containerId: "demo-payment",
  fontCss: ['https://fonts.googleapis.com/css?family=Do+Hyeon'],
  styles: {
    base: {
      default: {
        //color: "black",
        textDecoration: "none",
        fontFamily: "'Do Hyeon', sans-serif",
        boxSizing: "border-box",
        padding: ".375rem .75rem",
        boxShadow: 'none',
        fontSize: '1rem',
        borderRadius: '.25rem',
        lineHeight: '1.5',
      //  backgroundColor: 'black',

      },
      focus: {
        color: '#495057',
        borderColor: '#80bdff',
      },
      error: {
        color: "#B00",
        borderColor: "#B00"
      },
      valid: {
        color: "green",
        borderColor: 'green'
      },
      label: {
        display: 'none'
      }
    },
    cv2: {
      container: {
        width: "25%",
        float: "left",
        boxSizing: "border-box"
      },
      default: {
        borderRadius: "0 .25rem .25rem 0"
      }
    },
    expiryDate: {
      container: {
        width: "25%",
        float: "left",
        borderRadius: '0rem',
      },
      default: {
        borderRadius: "0",
        borderRight: "none"
      },
    },

    cardNumber: {
      container: {
        width: "50%",
        float: "left",
      },
      default: {
        borderRadius: ".25rem 0 0 .25rem",
        borderRight: "none"
      },
    }
  }
}
