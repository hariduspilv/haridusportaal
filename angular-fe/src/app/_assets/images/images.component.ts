import { HostListener, Component, Input, OnInit, HostBinding } from '@angular/core';
import { ModalService } from '@app/_services';
import { VideoEmbedService } from '@app/_services/VideoEmbedService';

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
  @Input() image: ResponseImage | ResponseImage[];
  @Input() videos: ResponseVideo | ResponseVideo[];
  @Input() videoThumb: string;
  @Input() limit = 1;
  @Input() prioritizeVideos = false;
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
    const originalImages = this.image || [];
    this.images = Array.isArray(originalImages) ? originalImages : [originalImages];

    if (this.videos && (Array.isArray(this.videos) || Object.keys(this.videos).length)) {
      this.mergeVideosToList();
    }

    if (this.images.length > 0) {
      this.initGalleryImages();
      // Hide the gallery button unless the first image has already loaded
      if (!this.loadBounce) {
        this.firstImageLoaded = false;
      }
    }
  }

  coverImageLoaded(): void {
    // Prevent a hypothetical race condition
    this.loadBounce = true;
    this.firstImageLoaded = true;
  }

  mergeVideosToList(): void {
    const orignalVideos = this.videos || [];
    const videoArray = Array.isArray(orignalVideos) ? orignalVideos : [orignalVideos];
    const videos = this.videoService.mapVideoList(videoArray, this.videoThumb) as ResponseVideo[];
    this.images = this.prioritizeVideos ? [...videos, ...this.images] : [...this.images, ...videos];
  }

  initGalleryImages(): void {
    this.images = this.images.map((element, index) => ({
      ...element, index,
    }));
    this.activeImage = this.images[0];
  }

  handlePrev(image: ResolvedList): void {
    if (image.index > 0) {
      this.handleNavigation(image.index - 1);
    }
  }

  handleNext(image: ResolvedList): void {
    if (image.index < this.images.length - 1) {
      this.handleNavigation(image.index + 1);
    }
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

  handleNavigation(index: number): void {
    this.activeImage = this.images[index];
  }

  openGallery(): void {
    this.modalService.open('gallery');
  }
}
