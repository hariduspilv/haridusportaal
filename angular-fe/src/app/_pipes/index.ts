import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthsToYearsPipe } from './monthsToYears.pipe';
import { RemoveProtocolPipe } from './removeProtocol.pipe';
import { UrlPipe } from './url.pipe';

const pipes = [
  MonthsToYearsPipe,
  RemoveProtocolPipe,
  UrlPipe,
];

@NgModule({

  declarations:[
    pipes,
  ],
  imports:[CommonModule],
  exports:[
    pipes,
  ],
})

export class AppPipes{}
