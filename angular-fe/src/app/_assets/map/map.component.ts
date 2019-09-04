import { Component, Input, ChangeDetectorRef } from '@angular/core';
import conf from '@app/_core/conf';
import { HttpClient } from '@angular/common/http';
import { MapService } from '@app/_services';
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
  private map: any;
  private heatmap: any;
  private previousPolygonModalState = false;
  private polygonCoords: any;
  private polygons: any;
  private polygonMarkers: any;
  private polygonLayer: string = 'county';
  private defaultMapOptions: any = conf.defaultMapOptions;
  private polygonIcon = {
    url: '/storybook/static/marker.svg',
    scaledSize: {
      width: 0,
      height: 0,
    },
  };
  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private mapService: MapService) {}
  mapReady(map) {
    this.map = map;
    this.map.setZoom(this.options.zoom);
    let centerCoords: {};
    if (this.options.centerLat && this.options.centerLng) {
      centerCoords = {
        lat: parseFloat(this.options.centerLat),
        lng: parseFloat(this.options.centerLng),
      };
    } else {
      centerCoords = this.defaultMapOptions.center;
    }
    this.map.setCenter(centerCoords);
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
    this.polygonMarkers =
      this.mapService.mapPolygonLabels(this.polygonCoords, !this.options.enablePolygonModal);
  }
  getPolygons() {
    const url = `/assets/polygons/${this.polygonLayer}.json`;
    const subscription = this.http.get(url).subscribe((data) => {
      this.polygonCoords = data;
      this.heatmap = this.mapService.generateHeatMap(this.options.polygonType,
                                                     this.polygonData[this.polygonLayer]);
      this.polygons = this.mapService.mapPolygonData(this.options.polygonType, data,
                                                     this.polygonData[this.polygonLayer],
                                                     this.heatmap);
      this.polygonMarkers =
        this.mapService.mapPolygonLabels(data, !this.options.enablePolygonModal);
      if (this.polygonMarkers) {
        this.cdr.detectChanges();
      }
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
    this.getPolygons();
  }
  ngOnInit() {
    if (this.polygonData) {
      this.getPolygons();
    }
  }
  ngOnChanges() {
    this.mapLabelSwitcher(this.options.enableLabels);
    if (this.previousPolygonModalState !== this.options.enablePolygonModal) {
      this.polygonMarkers = this.mapService.mapPolygonLabels(
        this.polygonCoords, !this.options.enablePolygonModal);
      this.previousPolygonModalState = this.options.enablePolygonModal;
    }
  }
  layerClickStatus($isOpen: boolean) {
    this.mapService.infoLayer['status'] = $isOpen;
    this.cdr.detectChanges();
  }
}
