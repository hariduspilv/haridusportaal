import { Injectable } from '@angular/core';
import conf from '@app/_core/conf';
import { LatLngLiteral } from '@agm/core';

@Injectable({
  providedIn: 'root',
})

export class MapService {
  public activeFontSize: string = '';
  public fontSizes: Object = {
    sm: '14px',
    md: '18px',
    lg: '22px',
  };
  public infoLayer: {} = {};
  public polygonValueLabels: {} = {};
  private labelOptions = {
    lightColor: 'white',
    color: 'black',
    fontSize: '14px',
    fontWeight: 'regular',
  };
  generateHeatMap (type, data) {
    let maxSum = 0;
    const sumArray = [];
    switch (type) {
      case 'investment':
        data.forEach((item) => {
          if (item.investmentAmountSum > maxSum) {
            maxSum = item.investmentAmountSum;
          }
        });
        if (maxSum === 0) { maxSum = 1000000; }
        const sumPartial = maxSum / conf.defaultPolygonColors.length;
        conf.defaultPolygonColors.forEach((item, index) => {
          const multiplier:number = index + 1;
          const tmpArray = {
            maxAmount: multiplier * sumPartial,
          };
          if (multiplier !== 1) {
            tmpArray['minAmount'] = index * sumPartial;
          } else {
            tmpArray['minAmount'] = 1000;
          }
          tmpArray['color'] = item;
          sumArray.push(tmpArray);
        });
        return sumArray;
      case 'oskaFields':
        data.forEach((item) => {
          if (item['division'] > maxSum) {
            maxSum = item['division'];
          }
        });
        conf.defaultPolygonColors.forEach((item, index) => {
          const tmpArray = {
            amount: index + 1,
            color: item,
          };
          sumArray.push(tmpArray);
        });
        return sumArray;
      default:
        console.error('Error generating heatmap (MapService.ts).');
        return null;
    }
  }
  mapPolygonData (type, polygonData, requestData, heatmap) {
    switch (type) {
      case 'investment':
        this.polygonValueLabels = {};
        for (const i in polygonData['features']) {
          const current = polygonData['features'][i];
          const properties = current['properties'];
          const name = properties['NIMI'].toLowerCase();
          const shortName = properties['NIMI_LUHIKE']
            ? properties['NIMI_LUHIKE'].toLowerCase() : '';
          let match:any = false;
          for (const o in requestData) {
            if (name === requestData[o].investmentLocation.toLowerCase()
              || shortName === requestData[o].investmentLocation.toLowerCase()) {
              match = requestData[o];
            }
          }
          let color = heatmap[0];
          for (const o in heatmap) {
            if (!match.investmentAmountSum) {
              color = '#cfcfcf';
            } else if (match.investmentAmountSum >= heatmap[o]['minAmount']
              && match.investmentAmountSum <= heatmap[o]['maxAmount']) {
              color = heatmap[o]['color'];
              properties['investmentAmountSum']
                = this.polygonValueLabels[properties['NIMI_LUHIKE']] = match.investmentAmountSum;
              break;
            }
          }
          properties['color'] = color;
        }
        return polygonData;
    }
  }
  mapPolygonLabels (polygons, extraLabels) {
    if (polygons && polygons['features']) {
      const extraLabelArr = [];
      const polygonMarkers = polygons['features'].map((elem) => {
        if (extraLabels) {
          extraLabelArr.push({
            latitude: elem.geometry.center ? elem.geometry.center.latitudeSm : '',
            longitude: elem.geometry.center ? elem.geometry.center.longitude : '',
            labelOptions: {
              color: this.labelOptions.color,
              fontSize: this.labelOptions.fontSize,
              fontWeight: this.labelOptions.fontWeight,
              text: this.polygonValueLabels[elem.properties['NIMI_LUHIKE']] ?
                `${this.polygonValueLabels[elem.properties['NIMI_LUHIKE']]} €` :
                null,
            },
          });
        }
        return {
          latitude: elem.geometry.center ? elem.geometry.center.latitude : '',
          longitude: elem.geometry.center ? elem.geometry.center.longitude : '',
          labelOptions: {
            color: this.labelOptions.color,
            fontSize: this.labelOptions.fontSize,
            fontWeight: this.labelOptions.fontWeight,
            text: elem.properties['NIMI_LUHIKE'] || elem.properties['NIMI'],
          },
        };
      });
      return [...polygonMarkers, ...extraLabelArr];
    }
  }
  polygonStyles(feature) {
    let color = '#cfcfcf';
    const keys = Object.keys(feature).join(',').split(',');

    for (const i in keys) {
      const key = keys[i];
      if (feature[key] && feature[key]['color']) {
        color = feature[key]['color'];
      }
    }
    return {
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 1,
      strokeOpacity: 1,
      clickable: true,
    };
  }
  layerClick($event, type) {
    switch (type) {
      case 'investment':
        let mouse;
        for (const i in $event) {
          if (typeof $event[i] === 'object' && $event[i]['clientX']) {
            mouse = $event[i];
          }
        }
        this.infoLayer = {
          left: `${mouse['clientX']}px`,
          top: `${mouse['clientY']}px`,
          latitude: $event.latLng.lat(),
          longitude: $event.latLng.lng(),
          status: true,
          title: $event.feature.getProperty('NIMI_LUHIKE') || $event.feature.getProperty('NIMI'),
          currency: $event.feature.getProperty('investmentAmountSum') ?
            `${Number($event.feature.getProperty('investmentAmountSum'))} €` : '0 €',
        };
    }
  }
  layerClickStatus($isOpen: boolean) {
    this.infoLayer['status'] = $isOpen;
  }
}
