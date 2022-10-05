import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import Swiper, { Navigation, Pagination } from 'swiper';
import { HTMSwiperComponent } from './swiper/swiper.component';

Swiper.use([Navigation, Pagination]);

@NgModule({
  declarations: [HTMSwiperComponent],
  exports: [HTMSwiperComponent],
  imports: [CommonModule]
})
export class HTMSwiperModule {}
