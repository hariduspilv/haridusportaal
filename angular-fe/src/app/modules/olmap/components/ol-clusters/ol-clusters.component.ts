import { Component, ContentChild, Host, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import { Feature, MapBrowserEvent } from 'ol';
import { Point } from 'ol/geom';
import { Cluster, Vector as VectorSource } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import { OlMapComponent } from '../ol-map/ol-map.component';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import Text from 'ol/style/Text';
import Fill from 'ol/style/Fill';
import { boundingExtent } from 'ol/extent';

@Component({
  selector: 'ol-clusters',
  templateUrl: './ol-clusters.component.html',
  styleUrls: ['./ol-clusters.component.scss']
})
export class OlClustersComponent implements OnInit, OnDestroy, OnChanges {
	private _layer = new VectorLayer();
  @ContentChild(TemplateRef) contentTemplate: TemplateRef<any>;

  @Input() markers: (Record<string, unknown> & { Lat?: number; Lon?: number; lat?: number; lon?: number; })[] = [];
  @Input() styles: Record<string, unknown>[];
  @Input() iconUrl: string;
  @Input() minDistance = 8;
  @Input() distance = 48;

  private clusterIcon!: Icon;
  private pinIcon!: Icon;

  constructor(@Host() public manager: OlMapComponent) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.markers) {
      this.readClusters();
		}
	}

	ngOnInit(): void {
    this._layer.setStyle(this.bindClusterStyle);
    this.manager.map.addLayer(this._layer);
    this.readClusters();

    this.clusterIcon = new Icon({
      src: this.styles[0].url as string,
    });

    this.pinIcon = new Icon({
      src: this.iconUrl,
      displacement: [0, 22]
    });

    this.manager.addClickHandler(this.bindClickHandler);
	}

	ngOnDestroy(): void {
    this.manager?.map.removeLayer(this._layer);
    this.manager?.removeClickHandler(this.bindClickHandler);
	}

  private clusterStyle(feature: Feature) {
    const featureCount = feature.getProperties().features.length;
    return new Style({
      image: featureCount > 1 ? this.clusterIcon : this.pinIcon,
      text: featureCount > 1 ? new Text({
        text: featureCount.toString(),
        font: `${this.styles[0].fontWeight} 11px ${this.styles[0].fontFamily}`,
        fill: new Fill({ color: '#fff' }),
      }) : undefined,
    })
  }

  private readClusters() {
    this._layer.setSource(undefined);
    const features = this.markers.filter((marker) => {
      return !isNaN(marker.Lon || marker.lon) && !isNaN(marker.Lat || marker.lat)
    }).map((marker) => {
      const feature = new Feature(new Point(fromLonLat([
        marker.Lon || marker.lon,
        marker.Lat || marker.lat
      ], 'EPSG:3301')));
      Object.keys(marker).forEach((key) => feature.set(key, marker[key]));
      return feature;
    });

    const source = new VectorSource({ features });
    const clusterSource = new Cluster({ source, minDistance: this.minDistance, distance: this.distance });
    this._layer.setSource(clusterSource);
  }

  private clickHandler(event: MapBrowserEvent<any>) {
    this._layer.getFeatures(event.pixel).then((clickedFeatures) => {
      if (clickedFeatures.length) {
        // Get clustered Coordinates
        const features = clickedFeatures[0].get('features');
        if (features.length > 1) {
          const extent = boundingExtent(
            features.map((r) => r.getGeometry().getCoordinates())
          );
          this.manager.map.getView().fit(extent, {duration: 500, padding: [50, 50, 50, 50]});
        } else {
          this.manager.showOverlay(this.contentTemplate, features[0], event, [0, -44]);
        }
      } else {
        this.manager.hideOverlay();
      }
    });
  }
  
  private bindClusterStyle = this.clusterStyle.bind(this);
  private bindClickHandler = this.clickHandler.bind(this);
}
