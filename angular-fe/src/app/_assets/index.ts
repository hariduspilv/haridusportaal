import { NgModule } from '@angular/core';
import {
  BlockComponent,
  BlockContentComponent,
  BlockTitleComponent,
  BlockTabsComponent,
 } from './block/block.component';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button/button.component';
import { LoaderComponent } from './loader/loader.component';
import { SkeletonComponent } from './skeleton/skeleton.component';
import { IconComponent } from './icon/icon.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
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
];

const exports = [

];

const providers = [
  AlertsService,
  EmbedVideoService,
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
