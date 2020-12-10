
export interface CarouselItem {
  title: string;
  url: {
    path: string;
    routed: boolean;
  };
  image: {
    url: string;
  };
}
