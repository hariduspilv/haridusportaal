import { Component } from '@angular/core';
import { HomePageViewComponent } from '../homePageView.component';

@Component({
  selector: 'homepage-teaching',
  templateUrl: 'homePageView.teaching.template.html',
  styleUrls: ['../homePageView.styles.scss'],
})
export class HomePageTeachingViewComponent extends HomePageViewComponent {
  public title = 'frontpage.teaching';
  public cooperationOffers = {
    title: this.translate.get('frontpage.cooperation_offers'),
    intro: this.translate.get('frontpage.cooperation_offers_intro'),
    data: [
      {
        title: this.translate.get('home.profession_compare'),
        image: '/assets/img/homepage-study-1.svg',
        url: {
          path: '/ametialad',
          routed: true,
        },
      },
      {
        title: this.translate.get('home.studyprogramme_compare'),
        image: '/assets/img/homepage-study-2.svg',
        url: {
          path: '/erialad',
          routed: true,
        },
      }
    ]
  }
}
