import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from "@angular/google-maps";
import {TootukassaJobOffer} from "@app/_views/homePageView/components/job-offers-map/job-offers-map.models";
import {ReplaySubject} from "rxjs";
import {MapService} from "@app/_services";
import {takeUntil} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
// import conf from "@app/_core/conf";

export interface MarkerFromBackend {
	EntityPath?: string;
	FieldAddress?: string;
	FieldEducationalInstitutionTy?: string;
	FieldOwnershipType?: string;
	FieldSchoolContactEmail?: string;
	FieldSchoolContactPhone?: string;
	FieldSchoolName?: string;
	FieldSchoolWebpageAddress?: string;
	FieldSearchAddress?: string;
	FieldSpecialClass?: string;
	FieldStudentHome?: string;
	FieldTeachingLanguage?: string;
	Lat?: string;
	Lon?: string;
	Nid?: string;
}
// this interface become needed when moving from @agm-map to the @angular/google-maps. Its purpose not to rewrite the response of backend
export interface MarkerForGoogleMaps extends MarkerFromBackend {
	position?: google.maps.LatLngLiteral,
	label?: google.maps.MarkerLabel,
	title?: string,
	options?: google.maps.MarkerOptions,
}

@Component({
	selector: 'map1',
	templateUrl: './map1.component.html',
	styleUrls: ['./map1.component.scss']
})
export class Map1Component implements OnInit, OnChanges, OnDestroy {
	private destroy$ = new ReplaySubject(1);

	@Input() loading: boolean;
	@Input() type: string;	// 'markers' | 'polygons'
	@Input() height = '600px';
	@Input() width = '100%';
	@Input() zoom = 7.4;
	@Input() center: google.maps.LatLngLiteral = {	lat: 58.5822061, lng: 24.7065513 };
	@Input() options: google.maps.MapOptions;
	@Input() markers: MarkerFromBackend[] | TootukassaJobOffer[];
	@Input() markerOptions: google.maps.MarkerOptions;
	@Input() markerClustererOptions: MarkerClustererOptions;

	@ViewChild(GoogleMap, { static: false }) map: GoogleMap;
	@ViewChild(MapInfoWindow, { static: false }) infoWindow: MapInfoWindow;

	updatedMarkers: MarkerForGoogleMaps[];
	markerForInfoWindow: MarkerForGoogleMaps;

	@Input() polygonData: any = false;
	@Input() polylineOptions: google.maps.PolylineOptions = { strokeColor: 'red', strokeWeight: 1 };
	public polygons: any;
	public polygonLayer: string = 'county';
	private polygonCoords: any;
	public heatmap: any;
	vertices: google.maps.LatLngLiteral[];

