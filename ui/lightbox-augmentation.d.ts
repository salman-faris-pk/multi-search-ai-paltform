import "yet-another-react-lightbox";

declare module "yet-another-react-lightbox" {
  export interface VideoSlide extends GenericSlide {
    type: "video-slide";
    src: string;
    iframe_src: string;
    thumbnail?: string;
    title?: string;
    width?: number;
    height?: number;
  }

  export interface SlideTypes {
    "video-slide": VideoSlide;
  }
}

export type { VideoSlide };