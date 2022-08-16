
export class YouthMonitoringUtility {
  public static transformDropdownData(input: any[]): any[] {
    return input.map((item) => ({
      nid: item.nid,
      title: item.title,
      entityUrl: {
        routed: true,
        path: item.entityUrl.path
      },
      fieldOskaFieldPicture: item.fieldOskaFieldPicture,
      fieldOskaVideo: item.fieldOskaVideo,
      fieldIntroduction: item.fieldIntroduction,
      reverseFieldOskaFieldParagraph: {
        entities: []
      },
    }));
  }
}
