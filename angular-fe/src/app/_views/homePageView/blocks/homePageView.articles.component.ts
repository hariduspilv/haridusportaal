import { Component, OnChanges, Input, HostBinding } from '@angular/core';
import { HomePageService } from '@app/_services';

@Component({
  selector: 'homepage-articles',
  templateUrl: 'homePageView.articles.html',
})
export class HomePageArticlesComponent {
  @Input() data: any[] = [];
  @Input() theme: string;
  @Input() line: number = 1;

  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }

  constructor (private service: HomePageService) {}

  public getImage(index: number): string {
    return this.service.getArticleImage(this.theme, index);
  }
}
