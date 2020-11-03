import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation, NgxGalleryComponent } from 'ngx-gallery';

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
  @Input() limit: number = 1;
  public images;

  @ViewChild(NgxGalleryComponent, { static: false }) gallery: NgxGalleryComponent;

  galleryOptions: NgxGalleryOptions[] = [
    {
      width: '100%',
      height: '400px',
      thumbnailsColumns: 4,
      imageAnimation: NgxGalleryAnimation.Slide,
      thumbnails: false,
      previewCloseOnEsc: true,
      previewCloseOnClick: true,
      arrowPrevIcon: 'keyboard_arrow_left',
      arrowNextIcon: 'keyboard_arrow_right',
    },
    {
      breakpoint: 800,
      width: '100%',
      height: '600px',
      imagePercent: 80,
      thumbnailsPercent: 20,
      thumbnailsMargin: 20,
      thumbnailMargin: 20,
    },
    // max-width 400
    {
      breakpoint: 400,
      preview: false
    },
  ];

  galleryImages: NgxGalleryImage[];

  openPreview() {
    console.log(this.gallery);
    this.gallery.openPreview(0);
  }

  ngOnInit() {
    if (!Array.isArray(this.image)) {
      this.images = [this.image];
    } else {
      this.images = this.image;
    }

    this.galleryImages = this.images.map((element) => {
      return new NgxGalleryImage(
        {
          small: element.derivative.url,
          medium: element.derivative.url,
          big: element.derivative.url,
        },
      );
    });
  }
}
