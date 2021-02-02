import { ExternalQualifications, PersonalDetails, Studies, StudiesError } from "@app/_assets/studies/studies.model";

export interface DSVValue {
  isikuandmed?: PersonalDetails;
  valineKvalifikatsioon?: ExternalQualifications[];
  enne2004Kvalifikatsioon?: ExternalQualifications[];
  oping?: (Studies | ExternalQualifications)[];
  kvalifikatsioon?: any[];
  kvalifikatsioonid?: any[];
  tasemeharidus?: any[];
}

export interface DSVResponse {
  error?: StudiesError;
  value?: DSVValue;
}