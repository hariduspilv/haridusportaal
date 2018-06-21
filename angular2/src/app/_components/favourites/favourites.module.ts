import { NgModule } from '@angular/core';
import { MaterialModule } from '../../_core/material.module';
import { FavouritesComponent } from './favourites.component';

@NgModule({
  imports: [
    MaterialModule,
  ],
  declarations: [
    FavouritesComponent
  ],
  exports: [
    FavouritesComponent
  ]
})

export class HeaderModule {}
