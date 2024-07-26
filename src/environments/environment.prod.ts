export const environment = {
  production: true,
  apiBase: 'https://backend.foodzi.co.uk/public/', // Live URL
  // apiBase: "https://stag-backend.foodzi.co.uk/public/",// Staging URL
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
    'https://web.e.connect.paymentsense.cloud/assets/js/client.js',
};
