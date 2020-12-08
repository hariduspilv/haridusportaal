import { Component, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'homepage-slogan',
  templateUrl: 'homePageView.slogan.html',
})
export class HomePageSloganComponent {
  @Input() title: string = '';
  @Input() image: string = '';
  @Input() person: string;
  @Input() company: string;
  @Input() theme: string;
  @Input() line: number = 2;

  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }
}
