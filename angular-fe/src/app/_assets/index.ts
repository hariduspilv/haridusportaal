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
import { TableComponent, SchoolTable, StudyProgrammeTable } from './table';
import { AlertsComponent } from './alerts';
import { EmbedVideoService } from 'ngx-embed-video';
import { VideoComponent } from './video';
import { TranslateModule } from '@app/_modules/translate';
import { FeedbackComponent } from './feedback';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RecaptchaModule, RECAPTCHA_LANGUAGE, RecaptchaFormsModule } from 'ng-recaptcha';
import {
  RippleService,
  NgbDateCustomParserFormatter,
  AlertsService,
  SidemenuService,
  SidebarService,
  ModalService,
  SettingsService,
  AuthService,
  UploadService,
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
  RotateTableDirective,
 } from '@app/_directives';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalComponent, ModalContentComponent } from './modal';
import { BaseLayout } from './base-layout';
import { ArticleLayout } from './article-layout';
import {
  SidebarComponent, SidebarLinksComponent, SidebarCategoriesComponent,
  SidebarContactComponent, SidebarArticlesComponent, SidebarDataComponent,
  SidebarActionsComponent, SidebarFactsComponent, SidebarLocationComponent,
  SidebarProgressComponent, SidebarRegisterComponent, SidebarEventsComponent,
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
import { CompareViewComponent } from './compare.view';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { AutocompleteComponent } from './autocomplete';
import { DropdownListComponent } from './dropdown-list/dropdown-list.component';
import { Triangles } from './shapes/triangles/triangles';
import { Circles } from './shapes/circles/circles';

export function settingsProviderFactory(provider: SettingsService) {
  return () => provider.load();
}
import { ImageComponent } from './image';
import { LinksComponent } from './links';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import {
  HomeSearchListViewComponent,
} from '@app/_views/homeSearchListView/homeSearchListView.component';

import { ModuleWithProviders } from '@angular/compiler/src/core';
import { InfographComponent } from './infograph/infograph.component';
import { InlineLinksComponent } from './inline-links/inline-links.component';
import { InlineArticlesComponent } from './inline-articles/inline-articles.component';
import { ArticlesSingleComponent } from './articles-single/articles-single.component';
import { NewsletterOrderComponent } from './newsletter-order/newsletter-order.component';
import { PictoComponent } from './picto';
import { InfoSystemComponent } from '@app/_views/infoSystem/infoSystem.component';
import { TableService } from '@app/_services/tableService';
import { AddressService } from '@app/_services/AddressService';
import { XjsonComponent } from '@app/_views/xjson/xjson.component';

const pipes = [];

import { AppPipes } from '@app/_pipes';

const declarations = [
  BlockComponent,
  BlockContentComponent,
  BlockTitleComponent,
  BlockSecondaryTitleComponent,
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
  RotateTableDirective,
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
  HomeSearchListViewComponent,
  CompareViewComponent,
  DropdownListComponent,
  // frontpage stuff, delete after remake
  Triangles,
  Circles,
  InlineLinksComponent,
  InlineArticlesComponent,
  ArticlesSingleComponent,
  NewsletterOrderComponent,
  PictoComponent,
  BlockSubTitleComponent,
  XjsonComponent,
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
  TableService,
  AddressService,
  SettingsService,
  UploadService,
  AuthService,
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
  declarations: [...declarations],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    FormsModule,
    AppPipes,
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
    DeviceDetectorModule.forRoot(),
    HttpClientJsonpModule,
    HttpClientModule,
    ReactiveFormsModule,
  ],
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
