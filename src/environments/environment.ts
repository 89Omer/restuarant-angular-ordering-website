// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiBase: 'https://backend.foodzi.co.uk/public/',
  // apiBase: 'https://stag-backend.foodzi.co.uk/public/',
  //apiBase: "http://foodzi-backend.com/",
  googleApiKey: 'AIzaSyByg27eBq3TdVAk_Y_h6IRXnMW8M1dn9L8',
  // googleApiKey:"AIzaSyAGRH_O6yavB0GuL2lcRCIokuPq8RcJI_s",
  firebaseConfig: {
    webApplicationId:
      '117190386289-modah9lquk94re30acgkkqt50bdcdtpj.apps.googleusercontent.com',
    apiKey: 'AIzaSyBd8b95MUrOw23SYzjfL_iTdhrP4kjN4vk',
    authDomain: 'foodzi-248a5.firebaseapp.com',
    databaseURL: 'https://foodzi-248a5-default-rtdb.firebaseio.com',
    projectId: 'foodzi-248a5',
    storageBucket: 'foodzi-248a5.appspot.com',
    messagingSenderId: '117190386289',
  },
  paymentSenseScript:
    // 'https://web.e.test.connect.paymentsense.cloud/assets/js/client.js',
    'https://web.e.connect.paymentsense.cloud/assets/js/client.js',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
