import { ActivatedRoute, Route } from '@angular/router';
import { LanguageCodes } from "@app/_services";

export function focus(id: string) {
  setTimeout(() => {
    const elem = document.getElementById(id);
    if (elem) {
      document.getElementById(id).focus();
    }
  }, 0);
}

export function arrayOfLength(len) {
  return Array(parseInt(len, 10)).fill(0).map((x, i) => i);
}

export function create2DArray(rows: number = 2, columns: number = 3, filler: string | number = ''): string[][] {
	return Array(rows).fill('').map(() => Array(columns).fill(filler));
}

export function parseUnixDate(input) {
  const tmpDate = new Date(input * 1000);
  const year = tmpDate.getFullYear();
  const month = tmpDate.getMonth();
  const day = tmpDate.getDate();
  return new Date(year, month, day, 0, 0).getTime();
}

export function paramsExist(route: ActivatedRoute): boolean {
  return !!Object.values(route.snapshot.queryParams)
    .filter(val => val)?.length;
}

export function scrollElementIntoView(selector: string): void {
  setTimeout(() => {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
  });
}

export function slugifyTitle(title: string): string {
  return title.toLowerCase()
      .replace(/span/g, '')
      .replace(/<a href=".+?>/g, '')
      .replace(/<\/a>/g, '')
      .replace(/ /g, '-')
      .replace(/[^A-Za-z0-9üõöä]+/igm, '-');
}

// TODO delete this function?
export function removeLanguageCode(path: string): string {
	if (path && path.match(/^\/[a-z]{2}\//)) {
		return path;	// .substring(3);
  }
  return path;
}

export function getLangCode(): LanguageCodes {
	const langCode = window.location.pathname.split('/')[1];
	return Object.values(LanguageCodes).some((languageCode) => languageCode === langCode)
		? langCode as LanguageCodes
		: LanguageCodes.ESTONIAN;
}

export function findTranslation(word: string, translations: string[][]): string[] {
	return translations[translations.findIndex((trans) => trans.includes(word))];
}

/**
 * Iga keele jaoks peavad olema kõik tõlged
 */
const routesTranslations = [
	['tunnistused', 'certificates'],								// , 'svidetelstva'
	['lõputunnistused' , 'finishing-certificates'], // , 'svidetelstva-ob-okonchanii'
	['lõpudokumendid', 'finishing-docs'],						// , 'dokumenty-ob-okonchanii'
	['uudised', 'news'],														// , 'novosti'
	['artiklid', 'articles'],												// , 'statji'
	['uuringud', 'studies'],												// , 'issledovanija'
	['karjäär', 'career'],													// , 'karjera'
	['sündmused', 'events'],												// , 'sobytija'
	['õppimine', 'learning'],												// , 'uchjoba'
	['õpetaja', 'teacher'],													// , 'uchitel'
	['infosüsteemid', 'infosystems'],								// , 'infosistemy'
	['erialad', 'specialities'],										// , 'spetsialnosti'
	['võrdlus', 'comparison'], 											// , 'sravnenije'
	['kool', 'school'],															// , 'shkola'
	['koolide-rahastus', 'money-to-school'],				// , 'finansirovanije-shkol'
	['ametialad', 'professions'],										// , 'sfery-dejatelnosti'
	['andmed', 'data'],															// , 'dannye'
	['töölaud', 'desktop'], 												// , 'rabo4ij-stol'
	['valdkonnad', 'spheres'],											// , 'sfery-dejatelnosti'
	['kaart', 'map'],																// , 'karta'
	['oska-tulemused', 'oska-results'],							// . 'oska-rezultaty'
	['ettepanekute-elluviimine', 'proposals-implementation'], // , 'realizacija-predlozenij'
	['tööjõuprognoos', 'labor-force-forecast'], 		// , 'prognoz-rabo4ej-sily'
	['tunnistuse-kehtivuse-kontroll', 'certificate-validity-check'],	// , 'proverka-dejstvitelnosti-svidetelstva'
	['lõpudokumentide-kehtivuse-kontroll', 'finishing-docs-validity-check'],	// , 'proverka-dejstvitelnosti-dokumentov-ob-okonchanii'
	['taotlused', 'application'], 									// , 'hodatajstvo'
	['teavitused', 'notification'], 								// , 'opovewenije'
	['gdpr', 'gdpr'],																// , 'gdpr'
	['digitempel', 'digital-tempel'],								// , 'digitalnaja-podpis'
];

export function translateRoutes(routes: Route[], exclusions?: string[]): Route[] {
	const languagesNumber = routesTranslations[0].length;
	const translatedRoutes: Route[] = [];

	routes.forEach((route) => {
		const routePath = route.path;
		const routePathSplit = routePath.split('/');
		const routeLength = routePathSplit.length;

		if (exclusions && exclusions.includes(routePath)) {
			translatedRoutes.push(route);
			return;
		}

		const isMainPage = routePath === '';
		const isWildcardRoute = routePath === '**';
		const isSingleVariableRoute = routeLength === 1 && routePath[0] === ':';

		if (isMainPage) {
			translatedRoutes.push(route);
			return;
		}
		if (isWildcardRoute) {
			translatedRoutes.push(route);
			return;
		}
		if (isSingleVariableRoute) {
			translatedRoutes.push(route);
			return;
		}

		if (routePath && !isWildcardRoute && !isSingleVariableRoute) {
			const pathTranslations: string[][] = create2DArray(languagesNumber, routeLength, '');

			routePathSplit.forEach((word) => {
				if (word[0] !== ':') {
					let wordTranslations = findTranslation(word, routesTranslations);
					pathTranslations.forEach((trans, index) => trans.push(wordTranslations[index]));
				}

				if (word[0] === ':') {
					pathTranslations.forEach((arr) => arr.push(word));
				}
			});

			pathTranslations.forEach((path) => {
				translatedRoutes.push({
					...route,
					path: path.filter((element) => element !== '').join('/'),
				});
			});
		}
	});

	return translatedRoutes;
}
