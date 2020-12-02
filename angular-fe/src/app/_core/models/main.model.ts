export interface ComparisonPage {
  count: number;
}

export interface Entity {
  entity: {
    entityId?: string;
    entityLabel?: string;
    entityUrl?: EntityUrl;
    nid?: number;
  };
}

export interface EntityUrl {
  path: string;
  routed?: boolean;
}

export interface EntityLink {
  title?: string;
  url: EntityUrl;
}
