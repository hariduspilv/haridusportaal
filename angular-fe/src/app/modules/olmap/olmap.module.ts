import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OlDataLayerComponent } from './components/ol-data-layer/ol-data-layer.component';
import { OlMapComponent } from './components/ol-map/ol-map.component';
import { OlClustersComponent } from './components/ol-clusters/ol-clusters.component';
import { OlInfoWindowComponent } from './components/ol-info-window/ol-info-window.component';
import { OlMarkerComponent } from './components/ol-marker/ol-marker.component';
import { OlOverlayComponent } from './components/ol-overlay/ol-overlay.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    OlMapComponent,
    OlDataLayerComponent,
    OlClustersComponent,
    OlInfoWindowComponent,
    OlMarkerComponent,
    OlOverlayComponent,
  ],
  exports: [
    OlMapComponent,
    OlDataLayerComponent,
    OlClustersComponent,
    OlInfoWindowComponent,
    OlMarkerComponent,
    OlOverlayComponent,
  ]
})
export class OlMapModule {}
