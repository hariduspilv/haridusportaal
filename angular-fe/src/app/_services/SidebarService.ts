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
    const uniforms: string[] = [
      'prosCons',
      'fieldContact',
      'fieldEventLocation',
      'fieldSchoolLocation',
      'fieldRegistration',
    ];
    const keysToMerge: Object = {};
    uniforms.forEach((item, key) => {
      const uniformType: Object = {};
      Object.entries(data).forEach((elem) => {
        if (!elem[1] || (elem[1] instanceof Array && !elem[1].length)) {
          delete data[elem[0]];
        } else if (this.types[item].includes(elem[0])) {
          uniformType[elem[0]] = elem[1];
        }
      });
      if (Object.keys(uniformType).length) {
        data[uniforms[key]] = uniformType;
      }
    });
    return data;
  }
}
