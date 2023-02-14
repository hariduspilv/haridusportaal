import { InjectionToken } from "@angular/core";
import { IOlMap } from "../interfaces/ol-map.interface";

export const OL_MAP_TOKEN = new InjectionToken<IOlMap>('OL_MAP_TOKEN');
