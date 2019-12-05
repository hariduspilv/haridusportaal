import { Component, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import conf from '@app/_core/conf';
import { HttpClient } from '@angular/common/http';
import { MapService } from '@app/_services';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
interface MapOptions {
  centerLat: any;
  centerLng: any;
  zoom: number;
  minZoom: number;
  maxZoom: number;
  draggable: boolean;
  enableZoomControl: boolean;
  enableStreetViewControl: boolean;
  enableOuterLink: boolean;
  enableLabels: boolean;
  enableParameters: boolean;
  polygonType: string;
  enablePolygonLegend: boolean;
  enableLayerSelection: boolean;
  enablePolygonModal: boolean;
}
@Component({
  selector: 'map',
  templateUrl: './map.template.html',
  styleUrls: ['./map.styles.scss'],
})

export class MapComponent {
  @Input() polygonData: any = false;
  @Input() options: MapOptions;
  @Input() markers: Object[];
  @Input() type: string;
  @Input() parameters: Object[];
  @Input() legendLabels: Object;
  @Input() legendKey: string;
  @Input() loading: boolean;
  @Output() layerChange: EventEmitter<string> = new EventEmitter;

  private map: any;
  private heatmap: any;
  private polygonCoords: any;
  private polygons: any;
  private polygonMarkers: any;
  private polygonLayer: string = 'county';
  private defaultMapOptions: any = conf.defaultMapOptions;
  private paramSub: Subscription;
  private polygonSub: Subscription;
  public params: Object;
  public infoWindowFunding: Boolean | Number;
  public activeLegendParameters: object;
  public paramValue: string;
  private polygonIcon = {
    url: '',
    scaledSize: {
      width: 0,
      height: 0,
    },
  };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private mapService: MapService,
    private route: ActivatedRoute) {}

  mapReady(map) {
    this.map = map;
    this.mapService.activeMap = this.map;
    this.map.setZoom(this.options.zoom);
    this.setCenter(this.map, this.options, this.defaultMapOptions);
  }

  setCenter(activeMap: any, options: MapOptions, defaultMapOptions: any) {
    let centerCoords: {};
    if (options.centerLat && options.centerLng) {
      centerCoords = {
        lat: parseFloat(options.centerLat),
        lng: parseFloat(options.centerLng),
      };
    } else {
      centerCoords = defaultMapOptions.center;
    }
    activeMap.setCenter(centerCoords);
  }

  zoomChange($event) {
    if (this.type === 'polygons' && this.polygonCoords) {
      if ($event < 9 && this.mapService.activeFontSize !== this.mapService.fontSizes['sm']) {
        this.mapService.activeFontSize = this.mapService.fontSizes['sm'];
        this.setPolyLabels();
      } else if ($event === 9 &&
          this.mapService.activeFontSize !== this.mapService.fontSizes['md']) {
        this.mapService.activeFontSize = this.mapService.fontSizes['md'];
        this.setPolyLabels();
      } else if ($event === 10 &&
          this.mapService.activeFontSize !== this.mapService.fontSizes['lg']) {
        this.mapService.activeFontSize = this.mapService.fontSizes['lg'];
        this.setPolyLabels();
      }
    }
  }

  setPolyLabels() {
    this.polygonMarkers = this.mapService.mapPolygonLabels(
      this.polygonCoords, !this.options.enablePolygonModal, this.options.polygonType);
  }

  getPolygons() {
    this.loading = true;
    const url = `/assets/polygons/${this.polygonLayer}.json`;
    const subscription = this.http.get(url).subscribe((data) => {
      this.polygonCoords = data;
      this.heatmap = this.mapService.generateHeatMap(this.options.polygonType,
                                                     this.polygonData[this.polygonLayer]);
      this.polygons = this.mapService.mapPolygonData(this.options.polygonType, data,
                                                     this.polygonData[this.polygonLayer],
                                                     this.heatmap);
      this.polygonMarkers = this.mapService.mapPolygonLabels(
        data, !this.options.enablePolygonModal, this.options.polygonType);
      if (this.polygonMarkers) {
        this.cdr.detectChanges();
      }
    },                                                () => {}, () => {
      this.loading = false;
      subscription.unsubscribe();
    });
  }
  mapLabelSwitcher(state) {
    this.defaultMapOptions.styles = [];
    this.defaultMapOptions.styles = [
      { elementType: 'labels', stylers: [{ visibility: state ? 'on' : 'off' }] },
      ...conf.defaultMapStyles,
    ];
  }

  changeLayer(name) {
    this.polygonLayer = name;
    this.layerChange.emit(name);
  }

  ngOnInit() {
    this.watchSearch();
    if (this.type === 'polygons') {
      this.polygonSub = this.mapService.polygonLayer.subscribe((layer) => {
        this.getPolygons();
        this.mapService.previousPolygonLayer = layer;
      });
    }
  }

  watchSearch() {
    this.paramSub = this.route.queryParams.subscribe((params) => {
      this.params = params;
      this.paramValue = params[this.legendKey]
        || (this.parameters
          && this.parameters.find(param => param['key'] === this.legendKey)['value']);
      if (this.paramValue) {
        this.activeLegendParameters = this.legendLabels[this.paramValue];
      }
      this.mapLabelSwitcher(this.options.enableLabels);
    });
  }

  ngOnDestroy() {
    this.paramSub.unsubscribe();
    if (this.polygonSub) this.polygonSub.unsubscribe();
  }

  ngOnChanges() {
    this.mapLabelSwitcher(this.options.enableLabels);
  }

  layerClickStatus($isOpen: boolean) {
    this.mapService.infoLayer['status'] = $isOpen;
    if (!this.cdr['destroyed']) this.cdr.detectChanges();
  }

  showFunding(year: string, infoWindow:any = false) {
    this.infoWindowFunding = parseFloat(year);
    if (!this.cdr['destroyed']) this.cdr.detectChanges();
  }

}
