export default {
  api_prefix: 'https://htm.wiseman.ee/',
  patterns: {
    idCode: '[1-6][0-9]{2}[0,1][0-9][0,1,2,3][0-9][0-9]{4}',
    minLength3: '[0-9a-zA-Z]{3,}',
  },
  defaultPolygonColors: [
    '#FBE5C4',
    '#FBD291',
    '#F8B243',
    '#F89229',
    '#E2770D',
    '#D5401A',
    '#8B2F17',
  ],
  defaultMapOptions: {
    center: {
      lat: 58.5822061,
      lng: 24.7065513,
    },
    zoom: 7.4,
    icon: '/assets/img/marker.svg',
    clusterStyles: [
      {
        textColor: '#FFFFFF',
        url: '/assets/img/cluster.svg',
        height: 50,
        width: 28,
      },
    ],
    styles: [],
  },
  defaultMapStyles: [
    {
      featureType: 'administrative',
      elementType: 'labels.text.fill',
      stylers: [
        { color: '#444444' },
      ],
    },
    {
      featureType: 'landscape',
      elementType: 'all',
      stylers: [
        { color: '#f2f2f2' },
      ],
    },
    {
      featureType: 'poi',
      elementType: 'all',
      stylers: [
        { visibility: 'off' },
      ],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text',
      stylers: [
        { visibility: 'off' },
      ],
    },
    {
      featureType: 'road',
      elementType: 'all',
      stylers: [
        { saturation: -100 },
        { lightness: 45 },
      ],
    },
    {
      featureType: 'road.highway',
      elementType: 'all',
      stylers: [
        { visibility: 'simplified' },
      ],
    },
    {
      featureType: 'road.arterial',
      elementType: 'labels.icon',
      stylers: [
        { visibility: 'off' },
      ],
    },
    {
      featureType: 'transit',
      elementType: 'all',
      stylers: [
        { visibility: 'off' },
      ],
    },
    {
      featureType: 'water',
      elementType: 'all',
      stylers: [
        { color: '#dbdbdb' },
        { visibility: 'on' },
      ],
    },
  ],
};
