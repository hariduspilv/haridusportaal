import { Component } from '@angular/core';
import { SettingsService } from '@app/_services/SettingsService';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
	selector: 'oskaFieldList-view',
	templateUrl: 'oskaFieldListView.template.html',
	styleUrls: ['oskaFieldListView.styles.scss'],
})
export class OskaFieldListViewComponent {
	public loading: boolean = false;
	public errMessage: any = false;
	private dataSub: Subscription;
	public data: any = false;
	public limit: number = 100;
	public offset: number = 0;

	constructor(private settings: SettingsService, private http: HttpClient) {}

	ngOnInit() {
		this.getData();
	}

	getData() {
		this.loading = true;
		this.errMessage = false;
		if (this.dataSub) {
			this.dataSub.unsubscribe();
		}
		const variables = {
			lang: this.settings.currentAppLanguage,
			offset: this.offset,
			limit: this.limit,
			nidEnabled: false,
		};

		const path = this.settings.queryList('oska_field_page', variables);
		this.dataSub = this.http.get(path).subscribe({
			next: (response: any) => {
				if (response['errors']) {
					this.errMessage = true;
				}
				this.data = response['entities'];
				if (document.getElementById('heading')) {
					document.getElementById('heading').focus();
				}
			},
			error: (err) => {
				this.errMessage = true;
			},
			complete: () => (this.loading = false),
		});
	}
}
