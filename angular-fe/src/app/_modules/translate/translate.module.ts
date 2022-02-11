import { NgModule, APP_INITIALIZER, ModuleWithProviders } from '@angular/core';
import { TranslatePipe } from './translate.pipe';
import { TranslateService } from './translate.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

export function translationsProviderFactory(provider: TranslateService) {
  return () => provider.load();
}

@NgModule({
  imports: [
    HttpClientModule,
    CommonModule,
  ],
  declarations: [TranslatePipe],
  exports: [TranslatePipe],
})

export class TranslateModule {
  static forRoot(): ModuleWithProviders<TranslateModule> {
    return {
      ngModule: TranslateModule,
      providers: [
        TranslateService,
        {
          provide: APP_INITIALIZER,
          useFactory: translationsProviderFactory,
          deps: [TranslateService],
          multi: true,
        },
      ],
    };
  }
}
