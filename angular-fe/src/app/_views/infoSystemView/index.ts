import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoSystemViewComponent } from './infoSystem.component';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';

const routes: Routes = [
  {
    path: ':id',
    component: InfoSystemViewComponent,
  },
];

@NgModule({
  declarations: [
    InfoSystemViewComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    AssetsModule,
    CommonModule,
    TranslateModule,
  ],
  providers: [
  ],
  bootstrap: [],
})

export class InfoSystemViewModule { }
