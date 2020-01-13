import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService, AuthService } from '@app/_services';
import FieldVaryService from '@app/_services/FieldVaryService';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'gdprView',
  templateUrl: 'gdprView.template.html',
  styleUrls: ['gdprView.styles.scss'],
})

export class GdprViewComponent implements OnInit{

  public data: any;
  public groupedData: any[] = [];
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
      title: 'Sinu andmete kasutajad',
    },
  ];
  public loading = false;
  private destroy$: Subject<boolean> = new Subject<boolean>();
  private params: any;

  public requestIterator: any;
  public requestIteratorTimeout = 1000;
  public requestCounter: number = 0;
  

  constructor (
    private http: HttpClient,
    private settings: SettingsService,
    private location: Location,
    public auth: AuthService,
    private router: ActivatedRoute,
  ) {}

  private groupBySender() {
    this.groupedData = [...new Set(this.data.value.GDPR.map(el => el.sender))].map((el) => {
      return {
        institution: el,
        queries: this.data.value.GDPR.filter((query) => {
          if (query.sender === el) {
            return true;
          }
          return false;
        }),
      };
    });
    console.log(this.groupedData);
    this.loading = false;
  }

  getData(init = true) {
    this.loading = true;
    const delay = init ? 0 : this.requestIteratorTimeout;
    this.requestCounter = this.requestCounter + 1;
    this.requestIterator = setTimeout(
      () => {
        const subscription = this.http
          .get(`${this.settings.url}/dashboard/gdprlog/1?_format=json`)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (response: any) => {
              console.log(response);
              if (!response || !response.redis_hit) {
                this.getData(false);
              };
              if (response.redis_hit && response.value) {
                this.loading = false;
                this.data = response;
                this.groupBySender();
              }
              if (response.redis_hit && !response.value) {
                this.loading = false;
                this.data = false;
              }
              subscription.unsubscribe();
            });
      },
      delay);
  }
  ngOnInit() {
    this.router.queryParams.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      this.params = val;
      this.getData();
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    if (this.requestIterator) {
      clearTimeout(this.requestIterator);
    }
  }
}
