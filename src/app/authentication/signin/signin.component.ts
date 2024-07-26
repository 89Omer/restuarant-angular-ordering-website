import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, first } from 'rxjs';
import { Country } from 'src/common/models/country.model';
import { CommonService } from 'src/common/services/common.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from 'src/common/services/ui-elements.service';
import { Constants } from 'src/common/models/constants.model';
import * as firebase from 'firebase/auth';
import { HelperService } from 'src/common/services/helper.service';
import { MyEventsService } from 'src/common/events/my-events.service';
import { AuthResponse } from 'src/common/models/auth-response.model';
@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent implements OnInit {
  countries: Country[] = [];
  signinForm!: FormGroup;
  closeResult = '';
  OtpForm!: FormGroup;
  private result: any;
  isDemoNumber: string = 'false';
  private resendCode: boolean = false;
  public otpNotSent: boolean = true;
  private credential: any;
  otp = '';
  private intervalCalled: boolean = false;
  private timer: any;
  private totalSeconds: number = 0;
  showOTPTimmer: string = '';
  private minutes: number = 0;
  private seconds: number = 0;
  auth = firebase.getAuth();
  private recaptchaVerifier!: firebase.RecaptchaVerifier;
  private captchanotvarified: boolean = true;
  defaultCountry: Country = {
    name: 'United Kingdom of Great Britain and Northern Ireland',
    alpha2Code: 'GB',
    callingCodes: '44',
    code: '44',
  };
  countrySelected: any;
  selectedCode: string = this.defaultCountry.callingCodes;
  queryParams: BehaviorSubject<any> = new BehaviorSubject({});
  signInMethod='otp'
  constructor(
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    public router: Router,
    private translate: TranslateService,
    private uiElementService: UiElementsService,
    private helper: HelperService,
    private myEvent: MyEventsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    localStorage.removeItem('vendors');
    localStorage.removeItem('products');
    this.makeCaptcha();
    this.getCountries();
    if (this.route.queryParams) {
      this.route.queryParams.subscribe((param: any) => {
        if (param.phoneNumberFull) {
          this.closeResult = 'yes';
          this.sendOtpBrowser(param.phoneNumberFull);
        }
        if(param.loginType){
          this.signInMethod=param.loginType;
          this.onSigninMethodChange(this.signInMethod);
        }
      });
    }
    this.signinForm = this.formBuilder.group({
      code: [this.countrySelected, Validators.compose([Validators.required])],
      phone: ['', Validators.compose([Validators.required])],
    });
    this.OtpForm = this.formBuilder.group({
      otpCode: ['', Validators.compose([Validators.required])],
    });
  }

  getCountries() {
    this.commonService
      .getCountries()
      .pipe(first())
      .subscribe((c: Country[]) => {
        this.countries = c;
        this.countrySelected = this.countries.findIndex(
          (f) =>
            f.name == this.defaultCountry.name &&
            f.alpha2Code == this.defaultCountry.alpha2Code
        );
        this.signinForm.controls['code'].setValue(this.countrySelected);
        this.signinForm.updateValueAndValidity();
      });
  }

  onSigninSubmit(content: any) {
    if(this.signInMethod=='otp'){
      this.selectedCode = this.countries[this.signinForm.value.code].callingCodes;
      this.modalService
        .open(content, { ariaLabelledBy: 'modal-basic-title' })
        .result.then(
          (result) => {
            this.closeResult = `Closed with: ${result}`;
            if (result == 'yes') {
              this.checkIfExists();
            }
          },
          (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          }
        );
    }
    else{
      if(this.signinForm.valid){
        this.translate.get('just_moment').subscribe((value) => {
          this.uiElementService.presentLoading(value)
          this.commonService.login(this.signinForm.value).subscribe((res:AuthResponse)=>{
            this.uiElementService.dismissLoading();
            this.helper.setLoggedInUserResponse(res);
            //this.apiService.setupHeaders(res.token);
            this.myEvent.setUserMeData(res.user);
            // window.localStorage.removeItem(Constants.KEY_ADDRESS);
            // this.myEvent.setAddressData(null);
            if (!localStorage.getItem(Constants.KEY_ADDRESS)) {
              this.router.navigate(['/saved-addresses']);
            } else {
              this.saveAddress();
              this.router.navigate(['/home']);
            }
            // const address = localStorage.getItem('saleemsc_address');
            // if (address) this.router.navigate(['/home']);
            // else this.router.navigate(['/saved-addresses']);
          },
          (err) => {
            this.uiElementService.dismissLoading();
            this.uiElementService.presentErrorAlert(
              err &&
                err.error &&
                err.error.message &&
                String(err.error.message).toLowerCase().includes('role')
                ? 'User exists with different role'
                :err?.error?.error && typeof(err.error.error)=='string'?err.error.error: 'Something went wrong'
            );
          })
        });
      }
      else{
        this.signinForm.markAsDirty();
        this.signinForm.markAllAsTouched();

      }
    }
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  onOtpSubmit() {
    this.verifyOtpBrowser();
    // this.router.navigate(['/auth/register']);
  }

  checkIfExists() {
    this.translate.get('just_moment').subscribe((value) => {
      this.uiElementService.presentLoading(value);
      this.commonService
        .checkUser({
          mobile_number: `+${this.selectedCode + this.signinForm.value.phone}`,
          role: Constants.ROLE_USER,
        })
        .subscribe(
          (res) => {
            this.uiElementService.dismissLoading();

            // let navigationExtras: NavigationExtras = { queryParams: { phoneNumberFull: this.phoneNumberFull } };
            // let navigationExtras: NavigationExtras = { queryParams: { phoneNumberFull: `+${this.signinForm.value.code+this.signinForm.value.phone}`, isDemoNumber: false} };
            // this.router.navigate(['./verification'], navigationExtras);
            this.sendOtpBrowser(
              `+${this.selectedCode + this.signinForm.value.phone}`
            );
          },
          (err) => {
            this.uiElementService.dismissLoading();

            // let navigationExtras: NavigationExtras = {
            //   queryParams: {
            //     code: this.signinForm.value.code,
            //     phone: this.signinForm.value.phone,
            //   },
            // };
            this.helper.registerPhone.next({
              code: this.signinForm.value.code,
              phone: this.signinForm.value.phone,
            });
            this.uiElementService.presentToast(
              'Your are not registered please register first'
            );
            let regEl = document.getElementById('register');
            if (regEl) {
              regEl.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest',
              });
            }
            // this.router.navigate(['auth/register'], navigationExtras);
          }
        );
    });
  }

  sendOtpBrowser(phone: string) {
    const component = this;
    this.uiElementService.dismissLoading();
    this.uiElementService.presentLoading('Sending otp');

    // auth.settings.appVerificationDisabledForTesting = true;

    firebase
      .signInWithPhoneNumber(this.auth, phone, this.recaptchaVerifier)
      .then((confirmationResult) => {
        component.result = confirmationResult;
        component.uiElementService.dismissLoading();
        component.uiElementService.presentSuccessToast('OTP Sent');
        setTimeout(() => {
          let codeEl = document.getElementById('otpCode');
          if (codeEl) {
            codeEl.focus();
          }
        }, 2000);
        // if (component.isDemoNumber == "true") { component.otp = component.config.demoLoginCredentials.otp; component.verify(); };
        component.otpNotSent = false;
        if (component.intervalCalled) {
          clearInterval(component.timer);
        }
        component.createInterval();
      })
      .catch(function (error) {
        component.resendCode = true;
        component.otpNotSent = true;
        component.uiElementService.dismissLoading();
        if (error.message) {
          component.uiElementService.presentErrorAlert(error.message);
        } else {
          component.uiElementService.presentSuccessToast('OTP Sending failed');
        }
      });
  }

  createInterval() {
    this.totalSeconds = 120;
    this.createTimer();
    this.timer = setInterval(() => {
      this.createTimer();
    }, 1000);
  }

  createTimer() {
    this.intervalCalled = true;
    this.totalSeconds--;
    if (this.totalSeconds == 0) {
      this.otpNotSent = true;
      this.resendCode = true;
      this.showOTPTimmer = '00:00';
      clearInterval(this.timer);
    } else {
      this.seconds = this.totalSeconds % 60;
      if (this.totalSeconds >= this.seconds) {
        this.minutes = (this.totalSeconds - this.seconds) / 60;
      } else {
        this.minutes = 0;
      }
      this.showOTPTimmer =
        ('0' + this.minutes).slice(-2) + ':' + ('0' + this.seconds).slice(-2);
    }
  }

  makeCaptcha() {
    const component = this;
    this.auth = firebase.getAuth();
    //this.auth.settings.appVerificationDisabledForTesting=true;
    this.recaptchaVerifier = new firebase.RecaptchaVerifier(
      'recaptcha-container',
      {
        size: 'invisible',
        callback: function (response: any) {
          component.captchanotvarified = true;
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
      },
      this.auth
    );
    this.recaptchaVerifier.render();
  }

  verifyOtpBrowser() {
    const component = this;
    this.uiElementService.presentLoading('Verifying otp');
    this.otp = this.OtpForm.value.otpCode;
    this.result
      .confirm(String(this.otp))
      .then(function (response: any) {
        component.uiElementService.dismissLoading();
        component.uiElementService.presentSuccessToast('OTP Verified');
        component.getUserToken(response.user);
      })
      .catch(function (error: any) {
        if (error.message) {
          // component.uiElementService.presentErrorAlert(error.message);
          component.uiElementService.presentErrorAlert(
            'OTP Mismatch, please type correctly'
          );
        } else {
          component.uiElementService.presentErrorAlert(
            'OTP Verification failed'
          );
        }
        component.uiElementService.dismissLoading();
      });
  }

  getUserToken(user: any) {
    user
      .getIdToken(false)
      .then((res: any) => {
        this.loginUser(res);
      })
      .catch((err: any) => {
        console.log('user_token_failure', err);
      });
  }

  loginUser(token: any) {
    this.translate.get('just_moment').subscribe((value) => {
      this.uiElementService.presentLoading(value);

      this.commonService
        .loginUser({ token: token, role: Constants.ROLE_USER })
        .subscribe(
          (res) => {
            this.uiElementService.dismissLoading();
            this.helper.setLoggedInUserResponse(res);
            //this.apiService.setupHeaders(res.token);
            this.myEvent.setUserMeData(res.user);
            // window.localStorage.removeItem(Constants.KEY_ADDRESS);
            // this.myEvent.setAddressData(null);
            if (!localStorage.getItem(Constants.KEY_ADDRESS)) {
              this.router.navigate(['/saved-addresses']);
            } else {
              this.saveAddress();
              this.router.navigate(['/home']);
            }
            // const address = localStorage.getItem('saleemsc_address');
            // if (address) this.router.navigate(['/home']);
            // else this.router.navigate(['/saved-addresses']);
          },
          (err) => {
            this.uiElementService.dismissLoading();
            this.uiElementService.presentErrorAlert(
              err &&
                err.error &&
                err.error.message &&
                String(err.error.message).toLowerCase().includes('role')
                ? 'User exists with different role'
                : 'Something went wrong'
            );
          }
        );
    });
  }

  saveAddress() {
    if (
      localStorage.getItem(Constants.KEY_ADDRESS) &&
      localStorage.getItem(Constants.KEY_ADDRESS) != 'undefined'
    ) {
      this.translate
        .get(['address_creating', 'something_wrong'])
        .subscribe((values) => {
          this.uiElementService.presentLoading(values['address_creating']);
          let selectedLocation = JSON.parse(
            localStorage.getItem(Constants.KEY_ADDRESS) as string
          );
          if (selectedLocation) {
            if (selectedLocation.id == -1) {
              delete selectedLocation.id;
            }
            this.commonService.addressAdd(selectedLocation).subscribe(
              (res) => {
                this.uiElementService.dismissLoading();
                window.localStorage.setItem('let_refresh', 'true');
                this.helper.setAddressSelected(res);
                this.router.navigate(['/home']);
              },
              (err) => {
                this.uiElementService.dismissLoading();
                this.uiElementService.presentToast(values['something_wrong']);
              }
            );
          }
        });
    }
  }

  onSigninMethodChange(event:any){
    console.log('radio event',event);
    if(event=='otp'){
      this.signinForm.removeControl('email');
      this.signinForm.removeControl('password');
      this.signinForm.addControl('code',new FormControl(this.countrySelected, Validators.required));
      this.signinForm.addControl('phone',new FormControl('', Validators.required));
      this.signinForm.updateValueAndValidity();
    }
    else{
      this.signinForm.removeControl('code');
      this.signinForm.removeControl('phone');
      this.signinForm.addControl('email',new FormControl('', Validators.required));
      this.signinForm.addControl('password',new FormControl('', Validators.required));
      this.signinForm.updateValueAndValidity();
    }
  }

  loginPWD(){
    this.otpNotSent=true;
    this.closeResult='No';
    this.router.navigate(['auth/login'], { queryParams: { loginType: 'password' } })
  }
}
