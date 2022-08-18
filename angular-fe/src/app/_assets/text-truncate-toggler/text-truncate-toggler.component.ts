import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'text-truncate-toggler',
  templateUrl: './text-truncate-toggler.component.html',
  styleUrls: ['./text-truncate-toggler.component.scss'],
})
export class TextTruncateTogglerComponent implements OnInit, OnChanges {
  @Input() input: string;
  @Input() limit: number;
  public expanded = false;
  public toggleButton = false;
  public unsanitary: SafeHtml;

  constructor(private sanitize: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.input) {
      this.unsanitary = this.sanitize.bypassSecurityTrustHtml(changes.input.currentValue);
    }
  }

  ngOnInit(): void {
    this.toggleButton = this.inputOverLimit();
  }

  private inputOverLimit(): boolean {
    return this.input?.length > this.limit;
  }

  public toggle(): void {
    this.expanded = !this.expanded;
  }
}
