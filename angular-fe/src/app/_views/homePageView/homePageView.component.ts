import { Component, Input } from '@angular/core';

@Component({
  selector: 'homepage-line',
  templateUrl: 'homePageView.line.html',
})
export class HomePageLineComponent {
  @Input() type: string = '1';
}

@Component({
  selector: 'homepage-navblock',
  templateUrl: 'blocks/homePageView.navblock.html',
})
export class HomePageNavBlockComponent {}

@Component({
  selector: 'homepage-articles',
  templateUrl: 'blocks/homePageView.articles.html',
})
export class HomePageArticlesComponent {}

@Component({
  selector: 'homepage-slides',
  templateUrl: 'blocks/homePageView.slides.html',
})
export class HomePageSlidesComponent {}

@Component({
  selector: 'homepage-topical',
  templateUrl: 'blocks/homePageView.topical.html',
})
export class HomePageTopicalComponent {}

@Component({
  selector: 'homepage-study',
  templateUrl: 'blocks/homePageView.study.html',
})
export class HomePageStudyComponent {}

@Component({
  selector: 'homepage-slogan',
  templateUrl: 'blocks/homePageView.slogan.html',
})
export class HomePageSloganComponent {}

@Component({
  selector: 'homepage-footer',
  templateUrl: 'blocks/homePageView.footer.html',
})
export class HomePageFooterComponent {}

@Component({
  selector: 'homepage',
  templateUrl: 'homePageView.template.html',
  styleUrls: ['homePageView.styles.scss'],
})

export class HomePageViewComponent {

}