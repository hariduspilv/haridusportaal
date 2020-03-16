import { Component, Input, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { SettingsService } from '@app/_services/SettingsService';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MapService } from '@app/_services';
import { TranslateService } from '@app/_modules/translate/translate.service';

@Component({
  selector: 'schoolList-map',
  templateUrl: 'schoolListMap.template.html',
  styleUrls: ['../schoolListView.styles.scss'],
})

export class SchoolListMapComponent implements AfterViewInit {
  @Input() path: string;
  @ViewChild('filterToggle', { static: false }) filterToggle: ElementRef;

  lang: any;
  params: any;
  tags: any;
  selectedTag: any;
  showFilter = true;
  filterFull = false;
  isLanguageDisabled = false;
  schoolType = [];
  primaryTypes = [];
  selectedPrimaryTypes = [];
  selectedSecondaryTypes = [];
  secondaryTypes = [];
  secondaryFilteredTypes = [];
  selectedLanguage = [];
  selectedOwnership = [];
  selectedTypes = [];
  languageFilters = [];
  ownershipFilters = [];
  typeOptions = [];
  subPlaceholder: string;
  public loading: boolean = false;
  private mapLimit: number = 3000;
  private boundsEnabled: boolean = false;
  private paramsSub: Subscription;
  public markers: Object[];
  private listSub: Subscription;
  public options: Object = {
    polygonType: 'investment', // ...
    zoom: 7.4,
    maxZoom: 16,
    minZoom: 7,
    draggable: true,
    enablePolygonModal: false,
    enableStreetViewControl: false,
    enableLabels: true,
  };
  public bounds = {
    minLat: '0',
    maxLat: '99',
    minLon: '0',
    maxLon: '99',
  };

  constructor(
    private settings: SettingsService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private mapService: MapService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.getTags();
    this.watchParams();
  }

  ngOnDestroy() {
    this.paramsSub.unsubscribe();
  }

  checkLanguageDisable():void {
    if (this.selectedPrimaryTypes.length === 1) {
      this.isLanguageDisabled =
        this.selectedPrimaryTypes.includes('3441') || this.selectedPrimaryTypes.includes('3440')
          ? true : false;
      return;
    }

    if (this.selectedPrimaryTypes.length === 2) {
      this.isLanguageDisabled =
        this.selectedPrimaryTypes.includes('3441') && this.selectedPrimaryTypes.includes('3440')
          ? true : false;
      return;
    }
    this.isLanguageDisabled = false;
  }
  ngAfterViewInit() {
    const responsive = this.filterToggle.nativeElement.clientWidth;
    this.showFilter = responsive ? false : true;
    this.filterFull = responsive ? true : false;
  }

  setSecondaryTypes() {
    this.secondaryFilteredTypes = [];
    this.selectedPrimaryTypes.forEach((element) => {
      this.secondaryTypes.forEach((el) => {
        if (el.parent === Number(element)) {
          this.secondaryFilteredTypes.push({ value: el.value, key: el.key });
        }
      });
    });
    this.removeHangingTypes();
    this.setTypeValue();
    this.subtypePlaceholder();
  }

  removeHangingTypes() {
    const oldValues = this.selectedSecondaryTypes || [];
    this.selectedSecondaryTypes = [];
    oldValues.forEach((element) => {
      if (this.secondaryFilteredTypes.indexOf(element) !== -1) {
        this.selectedSecondaryTypes.push(element);
      }
    });
  }

  setTypeValue() {
    this.selectedTypes = [...this.selectedPrimaryTypes, ...this.selectedSecondaryTypes];
  }

  watchParams() {
    if (this.paramsSub) this.paramsSub.unsubscribe();
    this.paramsSub = this.route.queryParams.subscribe((params: any) => {
      this.params = params;
      this.getData(params);
    });
  }

  getData(params) {
    this.loading = true;
    if (this.listSub !== undefined) this.listSub.unsubscribe();
    const variables = {
      lang: 'ET',
      offset: 0,
      limit: this.mapLimit,
      title: params['title'] ? `"${params['title'].toLowerCase()}"` : '""',
      boundsEnabled: this.boundsEnabled,
      minLat: this.bounds.minLat,
      maxLat: this.bounds.maxLat,
      minLon: this.bounds.minLon,
      maxLon: this.bounds.maxLon,
      location: params['location'] ? `"${params['location']}"` : '""',
      locationEnabled: params['location'] ? true : false,
      type: params['type'] || [],
      typeEnabled: params['type'] ? true : false,
      language: params['language'] ? params['language'] : [],
      languageEnabled: params['language'] ? true : false,
      ownership: params['ownership'] ? params['ownership'] : [],
      ownershipEnabled: params['ownership'] ? true : false,
      specialClass: params['specialClass'] ? '1' :  '""',
      specialClassEnabled: params['specialClass'] ? true : false,
      studentHome: params['studentHome'] ? '1' :  '""',
      studentHomeEnabled: params['studentHome'] ? true : false,
    };

    const path = this.settings.query('schoolMapQuery', variables);
    this.listSub = this.http.get(path).subscribe((response: any) => {
      const entities = response['data']['CustomElasticQuery'];
      this.markers = this.fixCoordinates(entities);
    },                                           () => {}, () => {
      this.loading = false;
      if (window['google'] && this.markers && this.markers.length) {
        this.mapService.setBounds(this.markers);
      } else {
        this.mapService.resetCenter();
      }
      this.listSub.unsubscribe();
    });
  }

  fixCoordinates(entities) {
    const coordinates = [];
    for (const i in entities) {
      const item = entities[i];
      const lat = parseFloat(entities[i].Lat);
      const lon = parseFloat(entities[i].Lon);
      if (lat == null) continue;
      const coords = `${lat}","${lon}`;

      if (coordinates.indexOf(coords) !== -1) {
        entities[i].Lon = `${lon}0.0005`;
      }
      coordinates.push(coords);
    }
    return entities;
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
}
