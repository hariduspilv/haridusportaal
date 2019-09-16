import { NgModule } from '@angular/core';

import { ToggleClassDirective } from './toggleClass.directive';
import { DateFormatterDirective } from './dateFormatter.directive';
import { FormItemStatesDirective } from './formItemStates';
import { numberFormatterDirective } from './numberFormatter.directive';
import { KeystrokesDirective } from './keystrokes.directive';
import { RotateTableDirective } from './rotateTable';

@NgModule({
	declarations: [
		ToggleClassDirective,
		DateFormatterDirective,
		FormItemStatesDirective,
		numberFormatterDirective,
		KeystrokesDirective,
		RotateTableDirective,

	],
	exports: [
		ToggleClassDirective,
		DateFormatterDirective,
		FormItemStatesDirective,
		numberFormatterDirective,
		KeystrokesDirective,
		RotateTableDirective,
	]
})

export class AppDirectives {}