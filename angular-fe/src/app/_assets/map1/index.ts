// import { Loader } from "@googlemaps/js-api-loader";

// Loading the Maps JavaScript API

// let map: google.maps.Map;
// const additionalMapOptions = {};

// const loader = new Loader({
// 	apiKey: "AIzaSyD0sqq4HN0rVOzSvsMmLhFerPYO67R_e7E",
// 	version: "weekly",
// 	language: 'et',
// 	region: 'EE',
// 	...additionalMapOptions,
// });

// const defaultMapOptions = {
// 	center: { lat: 58.5822061, lng: 24.7065513 },
// 	zoom: 7.4,
// };

// loader.load()
// 	.then(() => {
// 		const mapDiv = document.getElementById('map') as HTMLElement;
// 		if (mapDiv) map = new google.maps.Map(mapDiv, defaultMapOptions);
// 	})
// 	.catch((e) => console.log('error: ', e));

// ===================================================

let googleMapsApiScript = document.createElement('script');
googleMapsApiScript.src = 'https://maps.googleapis.com/maps/api/js?region=EE&language=et&key=AIzaSyD0sqq4HN0rVOzSvsMmLhFerPYO67R_e7E';
document.body.appendChild(googleMapsApiScript);

let mapMarkerClustererScript = document.createElement('script');
mapMarkerClustererScript.src = 'https://unpkg.com/@googlemaps/markerclustererplus/dist/index.min.js';
document.body.appendChild(mapMarkerClustererScript);

// export { map };
export * from './map1.component';
