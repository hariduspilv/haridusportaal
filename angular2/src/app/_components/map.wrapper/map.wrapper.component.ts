import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'map-wrapper',
  templateUrl: './map.wrapper.component.html',
  styleUrls: ['./map.wrapper.component.scss']
})
export class MapWrapperComponent implements OnInit {

  @Input() latitude: any;
  @Input() longitude: any;
  @Input() zoom: any;

  iconUrl = "/assets/marker.png"

  constructor() {

  }

  ngOnInit() {
    if (typeof this.latitude === 'string') {
      this.latitude = parseFloat(this.latitude);
    }
    if (typeof this.longitude === 'string') {
      this.longitude = parseFloat(this.longitude);
    }
    if (typeof this.zoom === 'string') {
      if (this.zoom === 'null') {
        this.zoom = 11;
      } else {
        this.zoom = parseInt(this.zoom);
      }
    }
  }

}
