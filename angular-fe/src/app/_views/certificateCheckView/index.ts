import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificateCheckComponent } from './certificateCheck.component';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { ReactiveFormsModule } from '@angular/forms';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';


const routes: Routes = [
  {
    path: '',
    component: CertificateCheckComponent,
  },
];

@NgModule({
  declarations: [
    CertificateCheckComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    AssetsModule,
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    RecaptchaFormsModule,
    RecaptchaModule,
  ],
  providers: [
  ],
  bootstrap: [],
})

export class CertificateCheckViewModule { }
