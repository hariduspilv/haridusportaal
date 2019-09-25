import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'image',
  templateUrl: 'image.template.html',
  styleUrls: ['image.styles.scss'],
  host: {
    class: 'image',
  },
})

export class ImageComponent implements OnInit{
  @Input() image: {} = {};
  public images;

  ngOnInit() {
    if (!Array.isArray(this.image)) {
      this.images = [this.image];
    } else {
      this.images = this.image;
    }
  }
}
