import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetsModule } from '@app/_assets';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { AuthInterceptor } from '@app/_interceptors';
import { TranslateModule } from '@app/_modules/translate';
import { StudyListItemComponent } from './components/study-list-item/study-list-item.component';
import { StudyListComponent } from './containers/study-list/study-list.component';
import {
  StudyListItemInlineElementsComponent,
} from './components/study-list-item-inline-elements/study-list-item-inline-elements.component';
import { StudyListFilterComponent } from './components/study-list-filter/study-list-filter.component';

const routes: Routes = [
  {
    path: '',
    component: StudyListComponent,
  },
];

@NgModule({
  declarations: [StudyListItemComponent, StudyListComponent, StudyListItemInlineElementsComponent, StudyListFilterComponent],
  imports: [
    CommonModule,
    AssetsModule,
    TranslateModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
  ],
  exports: [],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
})
export class StudyModule { }
