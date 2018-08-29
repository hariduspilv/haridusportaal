import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'searchNews'
})
export class FilterPipe implements PipeTransform {
  
  transform(items: any[], nameSearch: string, dateMinSearch: number, dateMaxSearch: number, tagSearch: any){
    if (items && items.length){
      
      return items.filter( item =>{
        
        
        if (nameSearch && item.entityTranslation.entityLabel.toLowerCase().indexOf(nameSearch.toLowerCase()) === -1){
          return false;
        }
        if (item.entityTranslation.created < dateMinSearch) {
          return false;
        }
        if (item.entityTranslation.created > dateMaxSearch) {
          return false;
        }
        
        
        let found = item.entityTranslation.fieldNewsTag.some( r => {
          if (tagSearch != null) {
            return tagSearch.entityLabel.includes(r.entity.entityLabel)
          }
        });
        
        
        // item tag - item.entityTranslation.fieldNewsTag.map((item) => { item.entity.entityLabel });
        // tag - tagSearch.map((item) => { item.entityLabel });
        // if item tag has an tag
        
        // item.entityTranslation.fieldNewsTag.some(
        //   (itemTag) => {

        
        //     // if (tagSearch!=null) {
        //     //   tagSearch.some((tsItem) => {                
        //     //     if (tsItem.entityLabel === itemTag.entity.entityLabel) {
        //     //       return true;
        //     //     }
        //     //   })
        
        //     // }
        //   }
        // )      
        
        return true;
      })
    }
    else{
      return items;
    }
  }
}