	geoJsonObject: Object = {
		"type": "FeatureCollection",
		"features": [
			{
				"type": "Feature",
				"properties": {
					"letter": "G",
					"color": "blue",
					"rank": "7",
					"ascii": "71"
				},
				"geometry": {
					"type": "Polygon",
					"coordinates": [
						[
							[123.61, -22.14], [122.38, -21.73], [121.06, -21.69], [119.66, -22.22], [119.00, -23.40],
							[118.65, -24.76], [118.43, -26.07], [118.78, -27.56], [119.22, -28.57], [120.23, -29.49],
							[121.77, -29.87], [123.57, -29.64], [124.45, -29.03], [124.71, -27.95], [124.80, -26.70],
							[124.80, -25.60], [123.61, -25.64], [122.56, -25.64], [121.72, -25.72], [121.81, -26.62],
							[121.86, -26.98], [122.60, -26.90], [123.57, -27.05], [123.57, -27.68], [123.35, -28.18],
							[122.51, -28.38], [121.77, -28.26], [121.02, -27.91], [120.49, -27.21], [120.14, -26.50],
							[120.10, -25.64], [120.27, -24.52], [120.67, -23.68], [121.72, -23.32], [122.43, -23.48],
							[123.04, -24.04], [124.54, -24.28], [124.58, -23.20], [123.61, -22.14]
						]
					]
				}
			},
			{
				"type": "Feature",
				"properties": {
					"letter": "o",
					"color": "red",
					"rank": "15",
					"ascii": "111"
				},
				"geometry": {
					"type": "Polygon",
					"coordinates": [
						[
							[128.84, -25.76], [128.18, -25.60], [127.96, -25.52], [127.88, -25.52], [127.70, -25.60],
							[127.26, -25.79], [126.60, -26.11], [126.16, -26.78], [126.12, -27.68], [126.21, -28.42],
							[126.69, -29.49], [127.74, -29.80], [128.80, -29.72], [129.41, -29.03], [129.72, -27.95],
							[129.68, -27.21], [129.33, -26.23], [128.84, -25.76]
						],
						[
							[128.45, -27.44], [128.32, -26.94], [127.70, -26.82], [127.35, -27.05], [127.17, -27.80],
							[127.57, -28.22], [128.10, -28.42], [128.49, -27.80], [128.45, -27.44]
						]
					]
				}
			},
			{
				"type": "Feature",
				"properties": {
					"letter": "o",
					"color": "yellow",
					"rank": "15",
					"ascii": "111"
				},
				"geometry": {
					"type": "Polygon",
					"coordinates": [
						[
							[131.87, -25.76], [131.35, -26.07], [130.95, -26.78], [130.82, -27.64], [130.86, -28.53],
							[131.26, -29.22], [131.92, -29.76], [132.45, -29.87], [133.06, -29.76], [133.72, -29.34],
							[134.07, -28.80], [134.20, -27.91], [134.07, -27.21], [133.81, -26.31], [133.37, -25.83],
							[132.71, -25.64], [131.87, -25.76]
						],
						[
							[133.15, -27.17], [132.71, -26.86], [132.09, -26.90], [131.74, -27.56], [131.79, -28.26],
							[132.36, -28.45], [132.93, -28.34], [133.15, -27.76], [133.15, -27.17]
						]
					]
				}
			},
			{
				"type": "Feature",
				"properties": {
					"letter": "g",
					"color": "blue",
					"rank": "7",
					"ascii": "103"
				},
				"geometry": {
					"type": "Polygon",
					"coordinates": [
						[
							[138.12, -25.04], [136.84, -25.16], [135.96, -25.36], [135.26, -25.99], [135, -26.90],
							[135.04, -27.91], [135.26, -28.88], [136.05, -29.45], [137.02, -29.49], [137.81, -29.49],
							[137.94, -29.99], [137.90, -31.20], [137.85, -32.24], [136.88, -32.69], [136.45, -32.36],
							[136.27, -31.80], [134.95, -31.84], [135.17, -32.99], [135.52, -33.43], [136.14, -33.76],
							[137.06, -33.83], [138.12, -33.65], [138.86, -33.21], [139.30, -32.28], [139.30, -31.24],
							[139.30, -30.14], [139.21, -28.96], [139.17, -28.22], [139.08, -27.41], [139.08, -26.47],
							[138.99, -25.40], [138.73, -25.00], [138.12, -25.04]
						],
						[
							[137.50, -26.54], [136.97, -26.47], [136.49, -26.58], [136.31, -27.13], [136.31, -27.72],
							[136.58, -27.99], [137.50, -28.03], [137.68, -27.68], [137.59, -26.78], [137.50, -26.54]
						]
					]
				}
			},
			{
				"type": "Feature",
				"properties": {
					"letter": "l",
					"color": "green",
					"rank": "12",
					"ascii": "108"
				},
				"geometry": {
					"type": "Polygon",
					"coordinates": [
						[
							[140.14, -21.04], [140.31, -29.42], [141.67, -29.49], [141.59, -20.92], [140.14, -21.04]
						]
					]
				}
			},
			{
				"type": "Feature",
				"properties": {
					"letter": "e",
					"color": "red",
					"rank": "5",
					"ascii": "101"
				},
				"geometry": {
					"type": "Polygon",
					"coordinates": [
						[
							[144.14, -27.41], [145.67, -27.52], [146.86, -27.09], [146.82, -25.64], [146.25, -25.04],
							[145.45, -24.68], [144.66, -24.60], [144.09, -24.76], [143.43, -25.08], [142.99, -25.40],
							[142.64, -26.03], [142.64, -27.05], [142.64, -28.26], [143.30, -29.11], [144.18, -29.57],
							[145.41, -29.64], [146.46, -29.19], [146.64, -28.72], [146.82, -28.14], [144.84, -28.42],
							[144.31, -28.26], [144.14, -27.41]
						],
						[
							[144.18, -26.39], [144.53, -26.58], [145.19, -26.62], [145.72, -26.35], [145.81, -25.91],
							[145.41, -25.68], [144.97, -25.68], [144.49, -25.64], [144, -25.99], [144.18, -26.39]
						]
					]
				}
			}
		]
	};

	constructor(private mapService: MapService, private http: HttpClient) {}

	ngOnInit(): void {
		if (this.type === 'polygons') {
			this.mapService.polygonLayer.pipe(takeUntil(this.destroy$)).subscribe((layer) => {
				this.getPolygons();
				this.mapService.previousPolygonLayer = layer;
			});
		}
	}

