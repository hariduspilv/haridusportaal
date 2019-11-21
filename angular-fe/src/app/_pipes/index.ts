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
import { TitleCasePipe } from './titleCase.pipe';
import { NumbersOnly } from './numbersOnly.pipe';
import { UrlDecodePipe } from './urlDecode.pipe';
import { ParseInAddsPipe } from './parseInAdds.pipe';
​
const pipes = [
  EllipsisPipe,
  EuroCurrencyPipe,
  IframePipe,
  LegendCurrencyPipe,
  LocaleNumberPipe,
  UnixToTimePipe,
  WeekDayPipe,
  EllipsisPipe,
  EuroCurrencyPipe,
  IframePipe,
  LegendCurrencyPipe,
  LocaleNumberPipe,
  MonthsToYearsPipe,
  RemoveEmptyTagsPipe,
  RemoveProtocolPipe,
  TitleCasePipe,
  UnixToTimePipe,
  UrlPipe,
  WeekDayPipe,
  NumbersOnly,
  UrlDecodePipe,
  ParseInAddsPipe,
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
