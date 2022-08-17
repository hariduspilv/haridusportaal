import { LanguageCodes } from "@app/_services";
import { YouthMonitoringSidebarType } from "./enums";

export interface YouthMonitoringVideo {
  input: string;
  videoDomain: string;
  videoDescription: string;
  videoId: string;
  videoThumbnail: string;
}

export interface YouthMonitoringPicture {
  url?: string;
  title?: string;
  alt?: string;
  derivative?: {
    url: string;
  }
}

export interface YouthMonitoringListItem {
  entityLabel: string;
  created: number;
  entityUrl: {
    path: string;
    languageSwitchLinks: {
      url: {
        path: string;
      }
    }[];
  },
  title: string;
  fieldIntroduction: string;
  fieldExtertnalLink: {
    entity: {
      fieldLinkName: string;
      fieldWebpageLink: {
          title: string;
          uri: string;
      }
    }
  }[];
  fieldFirstPictureOrVideo: 'picture' | 'video',
  fieldFirstPicture: YouthMonitoringPicture | null,
  fieldFirstVideo: YouthMonitoringVideo | null;
}

export interface YouthMonitoringLanguageSwitchLink {
  active: boolean;
  title: string;
  language: {
    id: LanguageCodes;
  },
  url: {
    path: string;
    routed: boolean;
    pathAlias: string;
    pathInternal: string;
  }
}

export interface WebpageLink {
  entity: {
    fieldLinkName?: string;
    fieldWebpageLink?: {
      title?: string;
      uri?: string;
    };
  };
  title?: string;
  url?: {
    path: string;
  }
}

export interface YouthMonitoringSidebar {
  entity: {
    fieldBlockType: YouthMonitoringSidebarType,
    fieldTitle: string;
    fieldBlockText: string;
    fieldLinkName: string;
    fieldWebPageLink: string;
  }
}

export interface YouthMonitoringAccordion {
  entity: {
    fieldTitle: string;
    fieldYouthBody?: {
      value: string;
    },
    fieldYouthLink: WebpageLink[];
    fieldYouthVideo: YouthMonitoringVideo | null,
    fieldYouthPicture: YouthMonitoringPicture | null,
    fieldYouthIntroduction?: {
      value: string;
    }
  }
}

export interface YouthMonitoringDetail {
  nid: number;
  title: string;
  fieldIntroduction: string;
  fieldContent: {
    value: string;
  },
  fieldGallery: YouthMonitoringPicture[],
  fieldExtertnalLink?: WebpageLink[];
  fieldEndPicture: YouthMonitoringPicture | null,
  fieldEndVideo: YouthMonitoringVideo | null,
  fieldBottomLink: WebpageLink[],
  fieldYouthAccordion: YouthMonitoringAccordion[],
  fieldEndText?: {
    value: string;
  },
  fieldRightColumnElements: YouthMonitoringSidebar[],
}

export interface YouthMonitoringMappedDetail extends YouthMonitoringDetail {
  images: YouthMonitoringPicture[];
}

export interface YouthMonitoringDetailDto {
  data: {
    route: {
      entity: YouthMonitoringDetail;
      languageSwitchLinks: YouthMonitoringLanguageSwitchLink[];
    }
  }
}

export interface YouthMonitoringListDto {
  data: {
    nodeQuery: {
      entities: YouthMonitoringListItem[];
    };
  };
}
