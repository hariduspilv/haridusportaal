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
import { EmbedVideoService } from 'ngx-embed-video';
import { VideoComponent } from './video';
import { TranslateModule } from '@app/_modules/translate';
import { FeedbackComponent } from './feedback';
import { FormsModule } from '@angular/forms';
import { RippleService } from '@app/_services';
import { MenuComponent, SidemenuItemComponent } from './menu';
import { HeaderComponent } from './header';
import { SlugifyPipe } from 'ngx-pipes';

const pipes = [
  SlugifyPipe,
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
  MenuComponent,
  SidemenuItemComponent,
  HeaderComponent,
  ...pipes,
];

const exports = [

];

const providers = [
  AlertsService,
  EmbedVideoService,
  RippleService,
];

@NgModule({
  declarations,
  providers,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    FormsModule,
  ],
  exports: [...declarations, ...exports],
})
export class AssetsModule { }
