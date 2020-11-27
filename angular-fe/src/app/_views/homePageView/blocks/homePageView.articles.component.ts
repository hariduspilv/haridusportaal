import { Component, OnChanges, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'homepage-articles',
  templateUrl: 'homePageView.articles.html',
})
export class HomePageArticlesComponent implements OnChanges {
  @Input() data: any[] = [];
  @Input() theme: string;
  @Input() line: number = 1;
  private imageList: string[] = [
    'homepage-articles-1.svg',
    'homepage-articles-2.svg',
    'homepage-articles-3.svg',
  ];

  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }

  ngOnChanges() {
    if (this.data) {
      this.assignImages();
    }
  }

  private assignImages() {

    if (this.theme === 'career') {
      this.imageList = [
        'homepage-articles-career-1.svg',
      ];
    } else if (this.theme === 'learning') {
      this.imageList = [
        'homepage-articles-learning-1.svg',
        'homepage-articles-learning-2.svg',
      ];
    }
    let counter = 0;
    this.data = this.data.map((item, index) => {
      if (counter >= this.imageList.length) {
        counter = 0;
      }
      const image = `/assets/img/${this.imageList[counter]}`;
      counter = counter + 1;
      return {
        ...item,
        image,
      };
    });
  }
}
