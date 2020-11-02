import { APP_INITIALIZER, NgModule } from '@angular/core';
import {
  BlockComponent,
  BlockContentComponent,
  BlockSecondaryTitleComponent,
  BlockSubTitleComponent,
  BlockTabsComponent,
  BlockTitleComponent,
  BlockSecondaryTitleSubtextComponent,
} from './block';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button';
import { LoaderComponent } from './loader';
import { SkeletonComponent } from './skeleton';
import { IconComponent } from './icon';
import { BreadcrumbsComponent } from './breadcrumbs';
import { RouterModule } from '@angular/router';
import { AccordionComponent, AccordionItemComponent } from './accordion';
import { SchoolTable, StudyProgrammeTable, TableComponent } from './table';
import { AlertsComponent } from './alerts';
import { VideoComponent } from './video';
import { TranslateModule } from '@app/_modules/translate';
import { FeedbackComponent } from './feedback';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RECAPTCHA_LANGUAGE, RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';
import {
  AnalyticsService,
  AuthService,
  ModalService,
  NgbDateCustomParserFormatter,
  RippleService,
  ScrollRestorationService,
  SettingsService,
  SidebarService,
  SidemenuService,
  UploadService,
} from '@app/_services';
import {
  NgbDateParserFormatter,
  NgbDatepickerModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { MenuComponent, SidemenuItemComponent } from './menu';
import { HeaderComponent } from './header';
import { ScrollableContentComponent } from './scrollableContent';
import { NgPipesModule } from 'ngx-pipes';
import { FormItemComponent } from './formItem';
import {
  AnalyticsEvent,
  CornerLogoDirective,
  FiltersDirective,
  RippleDirective,
  RotateTableDirective,
  ScrollToDirective,
} from '@app/_directives';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalComponent, ModalContentComponent } from './modal';
import { BaseLayout } from './base-layout';
import { ArticleLayout } from './article-layout';
import {
  SidebarActionsComponent,
  SidebarArticlesComponent,
  SidebarCategoriesComponent,
  SidebarComponent,
  SidebarContactComponent,
  SidebarDataComponent,
  SidebarEventsComponent,
  SidebarFactsComponent,
  SidebarFinalDocumentAccessComponent,
  SidebarFinalDocumentDownloadComponent,
  SidebarFinalDocumentHistoryComponent,
  SidebarGdprComponent,
  SidebarLinksComponent,
  SidebarLocationComponent,
  SidebarNotificationsComponent,
  SidebarProgressComponent,
  SidebarRegisterComponent,
} from './sidebar';
import { ProgressBarComponent } from './progressBar';
import { MapComponent } from './map';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { AgmCoreModule } from '@agm/core';
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';
import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';
import { ShareComponent } from './share';
import { ClipboardService } from 'ngx-clipboard';
import { LabelsComponent } from './labels';
import { FavouriteComponent } from './favourite';
import { LabeledSeparatorComponent } from './labeled-separator';
import { ListItemComponent } from './listItem/listItem.component';
import { ChartComponent } from './chart/chart.component';
import { SearchResultsComponent } from './searchResults';
import { StudyProgrammesComponent } from './studyProgrammes/studyProgrammes.component';
import { SchoolsComponent } from './schools/schools.component';
import { NewsComponent } from './news/news.component';
import { MainProfessionsComponent } from './mainProfessions/mainProfessions.component';
import { CompareComponent } from './compare';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { AutocompleteComponent } from './autocomplete';
import { DropdownListComponent } from './dropdown-list/dropdown-list.component';
import { Triangles } from './shapes/triangles/triangles';
import { Circles } from './shapes/circles/circles';
import { TooltipComponent } from './tooltip';
import { ImageComponent } from './images';
import { LinksComponent } from './links';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';

import { ModuleWithProviders } from '@angular/compiler/src/core';
import { InfographComponent } from './infograph/infograph.component';
import { InlineLinksComponent } from './inline-links/inline-links.component';
import { InlineArticlesComponent } from './inline-articles/inline-articles.component';
import { ArticlesSingleComponent } from './articles-single/articles-single.component';
import { NewsletterOrderComponent } from './newsletter-order/newsletter-order.component';
import { PictoComponent } from './picto';
import { TableService } from '@app/_services/tableService';
import { AddressService } from '@app/_services/AddressService';
import { AppPipes } from '@app/_pipes';
import { RelatedStudyProgrammesListComponent } from './relatedStudyprogrammesList/relatedStudyProgrammesList.component';
import { QueryParamsService } from '@app/_services/QueryParams.service';
import { RelatedEventsComponent } from './relatedEvents';
import { NotFoundComponent } from './notFound';
import { SessionExpirationComponent } from './sessionExpiration';
import { MoreBlockComponent } from './more.block/more.block.component';
import { CertificateComponent } from './certificate/certificate.component';
import { GradeSheetComponent } from './grade-sheet/gradeSheet.component';
import { DocumentCheckComponent } from './document-check/documentCheck.component';
import { A11yModule } from '@angular/cdk/a11y';

