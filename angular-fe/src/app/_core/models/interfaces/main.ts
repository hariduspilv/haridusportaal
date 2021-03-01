export interface ComparisonPage {
  count: number;
}

export interface Entity {
  entityId?: string;
  entityLabel?: string;
  entityUrl?: EntityUrl;
  nid?: number;
  title?: string;
}

export interface EntityObject {
  entity: Entity;
}

export interface EntityUrl {
  path: string;
  routed?: boolean;
}

export interface EntityLink {
  title?: string;
  url: EntityUrl;
}
