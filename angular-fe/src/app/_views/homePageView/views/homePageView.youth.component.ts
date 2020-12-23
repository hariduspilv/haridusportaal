import { Component } from '@angular/core';
import { HomePageViewComponent } from '../homePageView.component';
import { ISlogan } from '../homePageView.model';

@Component({
  selector: 'homepage-youth',
  templateUrl: 'homePageView.youth.template.html',
  styleUrls: ['../homePageView.styles.scss'],
})
export class HomePageYouthViewComponent extends HomePageViewComponent {
  public slogan: ISlogan = {
    title: '',
    person: '',
    company: '',
  };
}
