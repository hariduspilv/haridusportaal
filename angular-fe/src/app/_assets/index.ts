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
import { EmbedVideoService } from 'ngx-embed-video';
import { VideoComponent } from './video';
import { TranslateModule } from '@app/_modules/translate';
import { FeedbackComponent } from './feedback';
import { FormsModule } from '@angular/forms';
import { RippleService, NgbDateCustomParserFormatter, AlertsService,
  SidemenuService, SidebarService, ModalService } from '@app/_services';
import { NgbModule, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { MenuComponent, SidemenuItemComponent } from './menu';
import { HeaderComponent } from './header';
import { ScrollableContentComponent } from './scrollableContent';
import { NgPipesModule } from 'ngx-pipes';
import { FormItemComponent } from './formItem';
import { RippleDirective } from '@app/_directives/rippleDirective';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalComponent, ModalContentComponent } from './modal';
import { BaseLayout } from './base-layout';
import { ArticleLayout } from './article-layout';
import { SidebarComponent, SidebarLinksComponent, SidebarCategoriesComponent,
  SidebarContactComponent, SidebarArticlesComponent, SidebarDataComponent,
  SidebarActionsComponent, SidebarFactsComponent, SidebarLocationComponent,
  SidebarProgressComponent, SidebarRegisterComponent} from './sidebar';
import { ProgressBarComponent } from './progressBar';
import { MapComponent } from './map';
import { AgmCoreModule } from '@agm/core';
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';
import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';
import { LegendCurrencyPipe } from '@app/_pipes/legendCurrency.pipe';
import { EuroCurrencyPipe } from '@app/_pipes/euroCurrency.pipe';

const pipes =  [LegendCurrencyPipe, EuroCurrencyPipe];

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
  ScrollableContentComponent,
  MenuComponent,
  SidemenuItemComponent,
  HeaderComponent,
  FormItemComponent,
  RippleDirective,
  ModalComponent,
  ModalContentComponent,
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
  { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ModalService,
  SidemenuService,
  SidebarService,
];

@NgModule({
  providers,
  declarations: [...declarations, pipes],
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
    NgbModule,
    NgPipesModule,
    NgSelectModule,
  ],
  exports: [...declarations, ...pipes, ...exports],
})
export class AssetsModule { }
