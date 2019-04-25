import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  ArticleComponent,
  FrontpageComponent,
  OskaFrontPageComponent,
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
  XjsonFormComponent,
  SearchComponent,
  OskaAreasComponent,
  OskaProfessionsComponent,
  OskaProfessionsCompareComponent,
  OskaSectorsComponent,
  OskaResultsComponent,
  OskaResultsTableComponent,
  CertificateCheckComponent,
  OskaSectorsCompareComponent
} from './_views';
import { CertificatesDetailedComponent } from '@app/_components/certificates.detailed/certificates.detailed.component';
import { TeachingsDetailedComponent } from '@app/_components/teachings.detailed/teachings.detailed.component';
import { CertificatesComponent } from '@app/_components/certificates/certificates.component';
import { ApplicationsComponent } from '@app/_components/applications/applications.component';
import { StudiesComponent } from '@app/_components/studies/studies.component';
import { TeachingsComponent } from '@app/_components/teachings/teachings.component';
import { PreviewComponent } from '@app/_views/preview/preview.component';
import { VariablesComponent } from './_views/variables/variables.component';
const appRoutes: Routes = [

  { path: '', component: FrontpageComponent },
  { path: 'oska', component: OskaFrontPageComponent },
  
  { path: 'artiklid/:id', component: ArticleComponent },
  { path: 'uudised', component: NewsComponent },
  { path: 'uudised/:id', component: NewsSingleComponent },
  { path: 'sündmused', component: EventsComponent },
  { path: 'sündmused/:id', component: EventsSingleComponent },
  { path: 'kool', component: SchoolsComponent },
  { path: 'kool/:id', component: SchoolsSingleComponent },

  { path: 'koolide-rahastus', component: SchoolsFundingComponent },

  { path: 'erialad/võrdlus', component: StudyProgrammeCompareComponent},

  { path: 'erialad', component: StudyProgrammeComponent},
  { path: 'erialad/:id', component: StudyProgrammeSingleComponent},

  { path: 'tunnistuse-kehtivuse-kontroll', component: CertificateCheckComponent },

  { path: 'vormid/:form_name', component: XjsonFormComponent },
  
  { path: 'töölaud/tunnistused/:id', component: CertificatesDetailedComponent},
  { path: 'töölaud/õpetan/:type', component: TeachingsDetailedComponent},
  { path: 'töölaud/taotlused/:form_name', component: XjsonComponent},
  { path: 'töölaud', component: DashboardComponent,
    children: [
      // { path: 'taotlused', component: ApplicationsComponent},
      { path: 'tunnistused', component: CertificatesComponent},
      { path: 'õpingud', component: StudiesComponent},
      { path: 'õpetan', component: TeachingsComponent},
      { path: 'taotlused', redirectTo: 'tunnistused', pathMatch: 'full' },
      { path: '', redirectTo: 'tunnistused', pathMatch: 'full' },
      { path: '**', redirectTo: '404', pathMatch: 'full' }
    ]
  },

  { path: 'login/cancel', redirectTo: '' },
  { path: 'ametialad/võrdlus', component: OskaProfessionsCompareComponent},
  { path: 'ametialad', component: OskaProfessionsComponent},
  { path: 'valdkonnad', component: OskaSectorsComponent},
  { path: 'valdkonnad/andmed', component: OskaSectorsCompareComponent},
  { path: 'ametialad/:id', component: OskaAreasComponent},
  { path: 'valdkonnad/:id', component: OskaAreasComponent},
  { path: 'oska-tulemused/ettepanekute-elluviimine', component: OskaResultsTableComponent},
  { path: 'oska-tulemused/:id', component: OskaResultsComponent},

  { path: 'tööjõuprognoos/:id', component: OskaAreasComponent},
  
  { path: 'otsing', component: SearchComponent },

  { path: 'isikukaart', component: PersonalDataComponent },
  { path: 'variables', component: VariablesComponent },

  { path: 'preview/:id', component: PreviewComponent },
  { path: '404', component: NotFoundComponent },
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
  OskaFrontPageComponent,
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
  XjsonFormComponent,
  SearchComponent,
  OskaAreasComponent,
  OskaProfessionsComponent,
  OskaProfessionsCompareComponent,
  OskaSectorsComponent,
  OskaSectorsCompareComponent,
  OskaResultsComponent,
  OskaResultsTableComponent,
  CertificatesDetailedComponent,
  TeachingsDetailedComponent,
  CertificatesComponent,
  ApplicationsComponent,
  StudiesComponent,
  TeachingsComponent,
  PreviewComponent,
  CertificateCheckComponent,
  VariablesComponent
];

