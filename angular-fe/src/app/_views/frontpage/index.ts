import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrontpageViewComponent } from './frontpageView.component';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';

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
  ],
  providers: [
  ],
  bootstrap: [],
})

export class FrontpageViewModule { }
