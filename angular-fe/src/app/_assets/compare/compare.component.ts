import { Component, Input } from '@angular/core';
import { viewOptions, maxItems, translationsPerType } from './helpers/compare';
import { AlertsService, ModalService } from '@app/_services';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { SettingsService } from '@app/_services/SettingsService';

@Component({
  selector: 'compare',
  templateUrl: './compare.template.html',
  styleUrls: ['./compare.styles.scss'],
})

export class CompareComponent {
  @Input() id: string;
  @Input() sessionStorageKey: string;
  private sessionStorageSubscription: any;
  public compare: any;
  private checked: boolean = false;
  private viewLink: Object = {
    url: '/',
    label: '',
  };

  constructor(
    private alertsService: AlertsService,
    private modalService: ModalService,
    private translateService: TranslateService,
    private settingsService: SettingsService) {
    this.viewLink['label'] = this.translateService.get('button.see_comparison');
  }

  compareChange(id, $event) {
    this.compare = this.readFromLocalStorage(this.sessionStorageKey);
    const maximumItems = maxItems[this.sessionStorageKey]
      ? maxItems[this.sessionStorageKey] : maxItems.default;
    if ($event && !this.isChecked(id)) {
      if (this.compare.length >= maximumItems) {
        setTimeout(() => {
          this.checked = false;
        },         0);
        this.modalService.toggle('compare');
      } else {
        if (!this.compare.length) {
          this.settingsService.compareObservable.next('success');
        }
        this.addItemToLocalStorage(id, this.sessionStorageKey, this.compare);
      }
    } else if (!$event && this.isChecked(id)) {
      this.removeItemFromLocalStorage(id, this.sessionStorageKey, this.compare);
    }
    this.compare = this.readFromLocalStorage(this.sessionStorageKey);
    if (!this.compare.length) {
      this.alertsService.clear('global');
    }
  }

  isChecked(id) {
    return this.compare.some(existing => existing === id);
  }

  notify(type: string) {
    const variables = [
      this.translateService.get(translationsPerType[this.sessionStorageKey][type]),
      'global',
      'compare',
      false,
      this.viewLink,
    ];
    if (type === 'success') {
      this.alertsService.success(...variables);
    } else {
      this.alertsService.info(...variables);
    }
  }

  removeItemFromLocalStorage(id, inputKey:string, existing) {
    const existingArr = existing.filter(currentId => currentId !== id);
    sessionStorage.setItem(inputKey, JSON.stringify(existingArr));
  }

  addItemToLocalStorage(id, inputKey:string, existing) {
    existing.push(id);
    sessionStorage.setItem(inputKey, JSON.stringify(existing));
  }

  readFromLocalStorage(key) {
    const data = JSON.parse(sessionStorage.getItem(key));
    return data instanceof Array ? data : [];
  }

  ngOnInit() {
    this.compare = this.readFromLocalStorage(this.sessionStorageKey);
    this.checked = this.isChecked(this.id);
    this.viewLink['url'] = viewOptions[this.sessionStorageKey];
    if (!this.settingsService.compareObservable.observers.length) {
      this.sessionStorageSubscription = this.settingsService.compareObservable.subscribe((data) => {
        this.compare = this.readFromLocalStorage(this.sessionStorageKey);
        this.notify(data);
      });
      this.settingsService.compareObservable.next('info');
    }
  }

  ngOnDestroy() {
    if (this.sessionStorageSubscription) {
      this.sessionStorageSubscription.unsubscribe();
    }
    this.alertsService.clear('');
  }
}
