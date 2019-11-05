import { Component, Input } from '@angular/core';

@Component({
  selector: 'circles',
  templateUrl: 'circles.html',
  styleUrls: ['circles.scss'],
})

export class Circles {

  @Input() small: string = '';
  @Input() large: string = '';
  @Input() position: string = '';
  @Input() smallAlignment: string = '';

  public smallChild: object = {};
  public largeChild: object = {};

  constructor() {}
  ngOnInit() {
    // const { small, large } = this;
    this.smallChild[`background-color`] = `${this.small}`;
    this.largeChild[`background-color`] = `${this.large}`;
  }
}
