import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SettingsService } from '@app/_services/SettingsService';
@Component({
  selector: 'certificates',
  templateUrl: './certificates.template.html',
  styleUrls: ['./certificates.styles.scss'],
})

export class CertificatesComponent implements OnInit {
  @Input() jwt;

  public loading = {};
  public error: boolean = false;
  public professionalCertificates: any;
  public graduationCertificates: any;
  public examResults: any;
  public examResultsErr: string;
  public certificateErr: any;
  public errData: boolean;
  public errRequest: boolean;
  public headers: HttpHeaders;
  public loaded = {
    'graduation-certificates': false,
    'professional-certificates': false,
    'state-exams': false,
  };

  public accordionSection: {}[] = [
    { _id: 'professional-certificates', label: 'frontpage.dashboard_tabs_certificates_professional' },
    { _id: 'state-exams', label: 'frontpage.dashboard_tabs_certificates_examinations' },
  ];

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    public http: HttpClient,
    public settings: SettingsService,
  ) { }

  dataController(id: string) {
    switch (id) {
      case 'graduation-certificates':
        this.getGraduationCertificates(id);
        break;
      case 'professional-certificates':
        this.getProfessionalCertificates(id);
        break;
      case 'state-exams':
        this.getExamResults(id);
        break;
    }
  }

  compareCertificates(a, b) {
    return a.issued < b.issued || a.issued == null ? 1 : -1;
  }

  getGraduationCertificates(id) {

    this.loading[id] = true;

    if (!this.loaded[id]) {
      this.http.get(`${this.settings.ehisUrl}/certificates/v1/certificates`).subscribe(
        (res: any[]) => {
          this.loading[id] = false;
          this.graduationCertificates = res.sort(this.compareCertificates);
          console.log(this.graduationCertificates);
        },
        (err) => {
          this.graduationCertificates = [];
          this.loading[id] = false;
        });
      this.loaded[id] = true;
    }
  }

  getProfessionalCertificates(id) {

    this.loading[id] = true;

    if (!this.loaded[id]) {
      const sub = this.http.get(this.settings.url + '/dashboard/certificates/getProfessionalCertificate?_format=json').subscribe(response => {
        this.loading[id] = false;

        if (response['error']) {
          this.certificateErr = (response['error'] && response['error']['message_text'] && response['error']['message_text']['et']) ? response['error']['message_text']['et'] : false;
          this.error = true;
        } else {
          this.professionalCertificates = response['value']['kutsetunnistused'];

          if (this.professionalCertificates.length) {
            this.professionalCertificates.forEach(certificate => {
              certificate.path = decodeURI(this.router.url + '/' + certificate.registrinumber);
            });
            const regex = /(\d{2}).(\d{2}).(\d{4})/;
            this.professionalCertificates = this.professionalCertificates.sort(function (a, b) {
              return Number(new Date(b.valjaantud.replace(regex, '$2/$1/$3'))) - Number(new Date(a.valjaantud.replace(regex, '$2/$1/$3')));
            });
            this.professionalCertificates.forEach((certificate) => {
              certificate.valjaantud = certificate.valjaantud.split('-').reverse().join('.');
            });
          }

          sub.unsubscribe();
        }
      }, (err) => {
        this.loading[id] = false;
      });
      this.loaded[id] = true;
    }
  }

  getExamResults(id) {

    this.loading[id] = true;

    if (!this.loaded[id]) {
      const sub = this.http.get(this.settings.url + '/dashboard/certificates/getTestSessions?_format=json').subscribe(response => {
        if ((response['value'] && response['value']['teade']) || (response['error'] && response['error']['message_text'] && response['error']['message_text']['et']) || response['value']['testsessioonid_kod_jada'] === []) {
          const message = (response['error'] && response['error']['message_text']) ? response['error']['message_text']['et'] : response['value']['teade'];
          this.examResultsErr = message;
        } else {
          this.examResults = response['value']['testsessioonid_kod_jada'].sort((a, b) => b.oppeaasta - a.oppeaasta);
        }
        this.loading[id] = false;
        sub.unsubscribe();
      }, (err) => {
        this.errRequest = true;
        this.loading[id] = false;
      });
      this.loaded[id] = true;
    }
  }

  getId() {
    let initializeId = '';
    switch (this.route.snapshot.fragment) {
      case 'lõputunnistused':
        initializeId = 'graduation-certificates';
        break;
      case 'kutsetunnistused':
        initializeId = 'professional-certificates';
        break;
      case 'riigieksamid':
        initializeId = 'state-exams';
        break;
    }
    return initializeId;
  }

  ngOnInit() {
    if (this.route.snapshot.fragment) {
      const initializeId = this.getId();
      this.dataController(initializeId);
    }
  }
}
