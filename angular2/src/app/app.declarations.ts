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
import { DashboardFormDialog } from './_components/dialogs/dashboard.form/dashboard.form.dialog';
import { ImagePopupDialog } from './_components/dialogs/image.popup/image.popup.dialog';
import { Modal } from './_components/dialogs/modal/modal';
import { TableModal } from './_components/dialogs/table.modal/table.modal';
import { CheckModal } from './_components/dialogs/check.modal/check.modal';
import { VideoComponent } from './_components/video/video.component';
import { StudyProgrammeCompareComponent } from './_views/studyProgramme.compare/studyProgramme.compare.component';
import { ConfirmPopupDialog } from '@app/_components/dialogs/confirm.popup/confirm.popup.dialog';
import { EventsListComponent } from '@app/_components/eventsList/eventsList.component';
import { ArticlesSingleComponent } from '@app/_components/articles.single/articles.single';
import { InlineArticlesComponent } from '@app/_components/inline.articles/inline.articles';
import { InlineLinksComponent } from '@app/_components/inline.links/inline.links';
import { Triangles } from '@app/_components/shapes/triangles/triangles';
import { Circles } from '@app/_components/shapes/circles/circles';
import { SideMenuComponent } from '@app/_components/sidemenu/sidemenu.component';
import { ChartComponent } from './_components/chart/chart.component';
import { taraLoginModal } from './_components/dialogs/taraLogin/taraLogin.modal';
import { CookieNotification } from './_components/cookieNotification/cookieNotification.component';
import { FeedbackComponent } from './_components/feedback/feedback.component';
import { LoginModal } from './_components/dialogs/login.modal/login.modal'; 
import { SearchModal } from './_components/dialogs/search.modal/search.modal'; 
import { NotificationComponent } from './_components/notifications/notification.component';
import { InfosystemSingle } from './_views/infosystem.single/infosystem.single.component';
import { PictoComponent } from './_components/picto/picto.component';


export const AppDeclarations = [
  routedComponents,
  EventsRegistratonDialog,
  DashboardFormDialog,
  ImagePopupDialog,
  BreadcrumbsComponent,
  ShareComponent,
  Modal,
  TableModal,
  CheckModal,
  taraLoginModal,
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
  ConfirmPopupDialog,
  SideMenuComponent,
  ChartComponent,
  EventsListComponent,
  ArticlesSingleComponent,
  InlineArticlesComponent,
  InlineLinksComponent,
  Triangles,
  Circles,
  CookieNotification,
  FeedbackComponent,
  LoginModal,
  SearchModal,
  NotificationComponent,
  InfosystemSingle,
  PictoComponent,
];

export const AppEntryComponents = [
  EventsRegistratonDialog,
  DashboardFormDialog,
  ImagePopupDialog,
  TableModal,
  CheckModal,
  taraLoginModal,
  Modal,
  VideoComponent,
  StudyProgrammeCompareComponent,
  ConfirmPopupDialog,
  LoginModal,
  SearchModal,
]
