import { Component, Input } from '@angular/core';

@Component({
  selector: 'triangles',
  templateUrl: 'triangles.html',
  styleUrls: ['triangles.scss'],
})

export class Triangles {

  @Input() small: string = '';
  @Input() large: string = '';
  @Input() position: string = '';

  public smallChild: object = {};
  public largeChild: object = {};

  constructor() {}
  ngOnInit() {
    let positionLabel = this.position === 'topLeft' ? 'top' : this.position;
    positionLabel = this.position === 'leftSwapped' ? 'left' : positionLabel;
    positionLabel = this.position === 'rightLower' ? 'right' : positionLabel;
    this.smallChild[`border-${positionLabel}-color`] = `${this.small}`;
    this.largeChild[`border-${positionLabel}-color`] = `${this.large}`;
  }
}
