import { Subject } from 'rxjs/Subject';

export class RootScopeService{
  data: Object = {
    compareObservable: new Subject<any>(),
  };
  constructor (){}
  set(key, value) {
    this.data[key] = value;
  }
  get(key) {
    return this.data[key];
  }
}
