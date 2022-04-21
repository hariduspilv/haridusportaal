import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { getLangCode } from "@app/_core/router-utility";
import { LanguageSwitchLink } from "@app/_core/models/interfaces/main";

export enum LanguageCodes {
	ESTONIAN = 'et',
	ENGLISH = 'en',
	RUSSIAN = 'ru',
}

@Injectable({
	providedIn: 'root',
})
export class SettingsService {
	constructor(
		private http: HttpClient,
		public route: ActivatedRoute,
) {
		this.activeLang = getLangCode();
		this.setUrl();
		this.ehisUrl = environment.EHIS_URL;
	}

	public url: string = '';
	public ehisUrl: string = '';
	public login = '/api/v1/token?_format=json';
	public mobileLogin = '/custom/login/mobile_id?_format=json';
	public error: boolean = false;
	public data: any;
	public compareObservable = new Subject<any>();

	availableLanguages: Record<string, string | LanguageCodes>[] = [
		{ label: 'frontpage.et', code: LanguageCodes.ESTONIAN },
		{ label: 'frontpage.en', code: LanguageCodes.ENGLISH },
		// { label: 'frontpage.ru', code: LanguageCodes.RUSSIAN },
	];
	private activeLang: LanguageCodes = LanguageCodes.ESTONIAN; // getLangCode();
	activeLang$ = new BehaviorSubject(this.activeLang);
	get currentAppLanguage() { return this.activeLang;	}
	set currentAppLanguage(code: LanguageCodes) {
		document.documentElement.lang = code;
		if (this.activeLang === code) return;
		this.activeLang = code;
		this.activeLang$.next(code);
		this.setUrl();
	}

	private languageSwitchLinks: any;

	get currentLanguageSwitchLinks() {
		return this.languageSwitchLinks;
	}

	set currentLanguageSwitchLinks(links: LanguageSwitchLink[]) {
		this.languageSwitchLinks = links;
	}

	setUrl(): void {
		this.url = `${environment.API_URL}${this.activeLang === LanguageCodes.ESTONIAN ? '' : `/${this.activeLang.toLowerCase()}`}`;
	}

	/**
	 * Finds an entity from objects
	 * @param obj - key:value object
	 * @param path - eq. name or name.name2 or name.name2.name3
	 * @returns - value of given path
	 */
	private findObj(obj, path) {
		return path
			.replace(/\[|\]\.?/g, '.')
			.split('.')
			.filter(s => s)
			.reduce((acc, val) => acc && acc[val], obj);
	}

	/**
	 * Compiles GraphQL query string from query name and variables
	 * @param [name] - query name. Found in variables API request
	 * @param [variables] - variables object. Usually consists of path, lang etc.
	 * @returns - url string to use in http request
	 */
	public query(name: string = '', variables: object = {}) {
		if (variables && variables['path'] && this.activeLang !== LanguageCodes.ESTONIAN) {
			Object.assign(variables, {
				path: `${this.activeLang}${variables['path']}`
			});
		}

		const requestName = this.get(`request.${name}`);
		let path = `${this.url}/graphql?queryName=${name}&queryId=${requestName}`;
		path = `${path}&variables=${encodeURI(JSON.stringify({
			...variables,
			lang: this.activeLang.toUpperCase()
		}))}`;

		return path;
	}

	/**
	 * Get query ID
	 * @param [name] - query name found in variables API request
	 * @returns - query id string
	 */
	public queryID(name: string = '') {
		return this.get(`request.${name}`);
	}

	/**
	 * @param [key] - query name found in variables API request
	 * @returns - query string with appended :1
	 */
	public get(key: string = '') {
		this.findObj(this.data, key);
		let output = this.findObj(this.data, key) || undefined;
		if (key.match(/request\./gmi)) {
			output = `${output}:1`;
		}
		return output;
	}

	/**
	 * Loads settings service on app init
	 * @returns - boolean
	 */
	public load() {
		return new Promise((resolve, reject) => {
			const path = `${this.url}/variables?_format=json&lang=${this.activeLang.toLowerCase()}`;
			this.http.get(path).subscribe({
				next: (response) => {
					this.data = response;
					resolve(true);
				},
				error: (err) => {
					this.error = true;
					resolve(true);
				}
			});
		});
	}
}
