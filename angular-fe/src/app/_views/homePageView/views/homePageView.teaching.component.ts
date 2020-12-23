import { Component } from '@angular/core';
import { HomePageViewComponent } from '../homePageView.component';
import { ISlogan } from '../homePageView.model';

@Component({
  selector: 'homepage-teaching',
  templateUrl: 'homePageView.teaching.template.html',
  styleUrls: ['../homePageView.styles.scss'],
})
export class HomePageTeachingViewComponent extends HomePageViewComponent {
  public slogan: ISlogan = {
    title: '',
    person: '',
    company: '',
  };
}
