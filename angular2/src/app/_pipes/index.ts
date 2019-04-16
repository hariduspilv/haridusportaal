import { NgModule } from '@angular/core';
import {CommonModule} from "@angular/common";

import { EllipsisPipe } from './ellipsis.pipe';
import { UnixToTimePipe } from './unixToTime.pipe';
import { WeekDayPipe } from './weekday.pipe';
import { UrlPipe } from './url.pipe';
import { FilterPipe } from './filter.pipe';
import { alphabeticalSort } from './alphabeticalSort.pipe';
import { GroupByPipe } from './groupBy.pipe';
import { RemoveProtocolPipe } from './removeProtocol.pipe';
import { titleCasePipe } from './titleCase.pipe';
import { LegendCurrencyPipe } from './legendCurrency.pipe';
import { EuroCurrencyPipe } from './euroCurrency';
import { CapitalizePipe } from './capitalize.pipe';
import { IframePipe } from './iframe.pipe';
import { LocaleNumberPipe } from './localeNumber.pipe';

@NgModule({
  declarations:[
    EllipsisPipe,
    UnixToTimePipe,
    WeekDayPipe,
    UrlPipe,
    FilterPipe,
    alphabeticalSort,
    GroupByPipe,
    RemoveProtocolPipe,
    titleCasePipe,
    LegendCurrencyPipe,
    EuroCurrencyPipe,
    CapitalizePipe,
    IframePipe,
    LocaleNumberPipe
  ],
  imports:[CommonModule],
  exports:[
    EllipsisPipe,
    UnixToTimePipe,
    WeekDayPipe,
    UrlPipe,
    FilterPipe,
    alphabeticalSort,
    GroupByPipe,
    RemoveProtocolPipe,
    titleCasePipe,
    LegendCurrencyPipe,
    EuroCurrencyPipe,
    CapitalizePipe,
    IframePipe,
    LocaleNumberPipe
  ]
})

export class AppPipes{}

