import { Component, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { SettingsService } from '@app/_services/SettingsService';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

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
  selectedTypes = [];
  languageFilters = [];
  ownershipFilters = [];
  typeOptions = [];
  public loading: boolean = false;
  private mapLimit: number = 3000;
  private boundsEnabled: boolean = false;
  private paramsSub: Subscription;
  public markers: Object;
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
      this.getData(params);
    });
  }

  getData(params) {
    this.loading = true;
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
    const subscribe = this.http.get(path).subscribe((response: any) => {
      const entities = response['data']['CustomElasticQuery'];
      this.markers = this.fixCoordinates(entities);
    },                                              () => {}, () => {
      this.loading = false;
      subscribe.unsubscribe();
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

      subscribe.unsubscribe();
    });
  }
}
