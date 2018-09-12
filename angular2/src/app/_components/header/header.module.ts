import { NgModule } from '@angular/core';
import { MaterialModule } from '@app/_core/material.module';
import { HeaderComponent } from './header.component';
import { RouterModule, Routes } from '@angular/router';
import { SideMenuService } from '@app/_services';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { SharedModule } from '@app/_core/shared.module';
import { LoginModule } from '@app/_components/login/login.module';
import { FormsModule } from '@angular/forms'

@NgModule({
  providers: [
    SideMenuService
  ],
  imports: [
    MaterialModule,
    RouterModule,
    CommonModule,
    SharedModule,
    LoginModule,
    FormsModule
  ],
  declarations: [
    HeaderComponent
  ],
  exports: [
    HeaderComponent
  ]
})

export class HeaderModule {}
