import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsService, AuthService, ModalService } from '@app/_services';
import FieldVaryService from '@app/_services/FieldVaryService';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'messageView',
  templateUrl: 'messageView.template.html',
  styleUrls: ['messageView.styles.scss'],
})

export class MessageViewComponent implements OnInit{

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
      title: 'Teavitused',
    },
  ];
  public loading = false;
  private destroy$: Subject<boolean> = new Subject<boolean>();
  constructor (
    private http: HttpClient,
    private settings: SettingsService,
    private location: Location,
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    public modal: ModalService,
  ) {}
  getData() {
    const id = this.route.snapshot.params.messageId;
    this.loading = true;
    this.http
      .get(`${this.settings.url}/messages/messages/receiver/${id}`)
      .subscribe(
        (val: any) => {
          this.data = val;
          this.loading = false;
        },
      );
  }
  ngOnInit() {
    this.getData();
  }

  deleteMessage() {
    const id = this.data.messageAddressee[0].id;
    this.http.delete(`${this.settings.url}/messages/messages/receiver/messageAddressee/${id}`, {responseType: 'text'})
    .subscribe(
      (res) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      (err) => {
        console.log(err);
      }
    );
  }
  ngOnDestroy(): void {

  }
}
