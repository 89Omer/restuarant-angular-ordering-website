import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, first } from 'rxjs';
import { MyEventsService } from 'src/common/events/my-events.service';
import { AuthResponse } from 'src/common/models/auth-response.model';
import { SignUpRequest } from 'src/common/models/auth-signup-request.model';
import { Constants } from 'src/common/models/constants.model';
import { Country } from 'src/common/models/country.model';
import { CommonService } from 'src/common/services/common.service';
import { HelperService } from 'src/common/services/helper.service';
import { UiElementsService } from 'src/common/services/ui-elements.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  defaultCountry: Country = {
    name: 'United Kingdom of Great Britain and Northern Ireland',
    alpha2Code: 'GB',
    callingCodes: '44',
    code: '44',
  };

  @Input() countries: Country[] = [];
  @Input() queryParams: BehaviorSubject<any> = new BehaviorSubject({});
  countrySelected: any;
  registerForm!: FormGroup;
  // countries: Country[] = [];
  selectedCode: any = this.defaultCountry.callingCodes;
  selectedIndex: any;
  selectedCountry!: Country;
  selectedPhone: string = '';
  emailReg = /^([A-Za-z0-9_\-\.\+])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
  signUpRequest: SignUpRequest = new SignUpRequest();
  showOtpScreen: boolean = false;
  OtpForm!: FormGroup;
  otp = '';
  private result: any;

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private uiElementService: UiElementsService,
    private translate: TranslateService,
    private helper: HelperService,
    private myEvent: MyEventsService,
    private router: Router
  ) {
    this.route.queryParams.subscribe((param: any) => {
      this.selectedIndex = param.code;
      this.selectedPhone = param.phone;
    });
    this.helper.registerPhone.subscribe(res => {
      this.selectedIndex = res.code;
      this.selectedPhone = res.phone;
      setTimeout(() => {
        // this.countrySelected = this.countries[this.selectedIndex];
        this.registerForm.controls['code'].setValue(this.selectedIndex);
        this.registerForm.controls['phone'].setValue(this.selectedPhone);
      }, 500);
    });

  }

  ngOnInit(): void {
    // this.getCountries();
    this.countrySelected = this.registerForm = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required])],
      email: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(this.emailReg),
        ]),
      ],
      code: [this.countrySelected, Validators.compose([Validators.required])],
      phone: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])],
      // country: [{ value: '' }],
      // mobile_number: [{ value: this.selectedPhone }],
    });

    setTimeout(() => {
      this.countrySelected = this.countries.findIndex(
        (f) =>
          f.name == this.defaultCountry.name &&
          f.alpha2Code == this.defaultCountry.alpha2Code
      );
      this.registerForm.controls['code'].setValue(this.countrySelected);
    }, 500);
  }
  onRegisterSubmit() {
    this.selectedCode =
      this.countries[this.registerForm.value.code].callingCodes;
    if (this.registerForm.valid) {
      // this.uiElementService.presentLoading('Loading');
      this.signUpRequest.email = this.registerForm.value.email;
      this.signUpRequest.name = this.registerForm.value.name;
      this.signUpRequest.mobile_number = `+${this.selectedCode}${this.registerForm.value.phone}`;
      this.signUpRequest.password = this.registerForm.value.password;
      this.signUp();
    }
  }

  signUp() {
    this.translate.get('signing_up').subscribe((value) => {
      // this.uiElementService.presentLoading(value);

      this.commonService.createUser(this.signUpRequest).subscribe(
        (res: AuthResponse) => {
          this.uiElementService.dismissLoading();
          this.showOtpScreen = true;
          this.OtpForm = this.formBuilder.group({
            otpCode: ['', Validators.compose([Validators.required])],
          });
          let navigationExtras: NavigationExtras = {
            queryParams: { phoneNumberFull: res.user.mobile_number },
          };
          this.router.navigate(['auth/login'], navigationExtras);
        },
        (err) => {
          this.uiElementService.dismissLoading();
          let errMsg;
          this.translate
            .get([
              'invalid_credentials',
              'invalid_credential_email',
              'invalid_credential_phone',
              'invalid_credential_password',
            ])
            .subscribe((value) => {
              errMsg = value['invalid_credentials'];
              if (err && err.error && err.error.errors) {
                if (err.error.errors.email) {
                  errMsg =
                    typeof err.error.errors.email == 'string'
                      ? err.error.errors.email
                      : err.error.errors.email[0];
                } else if (err.error.errors.mobile_number) {
                  errMsg =
                    typeof err.error.errors.mobile_number == 'string'
                      ? err.error.errors.mobile_number
                      : err.error.errors.mobile_number[0];
                } else if (err.error.errors.password) {
                  errMsg =
                    typeof err.error.errors.password == 'string'
                      ? err.error.errors.password
                      : err.error.errors.password[0];
                }
              }
              this.uiElementService.presentErrorAlert(errMsg);
            });
        }
      );
    });
  }

  getCountries() {
    // this.uiElementService.presentLoading('loading');
    this.commonService
      .getCountries()
      .pipe(first())
      .subscribe(
        (c: Country[]) => {
          this.countries = c;
          this.selectedCountry = this.countries[this.selectedIndex];
          if (this.selectedCountry) {
            this.registerForm.controls['country'].setValue(
              this.selectedCountry.name
            );
            this.selectedCode = this.selectedCountry.callingCodes;
            this.registerForm.controls['mobile_number'].setValue(
              `+${this.selectedCode + this.selectedPhone}`
            );
            this.registerForm.updateValueAndValidity();
            this.uiElementService.dismissLoading();
          }
          //   this.countrySelected=this.countries.findIndex(f=>f.name==this.defaultCountry.name && f.alpha2Code==this.defaultCountry.alpha2Code);
          // this.signinForm.controls['code'].setValue(this.countrySelected);
          // this.signinForm.updateValueAndValidity();
        },
        (err) => {
          this.uiElementService.dismissLoading();
        }
      );
  }
  onOtpSubmit() {
    this.verifyOtpBrowser();
    // this.router.navigate(['/auth/register']);
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
          component.uiElementService.presentErrorAlert(error.message);
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
      .catch((err: any) => { });
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
            //window.localStorage.removeItem(Constants.KEY_ADDRESS);
            if (!localStorage.getItem(Constants.KEY_ADDRESS)) {
              // this.myEvent.setAddressData(null);
              this.router.navigate(['/saved-addresses']);
            } else {
              this.saveAddress();
              this.router.navigate(['/home']);
            }
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
  loginPWD(){
    this.showOtpScreen=false;
    this.router.navigate(['auth/login'], { queryParams: { loginType: 'password' } })
  }
}
