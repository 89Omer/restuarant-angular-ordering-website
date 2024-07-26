import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardInfoRoutingModule } from './card-info-routing.module';
import { CardInfoComponent } from './card-info/card-info.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ConnectCardInfoComponent } from './connect-card-info/connect-card-info.component';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { NgxStripeModule } from 'ngx-stripe';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
@NgModule({
  declarations: [

    ConnectCardInfoComponent
  ],
  imports: [
    CommonModule,
    CardInfoRoutingModule,
    TranslateModule,
    TranslateModule.forRoot({
      loader: {
      provide: TranslateLoader,
      useFactory: HttpLoaderFactory,
      deps: [HttpClient]
    }
  }),
    FormsModule,
    NgxStripeModule.forRoot(''),

  ]
})
export class CardInfoModule { }
