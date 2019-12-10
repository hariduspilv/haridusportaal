import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import conf from '@app/_core/conf';
import { Subscription } from 'rxjs';
import { AlertsService, ModalService, SettingsService, AuthService } from '@app/_services';
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
  public closeTime: any = false;
  private maxCount = 10;

  constructor(
    private http: HttpClient,
    private alertsService: AlertsService,
    private translate: TranslateService,
    public modalService: ModalService,
    private settings: SettingsService,
    private auth: AuthService,
  ) { }

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

      const variables = {
        language: 'ET',
        id: this.auth.userData.drupal.uid,
      };

      const path = this.settings.query('customFavorites', variables);

      this.http.get(path).subscribe((response: any) => {

        if (response.data.CustomFavorites &&
          response.data.CustomFavorites.favoritesNew.length >= this.maxCount) {
          this.modalService.toggle('favourites');
        } else {
          this.setFavourite(data);
        }
      });

    } else {
      data.queryId = 'c818e222e263618b752e74a997190b0f36a39818:1';
      this.closeTime = 5000;
      this.subscription = this.request({
        data,
        message: this.translate.get('frontpage.favourites_snackbar_message_remove'),
        closeable: true,
        link: false,
      });
    }
  }

  setFavourite(data) {
    this.closeTime = false;
    this.subscription = this.request({
      data,
      message: this.translate.get('frontpage.favourites_snackbar_message'),
      state: true,
      link: {
        url: '/töölaud/taotlused',
        label: this.translate.get('frontpage.check_dashboard'),
      },
    });
  }

  request({ data, message = '', link, closeable = false, state = false }) {
    return this.http.post(`${this.settings.url}/graphql`, data).subscribe((response) => {
      this.alertsService.success(
        message,
        'global',
        'favourites',
        closeable,
        link,
      );
      this.state = state;
    }, (err) => { });
  }
}
