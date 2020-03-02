import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '@app/_services';
import { switchMap, catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@app/_modules/translate/translate.service';

@Component({
  templateUrl: 'finalDocumentDashboardDetailView.template.html',
  styleUrls: ['./finalDocumentDashboardDetailView.styles.scss'],
})

export class FinalDocumentDashboardDetailViewComponent implements OnInit {
  constructor (
    private location: Location,
    private route: ActivatedRoute,
    private http: HttpClient,
    private settings: SettingsService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
  ) {}
  public documents = [];

  public sidebar = {
    entity: {
      finalDocumentAccess: {
        issuerInstitution: '',
      },
      finalDocumentDownload: true,
      finalDocumentHistory: {
        issuerInstitution: '',
      },
    },
  };

  public path = [
    {
      title: 'Avaleht',
      link: '/',
    },
    {
      title: 'Töölaud: Tunnistused',
      link: '/töölaud/tunnistused',
    },
  ];


  public loading = true;
  @ViewChildren('certificate') public certificate:QueryList<any>;

  tabChanged(tab) {
    if (!this.loading && tab === this.translate.get('certificates.graduation_certificate')) {
      this.certificate.first.calculateCertificateSize();
    }
  }
  getData() {
    const id = this.route.snapshot.params.id;
    this.http
      .get(`${this.settings.url}/certificates/v1/certificate/${id}`).subscribe((val: any) => {
        this.path = [...this.path, { title: val.index.typeName, link: '' }];
        this.getLatestDocuments(val.index.documents);
      });
  }

  getLatestDocuments(documentsArray) {
    const documents: any = {};

    const certificates = documentsArray.filter((doc) => {
      return doc.type === 'GRADUATION_DOCUMENT_TYPE:BASIC_EDUCATION_CERTIFICATE' ||
        doc.type === 'GRADUATION_DOCUMENT_TYPE:GENERAL_EDUCATION_CERTIFICATE';
    });

    const transcriptsOfgrades = documentsArray.filter((doc) => {
      return doc.type === 'GRADUATION_DOCUMENT_TYPE:BASIC_EDUCATION_TRANSCRIPT_OF_GRADES' ||
        doc.type === 'GRADUATION_DOCUMENT_TYPE:GENERAL_EDUCATION_TRANSCRIPT_OF_GRADES';
    });

    if (certificates.length > 0) {
      documents['certificate'] = certificates.reduce((next, current) => {
        return next.revision > current.revision ? next : current;
      });
    }

    if (transcriptsOfgrades.length > 0) {
      documents['gradesheet'] = transcriptsOfgrades.reduce((next, current) => {
        return next.revision > current.revision ? next : current;
      });
    }

    const URL =
      `${this.settings.url}/certificates/v1/certificateDocument/{DOCUMENT_ID}`;

    const req = [
      this.http.get(URL.replace('{DOCUMENT_ID}', documents.certificate.id)).pipe(
        catchError(() => of(null)),
      ),
    ];

    if (documents['gradesheet']) {
      req.push(
        this.http.get(URL.replace('{DOCUMENT_ID}', documents.gradesheet.id)).pipe(
          catchError(() => of(null)),
        ),
      );
    }

    forkJoin(req).subscribe((docs) => {
      this.documents['certificate'] = docs[0].document;
      this.documents['certificate'].content = JSON.parse(this.documents['certificate'].content);
      if (docs[1]) {
        this.documents['gradesheet'] = docs[1].document;
        this.documents['gradesheet'].content = JSON.parse(this.documents['gradesheet'].content);
      }
      this.sidebar.entity.finalDocumentHistory.issuerInstitution
        = this.documents['certificate'].content.educationalInstitution.name;
      this.sidebar.entity.finalDocumentAccess.issuerInstitution
        = this.documents['certificate'].content.educationalInstitution.name;
      this.loading = false;
    });
  }

  ngOnInit() {
    this.getData();
  }
}
