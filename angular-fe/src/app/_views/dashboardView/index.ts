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
import { TitleCasePipe } from '@app/_pipes/titleCase.pipe';
import { AuthInterceptor } from '@app/_interceptors';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

const routes: Routes = [
  {
    path: '',
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
  ],
  imports: [
    RouterModule.forChild(routes),
    AssetsModule,
    TranslateModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  providers: [
    TitleCasePipe,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [],
})

export class DashboardViewModule { }
