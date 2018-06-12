import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable()
export class MetaTagsService{

  activeTags: Array<string>;

  constructor(
    private meta: Meta,
    private title: Title
  ){}

  clearTags() {
    for( var i in this.activeTags ){
      let tag = this.activeTags[i];
      this.meta.removeTag(tag);
    }
  }

  set(metaTags: object){

    this.clearTags();

    console.log(metaTags);
    if( metaTags == null ){ return false; }

    for( var i in metaTags ){
      let tag = metaTags[i];
      this.meta.addTag(tag.key, tag.value);
    }

  }
}