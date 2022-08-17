import { WebpageLink, YouthMonitoringDetail, YouthMonitoringListDto, YouthMonitoringMappedDetail, YouthMonitoringPicture } from "./models/interfaces";

export class YouthMonitoringUtility {
  public static mapDropdownData(input: YouthMonitoringListDto): any[] {
    console.log(input);
    return input.data.nodeQuery.entities.map((item) => ({
      title: item.title,
      entityUrl: {
        routed: true,
        path: item.entityUrl.path
      },
      fieldOskaFieldPicture: item.fieldFirstPicture
        ? {
            ...item.fieldFirstPicture,
            derivative: {
              url: item.fieldFirstPicture.url
            }
          }
        : null,
      fieldOskaVideo: item.fieldFirstVideo,
      fieldIntroduction: item.fieldIntroduction,
      fieldLinks: item.fieldExtertnalLink?.length
        ? this.sortTitle(item.fieldExtertnalLink.map((link) => this.mapLink(link)))
        : null,
      reverseFieldOskaFieldParagraph: {
        entities: []
      },
    }));
  }

  public static mapDetail(input: YouthMonitoringDetail): YouthMonitoringMappedDetail {
    return {
      ...input,
      images: input.fieldGallery?.map((item) => this.mapImage(item)),
      fieldEndPicture: input.fieldEndPicture
        ? this.mapImage(input.fieldEndPicture)
        : null,
      fieldYouthAccordion: input.fieldYouthAccordion
        ? input.fieldYouthAccordion.map((accordion) => ({
            entity: {
              ...accordion.entity,
              fieldYouthPicture: accordion.entity.fieldYouthPicture
                ? this.mapImage(accordion.entity.fieldYouthPicture)
                : null,
              fieldYouthLink: accordion.entity.fieldYouthLink
                ? this.sortTitle(accordion.entity.fieldYouthLink.map((link) => this.mapLink(link)))
                : null,
            }
          }))
        : null,
      fieldBottomLink: input.fieldBottomLink
        ? this.sortTitle(input.fieldBottomLink.map((link) => this.mapLink(link)))
        : null,
      fieldExtertnalLink: input.fieldExtertnalLink
        ? this.sortTitle(input.fieldExtertnalLink.map((link) => this.mapLink(link)))
        : null,
    };
  }

  public static mapLink(input: WebpageLink): WebpageLink {
    return {
      ...input,
      title: input.entity.fieldLinkName,
      url: {
        path: input.entity.fieldWebpageLink.uri
      }
    }
  }

  public static mapImage(input: YouthMonitoringPicture): YouthMonitoringPicture {
    return {
      alt: input.alt,
      title: input.title || null,
      derivative: {
        url: input.url,
      },
    };
  }

  public static sortTitle<T extends { title?: string; }>(links: T[]): T[] {
    return links.sort((a, b) => a.title.toString().localeCompare(b.title.toString(), 'et', { numeric: true }));
  }
}
