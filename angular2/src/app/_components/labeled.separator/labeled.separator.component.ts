import { Component, Input } from "@angular/core";

@Component({
  selector: "labeled-separator",
  templateUrl: "labeled.separator.template.html",
  styleUrls: ["labeled.separator.styles.scss"]
})

export class LabeledSeparatorComponent {
  @Input() label;
}