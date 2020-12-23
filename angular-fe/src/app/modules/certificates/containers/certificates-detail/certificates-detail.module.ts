import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptor } from '@app/_interceptors';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppPipes } from '@app/_pipes';
import { CertificatesDetailComponent } from './certificates-detail.component';

const routes: Routes = [
  {
    path: '',
    component: CertificatesDetailComponent,
  },
];

@NgModule({
  declarations: [
    CertificatesDetailComponent,
  ],
  imports: [
    AppPipes,
    RouterModule.forChild(routes),
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

export class CertificatesDetailModule { }
