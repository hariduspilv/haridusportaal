import { Component, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'homepage-navblock',
  templateUrl: 'homePageView.navblock.html',
})
export class HomePageNavBlockComponent {
  @Input() data;
  @Input() title: string;
  @Input() description: string;
  @Input() theme: string;

  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }
}
