import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Subject} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class SettingsService {
  constructor(
    private http: HttpClient,
  ) {
    this.url = environment.API_URL;
    this.ehisUrl = environment.EHIS_URL;
  }

  public url: string = '';
  public ehisUrl: string = '';
  public login = '/api/v1/token?_format=json';
  public mobileLogin = '/custom/login/mobile_id?_format=json';
  public error: boolean = false;
  public data: any;
  public compareObservable = new Subject<any>();
  public activeLang: string = 'ET';

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
		const requestName = this.get(`request.${name}`);
		let path = `${this.url}/graphql?queryName=${name}&queryId=${requestName}`;
		if (Object.keys(variables).length > 0) {
			path = `${path}&variables=${encodeURI(JSON.stringify(variables))}`;
		}
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
			const path = `${this.url}/variables?_format=json&lang=et`;
			this.http.get(path).subscribe(
				(response) => {
					this.data = response;
					resolve(true);
				},
				(err) => {
					this.error = true;
					resolve(true);
				});
		});
	}
}
