import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { NotFoundViewComponent } from './notFoundView.component';

const routes: Routes = [
  {
    path: '',
    component: NotFoundViewComponent,
  },
];

@NgModule({
  declarations: [
    NotFoundViewComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    AssetsModule,
    TranslateModule,
    CommonModule,
  ],
  exports: [
  ],
  providers: [
  ],
})

export class NotFoundViewModule { }
