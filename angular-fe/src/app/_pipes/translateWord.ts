import { Pipe, PipeTransform } from '@angular/core';
import { getTranslatedWord } from "@app/_core/router-utility";

@Pipe({
	name: 'translateWord',
})
export class TranslateWord implements PipeTransform {
	transform(word: string): string {
		return word !== '' ? getTranslatedWord(word) : '';
	}
}
