import { ActivatedRoute } from '@angular/router';
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
