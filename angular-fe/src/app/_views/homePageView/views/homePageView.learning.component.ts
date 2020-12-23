import { Component } from '@angular/core';
import { HomePageViewComponent } from '../homePageView.component';
import { ISlogan } from '../homePageView.model';

@Component({
  selector: 'homepage-learning',
  templateUrl: 'homePageView.learning.template.html',
  styleUrls: ['../homePageView.styles.scss'],
})
export class HomePageLearningViewComponent extends HomePageViewComponent {
  public slogan: ISlogan = {
    title: '',
    person: '',
    company: '',
  };
}
