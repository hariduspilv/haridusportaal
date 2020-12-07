import { ComparisonPage, Entity, EntityLink, EntityObject, EntityUrl } from '@app/_core/models/main.model';

export interface OskaMainProfessionsList {
  data: {
    nodeQuery: {
      count: number;
      entities: OskaMainProfession[];
    };
    comparisonPage?: ComparisonPage;
  };
}

export interface OskaMainProfession {
  nid: number;
  title: string;
  fieldProfession: boolean;
  fieldFurtherInfo: string;
  fieldFixedLabel: EntityObject;
  entityUrl: EntityUrl;
  fieldSidebar: OskaMainProfessionSidebar;
  reverseOskaMainProfessionOskaFillingBarEntity: {
    entities: Record<string, string>[];
  };
  reverseOskaMainProfessionOskaIndicatorEntity: {
    entities: OskaIndicator[];
  };
  fieldBruto: number;
  fieldEducationIndicator: number;
  fieldNumberOfEmployees: number;
  fieldChangeInEmployment: number;
  fieldFillingBar: number;
}

export interface OskaMainProfessionFilter {
  data: {
    oskaFields: {
      entities: Entity[];
    }
    oskaIndicators: {
      entities: OskaIndicator[],
    },
    oskaFixedLabels: {
      entities: Entity[];
    },
  };
}

export interface OskaMainProfessionFilterFields {
  value: string,
  key: string,
}

export interface OskaMainProfessionListParameters {
  titleValue: string;
  titleEnabled: boolean;
  oskaFieldValue: string[];
  oskaFieldEnabled: boolean;
  fixedLabelValue: string[];
  fixedLabelEnabled: boolean;
  fillingBarValues: string[];
  fillingBarFilterEnabled: boolean;
  sortField: string;
  sortDirection: string;
  indicatorSort: boolean;
  nidEnabled: boolean;
  limit: number;
  offset: number;
  lang: string;
}

export interface OskaMainProfessionSidebar {
  entity: {
    fieldPros: string[];
    fieldNeutral: string[];
    fieldCons: string[];
    fieldContact: {
      entity: {
        fieldEmail?: string;
        fieldOrganization?: string;
        fieldPerson?: string;
        fieldPhone?: string;
      };
    };
    fieldIscedfSearchLink: {
      entity: {
        iscedf_detailed: EntityObject[];
        iscedf_broad: EntityObject[];
        iscedf_narrow: EntityObject[];
        level: EntityObject[];
      };
    };
    fieldJobOpportunities: EntityLink[];
    fieldJobs: EntityFieldJob[];
    fieldOskaField: EntityObject[];
    fieldQualificationStandard: EntityLink[];
    fieldQuickFind: EntityLink[];
  };
}

interface EntityFieldJob {
  entity: {
    fieldJobName: string,
    fieldJobLink: EntityLink;
  };
}

export interface OskaIndicator {
  oskaId?: number;
  oskaIndicator?: string;
  value?: string;
  icon?: number;
}