	private getPolygons() {
		this.loading = true;
		const url = `/assets/polygons/${this.polygonLayer}.json`;
		this.http.get(url).pipe(takeUntil(this.destroy$)).subscribe({
			next: (data) => {
				this.polygonCoords = data;
				this.heatmap = this.mapService.generateHeatMap('oskaFields', this.polygonData[this.polygonLayer]); // this.options.polygonType,
				this.polygons = this.mapService.mapPolygonData('oskaFields', data,	this.polygonData[this.polygonLayer], this.heatmap);	// this.options.polygonType

				// this.polygonMarkers = this.mapService.mapPolygonLabels(
				// 	data, !this.options.enablePolygonModal, this.options.polygonType);
				// if (this.polygonMarkers) {
				// 	this.cdr.detectChanges();
				// }

				console.log('p: ', this.polygons);

				// this.vertices = this.polygons.features[0].geometry.coordinates[0][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// tooni
				// this.vertices = this.polygons.features[0].geometry.coordinates[1][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// tartu
				// this.vertices = this.polygons.features[1].geometry.coordinates[0].map((item) => ({ lat: item[1],	lng: item[0] }));	// jogeva
				// this.vertices = this.polygons.features[2].geometry.coordinates[0].map((item) => ({ lat: item[1],	lng: item[0] }));	// rapla
				// this.vertices = this.polygons.features[3].geometry.coordinates[0][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// salusaar
				// this.vertices = this.polygons.features[3].geometry.coordinates[1][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// woru
				// this.vertices = this.polygons.features[3].geometry.coordinates[1][1].map((item) => ({ lat: item[1],	lng: item[0] }));	// woru small
				// this.vertices = this.polygons.features[4].geometry.coordinates[0][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// above loksa
				// this.vertices = this.polygons.features[4].geometry.coordinates[1][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// naissaar
				// this.vertices = this.polygons.features[4].geometry.coordinates[2][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// aegna
				// this.vertices = this.polygons.features[4].geometry.coordinates[3][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// rammu
				// this.vertices = this.polygons.features[4].geometry.coordinates[4][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// krasuli
				// this.vertices = this.polygons.features[4].geometry.coordinates[5][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// hara
				// this.vertices = this.polygons.features[4].geometry.coordinates[6][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// pedassaar
				// this.vertices = this.polygons.features[4].geometry.coordinates[7][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// koipsi
				// this.vertices = this.polygons.features[4].geometry.coordinates[8][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// rohusi
				// this.vertices = this.polygons.features[4].geometry.coordinates[9][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// pakri
				// this.vertices = this.polygons.features[4].geometry.coordinates[10][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// prangli
				// this.vertices = this.polygons.features[4].geometry.coordinates[11][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// aksi
				// this.vertices = this.polygons.features[4].geometry.coordinates[12][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// harjumaa
				// this.vertices = this.polygons.features[5].geometry.coordinates[0][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// pahksaar (vortsjarv)
				// this.vertices = this.polygons.features[5].geometry.coordinates[1][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// valgamaa
				// this.vertices = this.polygons.features[6].geometry.coordinates[0][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// uhtju
				// this.vertices = this.polygons.features[6].geometry.coordinates[1][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// vaindloo
				// this.vertices = this.polygons.features[6].geometry.coordinates[2][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// kuradi
				// this.vertices = this.polygons.features[6].geometry.coordinates[3][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// rakvere
				// this.vertices = this.polygons.features[7].geometry.coordinates[0][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[7].geometry.coordinates[1][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// polva
				// this.vertices = this.polygons.features[8].geometry.coordinates[0][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[8].geometry.coordinates[1][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[8].geometry.coordinates[2][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[8].geometry.coordinates[3][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[8].geometry.coordinates[4][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[8].geometry.coordinates[5][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[8].geometry.coordinates[6][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[8].geometry.coordinates[7][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[8].geometry.coordinates[8][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[8].geometry.coordinates[9][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[8].geometry.coordinates[10][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[8].geometry.coordinates[11][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// parnu
				// this.vertices = this.polygons.features[8].geometry.coordinates[12][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[8].geometry.coordinates[13][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[8].geometry.coordinates[14][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[9].geometry.coordinates[0].map((item) => ({ lat: item[1],	lng: item[0] }));	// paide
				// this.vertices = this.polygons.features[10].geometry.coordinates[0][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[10].geometry.coordinates[1][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[10].geometry.coordinates[2][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[10].geometry.coordinates[3][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[10].geometry.coordinates[4][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[10].geometry.coordinates[5][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[10].geometry.coordinates[6][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// narva
				// this.vertices = this.polygons.features[11].geometry.coordinates[0].map((item) => ({ lat: item[1],	lng: item[0] }));	// viljandi
				// this.vertices = this.polygons.features[12].geometry.coordinates[0][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// viljandi
				// this.vertices = this.polygons.features[12].geometry.coordinates[1][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[12].geometry.coordinates[2][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[12].geometry.coordinates[3][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[12].geometry.coordinates[4][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[12].geometry.coordinates[5][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[12].geometry.coordinates[6][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[12].geometry.coordinates[7][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[12].geometry.coordinates[8][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[12].geometry.coordinates[9][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[12].geometry.coordinates[10][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[12].geometry.coordinates[11][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[12].geometry.coordinates[12][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[12].geometry.coordinates[13][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[12].geometry.coordinates[14][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[12].geometry.coordinates[15][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[12].geometry.coordinates[16][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[12].geometry.coordinates[17][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[12].geometry.coordinates[18][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[12].geometry.coordinates[19][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[12].geometry.coordinates[20][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[12].geometry.coordinates[21][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// hiiumaa
				// this.vertices = this.polygons.features[12].geometry.coordinates[21][1].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[12].geometry.coordinates[22][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[13].geometry.coordinates[0][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[13].geometry.coordinates[1][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[13].geometry.coordinates[2][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[13].geometry.coordinates[3][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[13].geometry.coordinates[4][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[13].geometry.coordinates[5][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[13].geometry.coordinates[5][1].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[13].geometry.coordinates[6][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[13].geometry.coordinates[7][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[13].geometry.coordinates[8][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[13].geometry.coordinates[9][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[13].geometry.coordinates[10][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[13].geometry.coordinates[11][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[13].geometry.coordinates[12][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// haapsalu
				// this.vertices = this.polygons.features[13].geometry.coordinates[13][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[13].geometry.coordinates[14][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[13].geometry.coordinates[15][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[13].geometry.coordinates[16][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[13].geometry.coordinates[17][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[13].geometry.coordinates[18][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[13].geometry.coordinates[19][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[0][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[1][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[1][1].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[2][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[3][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[4][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[4][1].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[5][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[6][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[6][1].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[7][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[8][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[9][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[10][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[11][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[12][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[13][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[14][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[15][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[16][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[17][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[18][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[19][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[20][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[21][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[22][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[23][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[24][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[25][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[26][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[27][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[28][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				this.vertices = this.polygons.features[14].geometry.coordinates[29][0].map((item) => ({ lat: item[1],	lng: item[0] }));	// saaremaa
				// this.vertices = this.polygons.features[14].geometry.coordinates[30][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
				// this.vertices = this.polygons.features[14].geometry.coordinates[31][0].map((item) => ({ lat: item[1],	lng: item[0] }));	//
			}, complete: () => {
				this.loading = false;
			}
		});
	}

