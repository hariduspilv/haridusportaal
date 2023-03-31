import { Component, OnInit } from '@angular/core';
import { TootukassaJobOffer } from '../job-offers-map.models';
import { JobOffersMapService } from '../job-offers-map.service';

@Component({
  selector: 'job-offers-map',
  templateUrl: 'job-offers-map.template.html',
  styleUrls: ['job-offers-map.styles.scss'],
})
export class JobOffersMapComponent implements OnInit {
  public loading = true;
  public markers: TootukassaJobOffer[] = [];
  public options = {
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
    zoom: 8.5,
    maxZoom: 22,
    minZoom: 8,
    draggable: true,
    enablePolygonModal: false,
    enableStreetViewControl: false,
  };

  constructor(private service: JobOffersMapService) {}

  ngOnInit(): void {
    this.service.getMapData().subscribe((jobOffers) => {
      this.markers = jobOffers;
      this.loading = false;
    });
  }
}
