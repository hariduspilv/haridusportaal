import { NgModule, APP_INITIALIZER, ModuleWithProviders } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
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
  static forRoot(): ModuleWithProviders<SettingsModule> {
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
