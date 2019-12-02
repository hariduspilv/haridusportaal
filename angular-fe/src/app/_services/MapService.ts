import { Injectable } from '@angular/core';
import conf from '@app/_core/conf';
import { EuroCurrencyPipe } from '@app/_pipes/euroCurrency.pipe';
import { LocaleNumberPipe } from '@app/_pipes/localeNumber';

@Injectable({
  providedIn: 'root',
})

export class MapService {
  public activeFontSize: string = '';
  public fontSizes: Object = {
    sm: '13px',
    md: '18px',
    lg: '22px',
  };
  public infoLayer: {} = {};
  public polygonValueLabels: {} = {};
  public polygonColors: {} = {};
  public fieldMaxRanges: Object = {};
  private labelOptions = {
    lightColor: 'white',
    color: 'black',
    fontSize: '13px',
    fontWeight: 'regular',
  };
  generateHeatMap (type, data) {
    let maxSum = 0;
    const sumArray = [];
    const fieldSums = {};
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
          if (item['division'] > fieldSums[item.mapIndicator] || (!fieldSums[item.mapIndicator])) {
            fieldSums[item.mapIndicator] = item['division'];
          }
        });
        conf.defaultPolygonColors.forEach((item, index) => {
          const tmpArray = {
            amount: index + 1,
            color: item,
          };
          sumArray.push(tmpArray);
        });
        this.fieldMaxRanges = fieldSums;
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
              this.polygonColors[properties['NIMI_LUHIKE']] = parseInt(o, 10) + 1;
              break;
            }
          }
          properties['color'] = color;
        }
        break;
      case 'oskaFields':
        this.polygonValueLabels = {};
        for (const i in polygonData['features']) {
          const current = polygonData['features'][i];
          const properties = current['properties'];
          const shortName = properties['NIMI_LUHIKE']
            ? properties['NIMI_LUHIKE'].toLowerCase() : '';
          let match:any = false;
          for (const o in requestData) {
            if (shortName === requestData[o].county.toLowerCase()) {
              match = requestData[o];
              this.polygonValueLabels[properties['NIMI_LUHIKE']] = match.investmentAmountSum;
            }
          }
          let color = heatmap[0];
          for (const o in heatmap) {
            if (!match.division) {
              color = '#cfcfcf';
              properties['value'] = 'Puudub';
            } else if (match.division === heatmap[o]['amount']) {
              color = heatmap[o]['color'];
              properties['value']
                = this.polygonValueLabels[properties['NIMI_LUHIKE']] = match.value;
              this.polygonColors[properties['NIMI_LUHIKE']] = parseInt(o, 10) + 1;
              break;
            }
          }
          properties['color'] = color;
        }
        break;
    }
    return polygonData;
  }
  mapPolygonLabels (polygons, extraLabels, polygonType) {
    if (polygons && polygons['features']) {
      const extraLabelArr = [];
      const polygonMarkers = polygons['features'].map((elem) => {
        const current = elem.properties['NIMI_LUHIKE'];
        const color = this.polygonColors[current] === 7
          ? this.labelOptions.lightColor : this.labelOptions.color;
        const fontSize = this.activeFontSize || this.labelOptions.fontSize;
        const fontWeight = this.labelOptions.fontWeight;
        if (extraLabels && elem.geometry.center) {
          let text =
            this.polygonValueLabels[current] && !this.polygonValueLabels[current].includes('%')
            ? `${new LocaleNumberPipe().transform(this.polygonValueLabels[current])}`
            : this.polygonValueLabels[current];
          if (polygonType === 'investment') {
            text = this.polygonValueLabels[current] ?
              new EuroCurrencyPipe().transform(this.polygonValueLabels[current]) : '';
          }
          let latitude = elem.geometry.center.latitudeSm;
          if (this.activeFontSize === this.fontSizes['md']) {
            latitude = elem.geometry.center.latitudeMd;
          } else if (this.activeFontSize === this.fontSizes['lg']) {
            latitude = elem.geometry.center.latitudeLg;
          }
          extraLabelArr.push({
            latitude,
            longitude: elem.geometry.center ? elem.geometry.center.longitude : '',
            labelOptions: { color, fontSize, fontWeight, text },
          });
        }
        return {
          latitude: elem.geometry.center ? elem.geometry.center.latitude : '',
          longitude: elem.geometry.center ? elem.geometry.center.longitude : '',
          labelOptions: { color, fontSize, fontWeight, text: current || elem.properties['NIMI'] },
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
          currency: $event.feature.getProperty('investmentAmountSum') || '',
          value: $event.feature.getProperty('value'),
        };
    }
  }

  groupYears(data) {
    const output = [];

    for (const i in data) {
      const unix = data[i].investmentDeadline.unix;
      let year:any = new Date(parseFloat(unix) * 1000);
      year = year.getFullYear();

      if (output.indexOf(year) === -1) {
        output.push(year);
      }
    }
    return output;
  }

  parseInfoWindowMarkerData(data: any): any {
    for (const i in data) {
      const current = data[i];
      const unix = new Date(current.investmentDeadline['unix'] * 1000);
      const year:any = unix.getFullYear();
      current.year = parseFloat(year);
    }
    return data;
  }
}
