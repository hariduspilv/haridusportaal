import { Component, Input, ViewChild } from '@angular/core';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { SwiperComponent } from 'ngx-useful-swiper';
import { Swiper, SwiperOptions } from 'swiper';
import { CarouselItem } from './carousel.model';

@Component({
  selector: 'carousel',
  templateUrl: './carousel.template.html',
  styleUrls: ['./carousel.styles.scss'],
})
export class CarouselComponent {
  @Input() public data: CarouselItem[];
  @ViewChild('usefulSwiper', { static: false }) usefulSwiper: SwiperComponent;
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
    loop: true,
    on: {
      init: (sw: Swiper) => {
        sw.slides.forEach((el) => {
          if (el.classList.contains('swiper-slide-duplicate')) {
            el.setAttribute('aria-hidden', 'true');
            el.setAttribute('tabindex', '-1');
            el.querySelectorAll('a').forEach((el2) => {
              el2.setAttribute('aria-hidden', 'true');
              el2.setAttribute('tabindex', '-1');
            });
          }
        });
      },
    },
  };

  constructor(public translate: TranslateService) {}
}
