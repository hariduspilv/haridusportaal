import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '@app/_interceptors';
import { AppPipes } from '@app/_pipes';
import { OskaResultsView } from './oskaResultsView.component';

const routes: Routes = [
  {
    path: '',
    component: OskaResultsView,
  },
];

@NgModule({
  declarations: [
    OskaResultsView,
  ],
  imports: [
    RouterModule.forChild(routes),
    AssetsModule,
    TranslateModule,
    CommonModule,
    FormsModule,
    AppPipes,
  ],
  exports: [

  ],
  providers: [

  ],
})

export class OskaResultsViewModule { }
