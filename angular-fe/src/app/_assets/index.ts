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
import ModalService from '@app/_services/ModalService';
import { EmbedVideoService } from 'ngx-embed-video';
import { VideoComponent } from './video';
import { TranslateModule } from '@app/_modules/translate';
import { FeedbackComponent } from './feedback';
import { FormsModule } from '@angular/forms';
import { RippleService, NgbDateCustomParserFormatter, AlertsService, SidemenuService } from '@app/_services';
import { NgbModule, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { MenuComponent, SidemenuItemComponent } from './menu';
import { HeaderComponent } from './header';
import { ModalComponent, ModalContentComponent } from './modal';
import { ScrollableContentComponent } from './scrollableContent';
import { NgPipesModule } from 'ngx-pipes';
import { FormItemComponent } from './formItem';
import { RippleDirective } from '@app/_directives/rippleDirective';
import { NgSelectModule } from '@ng-select/ng-select';
import { BaseLayout } from './base-layout';

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
  FormItemComponent,
  RippleDirective,
  BaseLayout,
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
];

@NgModule({
  providers,
  declarations: [...declarations],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    FormsModule,
    NgbModule,
    NgPipesModule,
    NgSelectModule,
  ],
  exports: [...declarations, ...exports],
})
export class AssetsModule { }
