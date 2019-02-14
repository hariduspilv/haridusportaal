import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';

@Injectable()
export class PreferencesService {
	constructor(
		private http: HttpClient
	){}

  error: boolean = false;
  
	data: any;

	get( key:string = '' ) {
		if( !this.data ){
			return undefined;
		}
		return this.data[key] || undefined;
	}

	load() {
		return new Promise((resolve, reject) => {
			this.http.get('/variables?_format=json&lang=et').subscribe(response => {
				this.data = response;
				resolve(true);
			}, () => {
				this.error = true;
				resolve(true);
			});
		})
	}
}
