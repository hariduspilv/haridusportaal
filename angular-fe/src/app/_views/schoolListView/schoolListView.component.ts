import { Component, Input, AfterViewInit,
  ViewChild, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { SettingsService } from '@app/_services/SettingsService';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@app/_modules/translate/translate.service';

@Component({
  selector: 'schoolList-view',
  templateUrl: 'schoolListView.template.html',
  styleUrls: ['schoolListView.styles.scss'],
})

export class SchoolListViewComponent implements AfterViewInit, OnDestroy {
  @Input() path: string;
  @ViewChild('filterToggle', { static: false }) filterToggle: ElementRef;

  lang: any;
  params: any;
  tags: any;
  selectedTag: any;
  searchTitle: '';
  showFilter = true;
  filterFull = false;
  isLanguageDisabled = false;
  schoolType = [];
  primaryTypes = [];
  selectedLanguage = [];
  selectedOwnership = [];
  selectedPrimaryTypes = [];
  selectedSecondaryTypes = [];
  secondaryTypes = [];
  secondaryFilteredTypes = [];
  selectedTypes = [];
  languageFilters = [];
  combinedTypesOptions = [];
  ownershipFilters = [];
  paramsWatcher: Subscription = new Subscription();
  subPlaceholder: string = '';
  constructor(
    private settings: SettingsService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.watchParams();
    this.getTags();
  }

  watchParams() {
    this.paramsWatcher = this.route.queryParams.subscribe((response) => {
      this.params = response;
    });
  }

  checkLanguageDisable():void {
    // 3441 - huvikool
    // 3440 - täienduskoolitusasutus

    if (this.selectedPrimaryTypes.length === 1) {
      this.isLanguageDisabled =
        this.selectedPrimaryTypes.includes('3441') || this.selectedPrimaryTypes.includes('3440')
          ? true : false;
      if (this.isLanguageDisabled) {
        this.selectedLanguage = [];
      }
      return;
    }

    if (this.selectedPrimaryTypes.length === 2) {
      this.isLanguageDisabled =
        this.selectedPrimaryTypes.includes('3441') && this.selectedPrimaryTypes.includes('3440')
          ? true : false;
      if (this.isLanguageDisabled) {
        this.selectedLanguage = [];
      }
      return;
    }
    this.isLanguageDisabled = false;
    this.cdr.detectChanges();
  }
  ngAfterViewInit() {
    const responsive = this.filterToggle.nativeElement.clientWidth;
    this.showFilter = responsive ? false : true;
    this.filterFull = responsive ? true : false;
    this.cdr.detectChanges();
  }

  getGoogleAnalyticsObject() {
    return {
      category: 'schoolSearch',
      action: 'submit',
      label: this.searchTitle,
    };
  }

  setSecondaryTypes() {
    this.secondaryFilteredTypes = [];
    if (this.selectedPrimaryTypes && this.selectedPrimaryTypes.length > 0) {
      this.selectedPrimaryTypes.forEach((element) => {
        this.secondaryTypes.forEach((el) => {
          if (el.parent === Number(element)) {
            this.secondaryFilteredTypes.push({ value: `${el.value}`, key: el.key });
          }
        });
      });
      if (this.secondaryFilteredTypes.length === 0) {
        this.selectedSecondaryTypes = [];
      }
    } else {
      this.selectedSecondaryTypes = [];
    }
    this.removeHangingTypes();
    this.setTypeValue();
    this.subtypePlaceholder();
  }

  removeHangingTypes() {
    try {
      const oldValues = this.selectedSecondaryTypes;
      this.selectedSecondaryTypes = [];
      oldValues.forEach((element) => {
        if (this.secondaryFilteredTypes.indexOf(element) !== -1) {
          this.selectedSecondaryTypes.push(element);
        }
      });
    } catch (err) {}
  }

  setTypeValue() {
    this.combinedTypesOptions =
      [...this.primaryTypes, ...this.secondaryTypes];
    this.selectedTypes =
      [...this.selectedPrimaryTypes, ...this.selectedSecondaryTypes];
    this.checkLanguageDisable();
    this.cdr.detectChanges();
  }

  subtypePlaceholder() {
    let output;
    if (
      this.selectedPrimaryTypes &&
      this.selectedPrimaryTypes.length > 0 &&
      this.secondaryFilteredTypes.length === 0
    ) {
      output = this.translate.get('school.no_subtype');
    } else if (this.selectedPrimaryTypes.length > 0) {
      output = this.translate.get('school.institution_sublevel');
    } else {
      output = this.translate.get('school.institution_select_type');
    }
    this.subPlaceholder = output;
  }

  updateFormItems(): void {
    const params = this.route.snapshot.queryParams;
    const formItems = [
      {
        model: this.selectedPrimaryTypes,
        param: 'primaryTypes',
      },
      {
        model: this.selectedSecondaryTypes,
        param: 'secondaryTypes',
      },
      {
        model: this.selectedLanguage,
        param: 'language',
      },
      {
        model: this.selectedOwnership,
        param: 'ownership',
      },
    ];

    let openFilters = false;
    formItems.forEach((item) => {
      if (params[item.param]) {
        openFilters = true;
        let value = params[item.param];
        const type = typeof item.model;
        if (type === 'object') {
          value = value.split(';');
        }
        item.model = value;
      }
      if (item.param === 'primaryTypes') {
        this.setSecondaryTypes();
      }
      if (item.param === 'setTypeValue') {
        this.setTypeValue();
      }
    });
    if (openFilters) {
      this.filterFull = true;
    }
    setTimeout(
      () => {
        this.setSecondaryTypes();
        this.setTypeValue();
        this.cdr.detectChanges();
      },
      0);
  }

  getTags() {

    const variables = {
      lang: 'ET',
    };

    const path = this.settings.query('getSchoolFilterOptions', variables);

    const subscribe = this.http.get(path).subscribe((response: any) => {
      const data = response.data.taxonomyTermQuery.entities;

      data.map((el) => {
        if (el.reverseFieldEducationalInstitutionTyNode) {
          el.parentId ? this.secondaryTypes.push(
            { value: el.entityId, key: el.entityLabel, parent: el.parentId },
          ) : this.primaryTypes.push({ value: el.entityId, key: el.entityLabel });
        }
        if (el.reverseFieldTeachingLanguageNode) {
          this.languageFilters.push({ value: el.entityId, key: el.entityLabel });
        }
        if (el.reverseFieldOwnershipTypeNode) {
          this.ownershipFilters.push({ value: el.entityId, key: el.entityLabel });
        }
      });
      this.updateFormItems();
      subscribe.unsubscribe();
    });
  }

  ngOnDestroy() {
    this.paramsWatcher.unsubscribe();
  }
}
