import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { pictoDesigns } from './helpers/picto';

@Component({
  selector: 'picto',
  templateUrl: './picto.template.html',
  styleUrls: ['./picto.styles.scss'],
})

export class PictoComponent implements OnInit {
  @Input() img: string;
  @Input() insideText = false;

  private totalPictos: number = 6;
  public pictoNumber: number;
  public description: string;
  public pictoDesigns = pictoDesigns;

  @HostBinding('class') get hostClasses(): string {
    return this.insideText ? 'inside__text' : '';
  }

  rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  ngOnInit() {
    this.pictoNumber = this.rand(0, this.totalPictos - 1);
  }
}
