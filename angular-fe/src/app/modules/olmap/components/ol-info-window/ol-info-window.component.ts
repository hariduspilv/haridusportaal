import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'ol-info-window',
  templateUrl: './ol-info-window.component.html',
  styleUrls: ['./ol-info-window.component.scss']
})
export class OlInfoWindowComponent {
  @Output() close = new EventEmitter<void>();
}
