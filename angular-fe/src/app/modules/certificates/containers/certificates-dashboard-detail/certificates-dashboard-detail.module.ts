import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptor } from '@app/_interceptors';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppPipes } from '@app/_pipes';
import { CertificatesDashboardDetailComponent } from './certificates-dashboard-detail.component';
import { translateRoutes } from "@app/_core/router-utility";

const routes: Routes = [
  {
    path: '',
    component: CertificatesDashboardDetailComponent,
  },
];

@NgModule({
  declarations: [
    CertificatesDashboardDetailComponent,
  ],
  imports: [
    AppPipes,
    RouterModule.forChild(translateRoutes(routes)),
    AssetsModule,
    TranslateModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  exports: [
  ],
})

export class CertificatesDashboardDetailModule { }
