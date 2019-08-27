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
  @Input() state: boolean;
  @Input() limit: boolean;
  private subscription: Subscription;
  private alert: Object = {
    type: AlertType.Success,
    id: 'global',
    identifier: 'favourites',
    message: '',
  };
  private maxCount: number = 10;

  constructor(
    private http: HttpClient,
    private alertsService: AlertsService,
    private translate: TranslateService,
    private modalService: ModalService) {}
  handleStateChange() {
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
      if (this.limit) {
        this.modalService.open('favourites');
        return;
      }
      this.subscription =
        this.http.post(`${conf.api_prefix}graphql`, data).subscribe((response) => {
          this.alert['message'] = this.translate.get('frontpage.favourites_snackbar_message');
          this.alert['closeable'] = false;
          this.alert['link'] = {
            url: '/töölaud/taotlused',
            label: this.translate.get('frontpage.check_dashboard'),
          },
          this.alertsService.notify(
            new Alert(this.alert),
          );
          this.state = true;
        },                                                          (err) => {});
    } else {
      data.queryId = 'c818e222e263618b752e74a997190b0f36a39818:1';
      this.subscription =
        this.http.post(`${conf.api_prefix}graphql`, data).subscribe((response) => {
          this.alert['message'] =
            this.translate.get('frontpage.favourites_snackbar_message_remove');
          this.alert['closeable'] = true;
          this.alert['link'] = false;
          this.alertsService.notify(
            new Alert(this.alert),
          );
          this.state = false;
        },                                                          (err) => {});
    }
  }
}
