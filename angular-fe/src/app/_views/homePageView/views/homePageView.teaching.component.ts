import { Component } from '@angular/core';
import { HomePageViewComponent } from '../homePageView.component';

@Component({
  selector: 'homepage-teaching',
  templateUrl: 'homePageView.teaching.template.html',
  styleUrls: ['../homePageView.styles.scss'],
})
export class HomePageTeachingViewComponent extends HomePageViewComponent {
  public title = 'frontpage.teaching';
}
