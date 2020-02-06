import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'images',
  templateUrl: 'images.template.html',
  styleUrls: ['images.styles.scss'],
  host: {
    class: 'image',
  },
})

export class ImageComponent implements OnInit{
  @Input() image: {} = {};
  @Input() limit: number = 1;
  public images;

  ngOnInit() {
    if (!Array.isArray(this.image)) {
      this.images = [this.image];
    } else {
      this.images = this.image;
    }
    this.images = this.images.splice(0, this.limit);
  }
}
