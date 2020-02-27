import { Component, ChangeDetectorRef } from '@angular/core';
import { AuthService, SettingsService, AlertsService } from '@app/_services';
import { HeaderComponent } from '../header';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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
    public fb: FormBuilder,
    private router: Router,
    private alertsService: AlertsService,
  ) {}

  public isLoggedIn = false;
  public certificatesById: any;
  private destroy$: Subject<boolean> = new Subject<boolean>();

  public loading = {
    certificatesById: true,
    certificatesByAccessCode: false,
  };

  public accessFormGroup = this.fb.group(
    {
      certificateNr: ['', Validators.required],
      accessCode: ['', Validators.required],
    },
    {
      updateOn: 'submit',
    });

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

  getCertificateByAccessCode() {
    if (this.accessFormGroup.invalid) {
      for (const control in this.accessFormGroup.controls) {
        this.accessFormGroup.controls[control].markAsDirty();
      }
      return;
    }
    this.loading.certificatesByAccessCode = true;
    const formValue = this.accessFormGroup.value;
    this.http.get(
      `${this.settings.url}/certificates/v1/certificate/ACCESS_CODE/${formValue.certificateNr}/${formValue.accessCode}`,
    ).subscribe(
      (res: any) => {
        this.router.navigate([`/tunnistused/lõpudokumendid/${res.index.id}/${formValue.certificateNr}/${formValue.accessCode}`]);
        this.loading.certificatesByAccessCode = false;
      },
      (err) => {
        console.log('HERE')
        this.alertsService.error('certificates.no_certificate_or_access', 'certificatesByAccessCode','' , true)
        this.loading.certificatesByAccessCode = false;
      });
  }

  logIn(redirectUrl) {
    const loginButton: HTMLElement = document.querySelector('#headerLogin');
    sessionStorage.setItem('redirectUrl', redirectUrl);
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
