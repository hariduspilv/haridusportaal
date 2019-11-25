import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '@app/_interceptors';
import { AppPipes } from '@app/_pipes';
import { OskaFieldMapComponent } from './oskaFieldMap.component';
import { AgmCoreModule } from '@agm/core';
import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';
import { RootScopeService } from '@app/_services/RootScopeService';

const routes: Routes = [
  {
    path: '',
    component: OskaFieldMapComponent,
  },
];

@NgModule({
  declarations: [
    OskaFieldMapComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    AssetsModule,
    TranslateModule,
    CommonModule,
    FormsModule,
    AppPipes,
    AgmCoreModule,
    AgmSnazzyInfoWindowModule,
  ],
  exports: [
    OskaFieldMapComponent,
  ],
  providers: [
    RootScopeService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
})

export class OskaFieldMapModule { }
