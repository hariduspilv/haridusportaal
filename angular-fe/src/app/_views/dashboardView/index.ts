import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { Routes, RouterModule } from '@angular/router';
import { AssetsModule } from '@app/_assets';
import { TranslateModule } from '@app/_modules/translate';
import { CommonModule } from '@angular/common';
import { ApplicationsComponent } from '@app/_assets/applications/applications.component';
import { StudiesComponent } from '@app/_assets/studies/studies.component';
import { TeachingsComponent } from '@app/_assets/teachings/teachings.component';
import { CertificatesComponent } from '@app/_assets/certificates/certificates.component';
import { MoreBlockComponent } from '@app/_assets/more.block/more.block.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptor } from '@app/_interceptors';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppPipes } from '@app/_pipes';
import { StudiesDetailView } from './studiesDetailView/studiesDetailView.component';
import { CertificatesDetailView } from './certificatesDetailView/certificatesDetailView.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'taotlused',
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
    component: CertificatesDetailView,
  },
  {
    path: 'taotlused/:id',
    component: DashboardComponent,
  },
];

@NgModule({
  declarations: [
    DashboardComponent,
    ApplicationsComponent,
    StudiesComponent,
    TeachingsComponent,
    CertificatesComponent,
    MoreBlockComponent,
    StudiesDetailView,
    CertificatesDetailView,
  ],
  imports: [
    AppPipes,
    RouterModule.forChild(routes),
    AssetsModule,
    TranslateModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [],
})

export class DashboardViewModule { }
