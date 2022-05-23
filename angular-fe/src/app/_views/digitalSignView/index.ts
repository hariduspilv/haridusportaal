import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '@app/_interceptors';
import { AppPipes } from '@app/_pipes';
import { DigitalSignViewComponent } from './digitalSignView.component';
import { translateRoutes } from "@app/_core/router-utility";

const routes: Routes = [
  {
    path: '',
    component: DigitalSignViewComponent,
  },
];

@NgModule({
  declarations: [
    DigitalSignViewComponent,
  ],
  imports: [
    RouterModule.forChild(translateRoutes(routes)),
    AssetsModule,
    ReactiveFormsModule,
    TranslateModule,
    CommonModule,
    FormsModule,
    AppPipes,
  ],
  exports: [

  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
})

export class DigitalSignViewModule { }
