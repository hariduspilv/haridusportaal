import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable()
export class TitleService {
  public site = 'Haridusportaal edu.ee';
  public delimeter = '|';
  public currentTitle: string = '';

  constructor(
    private titleService: Title) {}

  public setTitle(title: string): void {
    this.currentTitle = title;
    this.titleService.setTitle(this.getFullTitle());
  }

  public getTitle(): string {
    return this.currentTitle;
  }

  public getFullTitle(): string {
    return this.currentTitle !== ''
      ? `${this.currentTitle} ${this.delimeter} ${this.site}`
      : this.site;
  }
}
