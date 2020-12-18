import { ClassifierAttributeDefinition } from './ClassifierAttributeDefinition';
import { ClassifierLinkDefinition } from './ClassifierLinkDefinition';
import { ClassifierDefinition } from './ClassifierDefinition';

export interface ClassifierDefinitionDetail extends
  ClassifierDefinition {
  classifierAttributeDefinitions:ClassifierAttributeDefinition[];
  classifierLinkDefinitionsByCode1:ClassifierLinkDefinition[];
  classifierLinkDefinitionsByCode2:ClassifierLinkDefinition[];
}
