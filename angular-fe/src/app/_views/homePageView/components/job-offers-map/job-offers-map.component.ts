import { Component, OnInit } from "@angular/core";
import { TootukassaJobOffer } from "./job-offers-map.models";
import { JobOffersMapService } from "./job-offers-map.service";

@Component({
  selector: 'job-offers-map',
  templateUrl: 'job-offers-map.template.html',
  styleUrls: ['job-offers-map.styles.scss'],
})
export class JobOffersMapComponent implements OnInit {
  public loading = true;
  public markers: TootukassaJobOffer[] = [];
  public options: Object = {
    polygonType: 'investment',
    icon: '/assets/img/marker_blue.svg',
    clusterStyles: [
      {
        textColor: '#FFFFFF',
        url: '/assets/img/cluster_blue.svg',
        height: 50,
        width: 28,
        anchorText: [16, 0],
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
      },
    ],
    zoom: 7.4,
    maxZoom: 24,
    minZoom: 7,
    draggable: true,
    enablePolygonModal: false,
    enableStreetViewControl: false,
    enableLabels: true,
  };

  constructor(private service: JobOffersMapService) {}

  fixCoordinates(entities: TootukassaJobOffer[]) {
    const clusters: { [key: string]: TootukassaJobOffer[] } = {};

    // Identify clusters
    for (const i in entities) {
      const item = entities[i];
      const lat = parseFloat(`${item.Lat}`);
      const lon = parseFloat(`${item.Lon}`);
      if (lat == null) continue;
      const coords = `${lat}","${lon}`;

      item.Lat = lat;
      item.Lon = lon;

      if (clusters[coords]) {
        clusters[coords].push(item);
      } else {
        clusters[coords] = [item];
      }
    }

    // Spread clusters
    for (const coord in clusters) {
      const items = clusters[coord];

      if (items.length <= 1) {
        continue;
      }

      for (const i in items) {
        const index = parseInt(i, 10);
        const item = items[i];
        const angle = 360.0 / items.length;
        item.Lat = item.Lat + -.00004 * Math.cos((+angle * index) / 180 * Math.PI);
        item.Lon = item.Lon + -.00004 * Math.sin((+angle * index) / 180 * Math.PI);
      }
    }

    return entities;
  }

  ngOnInit(): void {
    this.service.getMapData().subscribe((jobOffers) => {
      this.markers = this.fixCoordinates(jobOffers);
      this.loading = false;
    });
  }
}