import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrontpageViewComponent } from './frontpageView.component';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';

const routes: Routes = [
  {
    path: '',
    component: FrontpageViewComponent,
  },
];

@NgModule({
  declarations: [
    FrontpageViewComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    AssetsModule,
    CommonModule,
    TranslateModule,
  ],
  providers: [
  ],
  bootstrap: [],
})

export class FrontpageViewModule { }
