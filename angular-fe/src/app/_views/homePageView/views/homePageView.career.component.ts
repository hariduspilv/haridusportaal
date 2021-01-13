import { Component } from '@angular/core';
import { HomePageViewComponent } from '../homePageView.component';

@Component({
  selector: 'homepage-career',
  templateUrl: 'homePageView.career.template.html',
  styleUrls: ['../homePageView.styles.scss'],
})
export class HomePageCareerViewComponent extends HomePageViewComponent {
  public title = 'frontpage.career';
}
