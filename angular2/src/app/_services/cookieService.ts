import { Injectable, Component, NgModule,Input,ComponentFactory,ComponentRef, ComponentFactoryResolver, ViewContainerRef, ChangeDetectorRef, TemplateRef, ViewChild, Output, EventEmitter} from '@angular/core';
import { CookieNotification } from '@app/_components/cookieNotification/cookieNotification.component';

@Injectable()
export class CookieService {

  container: any;
  componentRef: ComponentRef<any>;

  constructor(
    private resolver: ComponentFactoryResolver
  ){

  }

  checkDnT() {
    // Do not Track
    let enabled = false;
    if (window['doNotTrack'] || navigator['doNotTrack'] || navigator['msDoNotTrack'] || 'msTrackingProtectionEnabled' in window.external) {
      if (window['doNotTrack'] == "1" || navigator['doNotTrack'] == "yes" || navigator['doNotTrack'] == "1" || navigator['msDoNotTrack'] == "1" || ( window['external']['msTrackingProtectionEnabled'] && window['external']['msTrackingProtectionEnabled']() ) ) {
        enabled = true;
      } else {
        enabled = false;
      }
    } else {
      enabled = true;
    }

    return enabled;
  }

  cookiesAllowed() {
    let allowed = true;

    this.set("test", "123");

    if( this.get("test") == "123" ){
      allowed = true;
      this.remove("test");
    }

    return allowed;
  }

  isAuthorized() {

    this.cookiesAllowed();

    if( this.cookiesAllowed() && this.checkDnT() ){
      return "not_allowed";
    }else{
      return this.get("cookies_allowed") == "1" ? true : false;
    }
    
  }

  authorize() {
    this.set("cookies_allowed", "1");
  }

  decline() {
    this.set("cookies_allowed", "0");
  }

  set(name, value, days = 365) {
    let expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  }

  get(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        let c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  }

  remove(name) {
    document.cookie = name+'=; Max-Age=-99999999;';  
  }

}