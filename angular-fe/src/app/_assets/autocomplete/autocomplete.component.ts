import { Component, Input } from '@angular/core';
import { SettingsService } from '@app/_services/SettingsService';

@Component({
  selector: 'autocomplete',
  templateUrl: 'autocomplete.template.html',
  styleUrls: ['autocomplete.styles.scss']
})

export class AutocompleteComponent {
  @Input() type: string = '';

  constructor(
    public settings: SettingsService,
  ) {}

  public search(value: string = ''): void {
    const variables = {
      search_term: value,
    };
  }
}
