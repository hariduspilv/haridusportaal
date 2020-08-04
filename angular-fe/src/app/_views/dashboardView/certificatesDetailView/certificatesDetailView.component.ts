import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { map } from 'rxjs/operators';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { SettingsService } from '@app/_services';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'certificates-detail',
  templateUrl: 'certificatesDetailView.template.html',
  styleUrls: ['certificatesDetailView.styles.scss'],
})
export class CertificatesDetailView implements OnInit {

  public certificate: any;
  public examResults: any;
  public dashboardLink: string = '/töölaud/tunnistused';
  public examinationYear: string;
  public labels: any = [];
  public breadcrumbs = [
    {
      title: 'Avaleht',
      link: '/',
    },
    {
      title: 'Minu töölaud',
      link: '/töölaud/taotlused',
    },
    {
      title: 'Tunnistused',
      link: '/töölaud/tunnistused',
    },
    {
      title: '',
    },
  ];
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public location: Location,
    public translate: TranslateService,
    public settings: SettingsService,
    public http: HttpClient,
  ) {}

  createAccordionTitle(item) {
    const string = `${item.test_nimi}`;
    if (item.tulemus) { return `${string} | ${item.tulemus}`; }
    return string;
  }
  ngOnInit() {
    const currentRoute = decodeURI(this.location.path()).split('/')[3];
    this.breadcrumbs[this.breadcrumbs.length - 1].title
      = currentRoute[0].toUpperCase() + currentRoute.slice(1);
    if (window.history.state.certificate) {
      this.certificateInit();
      return;
    }
    if (window.history.state.exams) {
      this.examinationYear = window.history.state.exams;
      this.examInit();
      return;
    }
    this.router.navigateByUrl('/töölaud');
  }

  certificateInit() {
    this.certificate = window.history.state.certificate;
    if (this.certificate.kehtetu) {
      this.labels = [...this.labels, { value: 'Kehtetu' }];
    }
    if (this.certificate.duplikaat) {
      this.labels = [...this.labels, { value: 'Duplikaat' }];
    }
  }

  examInit() {
    this.http
      .get(`${this.settings.url}/state-exams/${this.route.snapshot.params.id}?_format=json`)
        .subscribe((res) => {
          this.examResults = res['value'];
        });
  }

  parseTypeTranslation(type) {
    const translation = this.translate.get(`frontpage.${type}`).toString();
    if (translation.includes(`frontpage.${type}`)) {
      return type;
    }
    return translation;
  }

}
