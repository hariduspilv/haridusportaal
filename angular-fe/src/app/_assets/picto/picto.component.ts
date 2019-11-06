import { Component, Input, OnInit } from '@angular/core';
import { pictoDesigns } from './helpers/picto';

@Component({
  selector: 'picto',
  templateUrl: './picto.template.html',
  styleUrls: ['./picto.styles.scss'],
})

export class PictoComponent implements OnInit {
  @Input() img: string;

  private totalPictos: number = 6;
  public pictoNumber: number;
  public description: string;
  public pictoDesigns = pictoDesigns;

  rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  ngOnInit() {
    this.pictoNumber = this.rand(0, this.totalPictos - 1);
  }
}
