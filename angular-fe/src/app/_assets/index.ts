import { NgModule, APP_INITIALIZER } from '@angular/core';
import {
  BlockComponent,
  BlockContentComponent,
  BlockTitleComponent,
  BlockTabsComponent,
  BlockSecondaryTitleComponent,
  BlockSubTitleComponent,
} from './block';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button';
import { LoaderComponent } from './loader';
import { SkeletonComponent } from './skeleton';
import { IconComponent } from './icon';
import { BreadcrumbsComponent } from './breadcrumbs';
import { RouterModule } from '@angular/router';
import { AccordionComponent, AccordionItemComponent } from './accordion';
import { TableComponent } from './table';
import { AlertsComponent } from './alerts';
import { EmbedVideoService } from 'ngx-embed-video';
import { VideoComponent } from './video';
import { TranslateModule } from '@app/_modules/translate';
import { FeedbackComponent } from './feedback';
import { FormsModule } from '@angular/forms';
import { RecaptchaModule, RECAPTCHA_LANGUAGE, RecaptchaFormsModule } from 'ng-recaptcha';
import {
  RippleService,
  NgbDateCustomParserFormatter,
  AlertsService,
  SidemenuService,
  SidebarService,
  ModalService,
  AddressService,
} from '@app/_services';
import {
  NgbDatepickerModule,
  NgbTooltipModule,
  NgbDateParserFormatter,
} from '@ng-bootstrap/ng-bootstrap';
import { MenuComponent, SidemenuItemComponent } from './menu';
import { HeaderComponent } from './header';
import { ScrollableContentComponent } from './scrollableContent';
import { NgPipesModule } from 'ngx-pipes';
import { FormItemComponent } from './formItem';
import {
  RippleDirective,
  FiltersDirective,
 } from '@app/_directives';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalComponent, ModalContentComponent } from './modal';
import { BaseLayout } from './base-layout';
import { ArticleLayout } from './article-layout';
import {
  SidebarComponent, SidebarLinksComponent, SidebarCategoriesComponent,
  SidebarContactComponent, SidebarArticlesComponent, SidebarDataComponent,
  SidebarActionsComponent, SidebarFactsComponent, SidebarLocationComponent,
  SidebarProgressComponent, SidebarRegisterComponent,
} from './sidebar';
import { ProgressBarComponent } from './progressBar';
import { MapComponent } from './map';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { AgmCoreModule } from '@agm/core';
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';
import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';
import { LegendCurrencyPipe } from '@app/_pipes/legendCurrency.pipe';
import { EuroCurrencyPipe } from '@app/_pipes/euroCurrency.pipe';
import { ShareComponent } from './share';
import { ClipboardService } from 'ngx-clipboard';
import { LabelsComponent } from './labels';
import { FavouriteComponent } from './favourite';
import { LabeledSeparatorComponent } from './labeled-separator';
import { ListItemComponent } from './listItem/listItem.component';
import { MonthsToYearsPipe } from '@app/_pipes/monthsToYears.pipe';
import { RemoveProtocolPipe } from '@app/_pipes/removeProtocol.pipe';
import { LocaleNumberPipe } from '@app/_pipes/localeNumber';
import { ChartComponent } from './chart/chart.component';
import { UrlPipe } from '@app/_pipes/url.pipe';
import { SearchResultsComponent } from './searchResults';
import { SettingsService } from '@app/_services/SettingsService';
import { StudyProgrammesComponent } from './studyProgrammes/studyProgrammes.component';
import { SchoolsComponent } from './schools/schools.component';
import { NewsComponent } from './news/news.component';
import { MainProfessionsComponent } from './mainProfessions/mainProfessions.component';
import { InfoSystemComponent } from '@app/_views/infoSystem/infoSystem.component';
import { DashboardComponent } from '@app/_views/dashboard/dashboard.component';
import { TableService } from '@app/_services/tableService';
import { RootScopeService } from '@app/_services/RootScopeService';
import { ApplicationsComponent } from './applications/applications.component';
import { CertificatesComponent } from './certificates/certificates.component';

import { MoreBlockComponent } from './more.block/more.block.component';
import { EllipsisPipe } from '@app/_pipes/ellipsis.pipe';
import { DeviceDetectorService } from 'ngx-device-detector';
import { StudiesComponent } from './studies/studies.component';
import { TeachingsComponent } from './teachings/teachings.component';

export function settingsProviderFactory(provider: SettingsService) {
  return () => provider.load();
}

const pipes = [
  MonthsToYearsPipe,
  RemoveProtocolPipe,
  UrlPipe,
  LegendCurrencyPipe,
  EuroCurrencyPipe,
  LocaleNumberPipe,
  EllipsisPipe,
];

const declarations = [
  BlockComponent,
  BlockContentComponent,
  BlockTitleComponent,
  BlockSecondaryTitleComponent,
  BlockSubTitleComponent,
  BlockTabsComponent,
  ButtonComponent,
  LoaderComponent,
  SkeletonComponent,
  IconComponent,
  InfoSystemComponent,
  BreadcrumbsComponent,
  AccordionComponent,
  AccordionItemComponent,
  TableComponent,
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
  StudyProgrammesComponent,
  SchoolsComponent,
  ProgressBarComponent,
  MapComponent,
  ShareComponent,
  LabelsComponent,
  FavouriteComponent,
  LabeledSeparatorComponent,
  ChartComponent,
  ListItemComponent,
  MonthsToYearsPipe,
  RemoveProtocolPipe,
  UrlPipe,
  SearchResultsComponent,
  NewsComponent,
  DashboardComponent,
  ApplicationsComponent,
  MoreBlockComponent,
  CertificatesComponent,
  StudiesComponent,
  TeachingsComponent,
];

const exports = [
  NgbTooltipModule,
];

const providers = [
  EmbedVideoService,
  RippleService,
  { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ModalService,
  SidemenuService,
  SidebarService,
  ClipboardService,
  SettingsService,
  RootScopeService,
  AlertsService,
  DeviceDetectorService,
  AddressService,
  TableService,
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

@NgModule({
  providers,
  declarations: [...declarations, ...pipes],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    FormsModule,
    AgmJsMarkerClustererModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyD0sqq4HN0rVOzSvsMmLhFerPYO67R_e7E',
    }),
    AgmSnazzyInfoWindowModule,
    NgbDatepickerModule,
    NgPipesModule,
    NgSelectModule,
    NgbTooltipModule,
    RecaptchaModule.forRoot(),
    RecaptchaFormsModule,
    Ng2GoogleChartsModule,
  ],
  exports: [...declarations, ...pipes, ...exports],
})
export class AssetsModule { }
