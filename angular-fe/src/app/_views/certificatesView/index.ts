import { NgModule, ChangeDetectorRef } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptor } from '@app/_interceptors';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppPipes } from '@app/_pipes';
import { CertificatesView } from './certificates.component';
import { FinalDocumentsComponent } from '@app/_assets/final-documents/finalDocuments.component';

const routes: Routes = [
  {
    path: '',
    component: CertificatesView,
    children: [
      {
        path: '',
        redirectTo: 'e-tunnistused',
        pathMatch: 'full',
      },
      {
        path: 'e-tunnistused',
        component: CertificatesView,
      },
      {
        path: 'kehtivuse-kontroll',
        component: CertificatesView,
      },
    ],
  },

];

@NgModule({
  declarations: [
    CertificatesView,
    FinalDocumentsComponent,
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

export class CertificatesViewModule { }