import { Injectable } from '@angular/core';
import { uniformTypes } from '../_assets/sidebar/helpers/sidebar';
interface UniformType {
  [key: string]: string[];
}

@Injectable({
  providedIn: 'root',
})

export class SidebarService {
  private types: UniformType = uniformTypes;
  public mapUniformKeys(data) {
    const uniforms: string[] = ['prosCons'];
    const keysToMerge: Object = {};
    uniforms.forEach((item, key) => {
      const uniformType: Object = {};
      // const keysToDelete: string[] = [];
      Object.entries(data).forEach((elem) => {
        if (this.types[item].includes(elem[0])) {
          uniformType[elem[0]] = elem[1];
          // keysToDelete.push(elem[0]);
        }
      });
      if (Object.keys(uniformType).length) {
        data[uniforms[key]] = uniformType;
      }
      // keysToDelete.forEach(del => delete data[del]);
    });
    return data;
  }
}