export function settingsProviderFactory(provider: SettingsService) {
  return () => provider.load();
}

const pipes = [];

const declarations = [
  BlockComponent,
  BlockContentComponent,
  BlockTitleComponent,
  BlockSecondaryTitleComponent,
  BlockSecondaryTitleSubtextComponent,
  BlockTabsComponent,
  ButtonComponent,
  LoaderComponent,
  SkeletonComponent,
  IconComponent,
  BreadcrumbsComponent,
  AccordionComponent,
  AccordionItemComponent,
  TableComponent,
  SchoolTable,
  StudyProgrammeTable,
  AlertsComponent,
  VideoComponent,
  FeedbackComponent,
  ScrollableContentComponent,
  MenuComponent,
  SidemenuItemComponent,
  HeaderComponent,
  FormItemComponent,
  RippleDirective,
  FiltersDirective,
  ScrollToDirective,
  RotateTableDirective,
  CornerLogoDirective,
  ModalComponent,
  ModalContentComponent,
  MainProfessionsComponent,
  BaseLayout,
  ArticleLayout,
  SidebarComponent,
  SidebarLinksComponent,
  SidebarCategoriesComponent,
  SidebarContactComponent,
  SidebarArticlesComponent,
  SidebarDataComponent,
  SidebarActionsComponent,
  SidebarFactsComponent,
  SidebarLocationComponent,
  SidebarProgressComponent,
  SidebarRegisterComponent,
  SidebarEventsComponent,
  SidebarNotificationsComponent,
  SidebarGdprComponent,
  SidebarFinalDocumentAccessComponent,
  SidebarFinalDocumentDownloadComponent,
  SidebarFinalDocumentHistoryComponent,
  StudyProgrammesComponent,
  SchoolsComponent,
  ProgressBarComponent,
  MapComponent,
  ShareComponent,
  LabelsComponent,
  FavouriteComponent,
  LabeledSeparatorComponent,
  ChartComponent,
  InfographComponent,
  ListItemComponent,
  SearchResultsComponent,
  NewsComponent,
  AutocompleteComponent,
  CompareComponent,
  ImageComponent,
  LinksComponent,
  // HomeSearchListViewComponent,
  DropdownListComponent,
  // frontpage stuff, delete after remake
  Triangles,
  Circles,
  InlineLinksComponent,
  InlineArticlesComponent,
  ArticlesSingleComponent,
  NewsletterOrderComponent,
  //
  PictoComponent,
  BlockSubTitleComponent,
  RelatedStudyProgrammesListComponent,
  RelatedEventsComponent,
  AnalyticsEvent,
  NotFoundComponent,
  SessionExpirationComponent,
  MoreBlockComponent,
  CertificateComponent,
  GradeSheetComponent,
  DocumentCheckComponent,
  TooltipComponent,
];

const exports = [NgbTooltipModule];

const providers = [
  RippleService,
  { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ModalService,
  SidemenuService,
  SidebarService,
  ClipboardService,
  TableService,
  AddressService,
  SettingsService,
  UploadService,
  AuthService,
  QueryParamsService,
  ScrollRestorationService,
  AnalyticsService,
  {
    provide: RECAPTCHA_LANGUAGE,
    useValue: 'et',
  },
  {
    provide: APP_INITIALIZER,
    useFactory: settingsProviderFactory,
    deps: [SettingsService],
    multi: true,
  },
];

const imports = [
  CommonModule,
  RouterModule,
  TranslateModule,
  FormsModule,
  AppPipes,
  AgmJsMarkerClustererModule,
  AgmCoreModule.forRoot({
    apiKey: 'AIzaSyD0sqq4HN0rVOzSvsMmLhFerPYO67R_e7E',
    language: 'et',
  }),
  AgmSnazzyInfoWindowModule,
  NgbDatepickerModule,
  NgPipesModule,
  NgSelectModule,
  NgbTooltipModule,
  RecaptchaModule,
  RecaptchaFormsModule,
  Ng2GoogleChartsModule,
  DeviceDetectorModule.forRoot(),
  HttpClientJsonpModule,
  HttpClientModule,
  ReactiveFormsModule,
  A11yModule,
];

@NgModule({
  imports,
  declarations: [...declarations],
  exports: [...declarations, ...exports],
})

export class AssetsModule {
  static forRoot(): ModuleWithProviders {
    return {
      providers,
      ngModule: AssetsModule,
    };
  }
}
