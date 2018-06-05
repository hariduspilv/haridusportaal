import { NgModule } from '@angular/core';

import { ToggleClassDirective } from './toggleClass.directive';
import { DateFormatterDirective } from './dateFormatter.directive';

@NgModule({
    declarations: [
        ToggleClassDirective,
        DateFormatterDirective
    ],
    exports: [
        ToggleClassDirective,
        DateFormatterDirective
    ]
})
export class AppDirectives {}
