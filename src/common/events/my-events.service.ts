import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs'; // For rxjs 6
import { MyAddress } from '../models/address.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class MyEventsService {
    private customEvent = new Subject<string>();
    private selectedLanguage = new Subject<string>();
    private currentUser = new Subject<User>();
    private currentLocation = new Subject<MyAddress>();
    private locationDrop = new Subject<MyAddress>();

    constructor() { }

    public getLanguageObservable(): Observable<string> {
        return this.selectedLanguage.asObservable();
    }

    public setLanguageData(data:any) {
        this.selectedLanguage.next(data);
    }

    public getUserMeObservable(): Observable<User> {
        return this.currentUser.asObservable();
    }

    public setUserMeData(data:any) {
        this.currentUser.next(data);
    }

    public setAddressData(data:any) {
        this.currentLocation.next(data);
    }

    public getAddressObservable(): Observable<MyAddress> {
        return this.currentLocation.asObservable();
    }

    public setCustomEventData(data: string) {
        this.customEvent.next(data);
    }

    public getCustomEventObservable(): Observable<string> {
        return this.customEvent.asObservable();
    }

    public setLocationDrop(data:any){
        this.locationDrop.next(data);
    }

    public getLocationDropObservable(): Observable<MyAddress> {
        return this.locationDrop.asObservable();
    }
}
