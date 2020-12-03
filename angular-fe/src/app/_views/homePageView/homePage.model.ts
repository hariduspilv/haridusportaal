
export interface IURL {
  title?: string;
  path: string;
  routed?: boolean;
}

export interface ILink {
  title: string;
  url: IURL;
}

export interface ITopic {
  title: string;
  link: ILink;
  content?: string;
  position?: string;
}

export interface ISimpleArticle {
  title: string;
  path: string;
}

export interface ILogo {
  src: string;
  label: string;
}

export interface IContact {
  name?: string;
  email?: string;
  company?: string;
  skype?: string;
  phone?: string;
}

export interface IFooterData {
  name?: string;
  email?: string;
  company?: string;
  skype?: string;
  phone?: string;
  links?: IURL[];
  logos?: ILogo[];
  contacts?: IContact[];
}

export interface IImage {
  alt?: string;
  url: string;
}

export interface IService {
  title: string;
  link: ILink;
  image: IImage;
  content: string;
}

export interface ITopicArticleUnion {
  articles: ITopic[];
  topics: ITopic[];
}

export interface ISlogan {
  title: string;
  person: string;
  company: string;
}

export interface IStudyData {
  title: string;
  image: string;
  url: IURL;
}

export interface IStudy {
  title: string;
  intro: string;
  data: IStudyData[];
}

export interface IEvent {
  title: string;
  author: string;
  created: string | number;
  content: string;
  location?: string;
  link: ILink;
}

export interface ICareerSlide {
  slug: string;
  title: string;
  path: string;
}

export interface IGraphContacts {
  entity: {
    fieldInstitution?: string;
    fieldNameOccupation?: string;
    fieldEmail?: string;
    fieldSkype?: string;
  };
}

export interface IGraphExternalLinks {
  entity: {
    fieldLinkName: string;
    fieldWebpageLink: {
      url: {
        path: string;
      },
    }
  };
}

export interface IGraphURLEntity {
  entity: {
    entityUrl: IURL;
  };
}

export interface IGraphLearningToTeach {
  entity: {
    fieldLearningToTeachTitle: string;
    fieldLearningToTeachSitelink: IGraphURLEntity;
  };
}

export interface IGraphTopic {
  entity: {
    fieldTitle: string;
    fieldText: string;
    fieldInternalLink: IGraphURLEntity;
    fieldTopicLink: IGraphURLEntity;
    fieldTopicTitle?: string;
    fieldThemeTitle?: string;
    fieldTopicText?: string;
    fieldTopicButtonText?: string;
  };
}

export interface IGraphServiceImage {
  entity: {
    fieldServiceImg?: {
      entity: {
        url: string;
      };
    };
    fieldAlt?: string;
    url?: string;
  };
}

export interface IGraphService {
  image?: IGraphServiceImage;
  title?: string;
  linkTitle?: string;
  link?: IGraphURLEntity | ILink;
  content?: string;
}

export interface IGraphResponse {
  name?: string;
  phone?: string;
  email?: string;
  contact?: IGraphContacts[];
  externalLinks?: IGraphExternalLinks[];
  quoteText?: string;
  quoteAuthor?: string;
  quoteAuthorWork?: string;
  fieldLearningToTeach?: IGraphLearningToTeach[];
  news?: IGraphURLEntity;
  topics?: IGraphTopic | IGraphTopic[];
  services?: IGraphService[];
  fieldCareer?: IGraphURLEntity;
}

export interface IGraphNews {
  entityLabel: string;
  fieldOrganizer: string;
  fieldEventMainDate: {
    unix: number;
  };
  fieldDescriptionSummary: string;
  fieldEventLocation: string | {
    name: string;
  };
  entityUrl: IURL;
}

export interface IGraph {
  data: {
    nodeQuery: {
      entities: any[];
    };
  };
}
