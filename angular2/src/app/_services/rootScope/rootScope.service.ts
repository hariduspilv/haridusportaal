export class RootScopeService{
  data: Object = {};
  constructor (){}
  set(key, value) {
    this.data[key] = value;
  }
  get(key) {
    return this.data[key];
  }
}