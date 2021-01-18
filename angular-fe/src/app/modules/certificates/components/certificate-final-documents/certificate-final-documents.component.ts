import { Component } from '@angular/core';
import { AlertsService, AuthService, SettingsService } from '@app/_services';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CertificatesApi } from '../../certificates.api.service';
import { AccessType } from '../../models/enums/access-type.enum';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CertificateSearchCertificateStatus, CertificateStatus } from '../../models/interfaces/certificate-document';
import { link } from 'fs';

@Component({
  selector: 'certificate-final-documents',
  templateUrl: './certificate-final-documents.component.html',
  styleUrls: ['./certificate-final-documents.component.scss'],
})
export class CertificateFinalDocumentsComponent {

  constructor(
    private authService: AuthService,
    public http: HttpClient,
    public settings: SettingsService,
    public fb: FormBuilder,
    private router: Router,
    private alertsService: AlertsService,
    private certificatesApi: CertificatesApi,
    private translateService: TranslateService,
    private liveAnnouncer: LiveAnnouncer
  ) {}

  public isLoggedIn = false;
  public certificatesById: any;
  public certificatesByDisclosure: any;
  private destroy$: Subject<boolean> = new Subject<boolean>();

  public loading = {
    certificatesById: true,
    certificatesByAccessCode: false,
    certificatesByDisclosure: false,
  };

  public accessFormGroup = this.fb.group(
    {
      certificateNr: ['', Validators.required],
      accessCode: ['', Validators.required],
    },
    {
      updateOn: 'submit',
    });

  public disclosureFormGroup = this.fb.group({
    firstName: [''],
    lastName: [''],
    idCode: ['']
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
    this.certificatesApi.fetchCertificateWithAccess(AccessType.ID_CODE).subscribe(
      (res: { certificates: [], responseInfo: {} }) => {
        this.certificatesById = res.certificates.sort(this.compareCertificates);
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
      `${this.settings.ehisUrl}/certificates/v1/certificate/ACCESS_CODE/${formValue.certificateNr}/${formValue.accessCode}`,
    ).subscribe(
      (res: any) => {
        this.router.navigate([`/tunnistused/lõpudokumendid/${formValue.certificateNr}/${formValue.accessCode}`]);
        this.loading.certificatesByAccessCode = false;
      },
      (err) => {
        this.alertsService.error(
          'certificates.no_certificate_or_access',
          'certificatesByAccessCode',
          '' ,
          true,
        );
        this.loading.certificatesByAccessCode = false;
      });
  }

  focusFirstDisclosure() {
    const tbl: HTMLElement = document.querySelector('#certificatesByDisclosureTable');
    if (!tbl) {
      return;
    }

    const links = tbl.querySelectorAll('a');
    if (links.length) {
      links[0].focus();
    }
  }

  getCertificateByDisclosure() {
    this.alertsService.clear('certificatesByDisclosure');
    const { idCode, firstName, lastName } = this.disclosureFormGroup.value;
    this.disclosureFormGroupValidator();
    if (this.disclosureFormGroup.invalid) {
      for (const control in this.disclosureFormGroup.controls) {
        this.disclosureFormGroup.controls[control].updateValueAndValidity();
        this.disclosureFormGroup.controls[control].markAsDirty();
      }
      return;
    }
    let params = {};
    if(idCode) {
      params = { ownerIdCode: idCode };
    }
    if (firstName && lastName) {
      params = { ownerFirstName: firstName, ownerLastName: lastName };
    }
    this.loading.certificatesByDisclosure = true;
    this.http.get(`${this.settings.ehisUrl}/certificates/v1/certificates`, { params: { ...params, accessType: AccessType.DISCLOSURE }}).subscribe((res: any) => {
      this.certificatesByDisclosure = this.cleanDisclosureCertificatesResponse(res);
      this.liveAnnouncer.announce(this.translateService.get('liveAnnouncer.found_x_results').replace('%amount%', this.certificatesByDisclosure.length))
      this.loading.certificatesByDisclosure = false;
      setTimeout(x => this.focusFirstDisclosure(), 100);
    }, (err) => {
      this.loading.certificatesByDisclosure = false;
      this.certificatesByDisclosure = [];
      this.alertsService.error(this.translateService.get('errors.no_disclosed_certificates_found'), 'certificatesByDisclosure');
    })
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

  private disclosureFormGroupValidator() {
    const { firstName, lastName } = this.disclosureFormGroup.value;
    if(firstName || lastName) {
      this.disclosureFormGroup.controls.firstName.setValidators(Validators.required);
      this.disclosureFormGroup.controls.lastName.setValidators(Validators.required);
      this.disclosureFormGroup.controls.idCode.setValidators(null);
    } else {
      this.disclosureFormGroup.controls.idCode.setValidators(Validators.required);
      this.disclosureFormGroup.controls.lastName.setValidators(null);
      this.disclosureFormGroup.controls.firstName.setValidators(null);
    }
    for (const control in this.disclosureFormGroup.controls) {
      this.disclosureFormGroup.controls[control].updateValueAndValidity();
      this.disclosureFormGroup.controls[control].markAsDirty();
    }
  }

  private cleanDisclosureCertificatesResponse(res) {
    return res.certificates
    .filter((certificate) => {
      return !(certificate.status === CertificateSearchCertificateStatus.INVALID);
    })
    .sort((a, b) => {
      if (new Date(a.issued) < new Date(b.issued)) { 
        return 1;
      }
      if (new Date(a.issued) > new Date(b.issued)) { 
        return -1;
      }
      return 0;
    });
  }
}
