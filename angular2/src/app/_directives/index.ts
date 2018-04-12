import { NgModule } from '@angular/core';

import { ToggleClassDirective } from './toggleClass.directive';

@NgModule({
    declarations: [
        ToggleClassDirective
    ],
    exports: [
        ToggleClassDirective
    ]
})
export class AppDirectives {}
