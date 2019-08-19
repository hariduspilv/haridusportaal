import { Component, Input, HostBinding } from '@angular/core';
import conf from '@app/_core/conf';
interface MapOptions {
  zoomControl: boolean;
  streetViewControl: boolean;
  mapDraggable: boolean;
  bottomAction: boolean;
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
  private defaultMapStyles: any = conf.defaultMapStyles;
  private defaultMapOptions: any = conf.defaultMapOptions;
  @HostBinding('class') get hostClasses(): string {
    return 'map__wrapper';
  }
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
}
