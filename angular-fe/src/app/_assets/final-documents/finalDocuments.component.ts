import { Component, ChangeDetectorRef } from '@angular/core';
import { AuthService, SettingsService } from '@app/_services';
import { HeaderComponent } from '../header';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'final-documents',
  templateUrl: './finalDocuments.template.html',
  styleUrls: ['./finalDocuments.styles.scss'],
})
export class FinalDocumentsComponent {

  constructor(
    private authService: AuthService,
    public http: HttpClient,
    public settings: SettingsService,
  ) {}

  public show = false;
  public certificatesById: any;

  showCertificates() {
    this.http.get(`${this.settings.url}/certificates/v1/certificates`).subscribe(
      (res) => {
        console.log(res);
      },
      (err) => {
        console.log(err);
      });
  }

  logIn() {
    const loginButton: HTMLElement = document.querySelector('#headerLogin');
    sessionStorage.setItem('redirectUrl', '/tunnistused/lõpudokumendid');
    loginButton.click();
  }
}
