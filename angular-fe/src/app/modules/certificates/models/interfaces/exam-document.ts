/* eslint-disable @typescript-eslint/naming-convention */

export interface ExamDocumentValue {
	testid_kod_jada: {
		test_nimi: string;
		accordion?: string;
		staatus: string;
		tulemus: string;
		osad: {
			osa_nimi: string;
			osa_kuupaev: string;
			osa_koht: string;
			osa_aadress: string;
			staatus: string;
			tulemus: string;
		}[];
	}[];
	tunnistus_id: string;
}

export interface ExamDocumentResponse {
	value: ExamDocumentValue;
	lang_cert_nr?: string;
	error?: {
		message_text: {et: string};
		message_type: string;
	};
}
