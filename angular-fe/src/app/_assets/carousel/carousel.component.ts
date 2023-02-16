import { Component, Input } from '@angular/core';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { SwiperOptions } from 'swiper';
import { CarouselItem } from './carousel.model';

@Component({
  selector: 'carousel',
  templateUrl: './carousel.template.html',
  styleUrls: ['./carousel.styles.scss'],
})
export class CarouselComponent {
  @Input() public data: CarouselItem[];
  config: SwiperOptions = {
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: {
      nextEl: '.slides__arrow--right',
      prevEl: '.slides__arrow--left',
    },
    a11y: {
      enabled: false,
    },
    breakpoints: {
      720: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 3,
      },
    },
    slidesPerView: 1,
    slidesPerGroup: 1,
    rewind: true,
  };

  constructor(public translate: TranslateService) {}
}
