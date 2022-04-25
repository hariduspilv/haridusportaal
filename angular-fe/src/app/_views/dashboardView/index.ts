import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { CommonModule } from '@angular/common';
import { ApplicationsComponent } from '@app/_assets/applications/applications.component';
import { StudiesComponent } from '@app/_assets/studies/studies.component';
import { TeachingsComponent } from '@app/_assets/teachings/teachings.component';
import { MoreBlockComponent } from '@app/_assets/more.block/more.block.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptor } from '@app/_interceptors';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppPipes } from '@app/_pipes';
import { StudiesDetailView } from './studiesDetailView/studiesDetailView.component';
import { A11yModule } from '@angular/cdk/a11y';
import { translateRoutes } from "@app/_core/router-utility";

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
      },
      {
        path: 'taotlused',
        component: DashboardComponent,
      },
      {
        path: 'tunnistused',
        component: DashboardComponent,
      },
      {
        path: 'õpingud',
        component: DashboardComponent,
      },
      {
        path: 'õpetan',
        component: DashboardComponent,
      },
    ],
  },
  {
    path: 'õpetan/töötamine',
    component: StudiesDetailView,
  },
  {
    path: 'õpetan/kvalifikatsioonid',
    component: StudiesDetailView,
  },
  {
    path: 'õpetan/täiendkoolitus',
    component: StudiesDetailView,
  },
  {
    path: 'tunnistused/:id',
    loadChildren: () => import('../../modules/certificates/containers/certificates-dashboard-detail/certificates-dashboard-detail.module')
      .then(m => m.CertificatesDashboardDetailModule),
  },

];

@NgModule({
  declarations: [
    DashboardComponent,
    ApplicationsComponent,
    StudiesComponent,
    TeachingsComponent,
    StudiesDetailView,
  ],
  imports: [
    AppPipes,
    RouterModule.forChild(translateRoutes(routes)),
    AssetsModule,
    TranslateModule,
    CommonModule,
    ReactiveFormsModule,
    A11yModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  exports: [
    DashboardComponent,
    ApplicationsComponent,
    StudiesComponent,
    TeachingsComponent,
    MoreBlockComponent,
    StudiesDetailView,
  ],
})

export class DashboardViewModule { }
