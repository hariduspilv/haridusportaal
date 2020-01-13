import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService, AuthService } from '@app/_services';
import FieldVaryService from '@app/_services/FieldVaryService';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'messagesView',
  templateUrl: 'messagesView.template.html',
  styleUrls: ['messagesView.styles.scss'],
})

export class MessagesViewComponent implements OnInit{

  public data: any[] = [];
  public breadcrumbs: any = [
    {
      title: 'Avaleht',
      link: '/',
    },
    {
      title: 'Minu töölaud',
      link: '/töölaud',
    },
    {
      title: 'Teavitused',
    },
  ];
  public loading = false;
  private destroy$: Subject<boolean> = new Subject<boolean>();
  private params: any;

  constructor (
    private http: HttpClient,
    private settings: SettingsService,
    private location: Location,
    public auth: AuthService,
    private router: ActivatedRoute,
  ) {}
  getData() {
    const queryParams = { ...this.params };
    if (queryParams['searchString'] && queryParams['searchString'].length < 3) {
      return;
    }
    if (queryParams['sentFrom']) {
      queryParams['sentFrom'] = queryParams['sentFrom'].split('.').reverse().join('-');
    }
    if (queryParams['sentUntil']) {
      queryParams['sentUntil'] = queryParams['sentUntil'].split('.').reverse().join('-');
    }
    const query = `&${Object.keys(queryParams).map(key => `${key}=${queryParams[key]}`).join('&')}`;
    this.loading = true;
    this.http
      .get(`${this.settings.url}/messages/messages/receiver?orderBy=sentAt&sort=DESC${query ? `${query}` : ''}`)
      .subscribe(
        (val: any) => {
          this.data = val;
          this.loading = false;
        },
        (err) => {
          this.loading = false;
        }
      );
  }
  ngOnInit() {
    this.router.queryParams.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      this.params = val;
      this.getData();
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
