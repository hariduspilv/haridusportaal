import { Component, Host } from '@angular/core';
import { OlMapComponent } from '../ol-map/ol-map.component';

@Component({
  selector: 'ol-info-window',
  templateUrl: './ol-info-window.component.html',
  styleUrls: ['./ol-info-window.component.scss']
})
export class OlInfoWindowComponent {
  constructor(@Host() public manager: OlMapComponent) {}
}
