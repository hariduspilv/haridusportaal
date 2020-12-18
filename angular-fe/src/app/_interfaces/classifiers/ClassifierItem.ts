import { ClassifierItemText } from './ClassifierItemText';
/**
 * @DEPRECATED
 *   This makes no sense compared to the current ClassifierItem response
  and is not something that can be used in several places.
  Different requests serve a classifier item differently.
 * */
export interface ClassifierItem {
  editable: boolean;
  objectStatus?: string;
  classifierItemTexts?: ClassifierItemText[];
  // TODO: Change when BE woks
  classifierAttributeValues?: any[];
  defaultItem: boolean;

  code: string | number;
  name?: string;
  classifierDefinitionCode: string | number;
  classifierDefinitionName?: string;
  upperClassifierItemCode?: string | number;
  upperClassifierDefinitionCode?: string | number;
  seqNo?: number;
  validFrom?: string;
  validUntil?: string;
  EHIS1ID: string | number;
  children?: any[];
  indicatorMatrix?: string[];
  isOpen?: boolean;
}
