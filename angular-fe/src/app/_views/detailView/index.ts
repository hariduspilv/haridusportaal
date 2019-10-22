import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { DetailViewComponent } from './detailView.component';

const routes: Routes = [
  {
    path: '',
    component: DetailViewComponent,
  },
  {
    path: ':id',
    component: DetailViewComponent,
  },
];

@NgModule({
  declarations: [
    DetailViewComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    AssetsModule,
    TranslateModule,
    CommonModule,
  ],
  exports: [
    DetailViewComponent,
  ],
  providers: [

  ],
})

export class DetailViewModule { }
