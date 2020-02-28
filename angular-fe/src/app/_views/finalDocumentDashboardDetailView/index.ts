import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { AppPipes } from '@app/_pipes';
import { FinalDocumentDashboardDetailViewComponent } from './finalDocumentDashboardDetailView.component';

const routes: Routes = [
  {
    path: '',
    component: FinalDocumentDashboardDetailViewComponent,
  },
];

@NgModule({
  declarations: [
    FinalDocumentDashboardDetailViewComponent,
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

export class FrontpageViewModule { }
