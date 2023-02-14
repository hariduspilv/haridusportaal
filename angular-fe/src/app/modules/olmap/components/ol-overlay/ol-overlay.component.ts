import { AfterContentInit, AfterViewInit, Component, ContentChild, Host, Input, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import { OlMapComponent } from '../ol-map/ol-map.component';

@Component({
  selector: 'ol-overlay',
  templateUrl: './ol-overlay.component.html',
  styleUrls: ['./ol-overlay.component.scss']
})
export class OlOverlayComponent implements OnChanges, AfterContentInit {
  @ContentChild(TemplateRef) contentTemplate: TemplateRef<any>;

  @Input() isOpen?: boolean;
  @Input() latitude?: number;
  @Input() longitude?: number;

  constructor(@Host() public manager: OlMapComponent) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isOpen || changes.latitude || changes.longitude) {
      this.changeInfoWindow()
    }
  }

  ngAfterContentInit(): void {
    if (this.isOpen) this.changeInfoWindow();
  }

  private changeInfoWindow() {
    if (!!this.isOpen) {
      this.manager.showOverlay(this.contentTemplate, new Feature(new Point(fromLonLat([
        this.longitude, this.latitude
      ], 'EPSG:3301'))))
    } else if (!this.isOpen) {
      this.manager.hideOverlay();
    }
  }
}
