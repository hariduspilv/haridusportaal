import { DeviceDetectorService } from 'ngx-device-detector';
import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { translatePath } from "@app/_core/router-utility";
import { Location } from '@angular/common';
@Injectable({
	providedIn: 'root',
})
export class SidemenuService {
	// Open menu by default when front page is opened
	private subject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
		this.isFrontPage() &&
		this.deviceDetectorService.isDesktop()
	);
	private theme: BehaviorSubject<string> = new BehaviorSubject<string>('default');
	private langSwitch = new Subject<any>();

	/**
	 * These paths should not open the menu automatically on load.
	 */
	public ignoreAutoOpen = [translatePath('/õppimine'), translatePath('/karjäär'), translatePath('/õpetaja'), translatePath('/noored')];
	public themes = {
		õppimine: 'learning',
		learning: 'learning',
		õpetamine: 'teaching',
		teaching: 'teaching',
		karjäär: 'career',
		career: 'career',
		noored: 'youth',
		youth: 'youth',
		noortevaldkond: 'youth',
	};

	constructor(private location: Location, private deviceDetectorService: DeviceDetectorService) {}

	force = false;
	lang: any;

	get isVisible() {
		return this.subject.getValue();
	}

	get isVisibleSubscription() {
		return this.subject;
	}

	get currentTheme(): string {
		return this.theme.getValue();
	}

	get themeSubscription() {
		return this.theme;
	}

	get isMobileView() {
		return window.innerWidth <= 1024;
	}

	toggle() {
		this.subject.next(!this.subject.getValue());
	}

	close() {
		this.subject.next(false);
	}

	setTheme(theme: string): void {
		this.theme.next(theme);
	}

	triggerLang(force:boolean = false) {

		// force language switch on login to load main nav
		this.force = force;

		this.langSwitch.next({ any: Math.random() * 1000000 });
	}

	resetPageFocus(): void {
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
		document.body.setAttribute('tabindex', '-1');
		document.body.focus();
		document.body.removeAttribute('tabindex');
	}

	isFrontPage(): boolean {
		const path = decodeURI(this.location?.path());
		return !path;
	}
}
