import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OskaFrontpageViewComponent } from './oskaFrontpageView.component';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { AppPipes } from '@app/_pipes';

const routes: Routes = [
  {
    path: '',
    component: OskaFrontpageViewComponent,
  },
];

@NgModule({
  declarations: [
    OskaFrontpageViewComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    AssetsModule,
    CommonModule,
    TranslateModule,
    AppPipes,
  ],
  providers: [
  ],
  bootstrap: [],
})

export class OskaFrontpageViewModule { }
