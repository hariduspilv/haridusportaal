import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[keystrokes]'
})
export class KeystrokesDirective {

  @Output()
  private keystrokes: EventEmitter<void>;

  private sequence: string[];

  private keystrokesCode: string[];

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.keyCode) {
      this.sequence.push(event.keyCode.toString());

      if (this.sequence.length > this.keystrokesCode.length) {
        this.sequence.shift();
      }

      if (this.iskeystrokesCode()) {
        this.events();
        this.keystrokes.emit();
      }
    }
  }

  fonts() {
    const css = "@import url('https://fonts.googleapis.com/css?family=Gochi+Hand'); *{font-family:'Gochi Hand', cursive !important;}";
    const style = document.createElement('style');
    document.head.appendChild(style);
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
  }

  colors() {
    const css = `
      .mat-toolbar, .mat-button, .mat-raised-button{background:rgb(236, 105, 204) !important;}
      .breadcrumba a{color:rgb(236, 105, 204) !important;}
      .mat-drawer-content a, .mat-drawer-content h1{color:rgb(236, 105, 204) !important;}
      a, h1{color:rgb(236, 105, 204);}
    `;
    const style = document.createElement('style');
    document.head.appendChild(style);
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
  }

  images() {
    const images = document.querySelectorAll('img');
    Array.prototype.forEach.call(images, function(el, i){
      let src = el.src;
      let tmp = new Image();
      tmp.onload = function(){
        el.src = 'https://www.placecage.com/gif/'+el.width+'/'+el.height;
      }
      tmp.src = src;
    });
  }

  events() {
    this.fonts();
    this.colors();
    //this.images();
  }

  constructor() {
    this.keystrokes = new EventEmitter<void>();
    this.sequence = [];
    this.keystrokesCode = ['38', '38', '40', '40', '37', '39', '37', '39', '66', '65'];
  }

  iskeystrokesCode(): boolean {
    return this.keystrokesCode.every((code: string, index: number) => code === this.sequence[index]);
  }
}