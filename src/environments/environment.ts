// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  apiBase: 'https://exmaple.com/public/', // Live URL
  googleApiKey: 'xxxxxxxxx',
  firebaseConfig: {
    webApplicationId:
      'xx-xxxx.apps.googleusercontent.com',
    apiKey: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
    authDomain: 'xx-xx.firebaseapp.com',
    databaseURL: 'https://xxxx-248a5-default-rtdb.firebaseio.com',
    projectId: 'xxxxx-1234444',
    storageBucket: 'xxxxx-123444.appspot.com',
    messagingSenderId: '117190386289',
  },
  paymentSenseScript:
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
