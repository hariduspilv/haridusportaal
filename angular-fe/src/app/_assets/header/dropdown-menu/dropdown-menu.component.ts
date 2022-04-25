import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LanguageCodes, SettingsService } from "@app/_services";
import { TranslateService } from "@app/_modules/translate/translate.service";

@Component({
	selector: 'dropdown-menu',
	templateUrl: 'dropdown-menu.component.html',
	styleUrls: ['dropdown-menu.component.scss']
})
export class DropdownMenuComponent {
	@Input() options: Record<string, string | LanguageCodes>[];
	@Output() onLanguageChange = new EventEmitter<LanguageCodes>();

	activeLanguageCode: string = this.settings.currentAppLanguage;
	activeLanguage = this.translate.get(`frontpage.${this.settings.currentAppLanguage}`);

	constructor(
		private settings: SettingsService,
		private translate: TranslateService,
	) {}

	onClick(code: LanguageCodes) {
		this.activeLanguageCode = code;
		this.activeLanguage = this.translate.get(`frontpage.${code}`);
		this.onLanguageChange.emit(code);
	}
}
