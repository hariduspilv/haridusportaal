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
  SchoolsFundingComponent,
  XjsonComponent,
  SearchComponent,
  OskaAreasComponent,
  OskaProfessionsComponent,
  OskaProfessionsCompareComponent,
  OskaSectorsComponent,
  OskaResultsComponent
} from './_views';
import { CertificatesDetailedComponent } from '@app/_components/certificates.detailed/certificates.detailed.component';
import { TeachingsDetailedComponent } from '@app/_components/teachings.detailed/teachings.detailed.component';
import { CertificatesComponent } from '@app/_components/certificates/certificates.component';
import { ApplicationsComponent } from '@app/_components/applications/applications.component';
import { StudiesComponent } from '@app/_components/studies/studies.component';
import { TeachingsComponent } from '@app/_components/teachings/teachings.component';
import { PreviewComponent } from '@app/_views/preview/preview.component';
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

  { path: ':lang/koolide-rahastus', component: SchoolsFundingComponent},
  { path: ':lang/school-funding', component: SchoolsFundingComponent},

  { path: ':lang/erialad/vordlus', component: StudyProgrammeCompareComponent},
  { path: ':lang/study-programmes/compare', component: StudyProgrammeCompareComponent},

  { path: ':lang/erialad', component: StudyProgrammeComponent},
  { path: ':lang/erialad/:id', component: StudyProgrammeSingleComponent},
  { path: ':lang/study-programmes', component: StudyProgrammeComponent},
  { path: ':lang/study-programmes/:id', component: StudyProgrammeSingleComponent},

  { path: ':lang/toolaud/tunnistused/:id', component: CertificatesDetailedComponent},
  { path: ':lang/dashboard/certificates/:id', component: CertificatesDetailedComponent},
  { path: ':lang/toolaud/opetan/:type', component: TeachingsDetailedComponent},
  { path: ':lang/dashboard/teachings/:type', component: TeachingsDetailedComponent},
  { path: ':lang/dashboard/applications/:form_name', component: XjsonComponent},
  { path: ':lang/toolaud/taotlused/:form_name', component: XjsonComponent},

  { path: ':lang/dashboard', component: DashboardComponent,
    children: [
      { path: 'applications', component: ApplicationsComponent},
      { path: 'certificates', component: CertificatesComponent},
      { path: 'studies', component: StudiesComponent},
      { path: 'teachings', component: TeachingsComponent},
      { path: '', redirectTo: 'applications', pathMatch: 'full' },
      { path: '**', redirectTo: ':lang/404', pathMatch: 'full' }
    ]
  },
  { path: ':lang/toolaud', component: DashboardComponent,
    children: [
      { path: 'taotlused', component: ApplicationsComponent},
      { path: 'tunnistused', component: CertificatesComponent},
      { path: 'opingud', component: StudiesComponent},
      { path: 'opetan', component: TeachingsComponent},
      { path: '', redirectTo: 'taotlused', pathMatch: 'full' },
      { path: '**', redirectTo: ':lang/404', pathMatch: 'full' }
    ]
  },

  { path: ':lang/professions/compare', component:OskaProfessionsCompareComponent},
  { path: ':lang/ametialad/vordlus', component:OskaProfessionsCompareComponent},
  { path: ':lang/professions', component:OskaProfessionsComponent},
  { path: ':lang/ametialad', component:OskaProfessionsComponent},
  { path: ':lang/sectors', component:OskaSectorsComponent},
  { path: ':lang/valdkonnad', component:OskaSectorsComponent},
  { path: ':lang/professions/:id', component:OskaAreasComponent},
  { path: ':lang/ametialad/:id', component: OskaAreasComponent },
  { path: ':lang/valdkonnad/:id', component:OskaAreasComponent},
  { path: ':lang/sectors/:id', component:OskaAreasComponent},
  { path: ':lang/oska-tulemused/:id', component:OskaResultsComponent},
  { path: ':lang/oska-results/:id', component:OskaResultsComponent},

  { path: ':lang/ulduuringud/:id', component:OskaAreasComponent},
  { path: ':lang/survey-pages/:id', component:OskaAreasComponent},
  
  { path: ':lang/otsing', component: SearchComponent },
  { path: ':lang/search', component: SearchComponent },

  { path: ':lang/isikukaart', component: PersonalDataComponent },

  { path: 'preview/:id', component: PreviewComponent },
  { path: '', redirectTo: '/et', pathMatch: 'full' },
  { path: ':lang/404', component: NotFoundComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes, {useHash: false})],
    exports: [RouterModule]
})
export class AppRoutingModule { }

/*
const components = [];
for( let i in appRoutes ){
  let current = appRoutes[i];
  if( current.component && components.indexOf( current.component ) == -1 ){ components.push( current.component); }
  if( current.children ){
    for( let ii in current.children ){
      let child = current.children[ii];
      if( child.component && components.indexOf( child.component ) == -1 ){ components.push( child.component); }
    }
  }
}
*/


export const routedComponents = [
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
  SchoolsFundingComponent,
  XjsonComponent,
  SearchComponent,
  OskaAreasComponent,
  OskaProfessionsComponent,
  OskaProfessionsCompareComponent,
  OskaSectorsComponent,
  OskaResultsComponent,
  CertificatesDetailedComponent,
  TeachingsDetailedComponent,
  CertificatesComponent,
  ApplicationsComponent,
  StudiesComponent,
  TeachingsComponent,
  PreviewComponent
];

