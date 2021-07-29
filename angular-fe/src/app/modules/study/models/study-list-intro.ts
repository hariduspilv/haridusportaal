export interface StudyListIntroContent {
  entity: {
    fieldBody: {
      value: string;
    };
    fieldIntroTitle: string;
  };
}

export interface StudyListIntro {
  data: {
    route: {
      entity: {
        fieldPageIntroduction: StudyListIntroContent;
        nid: number;
        title: string;
      };
    };
  };
}
