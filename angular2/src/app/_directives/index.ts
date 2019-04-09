import { NgModule } from '@angular/core';

import { ToggleClassDirective } from './toggleClass.directive';
import { DateFormatterDirective } from './dateFormatter.directive';
import { FormItemStatesDirective } from './formItemStates';
import { numberFormatterDirective } from './numberFormatter.directive';

@NgModule({
	declarations: [
		ToggleClassDirective,
		DateFormatterDirective,
		FormItemStatesDirective,
		numberFormatterDirective

	],
	exports: [
		ToggleClassDirective,
		DateFormatterDirective,
		FormItemStatesDirective,
		numberFormatterDirective
	]
})

export class AppDirectives {}