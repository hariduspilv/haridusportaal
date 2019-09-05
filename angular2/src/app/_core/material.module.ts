import { NgModule, ViewChild } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions } from '@angular/material';
export const customTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 100,
  hideDelay: 100,
  touchendHideDelay: 6000
};
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatButtonToggleModule,
  MatCheckboxModule,
  MatChipsModule,
  MatCommonModule,
  MatNativeDateModule,
  MatOptionModule,
  MatRippleModule,
  MatPseudoCheckboxModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatSelectModule,
  MatSidenavModule,
  MatSnackBarModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';

@NgModule({
    imports: [
      MatCardModule,
      MatAutocompleteModule,
      MatButtonModule,
      MatButtonToggleModule,
      MatCheckboxModule,
      MatChipsModule,
      MatCommonModule,
      MatNativeDateModule,
      MatOptionModule,
      MatRippleModule,
      MatPseudoCheckboxModule,
      MatDatepickerModule,
      MatDialogModule,
      MatDividerModule,
      MatExpansionModule,
      MatFormFieldModule,
      MatIconModule,
      MatInputModule,
      MatMenuModule,
      MatProgressSpinnerModule,
      MatRadioModule,
      MatSelectModule,
      MatSidenavModule,
      MatSnackBarModule,
      MatToolbarModule,
      MatTooltipModule,
      BrowserAnimationsModule
    ],
    exports: [
      MatCardModule,
      MatAutocompleteModule,
      MatButtonModule,
      MatButtonToggleModule,
      MatCheckboxModule,
      MatChipsModule,
      MatCommonModule,
      MatNativeDateModule,
      MatOptionModule,
      MatRippleModule,
      MatPseudoCheckboxModule,
      MatDatepickerModule,
      MatDialogModule,
      MatDividerModule,
      MatExpansionModule,
      MatFormFieldModule,
      MatIconModule,
      MatInputModule,
      MatMenuModule,
      MatProgressSpinnerModule,
      MatRadioModule,
      MatSelectModule,
      MatSidenavModule,
      MatSnackBarModule,
      MatToolbarModule,
      MatTooltipModule,
      BrowserAnimationsModule
    ],
    providers: [
      { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: customTooltipDefaults }
    ]
})

export class MaterialModule {}
