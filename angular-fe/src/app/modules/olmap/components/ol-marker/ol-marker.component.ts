import { Component, Host, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Feature, Overlay } from 'ol';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import Text from 'ol/style/Text';
import { OlMarkerLabel } from '../../interfaces/label-options.interface';
import { OlMapComponent } from '../ol-map/ol-map.component';

@Component({
  selector: 'ol-marker',
  templateUrl: './ol-marker.component.html',
  styleUrls: ['./ol-marker.component.scss']
})
export class OlMarkerComponent implements OnInit, OnDestroy, OnChanges {
  private _layer = new VectorLayer();

  @Input() iconUrl?: string;
  @Input() latitude: number;
  @Input() longitude: number;
  @Input() label: OlMarkerLabel;

  constructor(@Host() public manager: OlMapComponent) {}

  ngOnInit(): void {
    this.manager.map.addLayer(this._layer);
    this.setupLabel();
  }

  ngOnDestroy(): void {
    this.manager.map.removeLayer(this._layer);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.latitude || changes.longitude || changes.label) {
      this.setupLabel();
    }
  }

  private setupLabel() {
    const coordinate = fromLonLat([
      this.longitude,
      this.latitude
    ], 'EPSG:3301');

    const feature = new Feature(new Point(coordinate));
    const source = new VectorSource({
      features: [feature],
    });

    this._layer.setStyle(new Style({
      text: new Text({
        text: this.label.text,
        fill: new Fill({
          color: this.label.color
        }),
        font: `${this.label.fontWeight} ${this.label.fontSize} Ariel,sans-serif`
      }),
      image: this.iconUrl
        ? new Icon({
            src: this.iconUrl
          })
        : undefined
    }));

    this._layer.setSource(source);
  }
}
