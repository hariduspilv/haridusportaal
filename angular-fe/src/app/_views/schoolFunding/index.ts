import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { FormsModule } from '@angular/forms';
import { AppPipes } from '@app/_pipes';
import { SchoolFundingViewComponent } from './schoolFundingView.component';
import { SchoolFundingAreasViewComponent } from './areas/schoolFundingAreasView.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '@app/_interceptors';

const routes: Routes = [
  {
    path: '',
    component: SchoolFundingViewComponent,
  },
  {
    path: 'haldusüksused',
    component: SchoolFundingAreasViewComponent,
  },
];

@NgModule({
  declarations: [
    SchoolFundingViewComponent,
    SchoolFundingAreasViewComponent,
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
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor , multi: true },
  ],
})

export class SchoolFundingViewModule { }
