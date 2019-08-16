import { Component, Input, HostBinding } from '@angular/core';
import conf from '@app/_core/conf';
import { HttpClient } from '@angular/common/http';
interface MapOptions {
  zoomControl: boolean;
  streetViewControl: boolean;
  mapDraggable: boolean;
  bottomAction: boolean;
  mapLabelsControl: boolean;
  markersControl: boolean;
  polygonsControl: boolean;
  centerLat: any;
  centerLng: any;
  zoom: number;
  minZoom: number;
  maxZoom: number;
}
@Component({
  selector: 'map',
  templateUrl: './map.template.html',
  styleUrls: ['./map.styles.scss'],
})

export class MapComponent {
  @Input() options: MapOptions;
  @Input() markers: Object[];
  private map: any;
  private polygons: any;
  private polygonMarkers: any;
  private polygonLayer: string = 'county';
  private defaultMapStyles: any = conf.defaultMapStyles;
  private defaultMapOptions: any = conf.defaultMapOptions;
  private labelOptions = {
    lightColor: 'white',
    color: 'black',
    fontSize: '14px',
    fontWeight: 'regular',
  };
  private polygonIcon = {
    url: '',
    scaledSize: {
      width: 0,
      height: 0,
    },
  };
  @HostBinding('class') get hostClasses(): string {
    return 'map__wrapper';
  }
  constructor(private http: HttpClient) {}
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
    this.getPolygons();
  }
  getPolygons() {
    const url = `/assets/polygons/${this.polygonLayer}.json`;
    const subscription = this.http.get(url).subscribe((data) => {
      this.polygons = data;
      this.polygonMarkers = this.mapPolyLabels(data);
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
  mapPolyLabels (polygons) {
    if (polygons && polygons['features']) {
      const polygonMarkers = polygons['features'].map((elem) => {
        return {
          latitude: elem.geometry.center.latitude,
          longitude: elem.geometry.center.longitude,
          labelOptions: {
            color: this.labelOptions.color,
            fontSize: this.labelOptions.fontSize,
            fontWeight: this.labelOptions.fontWeight,
            text: elem.properties['NIMI'],
          },
        };
      });
      return polygonMarkers;
    }
  }

  polygonStyles(feature) {
    let color = '#cfcfcf';
    const keys = Object.keys(feature).join(',').split(',');

    for (const i in keys) {
      const key = keys[i];
      if (feature[key] && feature[key]['color']) {
        color = feature[key]['color'];
      }
    }
    return {
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 1,
      strokeOpacity: 1,
      clickable: true,
    };
  }
  ngOnChanges() {
    this.mapLabelSwitcher(this.options.mapLabelsControl);
  }
}
