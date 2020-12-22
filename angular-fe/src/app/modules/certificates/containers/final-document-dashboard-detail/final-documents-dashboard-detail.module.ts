import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinalDocumentDashboardDetailComponent } from './final-document-dashboard-detail.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { AuthInterceptor } from '@app/_interceptors';
import { TranslateModule } from '@app/_modules/translate';
import { AppPipes } from '@app/_pipes';

const routes: Routes = [
  {
    path: '',
    component: FinalDocumentDashboardDetailComponent,
  },
];

@NgModule({
  declarations: [FinalDocumentDashboardDetailComponent],
  imports: [
    RouterModule.forChild(routes),
    AssetsModule,
    CommonModule,
    TranslateModule,
    AppPipes,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
})
export class FinalDocumentsDashboardDetailModule { }
