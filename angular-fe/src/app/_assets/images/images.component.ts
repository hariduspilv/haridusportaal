import { HostListener, Component, Input, OnInit, HostBinding } from '@angular/core';
import { ModalService } from '@app/_services';
import { VideoEmbedService } from '@app/_services/VideoEmbedService';
import Swiper, { SwiperOptions } from 'swiper';

let _galleryID = 0;

interface ResponseImage {
  alt?: string;
  title?: string;
  index?: number;
  derivative?: {
    url: string;
  };
}

interface ResponseVideo {
  input?: string;
  videoThumbnail?: string;
}

interface ResolvedList extends ResponseVideo, ResponseImage {}

@Component({
  selector: 'images',
  templateUrl: 'images.template.html',
  styleUrls: ['images.styles.scss'],
})

export class ImageComponent implements OnInit {
  public _id = `gallery-${_galleryID++}`;
  public swiper: Swiper;

  @Input() image: ResponseImage | ResponseImage[];
  @Input() videos: ResponseVideo | ResponseVideo[];
  @Input() videoThumb: string;
  @Input() limit = 1;
  @Input() prioritizeVideos = false;

  @Input() galleryType: string | null;
  @Input() mediaGallery: (ResponseVideo | ResponseImage)[] | null;

  @HostBinding('class') className = 'image';
  @HostBinding('id') get wrapperId() {
    return `${this._id}-wrapper`;
  }

  config: SwiperOptions;

  public images: ResolvedList[];
  public activeImage: ResolvedList;
  public loadBounce = false;
  public firstImageLoaded = true;

  constructor(
    private modalService: ModalService,
    private videoService: VideoEmbedService,
  ) { }

  ngOnInit(): void {
    this.initializeGallery();
    this.config = {
      pagination: { el: '.swiper-pagination', clickable: true, type: 'bullets' },
      navigation: {
        nextEl: '.slides__arrow--right',
        prevEl: '.slides__arrow--left',
      },
      a11y: {
        enabled: false,
      },
      observer: true,
      observeParents: true,
      slidesPerView: 1,
      loop: this.images.length > 1,
      watchOverflow: true,
      breakpoints: {
        1024: {
          slidesPerView: 'auto',
        }
      },
      on: {
        slideChangeTransitionStart: (sw: Swiper) => {
          // Set active image to current active index, so that opening the modal will select the correct image.
          const index = sw.el.querySelector('.swiper-slide-active')?.getAttribute('data-swiper-slide-index');
          if (index != null) {
            this.activeImage = this.images[parseInt(index, 10)];
          }
        },
        update: (sw: Swiper) => {
          // Hide duplicate slides from screen readers and
          sw.slides.forEach((el) => {
            if (el.classList.contains('swiper-slide-duplicate')) {
              el.setAttribute('aria-hidden', 'true');
              el.setAttribute('tabindex', '-1');

              el.querySelectorAll('iframe').forEach((el2) => {
                el2.setAttribute('aria-hidden', 'true');
                el2.setAttribute('tabindex', '-1');
              });

              el.querySelectorAll('img').forEach((el2) => {
                el2.setAttribute('alt', '');
              });
            }
          });
        }
      },
    }
  }

  initializeGallery(): void {
    let finalList = [];

    // Prioritize image
    if (!this.galleryType || this.galleryType === '1') {
      const originalImages = this.image || [];
      finalList = Array.isArray(originalImages) ? originalImages : [originalImages];

      // Old gallery logic
      if (!this.galleryType && this.videos && (Array.isArray(this.videos) || Object.keys(this.videos).length)) {
        const orignalVideos = this.videos || [];
        const videoArray = Array.isArray(orignalVideos) ? orignalVideos : [orignalVideos];
        const videos = this.videoService.mapVideoList(videoArray, this.videoThumb) as ResponseVideo[];

        // Legacy prioritization code
        finalList = this.prioritizeVideos ? [...videos, ...finalList] : [...finalList, ...videos];
      }
    // Prioritize video
    } else if (this.galleryType === '2') {
      const orignalVideos = this.videos || [];
      const videoArray = Array.isArray(orignalVideos) ? orignalVideos : [orignalVideos];
      finalList = this.videoService.mapVideoList(videoArray) as ResponseVideo[];
    }

    // Append gallery in order
    if (this.mediaGallery) {
      finalList.push(...this.mediaGallery.map((item) => {
        if ((item as ResponseVideo).input) {
          return this.videoService.mapVideo(item as ResponseVideo);
        }
        return item;
      }));
    }

    this.images = finalList;
		this.initGalleryImages();
  }

  coverImageLoaded(): void {
    // Prevent a hypothetical race condition
    this.loadBounce = true;
    this.firstImageLoaded = true;
  }

  initGalleryImages(): void {
    if (this.images.length > 0) {
      this.images = this.images.map((element, index) => ({
        ...element, index,
      }));
      this.activeImage = this.images[0];

      // Hide the gallery button unless the first image has already loaded
      if (!this.loadBounce) {
        this.firstImageLoaded = false;
      }
    }
  }

  handlePrev(image: ResolvedList): void {
    this.handleNavigation(image.index > 0
      ? image.index - 1
      : this.images.length - 1
    );
  }

  handleNext(image: ResolvedList): void {
    this.handleNavigation(image.index < this.images.length - 1
      ? image.index + 1
      : 0
    );
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.handlePrev(this.activeImage);
    }
    if (event.key === 'ArrowRight') {
      this.handleNext(this.activeImage);
    }
  }

  handlePreviewEnter(event: KeyboardEvent, image: ResolvedList): void {
    if (event.key === 'Enter') {
      this.activeImage = image;
    }
  }

  handleNavigation(index: number): void {
    this.activeImage = this.images[index];
  }

  openGallery(): void {
    this.modalService.open(this._id);
  }
}
