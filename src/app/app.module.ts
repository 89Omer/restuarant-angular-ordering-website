import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HeaderModule } from 'src/common/components/header/header.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FoodCategoriesComponent } from './food-categories/food-categories.component';
import { HomeComponent } from './home/home.component';
import { RestaurantDetailsComponent } from './restaurant-details/restaurant-details.component';
import { RestaurantsComponent } from './restaurants/restaurants.component';
import { CheckOutComponent } from './check-out/check-out.component';
import { JwtInterceptor } from 'src/common/interceptors/jwt.interceptor';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AgmCoreModule } from '@agm/core';
import { environment } from 'src/environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OrderPlacedComponent } from './order-placed/order-placed.component';
import { MapsComponent } from './maps/maps.component';
import { MyOrdersComponent } from './my-orders/my-orders.component';
import { NgbAccordionModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { AgmDirectionModule } from 'agm-direction';
import { SavedAddressComponent } from './saved-address/saved-address.component';
import { ComponentsModule } from 'src/common/components/components.module';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { TermsComponent } from './terms/terms.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { LightgalleryModule } from 'lightgallery/angular';
import { GalleryComponent } from './gallery/gallery.component'; // Import the LightGalleryModule
import { NgxStripeModule } from 'ngx-stripe';
import { CardInfoComponent } from './card-info/card-info/card-info.component';
import { AboutComponent } from './about/about.component';
import { BranchComponent } from './branch/branch.component';
import { SearchPageComponent } from './search-page/search-page.component';
import { ContactComponent } from './contact/contact.component';


export function HttpLoaderFactory(http: HttpClient) {
  // if(environment.production){
  //   let baseUrl= `${window.location.origin}/public/dist/assets/i18n/`;
  //   return new TranslateHttpLoader(http,baseUrl);
  // }
  // else{

  return new TranslateHttpLoader(http);

  // }
}
@NgModule({
  declarations: [
    AppComponent,
    FoodCategoriesComponent,
    HomeComponent,
    RestaurantDetailsComponent,
    RestaurantsComponent,
    CheckOutComponent,
    OrderPlacedComponent,
    MapsComponent,
    MyOrdersComponent,
    OrderDetailComponent,
    SavedAddressComponent,
    MyProfileComponent,
    TermsComponent,
    GalleryComponent,
    CardInfoComponent,
    AboutComponent,
    BranchComponent,
    SearchPageComponent,
    ContactComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    HeaderModule,
    HttpClientModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule,
    SlickCarouselModule,
    NgxSpinnerModule,
    AgmCoreModule.forRoot({
      apiKey: environment.googleApiKey,
      libraries: ['places'],
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    ToastrModule.forRoot({ positionClass: 'toast-bottom-right' }),
    NgxSpinnerModule,
    NgbModule,
    NgbAccordionModule,
    AgmDirectionModule,
    NgxSkeletonLoaderModule,
    LightgalleryModule,
    NgxStripeModule.forRoot(''),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
