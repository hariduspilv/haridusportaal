import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { HomePageService } from '@app/_services';

@Component({
  selector: 'homepage-topical',
  templateUrl: 'homePageView.topical.html',
})
export class HomePageTopicalComponent {
  @Input() article: any;
  @Input() theme: string;
  @Input() line: number = 2;
  @Input() category: string;

  constructor(
    private service: HomePageService,
  ) {}

  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }
}
