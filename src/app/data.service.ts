import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private startTime = new BehaviorSubject('');
  getStartTime = this.startTime.asObservable();

  private endTime = new BehaviorSubject('');
  getEndTime = this.endTime.asObservable();

  private availablity: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  getAvailablity = this.availablity.asObservable();
  constructor() {}

  setStartTime(data: string) {
    this.startTime.next(data);
  }

  setEndTime(data: string) {
    this.endTime.next(data);
  }

  setAvailablity(availablity: any[]) {
    this.availablity.next(availablity);
    localStorage.setItem('availablity', JSON.stringify(availablity));
  }
}
