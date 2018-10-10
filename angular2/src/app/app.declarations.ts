import { routedComponents } from './app.routing.module';
import { BreadcrumbsComponent } from './_components/breadcrumbs/breadcrumbs.component';
import { ShareComponent } from './_components/share/share.component';
import { SearchComponent } from './_views/search/search.component';
import { SchoolStudyProgrammesComponent } from './_components/school.study.programmes/school.study.programmes.component';
import { MapWrapperComponent } from './_components/map.wrapper/map.wrapper.component';
import { CompareComponent } from './_components/compare/compare.component';
import { RelatedStudyProgrammesComponent } from './_components/related.studyProgrammes/related.studyProgrammes.component';
import { RecentEventsComponent } from './_components/recent.events/recent.events.component';
import { FavouritesComponent } from './_components/favourites/favourites.component';
import { FavouritesListComponent } from './_components/favouritesList/favouritesList.component';
import { CertificatesComponent } from '@app/_components/certificates/certificates.component';
import { CertificatesDetailedComponent } from '@app/_components/certificates.detailed/certificates.detailed.component';
import { TeachingsDetailedComponent } from '@app/_components/teachings.detailed/teachings.detailed.component';
import { ApplicationsComponent } from '@app/_components/applications/applications.component';
import { StudiesComponent } from '@app/_components/studies/studies.component';
import { TeachingsComponent } from '@app/_components/teachings/teachings.component';
import { XjsonComponent } from '@app/_views/xjson/xjson.component';
import { EventsRegistratonDialog } from './_components/dialogs/events.registration/events.registration.dialog';
import { ImagePopupDialog } from './_components/dialogs/image.popup/image.popup.dialog';
import { Modal } from './_components/dialogs/modal/modal';
import { TableModal } from './_components/dialogs/table.modal/table.modal';
import { VideoComponent } from './_components/video/video.component';
import { StudyProgrammeCompareComponent } from './_views/studyProgramme.compare/studyProgramme.compare.component';
import { ConfirmPopupDialog } from '@app/_components/dialogs/confirm.popup/confirm.popup.dialog';

export const AppDeclarations = [
  routedComponents,
  EventsRegistratonDialog,
  ImagePopupDialog,
  BreadcrumbsComponent,
  ShareComponent,
  Modal,
  TableModal,
  VideoComponent,
  SchoolStudyProgrammesComponent,
  StudyProgrammeCompareComponent,
  MapWrapperComponent,
  CompareComponent,
  RelatedStudyProgrammesComponent,
  RecentEventsComponent,
  FavouritesComponent,
  FavouritesListComponent,
  CertificatesComponent,
  CertificatesDetailedComponent,
  TeachingsDetailedComponent,
  ApplicationsComponent,
  StudiesComponent,
  TeachingsComponent,
  XjsonComponent,
  SearchComponent,
  ConfirmPopupDialog
];

export const AppEntryComponents = [
  EventsRegistratonDialog,
  ImagePopupDialog,
  TableModal,
  Modal,
  VideoComponent,
  StudyProgrammeCompareComponent,
  ConfirmPopupDialog
]
