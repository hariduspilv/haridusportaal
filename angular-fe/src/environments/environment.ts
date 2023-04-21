// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  VERSION: require('../../package.json').version,
  // API_URL: "https://htm.wiseman.ee", // vana backend
  API_URL: "http://localhost:30000",
  EHIS_URL: "https://api.haridusportaal.twn.zone/ehis2/api",
  DEV_AUTH: true,
  GA_TRACKING: false,
  LANGUAGE_SWITCHER: true,
  LANGUAGES: ['et', 'en']
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
