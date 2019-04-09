import { Component, Input } from '@angular/core';

@Component({
  selector: 'triangles',
  templateUrl: 'triangles.html',
  styleUrls: ['triangles.scss']
})

export class Triangles {

  @Input() small: string = '';
  @Input() large: string = '';
  @Input() position: string = '';

  public smallChild: object = {};
  public largeChild: object = {};

  constructor(){}
  
  ngOnInit() {
    const { position, small, large } = this;
    this.smallChild[`border-${position}-color`] = `${small}`;
    this.largeChild[`border-${position}-color`] = `${large}`;
  }
}
