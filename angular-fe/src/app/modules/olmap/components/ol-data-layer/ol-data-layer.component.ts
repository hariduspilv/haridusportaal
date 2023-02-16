import {
  Component,
  EventEmitter,
  Host,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import VectorLayer from 'ol/layer/Vector';
import { OlMapComponent } from '../ol-map/ol-map.component';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import { StyleLike } from 'ol/style/Style';
import { FeatureLike } from 'ol/Feature';
import { Select } from 'ol/interaction';
import { click } from 'ol/events/condition';
import { getUid, MapBrowserEvent } from 'ol';

export interface MapLayerClickEvent {
  mapBrowserEvent: MapBrowserEvent<any>;
  feature?: FeatureLike;
}

@Component({
  selector: 'ol-data-layer',
  templateUrl: './ol-data-layer.component.html',
  styleUrls: ['./ol-data-layer.component.scss'],
})
export class OlDataLayerComponent implements OnInit, OnDestroy, OnChanges {
  @Input() geoJson: Object;
  @Input() styles?: (feature: FeatureLike) => StyleLike;
  @Output() layerClick = new EventEmitter<MapLayerClickEvent>();

  private _layer = new VectorLayer();
  private _select?: Select;

  constructor(@Host() public manager: OlMapComponent) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.styles) {
      this.styleFunc = this.styles?.bind(this);
      this._layer.setStyle(this.styleFunc);
    }

    if (changes.geoJson) {
      this.resetGeoJson();
    }
  }

  ngOnInit(): void {
    this.resetGeoJson();
    this.manager.map.addLayer(this._layer);
    this.manager.addClickHandler(this.clickHandlerFunc);
  }

  ngOnDestroy(): void {
    this.manager?.map.removeLayer(this._layer);
    this.manager?.removeClickHandler(this.clickHandlerFunc);
    this._select && this.manager?.map.removeInteraction(this._select);
  }

  private createSelect() {
    this._select = new Select({
      layers: (layer) => this._layer && getUid(layer) === getUid(this._layer),
      condition: click,
      style: this.styleFunc,
    });

    this._select.on('select', (event) => {
      this.layerClick.emit(event);
    });

    this.manager.map.addInteraction(this._select);
  }

  private resetGeoJson() {
    this._layer.setSource(undefined);

    const readFeatures = new GeoJSON().readFeatures(this.geoJson, {
      featureProjection: 'EPSG:3301',
    });

    const vectorSource = new VectorSource({
      features: readFeatures,
    });

    this._layer.setSource(vectorSource);
  }

  private clickHandler(event: MapBrowserEvent<any>) {
    this._layer.getFeatures(event.pixel).then((clickedFeatures) => {
      let feature: FeatureLike;

      if (clickedFeatures.length) {
        [feature] = clickedFeatures;
      }

      this.layerClick.emit({
        mapBrowserEvent: event,
        feature,
      });
    });
  }

  private styleFunc = this.styles?.bind(this);
  private clickHandlerFunc = this.clickHandler.bind(this);
}
