import { Component, Input, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import conf from '@app/_core/conf';
import { Subscription } from 'rxjs';
import { AlertsService, Alert, AlertType, ModalService } from '@app/_services';
import { TranslateService } from '@app/_modules/translate/translate.service';

@Component({
  selector: 'favourite',
  templateUrl: './favourite.template.html',
  styleUrls: ['./favourite.styles.scss'],
})

export class FavouriteComponent {
  @Input() id: string;
  @Input() title: string;
  @Input() state: boolean;
  @Input() limit: boolean;
  // @Input() authorization: string;
  private subscription: Subscription;
  private maxCount: number = 10;

  constructor(
    private http: HttpClient,
    private alertsService: AlertsService,
    private translate: TranslateService,
    private modalService: ModalService) {}
  handleStateChange() {
    // let headers = new HttpHeaders();
    // headers = headers = headers.append('Authorization', `Bearer ${this.authorization}`);
    if (this.limit) {
      this.modalService.open('favourites');
      return;
    }
    if (this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
    const data = {
      queryId: 'e926a65b24a5ce10d72ba44c62e38f094a38aa26:1',
      variables: {
        language: 'ET',
        id: this.id,
      },
    };
    if (!this.state) {
      this.subscription =
        this.http.post(`${conf.api_prefix}graphql`, data,
          // { headers }
          ).subscribe((response) => {
            this.alertsService.notify(
              new Alert({
                message: this.translate.get('frontpage.favourites_snackbar_message'),
                type: AlertType.Success,
                id: 'global',
                link: {
                  url: '/töölaud/taotlused',
                  label: this.translate.get('frontpage.check_dashboard'),
                },
                identifier: 'favourites',
              }),
            );
            this.state = true;
          },          (err) => {});
    } else {
      data.queryId = 'c818e222e263618b752e74a997190b0f36a39818:1';
      this.subscription =
        this.http.post(`${conf.api_prefix}graphql`, data,
        // { headers }
        ).subscribe((response) => {
          this.alertsService.notify(
            new Alert({
              message: this.translate.get('frontpage.favourites_snackbar_message_remove'),
              type: AlertType.Success,
              id: 'global',
              closeable: true,
              identifier: 'favourites',
            }),
          );
          this.state = false;
        },          (err) => {});
    }
  }
}
