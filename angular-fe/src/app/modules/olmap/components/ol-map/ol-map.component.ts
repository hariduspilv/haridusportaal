import {
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { IOlMap } from "../../interfaces/ol-map.interface";
import { Feature, Map, MapBrowserEvent, Overlay, View } from "ol";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";
import XYZ from "ol/source/XYZ";
import TileLayer from "ol/layer/Tile";
import { fromLonLat } from "ol/proj";
import TileGrid from "ol/tilegrid/TileGrid";
import { defaults as defaultInteractions } from "ol/interaction";
import { Attribution } from "ol/control";
import { Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

proj4.defs(
  "EPSG:3301",
  "+proj=lcc +lat_1=59.33333333333334 +lat_2=58 +lat_0=57.51755393055556 +lon_0=24 +x_0=500000 +y_0=6375000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
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
  selector: "ol-map",
  templateUrl: "./ol-map.component.html",
  styleUrls: ["./ol-map.component.scss"],
})
export class OlMapComponent implements IOlMap, OnInit, AfterViewInit {
  @ViewChild("mapContainer") private container: ElementRef<HTMLDivElement>;
  @ViewChild("mapTooltipContainer") private tooltip: ElementRef<HTMLDivElement>;

  @Input() minZoom = mapMinZoom;
  @Input() maxZoom = mapMaxZoom;
  @Input() zoom = 7;
  @Input() draggable = true;
  @Input() enableZoomControl = true;

  private clickHandlers: HandlerFn[] = [];
  public activeTooltip: TemplateRef<any>;
  public activeTooltipContext: any;
  public overlay!: Overlay;

  public map = new Map({
    controls: [attribution],
    interactions: defaultInteractions({
      doubleClickZoom: this.enableZoomControl,
      pinchZoom: this.enableZoomControl,
      mouseWheelZoom: this.enableZoomControl,
      shiftDragZoom: this.enableZoomControl,
      dragPan: this.draggable,
      keyboard: this.draggable,
      altShiftDragRotate: false,
      pinchRotate: false,
    }),
    layers: [
      new TileLayer({
        source: new XYZ({
          projection: "EPSG:3301",
          tileGrid: mapTileGrid,
          url: "/mapproxy/{z}/{x}/{-y}.png",
          attributions:
            '<a href="https://maaamet.ee/" target="_blank">Maa-amet</a>',
        }),
      }),
    ],
  });

  ngOnInit(): void {
    this.map.setView(
      new View({
        projection: "EPSG:3301",
        center: fromLonLat([24.7065513, 58.5822061], "EPSG:3301"),
        zoom: this.zoom + 1,
        minZoom: this.minZoom,
        maxZoom: this.maxZoom + 2,
        extent: mapExtent,
      })
    );
    this.mapEvents();
  }

  ngAfterViewInit(): void {
    this.map.setTarget(this.container.nativeElement);
    this.initOverlay();
  }

  addClickHandler(handler: HandlerFn) {
    this.clickHandlers.push(handler);
  }

  removeClickHandler(handler: HandlerFn) {
    const index = this.clickHandlers.indexOf(handler);
    if (index < 0) return;
    this.clickHandlers.splice(index, 1);
  }

  showOverlay(
    template: TemplateRef<any>,
    feature: Feature,
    event?: MapBrowserEvent<any>,
    offset = [0, 0]
  ) {
    this.activeTooltipContext = feature.getProperties();
    this.activeTooltip = template;

    // Wait for Angular to render the template
    setTimeout(() => {
      const coordinate = (feature.getGeometry() as Point).getCoordinates();
      this.overlay.setOffset(offset);
      this.overlay.setPosition(coordinate);
    });
  }

  hideOverlay() {
    this.activeTooltip = undefined;
    this.activeTooltipContext = undefined;
  }

  private mapEvents() {
    this.map.on("click", async (event) => {
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

    this.map.on("pointermove", function (evt) {
      var hit = this.forEachFeatureAtPixel(
        evt.pixel,
        function (feature, layer) {
          return true;
        }
      );
      if (hit) {
        this.getTargetElement().style.cursor = "pointer";
      } else {
        this.getTargetElement().style.cursor = "";
      }
    });
  }

  private initOverlay() {
    this.overlay = new Overlay({
      element: this.tooltip.nativeElement,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
      positioning: "bottom-center",
    });
    this.map.addOverlay(this.overlay);
  }
}
