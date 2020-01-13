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

  constructor (
    private http: HttpClient,
    private settings: SettingsService,
    private location: Location,
    public auth: AuthService,
    private router: ActivatedRoute,
  ) {}
  getData() {
    this.http.get(`${this.settings.url}/dashboard/gdprlog/1?_format=json`).subscribe((val) => {
      console.log(val);
    });
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
