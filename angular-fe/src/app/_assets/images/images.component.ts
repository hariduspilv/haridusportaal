import { HostListener, Component, Input, OnInit, HostBinding } from '@angular/core';
import { ModalService } from '@app/_services';
import { VideoEmbedService } from '@app/_services/VideoEmbedService';

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

  @Input() image: ResponseImage | ResponseImage[];
  @Input() videos: ResponseVideo | ResponseVideo[];
  @Input() videoThumb: string;
  @Input() limit = 1;
  @Input() prioritizeVideos = false;

  @Input() galleryType: string | null;
  @Input() mediaGallery: (ResponseVideo | ResponseImage)[] | null;

  @HostBinding('class') className = 'image';

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
