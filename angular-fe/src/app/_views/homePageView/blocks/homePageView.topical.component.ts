import { Component, Input, HostBinding } from '@angular/core';
import { ISimpleArticle } from '../homePageView.model';

@Component({
  selector: 'homepage-topical',
  templateUrl: 'homePageView.topical.html',
})
export class HomePageTopicalComponent {
  @Input() article: ISimpleArticle;
  @Input() image: string;
  @Input() theme: string;
  @Input() line: number = 2;
  @Input() category: string;

  constructor() {}

  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }
}
