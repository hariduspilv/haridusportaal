import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { IOlMap } from '../../interfaces/ol-map.interface';
import { Map, MapBrowserEvent, View } from 'ol';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import XYZ from 'ol/source/XYZ';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat, transformExtent } from 'ol/proj';
import TileGrid from 'ol/tilegrid/TileGrid';
import {
  defaults as defaultInteractions,
  DoubleClickZoom,
  DragPan,
  DragZoom,
  KeyboardPan,
  KeyboardZoom,
  MouseWheelZoom,
  PinchZoom,
} from 'ol/interaction';
import { Attribution } from 'ol/control';
import { Coordinate } from 'ol/coordinate';
import { Extent } from 'ol/extent';

proj4.defs(
  'EPSG:3301',
  '+proj=lcc +lat_1=59.33333333333334 +lat_2=58 +lat_0=57.51755393055556 +lon_0=24 +x_0=500000 +y_0=6375000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
);
register(proj4);
const mapExtent = [40500, 5993000, 1064500, 7017000];
const mapMinZoom = 3;
const mapMaxZoom = 13;
const mapMaxResolution = 1.0;
const tileExtent = [40500, 5993000, 1064500, 7017000];
const mapResolutions = [
  4000, 2000, 1000, 500, 250, 125, 62.5, 31.25, 15.625, 7.8125, 3.90625,
  1.953125, 0.9765625, 0.48828125,
];

const mapTileGrid = new TileGrid({
  extent: tileExtent,
  minZoom: mapMinZoom,
  resolutions: mapResolutions,
});

const attribution = new Attribution({
  collapsible: false,
});

type HandlerFn = (event: MapBrowserEvent<any>) => boolean | Promise<boolean>;

@Component({
  selector: 'ol-map',
  templateUrl: './ol-map.component.html',
  styleUrls: ['./ol-map.component.scss'],
})
export class OlMapComponent implements IOlMap, OnInit, AfterViewInit {
  @ViewChild('mapContainer') private container: ElementRef<HTMLDivElement>;

  @Input() minZoom? = mapMinZoom;
  @Input() maxZoom? = mapMaxZoom;
  @Input() zoom? = 7;
  @Input() draggable? = true;
  @Input() enableZoomControl? = true;
  @Output() mapReady = new EventEmitter<OlMapComponent>();
  @Output() zoomChange = new EventEmitter<number>();

  private clickHandlers: HandlerFn[] = [];
  private interactions = defaultInteractions({
    altShiftDragRotate: false,
    pinchRotate: false,
  });
  public activeTooltip: TemplateRef<any>;
  public activeTooltipContext: any;

  public map = new Map({
    controls: [attribution],
    interactions: this.interactions,
    layers: [
      new TileLayer({
        source: new XYZ({
          projection: 'EPSG:3301',
          tileGrid: mapTileGrid,
          url: '/mapproxy/{z}/{x}/{-y}.png',
          attributions:
            '<a href="https://maaamet.ee/" target="_blank">Maa-amet</a>',
        }),
      }),
    ],
  });

  ngOnInit(): void {
    // i don't know why angular doesn't do this by itself...
    if (this.enableZoomControl === undefined) this.enableZoomControl = true;
    if (this.draggable === undefined) this.draggable = true;

    this.map.setView(
      new View({
        projection: 'EPSG:3301',
        center: fromLonLat([24.7065513, 58.5822061], 'EPSG:3301'),
        zoom: this.zoom,
        minZoom: this.minZoom,
        maxZoom: this.maxZoom,
        extent: mapExtent,
      })
    );
    this.mapEvents();
  }

  ngAfterViewInit(): void {
    this.map.setTarget(this.container.nativeElement);
    this.setInteractions();
    this.mapReady.emit(this);
  }

  addClickHandler(handler: HandlerFn) {
    this.clickHandlers.push(handler);
  }

  removeClickHandler(handler: HandlerFn) {
    const index = this.clickHandlers.indexOf(handler);
    if (index < 0) return;
    this.clickHandlers.splice(index, 1);
  }

  setZoom(zoom: number) {
    this.map.getView().setZoom(zoom);
    this.zoom = zoom;
  }

  setCenter(center: Coordinate) {
    this.map.getView().setCenter(fromLonLat(center, 'EPSG:3301'));
  }

  fitBounds(extent: Extent, padding = [50,50,50,50]) {
    this.map.getView().fit(transformExtent(extent, 'EPSG:4326', 'EPSG:3301'), { padding })
  }

  private mapEvents() {
    this.map.on('click', async (event) => {
      for (const handler of this.clickHandlers) {
        try {
          let response = handler(event);
          if (response instanceof Promise) {
            response = await response;
          }
          if (response) break;
        } catch (e) {
          console.error(e);
        }
      }
    });

    this.map.on('pointermove', function (evt) {
      var hit = this.forEachFeatureAtPixel(evt.pixel, () => true);
      if (hit) {
        this.getTargetElement().style.cursor = 'pointer';
      } else {
        this.getTargetElement().style.cursor = '';
      }
    });

    const currZoom = this.map.getView().getZoom();
    this.map.on('moveend', (e) => {
      const newZoom = this.map.getView().getZoom();
      if (currZoom != newZoom) {
        this.zoom = newZoom;
        this.zoomChange.emit(newZoom);
      }
    });
  }

  private setInteractions() {
    this.interactions.forEach((interaction) => {
      if (
        interaction instanceof DoubleClickZoom ||
        interaction instanceof PinchZoom ||
        interaction instanceof MouseWheelZoom ||
        interaction instanceof DragZoom ||
        interaction instanceof KeyboardZoom
      ) {
        interaction.setActive(this.enableZoomControl);
      }

      if (
        interaction instanceof DragPan ||
        interaction instanceof KeyboardPan
      ) {
        interaction.setActive(this.draggable);
      }
    });
  }
}
