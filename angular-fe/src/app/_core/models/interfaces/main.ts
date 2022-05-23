import { LanguageCodes } from "@app/_services";

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

export interface FullTextUrl {
	url: EntityUrl;
}

export interface EntityUrl {
  path: string;
  routed?: boolean;
}

export interface EntityLink {
  title?: string;
  url: EntityUrl;
}

export interface QueryError {
  message: string;
  category: string;
  locations: ErrorLocation[];
  path?: string[];
}

export interface ErrorLocation {
  line: number;
  column: number;
}

export interface Content {
	value: string;
}

export interface ImageEntity {
	title: string;
	alt: string;
	derivative: ImageUrl;
}

export interface ImageUrl {
	url: string;
}

export interface LanguageSwitchLink {
	active: boolean;
	language: { id: LanguageCodes };
	title: string;
	url: LanguageSwitchLinkUrl;
}

export interface LanguageSwitchLinkUrl {
	path: string;
	pathAlias: string;
	pathInternal: string;
	routed: boolean;
}
