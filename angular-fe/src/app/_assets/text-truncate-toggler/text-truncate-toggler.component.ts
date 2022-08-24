import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'text-truncate-toggler',
  templateUrl: './text-truncate-toggler.component.html',
  styleUrls: ['./text-truncate-toggler.component.scss'],
})
export class TextTruncateTogglerComponent implements OnInit {
  @Input() input: string;
  @Input() limit: number;
  public expanded = false;
  public toggleButton = false;

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
