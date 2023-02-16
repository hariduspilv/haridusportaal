export default {
  api_prefix: 'https://api.hp.edu.ee/',
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
    center: [
      24.7065513,
      58.5822061,
    ],
    zoom: 8.5,
    icon: '/assets/img/marker.svg',
    clusterStyles: [
      {
        textColor: '#FFFFFF',
        url: '/assets/img/cluster.svg',
        height: 50,
        width: 28,
        anchorText: [16, 0],
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
      },
    ],
    styles: [],
  },
};
