import { NgModule } from '@angular/core';
import {CommonModule} from "@angular/common";

import { EllipsisPipe } from './ellipsis.pipe';
import { UnixToTimePipe } from './unixToTime.pipe';
import { WeekDayPipe } from './weekday.pipe';
import { UrlPipe } from './url.pipe';
import { FilterPipe } from './filter.pipe';
import { GroupByPipe } from './groupBy.pipe';
import { RemoveProtocolPipe } from './removeProtocol.pipe';
import { titleCasePipe } from './titleCase.pipe';
import { LegendCurrencyPipe } from './legendCurrency.pipe';
import { EuroCurrencyPipe } from './euroCurrency';
import { CapitalizePipe } from './capitalize.pipe';

@NgModule({
  declarations:[
    EllipsisPipe,
    UnixToTimePipe,
    WeekDayPipe,
    UrlPipe,
    FilterPipe,
    GroupByPipe,
    RemoveProtocolPipe,
    titleCasePipe,
    LegendCurrencyPipe,
    EuroCurrencyPipe,
    CapitalizePipe
  ],
  imports:[CommonModule],
  exports:[
    EllipsisPipe,
    UnixToTimePipe,
    WeekDayPipe,
    UrlPipe,
    FilterPipe,
    GroupByPipe,
    RemoveProtocolPipe,
    titleCasePipe,
    LegendCurrencyPipe,
    EuroCurrencyPipe,
    CapitalizePipe
  ]
})

export class AppPipes{}

