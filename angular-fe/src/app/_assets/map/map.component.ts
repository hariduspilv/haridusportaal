import { Component, Input, HostBinding, OnInit, ChangeDetectorRef } from '@angular/core';
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

export class MapComponent implements OnInit {
  @Input() options: MapOptions;
  @Input() markers: Object[];
  private infoLayer: Object;
  private openedNid : number = 0;
  private map: any;
  private defaultMapStyles: any = conf.defaultMapStyles;
  private defaultMapOptions: any = conf.defaultMapOptions;
  @HostBinding('class') get hostClasses(): string {
    return 'map__wrapper';
  }
  constructor(private cdr: ChangeDetectorRef) {}
  ngOnInit() {
    console.log(this.markers);
  }
  mapReady(map) {
    this.map = map;
    this.map.setZoom(this.options.zoom);
    this.map.setCenter(
      { lat: parseFloat(this.options.centerLat), lng: parseFloat(this.options.centerLng) },
    );
  }
  openInfoWindow(id) {
    this.openedNid = id;
  }
}
