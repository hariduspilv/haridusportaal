import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnChanges, Input, HostBinding } from '@angular/core';
import { SettingsService } from '@app/_services';
import FieldVaryService from '@app/_services/FieldVaryService';

@Component({
  selector: 'homepage-topical',
  templateUrl: 'homePageView.topical.html',
})
export class HomePageTopicalComponent implements OnInit, OnChanges {
  @Input() data: string;
  @Input() theme: string;
  @Input() line: number = 2;
  @Input() category: string;
  public article: any = {
    title: '',
    path: '',
  };

  constructor(
    private http: HttpClient,
    private settings: SettingsService,
  ) {
  }

  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }

  ngOnInit() {
    this.getData();
  }

  ngOnChanges() {
    this.getData();
  }

  private getData() {
    if (!this.data) {
      return false;
    }
    const variables = {
      path: this.data,
    };
    const query = this.settings.query('newsSingel', variables);
    const subscription = this.http.get(query).subscribe((response) => {
      this.article = {
        title: '',
        ...FieldVaryService(response['data']['route']['entity']),
        path: this.data,
      };
      subscription.unsubscribe();
    });
  }
}
