import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { ReactiveFormsModule } from '@angular/forms';
import { AppPipes } from '@app/_pipes';
import { CertificateDetailView } from './certificateDetailView.component';

const routes: Routes = [
  {
    path: '',
    component: CertificateDetailView,
  },
];

@NgModule({
  declarations: [
    CertificateDetailView,
  ],
  imports: [
    RouterModule.forChild(routes),
    AssetsModule,
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    AppPipes,
  ],
  providers: [
  ],
  bootstrap: [],
})

export class CertificateDetailViewModule { }
