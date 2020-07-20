import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrontpageViewComponent } from './frontpageView.component';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { AppPipes } from '@app/_pipes';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '@app/_interceptors';

const routes: Routes = [
  {
    path: '',
    component: FrontpageViewComponent,
  },
];

@NgModule({
  declarations: [
    FrontpageViewComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    AssetsModule,
    CommonModule,
    TranslateModule,
    AppPipes,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor , multi: true },
  ],
  bootstrap: [],
})

export class FrontpageViewModule { }
