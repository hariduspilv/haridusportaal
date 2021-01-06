import { Component, Input, HostBinding } from '@angular/core';
import { ISlogan } from '../homePageView.model';

@Component({
  selector: 'homepage-slogan',
  templateUrl: 'homePageView.slogan.html',
})
export class HomePageSloganComponent {
  @Input() data: ISlogan;
  @Input() image: string = '';
  @Input() theme: string;
  @Input() line: number = 2;

  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }
}
