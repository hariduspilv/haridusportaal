import { Component, Input, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { viewOptions, maxItems, translationsPerType } from './helpers/compare';
import { AlertsService, ModalService } from '@app/_services';
import { TranslateService } from '@app/_modules/translate/translate.service';
import { SettingsService } from '@app/_services/SettingsService';
import { Subscription } from 'rxjs';

@Component({
  selector: 'compare',
  templateUrl: './compare.template.html',
  styleUrls: ['./compare.styles.scss'],
})

export class CompareComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() id: string;
  @Input() sessionStorageKey: string;
  private sessionStorageSubscription: any;
  public compare: any;
  public checked: boolean = false;
  public selectedElement: any;
  private subscription: Subscription;
  private viewLink: Object = {
    url: '/',
    label: '',
  };

  constructor(
    private alertsService: AlertsService,
    private modalService: ModalService,
    public translateService: TranslateService,
    private settingsService: SettingsService) {
  }

  compareChange(id, $event) {
    this.compare = this.readFromLocalStorage(this.sessionStorageKey);
    this.selectedElement = event.target; 
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
        } else {
          this.settingsService.compareObservable.next('info');
        }
        this.addItemToLocalStorage(parseInt(id, 10), this.sessionStorageKey, this.compare);
      }
    } else if (!$event && this.isChecked(id)) {
      this.removeItemFromLocalStorage(parseInt(id, 10), this.sessionStorageKey, this.compare);
      this.compare = this.readFromLocalStorage(this.sessionStorageKey);
      if (!this.compare.length) {
        this.alertsService.clear('compare');
      } else {
        this.settingsService.compareObservable.next('info');
      }
    }
  }

  isChecked(id) {
    return this.compare.some(existing => existing === parseInt(id, 10));
  }

  notify(type: string) {
    const variables = [
      this.translateService.get(translationsPerType[this.sessionStorageKey][type]),
      'compare',
      'compare',
      true,
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
    this.viewLink['label'] = this.translateService.get('button.see_comparison');
    this.compare = this.readFromLocalStorage(this.sessionStorageKey);
    this.checked = this.isChecked(this.id);
    this.viewLink['url'] = viewOptions[this.sessionStorageKey];
    this.subscription = this.alertsService.alertClosed.subscribe(() => {
      if (this.selectedElement) {
        this.selectedElement.focus();
      }
    })
  }

  ngAfterViewInit(): void {
    if (this.settingsService && !this.settingsService.compareObservable.observers.length) {
      this.sessionStorageSubscription = this.settingsService.compareObservable.subscribe((data) => {
        this.compare = this.readFromLocalStorage(this.sessionStorageKey);
        this.notify(data);
      });
      if (this.compare.length) {
        this.settingsService.compareObservable.next('info');
      }
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.sessionStorageSubscription) {
      this.sessionStorageSubscription.unsubscribe();
    }
  }
}
