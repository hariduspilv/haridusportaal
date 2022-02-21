import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from "@angular/google-maps";
import conf from "@app/_core/conf";

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
export class Map1Component implements OnChanges {
	@Input() loading: boolean;

	@Input() height = '600px';
	@Input() width = '100%';
	@Input() zoom = 7.4;
	@Input() center: google.maps.LatLngLiteral = {	lat: 58.5822061, lng: 24.7065513 };
	@Input() options: google.maps.MapOptions = {
		backgroundColor: '#fff',
		clickableIcons: true,
		disableDefaultUI: true,
		disableDoubleClickZoom: false,
		fullscreenControl: false,
		fullscreenControlOptions: null,
		gestureHandling: 'auto',	// 'cooperative' | 'greedy' | 'none' | 'auto'
		keyboardShortcuts: true,
		mapTypeControl: false,
		mapTypeId: 'roadmap',	// 'hybrid' | 'roadmap' | 'satellite' | 'terrain'
		maxZoom: 16,
		minZoom: 7,
		scrollwheel: true,
		styles: [ ...conf.defaultMapStyles ],
		zoomControl: false,
	};
	@Input() markers: MarkerFromBackend[];
	@Input() markerOptions: google.maps.MarkerOptions = {
		draggable: false,
		icon: '/assets/img/marker.svg',
	};

	@ViewChild(GoogleMap, { static: false }) map: GoogleMap;
	@ViewChild(MapInfoWindow, { static: false }) infoWindow: MapInfoWindow;

	updatedMarkers: MarkerForGoogleMaps[];
	infoContent = '';
	// markerClustererImagePath = 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m';
	// markerClustererImagePath = '/assets/img/cluster';
	markerClustererOptions: MarkerClustererOptions = {
		// imageExtension: 'svg',
		styles: [{
			anchorText: [16, 0],
			fontFamily: 'Arial, sans-serif',
			fontWeight: 'bold',
			height: 50,
			textColor: '#ffffff',
			width: 28,
			url: '/assets/img/cluster.svg'
		}],
	};

	ngOnChanges(changes: SimpleChanges): void {
		this.updatedMarkers = this.markers.map((marker) => ({
			...marker,
			position: {
				lat: +marker.Lat,
				lng: +marker.Lon,
			},
			title: marker.FieldSchoolName,
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

	openInfoWindow(marker: MapMarker, schoolName: string): void {
		this.infoContent = schoolName;
		this.infoWindow.open(marker);
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
}
