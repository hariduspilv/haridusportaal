import { NgModule } from '@angular/core';
import {
  BlockComponent,
  BlockContentComponent,
  BlockTitleComponent,
  BlockTabsComponent,
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
import AlertsService from '@app/_services/AlertsService';
import ModalService from '@app/_services/ModalService';
import { EmbedVideoService } from 'ngx-embed-video';
import { VideoComponent } from './video';
import { TranslateModule } from '@app/_modules/translate';
import { FeedbackComponent } from './feedback';
import { FormsModule } from '@angular/forms';
import { RippleService, SidemenuService, SidebarService } from '@app/_services';
import { MenuComponent, SidemenuItemComponent } from './menu';
import { HeaderComponent } from './header';
import { ModalComponent, ModalContentComponent } from './modal';
import { ScrollableContentComponent } from './scrollableContent';
import { SlugifyPipe } from 'ngx-pipes';
import { BaseLayout } from './base-layout';
import { ArticleLayout } from './article-layout';
import { SidebarComponent, SidebarLinksComponent, SidebarCategoriesComponent,
  SidebarContactComponent, SidebarArticlesComponent, SidebarDataComponent,
  SidebarActionsComponent, SidebarFactsComponent, SidebarLocationComponent,
  SidebarProgressComponent, SidebarRegisterComponent} from './sidebar';
import { ProgressBarComponent } from './progressBar';
import { TruncatePipe } from '@app/_pipes/truncate.pipe';
import { LocaleNumberPipe } from '@app/_pipes/localeNumber.pipe';
import { MapComponent } from './map';
import { AgmCoreModule } from '@agm/core';
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';
import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';

const pipes = [
  SlugifyPipe,
  TruncatePipe,
  LocaleNumberPipe,
];

const declarations = [
  BlockComponent,
  BlockContentComponent,
  BlockTitleComponent,
  BlockTabsComponent,
  ButtonComponent,
  LoaderComponent,
  SkeletonComponent,
  IconComponent,
  BreadcrumbsComponent,
  AccordionComponent,
  AccordionItemComponent,
  TableComponent,
  AlertsComponent,
  VideoComponent,
  FeedbackComponent,
  ModalComponent,
  ModalContentComponent,
  ScrollableContentComponent,
  MenuComponent,
  SidemenuItemComponent,
  HeaderComponent,
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
  ProgressBarComponent,
  MapComponent,
];

const exports = [

];

const providers = [
  AlertsService,
  EmbedVideoService,
  RippleService,
  ModalService,
  SidemenuService,
  SidebarService,
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
  ],
  exports: [...declarations, ...pipes, ...exports],
})
export class AssetsModule { }
