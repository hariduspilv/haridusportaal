import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { GraduationDocumentAttribute } from "@app/_enums/certificates/graduation-document-attribute.enum";
import { GraduationDocumentType } from "@app/_enums/certificates/graduation-document-type.enum";
import { ClassifierAttribute } from "@app/_interfaces/classifiers/ClassifierAttribute";
import {
	AccessScope,
	AccessType,
	CertificateAccess
} from "@app/_interfaces/certificates/certificate-access";
import { CertificateAccessDTO } from "@app/_interfaces/certificates/certificate-access-dto";
import { AuthService } from "@app/_services/AuthService";
// import { HttpService } from '@app/_services/HttpService';
import { BehaviorSubject, forkJoin, Observable, of } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import {
	ClassifierItemsQuery,
	ClassifierItemsQueryItem
} from "@app/_interfaces/classifiers/classifier-items-query";
import { ClassifierDefinitionCode } from "@app/_enums/classifier/classifier-definition-code.enum";
import { ClassifierAttributeDefinitionCode } from "@app/_enums/classifier/classifier-attribute-definition-code.enum";
import { CertificateAccessStatusClassifier } from "@app/_enums/certificates/certificate-access-status-classifier.enum";
import {
	Certificate,
	CertificateResponse
} from "@app/_interfaces/certificates/certificate";
import { FormattedCertificateDataResponse } from "@app/_interfaces/certificates/certificate-data";
import { CertificateActionResponse } from "@app/_interfaces/certificates/certificate-action-response";
import { CertificateDataIssueResponse } from "@app/_interfaces/certificates/certificate-data-issue-response";
import { CertificateTranscriptParams } from "@app/_interfaces/certificates/certificate-transcript-params";
import { CertificateDocumentResponse } from "@app/_interfaces/certificates/certificate-document-response";
import { SettingsService } from "../SettingsService";
import { ClassifiersService } from '../classifiers/classifiers.service';

@Injectable({
	providedIn: "root"
})
export class CertificatesService {
	constructor(
		// private http: HttpService,
		private httpClient: HttpClient,
		private auth: AuthService,
		private classifiers: ClassifiersService,
		private settings: SettingsService
	) {}

	private certificatesUrl = `${this.settings.ehisUrl}/certificates/v1`;

	addAccess(accessDTO) {
		return this.httpClient.post(
			`${this.settings.ehisUrl}/certificates/v1/certificateAccess`,
			accessDTO
		);
	}

	modifyAccess(accessDTO) {
		return this.httpClient.patch(
			`${this.settings.ehisUrl}/certificates/v1/certificateAccess`,
			accessDTO
		);
	}

	removeAccess(indexId, accessId) {
		return this.httpClient.delete(
			`${this.settings.ehisUrl}/certificates/v1/certificateAccess?indexId=${indexId}&accessId=${accessId}`
		);
	}

	downloadTranscript(
		id: number,
		params: CertificateTranscriptParams
	): Observable<Blob> {
		return this.httpClient.get(
			`${this.settings.ehisUrl}/certificates/v1/certificateTranscript/${id}`,
			{ params, responseType: "blob" }
		);
	}

	fetchCertificate(id: string): Observable<CertificateResponse> {
		const url = `${this.certificatesUrl}/certificate/${id}`;

		return this.httpClient
			.get<Certificate>(url)
			.pipe(catchError(() => of(null)));
	}

	fetchCertificateAccesses(
		indexId: string,
		status: CertificateAccessStatusClassifier
	): Observable<CertificateAccess[]> {
		const url = `${this.certificatesUrl}/certificateAccess`;

		return this.httpClient
			.get<CertificateAccess[]>(url, { params: { indexId, status } })
			.pipe(catchError(() => of(null)));
	}

	fetchCertificateActions(id): Observable<CertificateActionResponse> {
		const url = `${this.certificatesUrl}/certificateActions/${id}`;

		return this.httpClient
			.get<CertificateActionResponse>(url)
			.pipe(catchError(() => of(null)));
	}

	getData(id): Observable<FormattedCertificateDataResponse> {
		return forkJoin({
			certificate: this.fetchCertificate(id),
			certificateActions: this.fetchCertificateActions(id)
		});
	}

	fetchDocument(documentId: number): Observable<CertificateDocumentResponse> {
		const url = `${this.certificatesUrl}/certificateDocument/${documentId}`;

		return this.httpClient.get<CertificateDocumentResponse>(url);
	}

	reloadAccesses(id) {
		const observables = [
			this.httpClient.get(
				`${this.settings.ehisUrl}/certificates/v1/certificateAccess?indexId=${id}&status=ACCESS_STATUS:VALID`
			),
			this.httpClient.get(
				`${this.settings.ehisUrl}/certificates/v1/certificateAccess?indexId=${id}&status=ACCESS_STATUS:INVALID`
			)
		];
		return forkJoin(observables);
	}

	getShortName(): Observable<ClassifierItemsQuery> {
		return this.classifiers.fetchClassifierItemsByDefinitionCode(
			ClassifierDefinitionCode.GRADUATION_DOCUMENT_TYPE
		);
	}

	createAccessDTO({
		id,
		type,
		recipient,
		scope
	}: {
		id: number;
		type: AccessType;
		recipient: string;
		scope: AccessScope;
	}): CertificateAccessDTO {
		let additionalData = {};
		if (type === AccessType.ACCESS_CODE) {
			additionalData = {
				emailAddress: recipient,
				scope: AccessScope.WITH_ACCOMPANYING_DOCUMENTS
			};
		}
		if (type === AccessType.ID_CODE) {
			additionalData = {
				accessorCode: `EE${recipient}`,
				scope: AccessScope.WITH_ACCOMPANYING_DOCUMENTS
			};
		}
		return {
			indexId: id.toString(),
			access: {
				type,
				scope,
				...additionalData
			}
		};
	}

	getDocumentsWithAllowedDisclosure(): Observable<ClassifierItemsQuery> {
		return this.classifiers.fetchClassifierItemsByDefinitionCodeWithParameters(
			ClassifierDefinitionCode.GRADUATION_DOCUMENT_TYPE,
			{
				attributeDefinitionCode:
					ClassifierAttributeDefinitionCode.GRADUATION_DOCUMENT_TYPE_DISCLOSURE_ALLOWED
			}
		);
	}

	isDisclosureAllowed(
		document: GraduationDocumentType
	): BehaviorSubject<boolean> {
    console.log(document);
		const isAllowed = new BehaviorSubject<boolean>(false);
		this.getDocumentsWithAllowedDisclosure().subscribe(
			(res: ClassifierItemsQuery) => {
        const items: ClassifierItemsQueryItem[] = res.classifierItems;
        console.log(items);
				const item = items
					.filter((el: ClassifierItemsQueryItem) =>
						el.attributes.find(
							(attribute: ClassifierAttribute) =>
								attribute.code ===
									GraduationDocumentAttribute.DISCLOSURE_ALLOWED &&
								attribute.value === "1"
						)
					)
					.find((el: ClassifierItemsQueryItem) => el.code === document);
				if (item) {
					const attribute: ClassifierAttribute = item.attributes.find(
						(el: ClassifierAttribute) =>
							el.code === GraduationDocumentAttribute.DISCLOSURE_ALLOWED
					);
					isAllowed.next(!!parseInt(attribute.value, 10));
				}
			}
		);
		return isAllowed;
	}
}
