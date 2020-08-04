import { Component, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { SettingsService } from '@app/_services/SettingsService';
import { HttpClient } from '@angular/common/http';
import FieldVaryService from '@app/_services/FieldVaryService';
import { TranslateService } from '@app/_modules/translate/translate.service';
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
  public hasComparisonPage: boolean = false;
  public data: any = false;
  public limit: number = 100;
  public offset: number = 0;

  constructor(
    private settings: SettingsService,
    private http: HttpClient,
  ) {

  }

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
      lang: 'ET',
      offset: this.offset,
      limit: this.limit,
      nidEnabled: false,
    };

    const path = this.settings.query('oskaFieldListView', variables);

    this.dataSub = this.http.get(path).subscribe(
      (response:any) => {
        if (response['errors']) {
          this.loading = false;
          this.errMessage = true;
        }
        this.hasComparisonPage = response.data.comparisonPage.count;
        this.data = response['data']['nodeQuery']['entities'];
        this.loading = false;
        if (document.getElementById('heading')) {
          document.getElementById('heading').focus();
        }
      },
      (err) => {
        this.errMessage = true;
        this.loading = false;
      });
  }

}
