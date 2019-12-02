import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '@app/_interceptors';
import { AppPipes } from '@app/_pipes';
import { CompareViewComponent } from './compareView.component';

const routes: Routes = [
  {
    path: '',
    component: CompareViewComponent,
  },
];

@NgModule({
  declarations: [
    CompareViewComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    AssetsModule,
    TranslateModule,
    CommonModule,
    AppPipes,
  ],
  exports: [
    CompareViewComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
})

export class CompareViewModule { }
