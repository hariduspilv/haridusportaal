import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '@app/_services';
import FieldVaryService from '@app/_services/FieldVaryService';

@Component({
  selector: 'mainProfessionData-view',
  templateUrl: 'mainProfessionDataView.template.html',
  styleUrls: ['mainProfessionDataView.styles.scss'],
})

export class MainProfessionDataViewComponent implements OnInit{
  private origData;
  public data;
  public loading: boolean = false;
  constructor(
    private http: HttpClient,
    private settings: SettingsService,
  ) {}

  private getData():void {
    const variables = {
      lang: 'ET',
    };

    const path = this.settings.query('oskaMainProfessionComparsionPage', variables);

    const subscription = this.http.get(path).subscribe((response) => {

      this.origData = response['data']['nodeQuery']['entities'][0];

      this.data = FieldVaryService(response['data']['nodeQuery']['entities'][0]);

      if (Array.isArray(this.data.video) && this.data.video.length > 1) {
        this.data.additionalVideos = this.data.video.slice(1, 10);
        this.data.video.splice(0, 1);
      }

      this.loading = false;

      subscription.unsubscribe();

    });

  }

  ngOnInit() {
    this.getData();
  }
}
