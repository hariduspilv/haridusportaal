import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable()
export class MetaTagsService{

  activeTags: Array<string> = [];

  specialTags: Array<string>;

  constructor(
    private meta: Meta,
    private title: Title
  ){
    this.specialTags = ["title"]
  }

  clearTags() {

    for( var i in this.activeTags ){
      let tag = this.activeTags[i];
      this.meta.removeTag("name="+tag);
    }
    this.activeTags = [];
  }

  isSpecial(tag:object) {
    return this.specialTags.includes( tag['name'] );
  }

  handleSpecial(tag:object) {
    
    switch( tag['name'] ){
      case "title": {
        this.title.setTitle(tag['value']);
      }
      default: {
        
      }
    }

  }

  set(metaTags: object){

    this.clearTags();

    if( metaTags == null ){ return false; }

    for( var i in metaTags ){
      let tag = metaTags[i];
      if( this.isSpecial( tag ) ){
        this.handleSpecial(tag);
      }else{
        this.activeTags.push(tag['name']);
        this.meta.addTag(tag);
      }
    }

  }
}