import { MapsAPILoader } from '@agm/core';
import { Component, OnInit } from '@angular/core';
import { Order } from 'src/common/models/order.model';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  order!: Order;
  dir:any;
  private geoCoder: any;
  public markerOptions = {
    origin: {
        icon: 'https://www.shareicon.net/data/32x32/2016/04/28/756617_face_512x512.png',
        draggable: false,
        height:'10px',
        width:'10px'
    },
    destination: {
        icon: 'assets/images/empty_dp.png',
        draggable: false,
        height:'10px',
        width:'10px'
    },
};
public renderOptions = {
  suppressMarkers: true,
}
  constructor( private mapsAPILoader: MapsAPILoader,) { }

  ngOnInit(): void {
    if(history.state.order){
      this.order=history.state.order;
      this.getDirection();
      this.markerOptions.origin.icon=this.order.vendor.image;
    }
    this.mapsAPILoader.load().then(() => {
      //this.setCurrentLocation();
      this.geoCoder = new google.maps.Geocoder();
    });
  }

  getDirection(){
  this.dir={origin:{lat:Number(this.order.vendor.latitude),lng:Number(this.order.vendor.longitude)},
  destination:{lat:Number(this.order.address.latitude),lng:Number(this.order.address.longitude)}};
  }

  convertToNumber(latlng: string): number {
    return Number(latlng);
  }


}
