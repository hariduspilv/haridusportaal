
export interface IMenuURL {
  path: string;
  internal: boolean;
}

export interface IMenuData {
  label: string;
  description?: string;
  links: IMenuData[];
  url: IMenuURL;
  expanded?: boolean;
  active?: boolean;
  userClosed?: boolean;
  firstLevel?: boolean;
}

export interface IMenuResponse {
  data: {
    menu: {
      links: IMenuData[];
    };
  };
}
