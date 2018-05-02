import { NgModule } from '@angular/core';
import {CommonModule} from "@angular/common";

import { EllipsisPipe } from './ellipsis.pipe';
import { UnixToTimePipe } from './unixToTime.pipe';
import { WeekDayPipe } from './weekday.pipe';
import { UrlPipe } from './url.pipe';

@NgModule({
  declarations:[EllipsisPipe, UnixToTimePipe, WeekDayPipe, UrlPipe],
  imports:[CommonModule],
  exports:[EllipsisPipe, UnixToTimePipe, WeekDayPipe, UrlPipe]
})

export class AppPipes{}

