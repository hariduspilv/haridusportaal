import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { ICareerSlide } from '../../homePageView.model';
import { HomePageService } from '../../homePageView.service';

@Component({
  selector: 'homepage-careerDevelopment',
  templateUrl: 'homePageView.careerDevelopment.html',
})
export class HomePageCareerDevelopmentComponent implements OnInit {
  @Input() title: string;
  @Input() description: string;
  @Input() url: string;
  @Input() theme: string;
  @Input() line: number = 3;
  public data: ICareerSlide[] = [];

  constructor(
    private service: HomePageService,
  ) {}

  @HostBinding('class') get hostClasses(): string {
    return `theme--${this.theme}`;
  }

  ngOnInit() {
    if (this.url) {
      this.service.getCareerDevelopmentSlides(this.url).subscribe(
        (data: ICareerSlide[]) => this.data = data);
    }
  }
}
