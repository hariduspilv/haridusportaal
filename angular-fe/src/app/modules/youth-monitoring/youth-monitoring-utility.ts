import {
  MappedYouthMonitoringDetailTab,
  WebpageLink,
  YouthMonitoringDetailTabDto,
  YouthMonitoringListDto,
  YouthMonitoringPicture
} from './models/interfaces';

export class YouthMonitoringUtility {
  public static mapDropdownData(input: YouthMonitoringListDto): any[] {
    return input.data.nodeQuery.entities.map((item) => ({
      title: item.title,
      entityUrl: {
        routed: true,
        path: item.entityUrl.path
      },
      fieldOskaFieldPicture: item.fieldFirstPicture
        ? {
            derivative: {
              url: item.fieldFirstPicture.url
            },
            ...item.fieldFirstPicture,
          }
        : null,
      fieldOskaVideo: item.fieldFirstVideo,
      fieldIntroduction: item.fieldIntroduction,
      fieldLinks: this.mapLink(item.fieldExtertnalLink),
      reverseFieldOskaFieldParagraph: {
        entities: []
      },
    }));
  }

  public static mapDetail(input: YouthMonitoringDetailTabDto): MappedYouthMonitoringDetailTab[] {
    const tabs = input.fieldYouthMonitorTab.map((item) => item.entity);
    return tabs.map((tab) => {
      const { fieldYouthMonitorTabPage: { entity: data }, fieldAccordionIcon, fieldAccordionTitle } = tab;
      return {
        fieldAccordionIcon,
        fieldAccordionTitle,
        fieldYouthMonitorTabPage: {
          ...data,
          fieldContent: { value: data.fieldContent?.value || '' },
          images: data.fieldYouthGallery?.filter(
              (item) => item.entity.fieldMediaImg
            ).map(
              (item) => this.mapImage(item.entity.fieldMediaImg)
            ),
          videos: data.fieldYouthGallery?.filter(
              (item) => item.entity.fieldMediaVid
            ).map(
              (item) => item.entity.fieldMediaVid
            ),
          fieldEndPicture: data.fieldEndPicture
            ? this.mapImage(data.fieldEndPicture)
            : null,
          fieldYouthAccordion: data.fieldYouthAccordion
            ? data.fieldYouthAccordion
                .filter((item) => item.entity.fieldTitle)
                .map((accordion) => ({
                  entity: {
                    ...accordion.entity,
                    fieldYouthPicture: accordion.entity.fieldYouthPicture
                      ? this.mapImages(accordion.entity.fieldYouthPicture)
                      : null,
                    fieldYouthLink: this.mapLink(accordion.entity.fieldYouthLink)
                  }
                }))
            : null,
          fieldBottomLink: this.mapLink(data.fieldBottomLink),
          fieldExtertnalLink: this.mapLink(data.fieldExtertnalLink),
        }
      }
    });
  }

  public static mapLink(input?: WebpageLink[]): WebpageLink[] {
    return input?.length
      ? this.sortTitle(input.map((input: WebpageLink) => ({
          ...input,
          title: input.entity.fieldLinkName,
          url: {
            path: input.entity.fieldWebpageLink.uri
          }
        })))
      : null;
  }

  public static mapImage(
    input: YouthMonitoringPicture
  ): YouthMonitoringPicture {
    return {
      alt: input.alt || '',
      title: input.title || null,
      derivative: {
        url: input.url || '',
      },
    };
  }

  public static mapImages(input: YouthMonitoringPicture | YouthMonitoringPicture[]) {
    if (Array.isArray(input)) return input.map((item) => this.mapImage(item));
    return this.mapImage(input);
  }

  public static sortTitle<T extends { title?: string; }>(links: T[]): T[] {
    return links.sort(
      (a, b) => a.title.toString().localeCompare(b.title.toString(), 'et', { numeric: true }));
  }

  public static icons = {
    ServiceDevelopmentIcon: 'lightbulb',
    PublicationsIcon: 'library-alt',
    StudiesIcon: 'file-search',
    DevelopmentPlanIcon: 'file-line',
    YouthReportIcon: 'newspaper',
    DashboardIcon: 'graph-line',
    WebReportIcon: 'report',
    DataSeminarsIcon: 'file-play',
    DataTrainingIcon: 'users',
    DataIcon: 'youtube',
    ScholarshipProgramIcon: 'file-badge',
    WritingCampIcon: 'users',
  };
}
