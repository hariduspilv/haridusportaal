import { Component, Input, HostBinding } from '@angular/core';
import { IStudy } from '../homePage.model';

@Component({
  selector: 'homepage-study',
  templateUrl: 'homePageView.study.html',
})
export class HomePageStudyComponent {
  @Input() theme: string;
  @Input() line: number = 3;
  @Input() title: string;
  @Input() intro: string;
  @Input() data: IStudy[];
  @Input() learnMore = true;

  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }
}
