import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders } from '@angular/compiler/src/core';
import { SettingsService } from '@app/_services';

export function settingsProviderFactory(provider: SettingsService) {
  return () => provider.load();
}

@NgModule({
  imports: [
    HttpClientModule,
    CommonModule,
  ],
})

export class SettingsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SettingsModule,
      providers: [
        SettingsService,
        {
          provide: APP_INITIALIZER,
          useFactory: settingsProviderFactory,
          deps: [SettingsService],
          multi: true,
        },
      ],
    };
  }
}
