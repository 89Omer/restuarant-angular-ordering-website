import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { CheckOutComponent } from './check-out/check-out.component';
import { HomeComponent } from './home/home.component';
import { MapsComponent } from './maps/maps.component';
import { MyOrdersComponent } from './my-orders/my-orders.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { OrderPlacedComponent } from './order-placed/order-placed.component';
import { RestaurantDetailsComponent } from './restaurant-details/restaurant-details.component';
import { RestaurantsComponent } from './restaurants/restaurants.component';
import { SavedAddressComponent } from './saved-address/saved-address.component';
import { TermsComponent } from './terms/terms.component';
import { RoutingGuard } from 'src/common/guards/routing.guard';
import { GalleryComponent } from './gallery/gallery.component';
import { AboutComponent } from './about/about.component';
import {BranchComponent} from "./branch/branch.component";
import { SearchPageComponent } from './search-page/search-page.component';
import { ContactComponent } from './contact/contact.component';


const routes: Routes = [
  {
    path: 'home',
    //component: BranchComponent,
    component: HomeComponent,
    canActivate: [RoutingGuard],
  },
  {
    path: 'search',
    component: SearchPageComponent,
  },
  // {
  //   path: 'home',
  //   component: RestaurantDetailsComponent,
  // },
  {
    path: 'restaurant/:id/:name/:forTableBooking',
    component: RestaurantDetailsComponent,
  },
  {
    path: 'restaurant',
    component: RestaurantDetailsComponent,
  },
  {
    path: 'restaurant/:id/:name',
    component: RestaurantDetailsComponent,
  },
  {
    path: 'restaurants',
    component: RestaurantsComponent,
  },
  {
    path: 'check-out',
    component: CheckOutComponent,
    canActivate: [RoutingGuard],
  },
  {
    path: 'order-placed',
    component: OrderPlacedComponent,
  },
  {
    path: 'table-booked',
    component: OrderPlacedComponent,
  },
  {
    path: 'add-address',
    component: MapsComponent,
  },
  {
    path: 'my-orders',
    component: MyOrdersComponent,
  },
  {
    path: 'my-bookings',
    component: MyOrdersComponent,
  },
  {
    path: 'order-detail',
    component: OrderDetailComponent,
  },
  {
    path: 'saved-addresses',
    component: SavedAddressComponent,
  },
  {
    path: 'my-profile',
    component: MyProfileComponent,
  },
  {
    path: 'terms',
    component: TermsComponent,
  },
  {
    path: 'gallery',
    component: GalleryComponent
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'branch',
    component: BranchComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./authentication/authentication.module').then(
        (m) => m.AuthenticationModule
      ),
  },
  { path: '**', redirectTo: '/home' },

];
const routerOptions: ExtraOptions = {
  useHash: true,
  anchorScrolling: 'enabled',
  scrollPositionRestoration: 'enabled'
  // ...any other options you'd like to use
};
@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
