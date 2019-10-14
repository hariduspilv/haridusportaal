import { Subject } from 'rxjs';

export class RootScopeService{
  data: Object = {
    compareObservable: new Subject<any>(),
    mapStyles: [{ featureType:'administrative', elementType:'labels.text.fill', stylers:[{ color:'#444444' }] }, { featureType:'landscape', elementType:'all', stylers:[{ color:'#f2f2f2' }] }, { featureType:'poi', elementType:'all', stylers:[{ visibility:'off' }] }, { featureType:'poi', elementType:'labels.text', stylers:[{ visibility:'off' }] }, { featureType:'road', elementType:'all', stylers:[{ saturation:-100 }, { lightness:45 }] }, { featureType:'road.highway', elementType:'all', stylers:[{ visibility:'simplified' }] }, { featureType:'road.arterial', elementType:'labels.icon', stylers:[{ visibility:'off' }] }, { featureType:'transit', elementType:'all', stylers:[{ visibility:'off' }] }, { featureType:'water', elementType:'all', stylers:[{ color:'#dbdbdb' }, { visibility:'on' }] }],
  };
  constructor () {}
  set(key, value) {
    this.data[key] = value;
  }
  get(key) {
    return this.data[key];
  }
}
