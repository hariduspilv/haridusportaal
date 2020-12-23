import { Component } from '@angular/core';
import { HomePageViewComponent } from '../homePageView.component';
import { ISlogan } from '../homePageView.model';

@Component({
  selector: 'homepage-career',
  templateUrl: 'homePageView.career.template.html',
  styleUrls: ['../homePageView.styles.scss'],
})
export class HomePageCareerViewComponent extends HomePageViewComponent {
  public slogan: ISlogan = {
    title: '',
    person: '',
    company: '',
  };
}
