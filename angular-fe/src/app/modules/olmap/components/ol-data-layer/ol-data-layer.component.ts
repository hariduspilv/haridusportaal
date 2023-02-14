import {
  Component,
  ContentChild,
  EventEmitter,
  Host,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
} from "@angular/core";
import VectorLayer from "ol/layer/Vector";
import { OlMapComponent } from "../ol-map/ol-map.component";
import GeoJSON from "ol/format/GeoJSON";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";
import { FeatureLike } from "ol/Feature";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import { Select } from "ol/interaction";
import { click } from "ol/events/condition";
import { SelectEvent } from "ol/interaction/Select";

@Component({
  selector: "ol-data-layer",
  templateUrl: "./ol-data-layer.component.html",
  styleUrls: ["./ol-data-layer.component.scss"],
})
export class OlDataLayerComponent implements OnInit, OnDestroy, OnChanges {
  @Input() geoJson: Object;
  @Input() styles?: (feature: any) => any;
  @Output() layerClick = new EventEmitter<SelectEvent>();

  private _layer = new VectorLayer();
  private _select?: Select;

  constructor(@Host() public manager: OlMapComponent) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.geoJson || changes.styles) {
      this.resetGeoJson();
    }
  }

  ngOnInit(): void {
    this.resetGeoJson();
    this.manager.map.addLayer(this._layer);
    this.createSelect();
  }

  ngOnDestroy(): void {
    this.manager.map.removeLayer(this._layer);
    this._select && this.manager.map.removeInteraction(this._select);
  }

  private createSelect() {
    this._select = new Select({
      condition: click,
      style: this.styleFunc,
    });
    this._select.on('select', (event) => {
      this.layerClick.emit(event);
    });
    this.manager.map.addInteraction(this._select);
  }

  private convertStyles(feature: FeatureLike) {
    if (!this.styles) return {};
    const response = this.styles(feature);
    if (response instanceof Style) return response;
    const flatStyle = response as Record<string, any>;

    // TODO: move to mapservice
    return new Style({
      stroke: new Stroke({
        color: flatStyle.strokeColor,
        width: flatStyle.strokeWeight,
      }),
      fill: new Fill({
        color: flatStyle.fillColor,
      }),
    });
  }

  private resetGeoJson() {
    this._layer.setSource(undefined);
    const readFeatures = new GeoJSON().readFeatures(this.geoJson, {
      featureProjection: "EPSG:3301",
    });
    const vectorSource = new VectorSource({
      features: readFeatures,
    });
    this._layer.setSource(vectorSource);
    this._layer.setStyle(this.styleFunc);
  }

  private styleFunc = this.convertStyles?.bind(this);
}
