import { Component } from '@angular/core';
import { HomePageViewComponent } from '../homePageView.component';

@Component({
  selector: 'homepage-learning',
  templateUrl: 'homePageView.learning.template.html',
  styleUrls: ['../homePageView.styles.scss'],
})
export class HomePageLearningViewComponent extends HomePageViewComponent {
  public title = 'frontpage.learning';
}
