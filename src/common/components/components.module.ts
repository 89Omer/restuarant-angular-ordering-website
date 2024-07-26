import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer/footer.component';
import { AdressPopupComponent } from './adress-popup/adress-popup.component';
import { AgmCoreModule } from '@agm/core';
import { environment } from 'src/environments/environment';
import { LoginPopupComponent } from './login-popup/login-popup.component';
import { SelectBranchComponent } from './select-branch/select-branch.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [

    FooterComponent,
    AdressPopupComponent,
    LoginPopupComponent,
    SelectBranchComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    AgmCoreModule.forRoot({
      apiKey: environment.googleApiKey,
      libraries: ['places'],
    }),
FormsModule,
  ],
  exports: [
    FooterComponent,
    AdressPopupComponent
  ]
})
export class ComponentsModule { }
