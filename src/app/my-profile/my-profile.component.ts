import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MyEventsService } from 'src/common/events/my-events.service';
import { User } from 'src/common/models/user.model';
import { WalletTransaction } from 'src/common/models/wallet-transactions.model';
import { CommonService } from 'src/common/services/common.service';
import { HelperService } from 'src/common/services/helper.service';
import { UiElementsService } from 'src/common/services/ui-elements.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {
  userMe!: User;
  currency_icon: string='';
  balance = 0;
  private subscriptions = new Array<Subscription>();
  transactions = new Array<WalletTransaction>();
  constructor(private Helper:HelperService,
    private myEvent: MyEventsService,
    private commonService:CommonService,
    private uiElementService: UiElementsService,) { }

  ngOnInit(): void {
    this.userMe =this.Helper.getLoggedInUser();
    this.myEvent.getUserMeObservable().subscribe(user => this.userMe = user);
    this.currency_icon = this.Helper.getSetting("currency_icon");
    this.refreshBalance();
  }

  refreshBalance() {
    this.uiElementService.presentLoading('loading');
    this.subscriptions.push(this.commonService.getBalance().subscribe(res => {
      if (res.balance != this.balance || ((!this.transactions || !this.transactions.length) && res.balance != 0)) {
        this.transactions = [];
       // this.subscriptions.push(this.commonService.getTransactions().subscribe(res => this.handleTransactionRes(res), err => this.handleTransactionErr(err)));
      } else {

        this.uiElementService.dismissLoading();
      }
      this.balance = res.balance;
      this.uiElementService.dismissLoading();
    }, err => {
      this.uiElementService.dismissLoading();
      //this.isLoading = false;
    }));
  }

}
