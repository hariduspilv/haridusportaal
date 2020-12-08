import { AfterContentChecked, HostListener } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
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
  public images;
  public activeImage;

  constructor(private modalService: ModalService) { }

  ngOnInit() {
    if (!Array.isArray(this.image)) {
      this.images = [this.image];
    } else {
      this.images = this.image;
    }
    this.mergeVideosToList();
    if (this.images.length > 0) {
      this.initGalleryImages();
    }
  }

  mergeVideosToList() {
    if (!Array.isArray(this.videos)) {
      this.images.push(this.videos);
    } else {
      this.images = [...this.images, ...this.videos];
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
