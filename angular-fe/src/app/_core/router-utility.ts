import { Route } from "@angular/router";
import { create2DArray } from "@app/_core/utility";
import { routerDictionary } from "@app/_core/router-dictionary";

export function findTranslation(word: string, translations: string[][]): string[] {
	return translations[translations.findIndex((trans) => trans.includes(word))];
}

export function translateRoutes(routes: Route[], exclusions?: string[]): Route[] {
	const languagesNumber = routerDictionary[0].length;
	const translatedRoutes: Route[] = [];

	routes.forEach((route) => {
		if (route.children) route.children = translateRoutes(route.children);

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
					let wordTranslations = findTranslation(word, routerDictionary);
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

	console.log(translatedRoutes);
	return translatedRoutes;
}
