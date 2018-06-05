import { NgModule } from '@angular/core';
import { MaterialModule } from '../../_core/material.module';
import { HeaderComponent } from './header.component';
import { RouterModule, Routes } from '@angular/router';
import { SideMenuService } from '../../_services';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { SharedModule } from '../../_core/shared.module';

@NgModule({
  providers: [
    SideMenuService
  ],
  imports: [
    MaterialModule,
    RouterModule,
    CommonModule,
    SharedModule
  ],
  declarations: [
    HeaderComponent
  ],
  exports: [
    HeaderComponent
  ]
})

export class HeaderModule {}
