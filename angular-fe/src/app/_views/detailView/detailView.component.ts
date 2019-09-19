import { Component, Input } from '@angular/core';
import { SettingsService } from '@app/_services/SettingsService';
import { HttpClient } from '@angular/common/http';
import FieldVaryService from '@app/_services/FieldVaryService';
@Component({
  selector: 'detail-view',
  templateUrl: 'detailView.template.html',
  styleUrls: ['detailView.styles.scss'],
})

export class DetailViewComponent {
  @Input() type: string = 'news';
  @Input() path: string;
  @Input() data: any;
  public loading: boolean = true;

  constructor(
    private settings: SettingsService,
    private http: HttpClient,
  ) {}

  private getData() {
    const variables = {
      path: this.path,
    };
    const path = `${this.settings.query('newsSingel')}&variables=${JSON.stringify(variables)}`;
    const subscription = this.http.get(path).subscribe((response) => {
      this.data = FieldVaryService(response['data']['route']['entity']);
      this.loading = false;
      console.log(this.data);
    });
  }

  ngOnInit() {
    if (!this.data) {
      this.getData();
    }
  }
}
