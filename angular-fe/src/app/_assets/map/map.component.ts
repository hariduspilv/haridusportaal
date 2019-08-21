import { Component, Input, HostBinding, ChangeDetectorRef } from '@angular/core';
import conf from '@app/_core/conf';
import { HttpClient } from '@angular/common/http';
import { MapService } from '@app/_services';
interface MapOptions {
  zoomControl: boolean;
  streetViewControl: boolean;
  mapDraggable: boolean;
  bottomAction: boolean;
  mapLabelsControl: boolean;
  legendControl: boolean;
  layerControl: boolean;
  extraPolygonLabels: boolean;
  centerLat: any;
  centerLng: any;
  zoom: number;
  minZoom: number;
  maxZoom: number;
  type: string;
}
@Component({
  selector: 'map',
  templateUrl: './map.template.html',
  styleUrls: ['./map.styles.scss'],
})

export class MapComponent {
  @Input() polygonData: any = false;
  @Input() options: MapOptions;
  @Input() markerData: Object[];
  @Input() polygonType: string;
  private map: any;
  private heatmap: any;
  private loading: boolean = false;
  private polygons: any;
  private polygonMarkers: any;
  private polygonLayer: string = 'county';
  private defaultMapStyles: any = conf.defaultMapStyles;
  private defaultMapOptions: any = conf.defaultMapOptions;
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
    console.log('zoomChange');
  }
  getPolygons() {
    const url = `/assets/polygons/${this.polygonLayer}.json`;
    const subscription = this.http.get(url).subscribe((data) => {
      this.heatmap = this.mapService.generateHeatMap(this.polygonType,
                                                     this.polygonData[this.polygonLayer]);
      this.polygons = this.mapService.mapPolygonData(this.polygonType, data,
                                                     this.polygonData[this.polygonLayer],
                                                     this.heatmap);
      this.polygonMarkers = this.mapService.mapPolygonLabels(data, this.options.extraPolygonLabels);
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
    this.getPolygons();
  }
  ngOnChanges() {
    this.mapLabelSwitcher(this.options.mapLabelsControl);
  }
}
