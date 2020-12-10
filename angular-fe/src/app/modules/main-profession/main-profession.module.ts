import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainProfessionListComponent } from './components/main-profession-list/main-profession-list.component';
import { MainProfessionDetailComponent } from './components/main-profession-detail/main-profession-detail.component';
import { MainProfessionDataComponent } from './components/main-profession-data/main-profession-data.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@app/_modules/translate';
import { AssetsModule } from '@app/_assets';
import { ReactiveFormsModule } from '@angular/forms';
// import { BaseLayoutModule } from '@app/_assets/base-layout/base-layout.module';
// import { BreadcrumbsModule } from '@app/_assets/breadcrumbs/breadcrumbs.module';
// import { IconModule } from '@app/_assets/icon/icon.module';

const routes: Routes = [
  {
    path: '',
    component: MainProfessionListComponent,
  },
];

@NgModule({
  declarations: [
    MainProfessionListComponent,
    MainProfessionDetailComponent,
    MainProfessionDataComponent,
  ],
  imports: [
    // BaseLayoutModule,
    // BreadcrumbsModule,
    // IconModule,
    TranslateModule,
    CommonModule,
    AssetsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
})
export class MainProfessionModule { }
