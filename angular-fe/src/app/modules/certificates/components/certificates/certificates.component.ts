import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { slugifyTitle } from '@app/_core/utility';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { LanguageCodes, SettingsService } from '@app/_services';
import { CertificatesUtility } from '../../certificates.utility';
import { CertificateAccordionSection } from '../../models/interfaces/certificate-accordion-section';

@Component({
  selector: 'certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.scss'],
})
export class CertificatesComponent implements OnInit {

  @Input() jwt;

  public error: boolean = false;
  public professionalCertificates: any;
  public graduationCertificates: any;
  public examResults: any;
  public examResultsErr: string;
  public certificateErr: any;
  public errData: boolean;
  public errRequest: boolean;
  public headers: HttpHeaders;
  public accordionSections: CertificateAccordionSection[] = [
    {
      id: 'graduation-certificates',
      title: this.translate.get('frontpage.dashboard_tabs_certificates_graduation'),
      dataFunction: (section: CertificateAccordionSection) =>
        this.getGraduationCertificates(section),
      loaded: false,
      loading: false,
    },
    {
      id: 'professional-certificates',
      title: this.translate.get('frontpage.dashboard_tabs_certificates_professional'),
      dataFunction: (section: CertificateAccordionSection) =>
        this.getProfessionalCertificates(section),
      loaded: false,
      loading: false,
    },
    {
      id: 'state-exams',
      title: this.translate.get('frontpage.dashboard_tabs_certificates_examinations'),
      dataFunction: (section: CertificateAccordionSection) => this.getExamResults(section),
      loaded: false,
      loading: false,
    },
  ];

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    public http: HttpClient,
    public settings: SettingsService,
    private translate: TranslateService,
  ) { }

  dataController(id: string) {
    const selectedSection = this.accordionSections.find(section => section.id === id);
    selectedSection?.dataFunction(selectedSection);
  }

  compareCertificates(a, b) {
    return a.issued < b.issued || a.issued == null ? 1 : -1;
  }

  getGraduationCertificates(selectedSection: CertificateAccordionSection): void {

    selectedSection.loading = true;

    if (!selectedSection.loaded) {
      this.http.get(`${this.settings.ehisUrl}/certificates/v1/certificates`).subscribe({
        next: (res: any[]) => {
          selectedSection.loading = false;
          const resultObject = res['certificates'] ? res['certificates'] : res;
          this.graduationCertificates =
            CertificatesUtility.sortGraduationCertificates(resultObject);
        },
        error: (err) => {
          this.graduationCertificates = [];
          selectedSection.loading = false;
        }
      });
      selectedSection.loaded = true;
    }
  }

  getProfessionalCertificates(selectedSection: CertificateAccordionSection): void {

    selectedSection.loading = true;

    if (!selectedSection.loaded) {

      const sub = this.http.get(`${this.settings.url}/dashboard/certificates/getProfessionalCertificate?_format=json`).subscribe({
        next: (response) => {
          selectedSection.loading = false;

          if (response['error']) {
            this.certificateErr = (response['error'] &&
            response['error']['message_text'] &&
            response['error']['message_text']['et']) ?
            response['error']['message_text']['et'] : false;
            this.error = true;
          } else {
            this.professionalCertificates = response['value']['kutsetunnistused'];

            if (this.professionalCertificates.length) {
              this.professionalCertificates.forEach((certificate) => {
                certificate.path = decodeURI(`${this.router.url}/${certificate.registrinumber}`);
              });
              const regex = /(\d{2}).(\d{2}).(\d{4})/;
              this.professionalCertificates = this.professionalCertificates.sort((a, b) => {
                const x = Number(new Date(b.valjaantud.replace(regex, '$2/$1/$3')));
                const y = Number(new Date(a.valjaantud.replace(regex, '$2/$1/$3')));
                return x - y;
              });
              this.professionalCertificates.forEach((certificate) => {
                certificate.valjaantud = certificate.valjaantud.split('-').reverse().join('.');
              });
            }

            sub.unsubscribe();
          }
        },
        error: (err) => {
          selectedSection.loading = false;
        }
      });
      selectedSection.loaded = true;
    }
  }

  getExamResults(selectedSection: CertificateAccordionSection): void {
    selectedSection.loading = true;

    if (!selectedSection.loaded) {
      const sub = this.http.get(`${this.settings.url}/dashboard/certificates/getTestSessions?_format=json`)
      .subscribe({
        next: (response) => {
          if ((response['value'] && response['value']['teade'])
            || (response['error'] && response['error']['message_text'] && response['error']['message_text']['et'])
            || !response['value']['testsessioonid_kod_jada']?.length) {
            const message = (response['error'] && response['error']['message_text'])
              ? response['error']['message_text']['et']
              : response['value']['teade'];
            this.examResultsErr = message;
          } else {
            this.examResults = response['value']['testsessioonid_kod_jada']
              .sort((a, b) => b.oppeaasta - a.oppeaasta);
          }
          selectedSection.loading = false;
          sub.unsubscribe();
        },
        error: (err) => {
          this.errRequest = true;
          selectedSection.loading = false;
        }
      });
      selectedSection.loaded = true;
    }
  }

  getId(): string {
    return this.accordionSections.find((section) => {
      return slugifyTitle(section.title) === this.route.snapshot.fragment;
    })?.id;
  }

  ngOnInit() {
    if (this.route.snapshot.fragment) {
      const initializeId = this.getId();
      this.dataController(initializeId);
    }

		this.setLanguageSwitchLinks();
  }

	private setLanguageSwitchLinks() {
		this.settings.currentLanguageSwitchLinks = [
			{
				language: {
					id: LanguageCodes.ESTONIAN
				},
				url: {
					path: '/töölaud/tunnistused'
				}
			},
			{
				language: {
					id: LanguageCodes.ENGLISH
				},
				url: {
					path: '/en/dashboard/certificates'
				}
			},
			{
				language: {
					id: LanguageCodes.RUSSIAN
				},
				url: {
					path: '/ru/rabo4ij-stol/svidetelstva'
				}
			},
		];
	}
}
