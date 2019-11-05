import { Component, Input, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'picto',
  templateUrl: './picto.template.html',
  styleUrls: ['./picto.styles.scss'],
})

export class PictoComponent implements OnInit {
  @Input() img: string;
  @Input() content: string;

  private totalPictos: number = 6;
  public pictoNumber: number;
  public description: string;

  rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  ngOnInit() {
    this.description = `<div class="picto"><img class="image" src="${this.img}"/><span class="circle"></span><span class="circlesec"></span></div>${this.content}`;
    console.log(this.description);
    this.pictoNumber = this.rand(0, this.totalPictos);
  }
}