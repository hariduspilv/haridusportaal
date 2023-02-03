import { Study } from "./study";

export interface LabelEntity {
  entityId: string;
  entityLabel: string;
}

export interface StudyListViewHighlightedResponse {
  status: number;
  values: {
    [x: string]: Study;
  }
}
