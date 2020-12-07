import { Component, OnChanges, Input, HostBinding } from '@angular/core';
import { ITopic } from '../homePage.model';
import { HomePageService } from '../homePage.service';

@Component({
  selector: 'homepage-articles',
  templateUrl: 'homePageView.articles.html',
})
export class HomePageArticlesComponent {
  @Input() data: ITopic[] = [];
  @Input() theme: string;
  @Input() category: string;
  @Input() line: number = 1;

  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }

  constructor (private service: HomePageService) {}
}
