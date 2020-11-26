import { Component, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'homepage-slides',
  templateUrl: 'homePageView.slides.html',
})
export class HomePageSlidesComponent {
  @Input() title: string;
  @Input() data: [] = [];
  @Input() theme: string;
  @Input() line: number = 2;

  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }
}
