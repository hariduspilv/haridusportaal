import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  ArticleComponent,
  FrontpageComponent,
  EventsComponent,
  PersonalDataComponent,
  EventsSingleComponent,
  NewsComponent,
  NewsSingleComponent,
  SchoolsComponent,
  SchoolsSingleComponent,
  StudyProgrammeComponent,
  StudyProgrammeSingleComponent,
  NotFoundComponent,
  StudyProgrammeCompareComponent,
  DashboardComponent,
  SchoolsFundingComponent
} from './_views';
import { CertificatesDetailedComponent } from '@app/_components/certificates.detailed/certificates.detailed.component';
import { CertificatesComponent } from '@app/_components/certificates/certificates.component';
import { ApplicationsComponent } from '@app/_components/applications/applications.component';
import { StudiesComponent } from '@app/_components/studies/studies.component';
import { TeachingsComponent } from '@app/_components/teachings/teachings.component';

const appRoutes: Routes = [
  { path: ':lang/artiklid/:id', component: ArticleComponent },
  { path: ':lang/articles/:id', component: ArticleComponent },
  { path: ':lang/events', component: EventsComponent },
  { path: ':lang/events/:id', component: EventsSingleComponent },
  { path: ':lang/news', component: NewsComponent },
  { path: ':lang/news/:id', component: NewsSingleComponent },
  { path: ':lang/uudised', component: NewsComponent },
  { path: ':lang/uudised/:id', component: NewsSingleComponent },
  { path: ':lang/sundmused', component: EventsComponent },
  { path: ':lang/sundmused/:id', component: EventsSingleComponent },
  { path: ':lang', component: FrontpageComponent },

  { path: ':lang/school', component: SchoolsComponent },
  { path: ':lang/kool', component: SchoolsComponent },
  { path: ':lang/school/:id', component: SchoolsSingleComponent },
  { path: ':lang/kool/:id', component: SchoolsSingleComponent },

  { path: ':lang/school_funding', component: SchoolsFundingComponent},

  { path: ':lang/erialad/vordlus', component: StudyProgrammeCompareComponent},
  { path: ':lang/study-programmes/compare', component: StudyProgrammeCompareComponent},

  { path: ':lang/erialad', component: StudyProgrammeComponent},
  { path: ':lang/erialad/:id', component: StudyProgrammeSingleComponent},
  { path: ':lang/study-programmes', component: StudyProgrammeComponent},
  { path: ':lang/study-programmes/:id', component: StudyProgrammeSingleComponent},

  { path: ':lang/toolaud/tunnistused/:name', component: CertificatesDetailedComponent},
  { path: ':lang/dashboard/certificates/:name', component: CertificatesDetailedComponent},

  { path: ':lang/dashboard', component: DashboardComponent,
    children: [
      { path: 'applications', component: ApplicationsComponent},
      { path: 'certificates', component: CertificatesComponent},
      { path: 'studies', component: StudiesComponent},
      { path: 'teachings', component: TeachingsComponent},
      { path: '**', redirectTo: 'applications', pathMatch: 'full' }
    ]},
  { path: ':lang/toolaud', component: DashboardComponent,
    children: [
      { path: 'taotlused', component: ApplicationsComponent},
      { path: 'tunnistused', component: CertificatesComponent},
      { path: 'opingud', component: StudiesComponent},
      { path: 'opetan', component: TeachingsComponent},
      { path: '**', redirectTo: 'taotlused', pathMatch: 'full' }
    ]},

  { path: ':lang/isikukaart', component: PersonalDataComponent },
  { path: '', redirectTo: '/et', pathMatch: 'full' },
  { path: ':lang/404', component: NotFoundComponent },
  // { path: '**', component: NotFoundComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes, {useHash: false})],
    exports: [RouterModule]
})
export class AppRoutingModule { }

export const routedComponents = [
  ArticleComponent,
  FrontpageComponent,
  EventsComponent,
  EventsSingleComponent,
  PersonalDataComponent,
  NewsComponent,
  NewsSingleComponent,
  SchoolsComponent,
  SchoolsSingleComponent,
  StudyProgrammeComponent,
  StudyProgrammeSingleComponent,
  NotFoundComponent,
  StudyProgrammeCompareComponent,
  DashboardComponent,
  SchoolsFundingComponent,
  CertificatesComponent
];

