import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleViewComponent } from './articleView.component';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';

const routes: Routes = [
  {
    path: '',
    component: ArticleViewComponent,
  },
  {
    path: ':id',
    component: ArticleViewComponent,
  },
];

@NgModule({
  declarations: [
    ArticleViewComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    AssetsModule,
  ],
  providers: [
  ],
  bootstrap: [],
})

export class ArticleViewModule { }
