import { Injectable } from '@angular/core';
import { AlertsService } from './AlertsService';

@Injectable({ providedIn: 'root' })

export class CookieService {

  constructor (
    private alertsService: AlertsService,
  ) {}

  /**
   * Agree to terms and services and clear cookie notification
   */
  agreeTerms() {
    this.authorize();
    // this.showCookieNotification = false;
    this.alertsService.clear('cookie');
    // this.showChat();
  }
  /**
   * Checks whether DoNotTrack is enabled
   * @returns boolean
   */
  checkDnT() {
    // Do not Track
    let enabled = false;

    try {
      if (
        window['doNotTrack'] ||
        navigator['doNotTrack'] ||
        navigator['msDoNotTrack'] ||
        (window.external && 'msTrackingProtectionEnabled' in window.external)
      ) {
        if (
          window['doNotTrack'] === '1' ||
          navigator['doNotTrack'] === 'yes' ||
          navigator['doNotTrack'] === '1' ||
          navigator['msDoNotTrack'] === '1' ||
          (
            window['external']['msTrackingProtectionEnabled'] &&
            window['external']['msTrackingProtectionEnabled']()
          )
        ) {
          enabled = true;
        } else {
          enabled = false;
        }
      } else {
        enabled = false;
      }
    } catch (err) {
      enabled = false;
    }
    return enabled;
  }

  /**
   * Check whether cookies are allowed or not
   * @returns boolean
   */
  cookiesAllowed() {
    let allowed = true;

    this.set('test', '123');

    if (this.get('test') === '123') {
      allowed = true;
      this.remove('test');
    }

    return allowed;
  }

  /**
   * Check if cookies are allowed
   * @returns boolean
   */
  isAuthorized() {

    this.cookiesAllowed();

    if (this.cookiesAllowed() && this.checkDnT()) {
      return 'not_allowed';
    }
    return this.get('cookies_allowed') === '1' ? true : false;
  }

  /**
   * Save allowed preference
   */
  authorize() {
    this.set('cookies_allowed', '1');
  }

  /**
   * Save declined preference
   */
  decline() {
    this.set('cookies_allowed', '0');
  }

  /**
   * Set cookie value
   * @param name - cookie name
   * @param value - cookie value
   * @param [days] - cookie expiration in days
   */
  set (name: any, value: any, days = 365) {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${(value || '')}${expires}; path=/; SameSite=Strict; Secure`;
    // document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  }

  /**
   * Get cookie
   * @param name - cookie name
   * @returns cookie value
   */
  get (name) {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0 ; i < ca.length; i += 1) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  /**
   * Delete cookie
   * @param name
   */
  remove(name) {
    document.cookie = `${name}=; Max-Age=-99999999; path=/; SameSite=Strict; Secure`;
  }
}
