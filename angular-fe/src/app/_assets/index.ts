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
  AlertsComponent
];

const exports = [

];

const providers = [
  AlertsService
]

@NgModule({
  declarations,
  providers,
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [...declarations, ...exports],
})
export class AssetsModule { }
