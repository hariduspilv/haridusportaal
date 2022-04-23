import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '@app/_services';
import FieldVaryService from '@app/_services/FieldVaryService';

@Component({
  selector: 'oskaFieldData-view',
  templateUrl: 'oskaFieldDataView.template.html',
  styleUrls: ['oskaFieldDataView.styles.scss'],
})

export class OskaFieldDataViewComponent implements OnInit{
  public origData;
  public data;
  public loading: boolean = false;
  constructor(
    private http: HttpClient,
    private settings: SettingsService,
  ) {}

  private getData():void {
    const variables = {
			lang: this.settings.currentAppLanguage,
    };

    const path = this.settings.query('oskaFieldComparisonPage', variables);

    const subscription = this.http.get(path).subscribe({
			next: (response) => {
				this.origData = response['data']['nodeQuery']['entities'][0];

				this.data = FieldVaryService(response['data']['nodeQuery']['entities'][0]);

				if (Array.isArray(this.data.video) && this.data.video.length > 1) {
					this.data.additionalVideos = this.data.video.slice(1, 10);
					this.data.video = this.data.video[0];
				}
			},
			complete: () => {
				this.loading = false;
				subscription.unsubscribe();
			},
		});
  }

  ngOnInit() {
    this.getData();
  }
}
