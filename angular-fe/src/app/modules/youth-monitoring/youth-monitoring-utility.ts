import { MappedYouthMonitoringDetail, WebpageLink, YouthMonitoringDetail, YouthMonitoringListDto, YouthMonitoringPicture, YouthMonitoringVideo } from "./models/interfaces";

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

  public static mapDetail(input: YouthMonitoringDetail): MappedYouthMonitoringDetail {
    return {
      ...input,
			fieldContent: { value: input.fieldContent.value.split('img').join('img style="max-width: 100%"')},
      images: input.fieldYouthGallery?.filter(
          (item) => item.entity.fieldMediaImg
        ).map(
          (item) => this.mapImage(item.entity.fieldMediaImg)
        ),
      videos: input.fieldYouthGallery?.filter(
          (item) => item.entity.fieldMediaVid
        ).map(
          (item) => item.entity.fieldMediaVid
        ),
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
              fieldYouthLink: this.mapLink(accordion.entity.fieldYouthLink)
            }
          }))
        : null,
      fieldBottomLink: this.mapLink(input.fieldBottomLink),
      fieldExtertnalLink: this.mapLink(input.fieldExtertnalLink),
    };
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

  public static mapImage(input: YouthMonitoringPicture): YouthMonitoringPicture {
    return {
      alt: input.alt || '',
      title: input.title || null,
      derivative: {
        url: input.url || '',
      },
    };
  }

  public static sortTitle<T extends { title?: string; }>(links: T[]): T[] {
    return links.sort(
      (a, b) => a.title.toString().localeCompare(b.title.toString(), 'et', { numeric: true }));
  }
}
