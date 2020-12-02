import { ComparisonPage, Entity, EntityLink, EntityUrl } from '@app/_core/models/main.model';

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
  fieldFixedLabel: Entity;
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
        iscedf_detailed: Entity[];
        iscedf_broad: Entity[];
        iscedf_narrow: Entity[];
        level: Entity[];
      };
    };
    fieldJobOpportunities: EntityLink[];
    fieldJobs: EntityFieldJob[];
    fieldOskaField: Entity[];
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
  oskaId: number;
  oskaIndicator: string;
  value: string;
  icon: number;
}
