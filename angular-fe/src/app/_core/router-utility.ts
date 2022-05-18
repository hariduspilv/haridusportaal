import { Route } from '@angular/router';
import { create2DArray } from '@app/_core/utility';
import { routerDictionary } from '@app/_core/router-dictionary';
import { LanguageCodes } from '@app/_services';

export function isMainPage(link?: string): boolean {
	const pathSplit = link && link.substring(1) ? [link.substring(1)] : window.location.pathname.split('/').splice(1);
	return pathSplit.length === 1 && (pathSplit[0] === '' || isLanguageCode(pathSplit[0]));
}

// export function isWildcardPage(): boolean {
// 	return decodeURI(window.location.pathname).split('/').includes('**');
// }

export function isLanguageCode(code): boolean {
	return Object.values(LanguageCodes).some((languageCode) => languageCode === code);
}

export function activeLanguageIndex(): number {
	const appActiveLanguage = getLangCode();
	return Object.values(LanguageCodes).findIndex((code) => code === appActiveLanguage);
}

export function languageIndex(code: LanguageCodes): number {
	return Object.values(LanguageCodes).findIndex((langCode) => langCode === code);
}

export function addLanguageCode(path: string, code: LanguageCodes): string {
	return code === 'et' ? `/${path}`	: `/${code}/${path}`;
}

export function removeLanguageCode(path: string): string {
	return (path && isLanguageCode(path.split('/')[1]))
		? path.substring(3)
		: path;
}

export function getLangCode(): LanguageCodes {
	const langCode = window.location.pathname.split('/')[1];
	return isLanguageCode(langCode)
		? langCode as LanguageCodes
		: LanguageCodes.ESTONIAN;
}

export function findTranslation(word: string): string[] {
	return routerDictionary[routerDictionary.findIndex((translation) => translation.includes(word))];
}

export function getTranslatedWord(word: string): string {
	return findTranslation(word)[activeLanguageIndex()];
}

// NB! path must begin with '/'
export function translatePath(path: string): string {
	const translatedPath = path
			.split('/')
			.splice(1)
			.map((subPath) => getTranslatedWord(subPath))
			.join('/');

	return addLanguageCode(translatedPath, getLangCode());
}

export function translatePathTo(path: string, langCode: LanguageCodes): string {
	const translatedPath = removeLanguageCode(decodeURI(path))
		.split('/')
		.splice(1)
		.map((subPath) => findTranslation(subPath)[languageIndex(langCode)])
		.join('/');

	return addLanguageCode(translatedPath, langCode);
}

export function translateRoutes(routes: Route[], exclusions?: string[]): Route[] {
	const languagesNumber = routerDictionary[0].length;
	const translatedRoutes: Route[] = [];

	routes.forEach((route) => {
		if (route.children) route.children = translateRoutes(route.children);

		const routePath = route.path;
		const routeSplit = routePath.split('/');
		const routeLength = routeSplit.length;

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

			routeSplit.forEach((word) => {
				if (word[0] !== ':') {
					let wordTranslations = findTranslation(word);
					pathTranslations.forEach((trans, index) => trans.push(wordTranslations[index]));
				}

				if (word[0] === ':') {
					pathTranslations.forEach((trans) => trans.push(word));
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
