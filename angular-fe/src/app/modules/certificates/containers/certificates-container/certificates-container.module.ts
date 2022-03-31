import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptor } from '@app/_interceptors';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppPipes } from '@app/_pipes';
import { CertificatesContainerComponent } from './certificates-container.component';
import { translateRoutes } from "@app/_core/router-utility";

const routes: Routes = [
  {
    path: '',
    component: CertificatesContainerComponent,
  },
];

@NgModule({
  declarations: [
    CertificatesContainerComponent,
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
})

export class CertificatesContainerModule { }
