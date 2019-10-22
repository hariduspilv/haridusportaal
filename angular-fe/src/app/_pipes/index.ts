import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthsToYearsPipe } from './monthsToYears.pipe';
import { RemoveProtocolPipe } from './removeProtocol.pipe';
import { UrlPipe } from './url.pipe';
import { RemoveEmptyTagsPipe } from './removeEmptyTags.pipe';
import { EllipsisPipe } from './ellipsis.pipe';
import { EuroCurrencyPipe } from './euroCurrency.pipe';
import { IframePipe } from './iframe.pipe';
import { LegendCurrencyPipe } from './legendCurrency.pipe';
import { LocaleNumberPipe } from './localeNumber';
import { UnixToTimePipe } from './unixToTime.pipe';
import { WeekDayPipe } from './weekday.pipe';
​
const pipes = [
  MonthsToYearsPipe,
  RemoveProtocolPipe,
  UrlPipe,
  RemoveEmptyTagsPipe,
  EllipsisPipe,
  EuroCurrencyPipe,
  IframePipe,
  LegendCurrencyPipe,
  LocaleNumberPipe,
  UnixToTimePipe,
  WeekDayPipe,
];
​
@NgModule({
​
  declarations:[
    pipes,
  ],
  imports:[CommonModule],
  exports:[
    pipes,
  ],
})
​
export class AppPipes{}
