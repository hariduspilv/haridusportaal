import { HostListener, Component, Input, OnInit } from '@angular/core';
import { ModalService } from '@app/_services';

@Component({
  selector: 'images',
  templateUrl: 'images.template.html',
  styleUrls: ['images.styles.scss'],
  host: {
    class: 'image',
  },
})

export class ImageComponent implements OnInit {
  @Input() image: {} = {};
  @Input() videos: {} = {};
  @Input() limit: number = 1;
  @Input() prioritizeVideos = false;
  public images;
  public activeImage;
  public loadBounce = false;
  public firstImageLoaded = true;

  constructor(
    private modalService: ModalService,
    ) { }

  ngOnInit() {
    if (!Array.isArray(this.image)) {
      this.images = [this.image];
    } else {
      this.images = this.image;
    }
    if (Array.isArray(this.videos) || Object.keys(this.videos).length) {
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

  coverImageLoaded() {
    // Prevent a hypothetical race condition
    this.loadBounce = true;
    this.firstImageLoaded = true;
  }

  mergeVideosToList() {
    if (!Array.isArray(this.videos)) {
      this.images = this.prioritizeVideos ? [this.videos, ...this.images] : [...this.images, this.videos];
    } else {
      this.images = this.prioritizeVideos ? [...this.videos, ...this.images] : [...this.images, ...this.videos];
    }
  }

  initGalleryImages() {
    this.images = this.images.map((element, index) => {
      return { ...element, index };
    });
    this.activeImage = this.images[0];
  }

  handlePrev(image) {
    if (image.index > 0) {
      this.handleNavigation(image.index - 1);
    }
  }

  handleNext(image) {
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

  handleNavigation(index) {
    this.activeImage = this.images[index];
  }

  openGallery() {
    this.modalService.open('gallery');
  }
}
