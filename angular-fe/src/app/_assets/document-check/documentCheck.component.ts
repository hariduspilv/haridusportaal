import { Component, ViewChildren, QueryList, ViewChild } from "@angular/core";
import {
	FormBuilder,
	FormGroup,
	Validators,
	AbstractControl
} from "@angular/forms";
import { AlertsService, SettingsService, AuthService } from "@app/_services";
import { TranslateService } from "@app/_modules/translate/translate.service";
import { HttpClient } from "@angular/common/http";
import { Location } from "@angular/common";
import { take } from "rxjs/operators";

@Component({
	templateUrl: "./documentCheck.template.html",
	styleUrls: ["documentCheck.styles.scss"],
	selector: "document-check"
})
export class DocumentCheckComponent {
	public resultSetIds = {
		id_code: null,
		certificate_id: null
	};

	public model: FormGroup = this.formBuilder.group({
		captcha: ["", Validators.required],
		id_code: ["", [Validators.required, this.validateIdCodeOrBirthday]],
		document_id: ["", Validators.required]
	});

	public dataFetched = false;
	public loading = false;
	public documentData: any = {};
	public tableOverflown = false;

	public initialized = false;
	public loginStatus = false;

	public path = this.location.path();
	@ViewChild("scrollTarget", { static: false }) public scrollTarget;
	constructor(
		private formBuilder: FormBuilder,
		private alertsService: AlertsService,
		private translate: TranslateService,
		private settings: SettingsService,
		private http: HttpClient,
		private location: Location,
		public auth: AuthService
	) {}

	subscribeToAuth() {
		this.auth.isAuthenticated.pipe(take(1)).subscribe(val => {
			this.loginStatus = val;
		});
	}

	validateIdCodeOrBirthday(control: AbstractControl) {
		if (
			!control.value.match(
				/([1-6][0-9]{2}[0,1][0-9][0,1,2,3][0-9][0-9]{4})|(([0-9]{2}\.)([0-9]{2}\.)[0-9]{4})/g
			)
		) {
			return { errors: false };
		}
		return null;
	}
	submit() {
		this.alertsService.clear("documentCheck");
		if (this.model.controls.captcha.invalid && !this.loginStatus) {
			this.alertsService.error(
				this.translate.get("errors.captcha"),
				"documentCheck",
				false
			);
			window.setTimeout(() => {
				this.scrollTarget.nativeElement.scrollIntoView({ behavior: "smooth" });
			}, 1000);
			return;
		}
		if (!this.model.controls.document_id.value) {
			this.alertsService.error(
				this.translate.get("documentCheck.doc_nr_missing"),
				"documentCheck",
				false
			);
			window.setTimeout(() => {
				this.scrollTarget.nativeElement.scrollIntoView({ behavior: "smooth" });
			}, 1000);
			return;
		}
		if (this.model.controls.id_code.invalid) {
			this.alertsService.error(
				this.translate.get("documentCheck.idcode_or_bday_missing"),
				"documentCheck",
				false
			);
			window.setTimeout(() => {
				this.scrollTarget.nativeElement.scrollIntoView({ behavior: "smooth" });
			}, 1000);
			return;
		}
		this.loading = true;
		this.model.controls.document_id.setValue(
			this.model.controls.document_id.value.replace(/\s|\//g, "")
		);
		const elasticQuery = {
			size: 10000,
			query: {
				bool: {
					must: [
						{
							match: {
								NR_QUERY: this.model.controls.document_id.value
							}
						}
					]
				}
			}
		};
		this.http
			.post(`${this.settings.url}/es-public/tunnistused/_search`, elasticQuery)
			.subscribe(
				(response: any) => {
					if (response.hits.total.value === 0) {
						this.alertsService.warning(
							this.translate.get("documentCheck.no_results"),
							"documentCheck",
							false
						);
						this.loading = false;
						window.setTimeout(() => {
							this.scrollTarget.nativeElement.scrollIntoView({
								behavior: "smooth"
							});
						}, 1000);
						return;
					}
					let document = response.hits.hits.find(
						el =>
							el._source.SAAJA_ISIKUKOOD ===
							`${this.model.controls.id_code.value}`
					);
					if (!document) {
						document = response.hits.hits.find(
							el =>
								el._source.SYNNI_KP === `${this.model.controls.id_code.value}`
						);
					}
					if (!document) {
						this.alertsService.warning(
							this.translate.get("documentCheck.exists_but_not_for_user"),
							"documentCheck",
							false
						);
						this.loading = false;
						window.setTimeout(() => {
							this.scrollTarget.nativeElement.scrollIntoView({
								behavior: "smooth"
							});
						}, 1000);
						return;
					}
					if (document._source.DOKUMENDI_STAATUS === "0") {
						this.alertsService.error(
							this.translate.get("documentCheck.invalid_document"),
							"documentCheck",
							false
						);
						this.loading = false;
						window.setTimeout(() => {
							this.scrollTarget.nativeElement.scrollIntoView({
								behavior: "smooth"
							});
						}, 1000);
						return;
					}
					if (
						document._source.LIIK_NIMETUS &&
						document._source.DOKUMENDI_STAATUS === "1"
					) {
						const string = this.translate
							.get("documentCheck.found_result")
							.replace("%LIIK%", response.hits.hits[0]._source.LIIK_NIMETUS)
							.replace(
								"%VASTAVUS%",
								response.hits.hits[0]._source.VASTAVUS_NIMETUS
							);
						this.alertsService.success(string, "documentCheck", false);
					}
					window.setTimeout(() => {
						this.scrollTarget.nativeElement.scrollIntoView({
							behavior: "smooth"
						});
					}, 1000);
					this.loading = false;
				},
				error => {
					this.alertsService.error(
						this.translate.get("errors.request"),
						"documentCheck",
						false
					);
					this.loading = false;
					window.setTimeout(() => {
						this.scrollTarget.nativeElement.scrollIntoView({
							behavior: "smooth"
						});
					}, 1000);
				}
			);
	}
	ngOnInit() {
		this.alertsService.clear("general");
		this.subscribeToAuth();
	}
}