	ngOnChanges(changes: SimpleChanges): void {
		this.updatedMarkers = this.markers.map((marker) => ({
			...marker,
			position: {
				lat: +marker.Lat,
				lng: +marker.Lon,
			},
			title: marker.FieldSchoolName | marker.FieldName,
		}));
	}

	zoomIn(): void {
		if (this.zoom < this.options.maxZoom) this.zoom++;
	}

	zoomOut(): void {
		if (this.zoom > this.options.minZoom) this.zoom--;
	}

	getCurrentPosition(): void {
		navigator.geolocation.getCurrentPosition((position) => {
			this.center = {
				lat: position.coords.latitude,
				lng: position.coords.longitude,
			};
			this.zoom = 12.4;
		});
	}

	mapClick(event: google.maps.MapMouseEvent | google.maps.IconMouseEvent) {
		console.log('map clicked: ', event);
	}

	openInfoWindow(markerElement: MapMarker, marker: MarkerForGoogleMaps): void {
		this.markerForInfoWindow = marker;
		this.infoWindow.open(markerElement);
		console.log(marker);
	}

	logCenter(): void {
		console.log('the centre of the map: ', JSON.stringify(this.map.getCenter()));
	}

	logZoom(): void {
		console.log('Current zoom: ', this.zoom);
	}

	addMarker(): void {
		this.updatedMarkers.push({
			position: {
				lat: this.center.lat + ((Math.random() - 0.5) * 5) / 10,
				lng: this.center.lng + ((Math.random() - 0.5) * 2) / 10,
			},
			label: {
				color: 'red',
				text: 'Marker label ' + (this.markers.length + 1),
			},
			title: 'Marker title ' + (this.markers.length + 1),
			options: { animation: google.maps.Animation.BOUNCE },
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next(null);
		this.destroy$.complete();
	}
}
