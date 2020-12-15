import { Component, Input, ViewChild } from '@angular/core';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { SwiperComponent } from 'ngx-useful-swiper';
import { SwiperOptions } from 'swiper';
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
      prevSlideMessage: this.translate.get('carousel.prev'),
      nextSlideMessage: this.translate.get('carousel.next'),
      paginationBulletMessage: this.translate.get('carousel.to_slide'),
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
  };

  constructor(public translate: TranslateService) {}
}
