import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { NewsListViewComponent } from './newsListView.component';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: NewsListViewComponent,
  },
];

@NgModule({
  declarations: [
    NewsListViewComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    AssetsModule,
    TranslateModule,
    CommonModule,
    FormsModule,
  ],
  exports: [
    NewsListViewComponent,
  ],
  providers: [

  ],
  bootstrap: [
  ],
})

export class NewsListViewModule { }
