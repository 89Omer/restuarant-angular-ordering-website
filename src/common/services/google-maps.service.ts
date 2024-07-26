
import { Injectable } from '@angular/core';
// import maps from '@types/google.maps'
import { environment } from 'src/environments/environment';
import { MyAddress } from '../models/address.model';
import { ConnectivityService } from './connectivity.service';
@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {
  private mapElement: any;
  private pleaseConnect: any;
  map: any;
  private mapInitialised: boolean = false;
  private mapLoaded: any;
  private mapLoadedObserver: any;
  private currentMarker: any;
  private myCenter!: MyAddress |null;
  // private silver: Array<google.maps.MapTypeStyle>  = [
  //   {
  //     elementType: "geometry",
  //     stylers: [{ color: "#f5f5f5" }],
  //   },
  //   {
  //     elementType: "labels.icon",
  //     stylers: [{ visibility: "off" }],
  //   },
  //   {
  //     elementType: "labels.text.fill",
  //     stylers: [{ color: "#616161" }],
  //   },
  //   {
  //     elementType: "labels.text.stroke",
  //     stylers: [{ color: "#f5f5f5" }],
  //   },
  //   {
  //     featureType: "administrative.land_parcel",
  //     elementType: "labels.text.fill",
  //     stylers: [{ color: "#bdbdbd" }],
  //   },
  //   {
  //     featureType: "poi",
  //     elementType: "geometry",
  //     stylers: [{ color: "#eeeeee" }],
  //   },
  //   {
  //     featureType: "poi",
  //     elementType: "labels.text.fill",
  //     stylers: [{ color: "#757575" }],
  //   },
  //   {
  //     featureType: "poi.park",
  //     elementType: "geometry",
  //     stylers: [{ color: "#e5e5e5" }],
  //   },
  //   {
  //     featureType: "poi.park",
  //     elementType: "labels.text.fill",
  //     stylers: [{ color: "#9e9e9e" }],
  //   },
  //   {
  //     featureType: "road",
  //     elementType: "geometry",
  //     stylers: [{ color: "#ffffff" }],
  //   },
  //   {
  //     featureType: "road.arterial",
  //     elementType: "labels.text.fill",
  //     stylers: [{ color: "#757575" }],
  //   },
  //   {
  //     featureType: "road.highway",
  //     elementType: "geometry",
  //     stylers: [{ color: "#dadada" }],
  //   },
  //   {
  //     featureType: "road.highway",
  //     elementType: "labels.text.fill",
  //     stylers: [{ color: "#616161" }],
  //   },
  //   {
  //     featureType: "road.local",
  //     elementType: "labels.text.fill",
  //     stylers: [{ color: "#9e9e9e" }],
  //   },
  //   {
  //     featureType: "transit.line",
  //     elementType: "geometry",
  //     stylers: [{ color: "#e5e5e5" }],
  //   },
  //   {
  //     featureType: "transit.station",
  //     elementType: "geometry",
  //     stylers: [{ color: "#eeeeee" }],
  //   },
  //   {
  //     featureType: "water",
  //     elementType: "geometry",
  //     stylers: [{ color: "#c9c9c9" }],
  //   },
  //   {
  //     featureType: "water",
  //     elementType: "labels.text.fill",
  //     stylers: [{ color: "#9e9e9e" }],
  //   }
  // ];

  constructor(private connectivityService: ConnectivityService) { }

  // init(mapElement: any, pleaseConnect: any, myCenter: MyAddress |null): Promise<any> {
  //   this.mapElement = mapElement;
  //   this.pleaseConnect = pleaseConnect;
  //   this.myCenter = myCenter;
  //   return this.loadGoogleMaps();
  // }

  // loadGoogleMaps(): Promise<any> {
  //   return new Promise((resolve) => {
  //     if (typeof google == "undefined" || typeof google.maps == "undefined") {
  //       console.log("Google maps JavaScript needs to be loaded.");
  //       this.disableMap();
  //     //  if (this.connectivityService.isOnline()) {
  //       //  window['mapInit'] = () => {
  //           this.initMap().then(() => {
  //             resolve(true);
  //           });
  //           this.enableMap();
  //       //  }
  //         let script = document.createElement("script");
  //         script.id = "googleMaps";
  //         if (environment.googleApiKey) {
  //           script.src = 'http://maps.google.com/maps/api/js?key=' + environment.googleApiKey + '&callback=mapInit&libraries=places';
  //         } else {
  //           script.src = 'http://maps.google.com/maps/api/js?callback=mapInit';
  //         }
  //         document.body.appendChild(script);
  //       //}
  //     } else {
  //    //   if (this.connectivityService.isOnline()) {
  //         this.initMap();
  //         this.enableMap();
  //      // }
  //       // else {
  //       //   this.disableMap();
  //       // }
  //       resolve(true);
  //     }
  //     this.addConnectivityListeners();
  //   });
  // }

  // initMap(): Promise<any> {
  //   this.mapInitialised = true;
  //   return new Promise((resolve) => {
  //     let styles: Array<google.maps.MapTypeStyle> = this.silver;
  //     let center = new google.maps.LatLng(this.myCenter ? Number(this.myCenter.latitude) : 39.9334, this.myCenter ? Number(this.myCenter.longitude) : 32.8597);
  //     let mapOptions = {
  //       center: center,
  //       zoom: 15,
  //       mapTypeId: google.maps.MapTypeId.ROADMAP,
  //       styles: styles,
  //       disableDefaultUI: true
  //       //,minZoom: 3, maxZoom: 15
  //     }
  //     this.map = new google.maps.Map(this.mapElement, mapOptions);
  //     resolve(true);
  //   });
  // }


  // disableMap(): void {
  //   if (this.pleaseConnect) {
  //     if (this.pleaseConnect != null) this.pleaseConnect.style.display = "block";
  //   }
  // }

  // enableMap(): void {
  //   if (this.pleaseConnect) {
  //     if (this.pleaseConnect != null) this.pleaseConnect.style.display = "none";
  //   }
  // }

  // addConnectivityListeners(): void {
  // //  this.connectivityService.watchOnline().subscribe(() => {
  //     setTimeout(() => {
  //       if (typeof google == "undefined" || typeof google.maps == "undefined") {
  //         this.loadGoogleMaps();
  //       }
  //       else {
  //         if (!this.mapInitialised) {
  //           this.initMap();
  //         }
  //         this.enableMap();
  //       }
  //     }, 2000);
  //  // });
  //   // this.connectivityService.watchOffline().subscribe(() => {
  //   //   this.disableMap();
  //   // });

  // }
}
