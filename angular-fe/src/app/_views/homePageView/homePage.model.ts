
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
