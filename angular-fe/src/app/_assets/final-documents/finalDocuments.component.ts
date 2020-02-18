import { Component, ChangeDetectorRef } from '@angular/core';
import { AuthService, SettingsService } from '@app/_services';
import { HeaderComponent } from '../header';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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

  public isLoggedIn = false;
  public certificatesById: any;
  private destroy$: Subject<boolean> = new Subject<boolean>();

  public loading = {
    certificatesById: true,
  };

  compareCertificates(a, b) {
    return a.access.issued < b.access.issued || a.issued == null ? 1 : -1;
  }

  initializeAuth() {
    this.authService.isAuthenticated.pipe(
      takeUntil(this.destroy$),
    ).subscribe((value) => {
      this.isLoggedIn = value;
      if (this.isLoggedIn) {
        this.getCertificates();
      }
    });
  }

  getCertificates() {
    this.loading.certificatesById = true;
    this.http.get(`${this.settings.url}/certificates/v1/certificates?accessType=ACCESS_TYPE:ID_CODE`).subscribe(
      (res: any[]) => {
        this.certificatesById = res.sort(this.compareCertificates);
        this.loading.certificatesById = false;
      },
      (err) => {
        this.loading.certificatesById = false;
      });
  }

  logIn() {
    const loginButton: HTMLElement = document.querySelector('#headerLogin');
    sessionStorage.setItem('redirectUrl', '/tunnistused/lõpudokumendid');
    loginButton.click();
  }

  ngOnInit() {
    this.initializeAuth();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
