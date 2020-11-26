import { Component, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'homepage-study',
  templateUrl: 'homePageView.study.html',
})
export class HomePageStudyComponent {
  @Input() theme: string;
  @Input() line: number = 3;

  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }
}
