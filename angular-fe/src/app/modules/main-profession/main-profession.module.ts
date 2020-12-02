import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainProfessionListComponent } from './components/main-profession-list/main-profession-list.component';
import { MainProfessionDetailComponent } from './components/main-profession-detail/main-profession-detail.component';
import { MainProfessionDataComponent } from './components/main-profession-data/main-profession-data.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: MainProfessionListComponent,
  },
];

@NgModule({
  declarations: [
    MainProfessionListComponent,
    MainProfessionDetailComponent,
    MainProfessionDataComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
})
export class MainProfessionModule { }
