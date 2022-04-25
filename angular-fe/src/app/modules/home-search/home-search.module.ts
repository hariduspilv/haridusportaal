import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeSearchComponent } from './components/home-search/home-search.component';
import { RouterModule, Routes } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '@app/_interceptors';

const routes: Routes = [
  {
    path: '',
    component: HomeSearchComponent,
  },
];

@NgModule({
  declarations: [HomeSearchComponent],
  imports: [
    CommonModule,
    TranslateModule,
    AssetsModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
  ],
  exports: [HomeSearchComponent],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
})
export class HomeSearchModule { }
