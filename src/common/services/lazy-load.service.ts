import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LazyLoadService {
  loadedLibraries: { [url: string]: ReplaySubject<void> } = {};

  constructor() { }

  loadScript(url: string): Observable<void> {
    if (this.loadedLibraries[url]) {
      return this.loadedLibraries[url].asObservable();
    }

    this.loadedLibraries[url] = new ReplaySubject();

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = () => {
      this.loadedLibraries[url].next();
      this.loadedLibraries[url].complete();
    };

    document.body.appendChild(script);

    return this.loadedLibraries[url].asObservable();
  }
}
