import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { Constants } from '../models/constants.model';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private route: Router,) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let token = localStorage.getItem('saleemsc_token');
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(request).pipe(
      tap(
        (event) => { },
        (error: any) => {
          if (error instanceof HttpErrorResponse && error.status == 401 && !request.url.includes('api/login')) {
            // handle 401 errors
            localStorage.removeItem(Constants.KEY_USER);
            localStorage.removeItem(Constants.KEY_ADDRESS);
            localStorage.removeItem(Constants.KEY_TOKEN);
            // this.route.navigate(['']);
            this.route.navigate(['/'], { queryParams: { logout: 'true' } });
          }
          if (error && error.error && error.error.message && error.error.message.length > 0) {
          //  this.toastr.error(error.error.message[0]);
          }
        }
      ));
  }
}
