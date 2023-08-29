/* eslint-disable @typescript-eslint/naming-convention */
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { AlertsService, SettingsService } from '@app/_services';
import { Location } from '@angular/common';
import { CertificateFileDownloadSidebar } from '../../models/interfaces/certificate-file-download-sidebar';
import { ExamDocumentResponse, ExamDocumentValue } from '../../models/interfaces/exam-document';
import { environment } from '@env/environment';

@Component({
	selector: 'certificates-dashboard-detail',
	templateUrl: './certificates-dashboard-detail.component.html',
	styleUrls: ['./certificates-dashboard-detail.component.scss'],
})
export class CertificatesDashboardDetailComponent implements OnInit {

	public certificate: any;
	public examResults: ExamDocumentValue;
	public dashboardLink = '/töölaud/tunnistused';
	public examinationYear: string;
	public labels: any = [];
	public sidebar: CertificateFileDownloadSidebar | null = null;
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
	// Use this to get rid of loader if query errors
	public errors = this.alertsService?.getAlertsFromBlock('certificates');
	constructor(
		public router: Router,
		public route: ActivatedRoute,
		public location: Location,
		public translate: TranslateService,
		public settings: SettingsService,
		public http: HttpClient,
		private alertsService: AlertsService
	) {}

	createAccordionTitle(item: { test_nimi: string; tulemus: string }): string {
		const str = `${item.test_nimi}`;
		if (item.tulemus) { return `${str} | ${item.tulemus}`; }
		return str;
	}

	ngOnInit(): void {
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

	certificateInit(): void {
		this.certificate = window.history.state.certificate;
		if (this.certificate.kehtetu) {
			this.labels = [...this.labels, { value: 'Kehtetu' }];
		}
		if (this.certificate.duplikaat) {
			this.labels = [...this.labels, { value: 'Duplikaat' }];
		}
	}

	examInit(): void {
		this.http.get<ExamDocumentResponse>(`${this.settings.url}/state-exams/${this.route.snapshot.params.id}?_format=json`)
			.subscribe((examResults) => {
				if (examResults?.error) {
					this.alertsService?.error(examResults?.error?.message_text?.et, 'certificates');
					return;
				}
				if (examResults?.value?.tunnistus_id) {
					this.createSidebar(examResults);
				}
				this.examResults = {
					...examResults.value,
					testid_kod_jada: examResults.value.testid_kod_jada.map((test) => ({
						...test,
						accordion: this.createAccordionTitle(test),
					})),
				};
			});
	}

	parseTypeTranslation(type: string): string {
		const translation = this.translate.get(`frontpage.${type}`).toString();
		if (translation.includes(`frontpage.${type}`)) {
			return type;
		}
		return translation;
	}

	private createSidebar(examResults: ExamDocumentResponse): void {
		// Add language certificate number to file name if it exists
		const langCertNr = examResults?.lang_cert_nr ? `-${examResults?.lang_cert_nr}` : '';
		this.sidebar = {
			entity: {
				downloadFile: {
					url: `${environment.API_URL}/certificate-download/${examResults?.value?.tunnistus_id}`,
					filename: `tasemeeksam-${this.examinationYear}${langCertNr}.asice`,
				},
			},
		};
	}
}
