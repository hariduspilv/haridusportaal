import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { DetailViewComponent } from './detailView.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '@app/_interceptors';
import { AppPipes } from '@app/_pipes';
import { translateRoutes } from "@app/_core/router-utility";
import { DedrupalizeInterceptor } from '@app/_interceptors/dedrupalize.interceptor';

const routes: Routes = [
  {
    path: '',
    component: DetailViewComponent,
  },
  {
    path: ':id',
    component: DetailViewComponent,
  },
];

@NgModule({
  declarations: [
    DetailViewComponent,
  ],
  imports: [
    RouterModule.forChild(translateRoutes(routes)),
    AssetsModule,
    TranslateModule,
    CommonModule,
    AppPipes,
  ],
  exports: [
    DetailViewComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: DedrupalizeInterceptor, multi: true },
  ],
})

export class DetailViewModule { }
