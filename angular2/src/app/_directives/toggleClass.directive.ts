import { Directive, ElementRef, Renderer2, OnInit, Input, HostListener, OnChanges } from '@angular/core';

import { RouterModule, Routes, Router, NavigationEnd } from '@angular/router';

// Directive decorator
@Directive({ selector: '[appToggleClass]' })

// Directive class
export class ToggleClassDirective implements OnInit, OnChanges {
    @Input() hasChildren: any;
    private className: string;
    @Input() routerLink: any;
    element: any;

    constructor(private el: ElementRef, private renderer: Renderer2, private router: Router) {
      this.element = el;

      router.events.subscribe(event => {

        if (event instanceof NavigationEnd) {

          setTimeout(() => {
            const hostElem = this.element.nativeElement.parentElement;

            this.renderer.removeClass(this.element.nativeElement, 'mat-menu-item-active-parent' );
            this.renderer.removeClass( this.element.nativeElement.parentElement, 'menu-open' );
            if ( hostElem.innerHTML.match(/(class=")([^"]*mat-menu-item-active(?!-)[^"]*|[^"]*isActive[^"]*)(")/gi)) {
              this.renderer.addClass( this.element.nativeElement, 'mat-menu-item-active-parent' );
              this.renderer.addClass( this.element.nativeElement.parentElement, 'menu-open' );
            }

          }, 0);
        }
      });


    }
    ngOnInit() {
      this.className = this.element.nativeElement.attributes.apptoggleclass.nodeValue;
      setTimeout(() => {
        const hostElem = this.element.nativeElement.parentElement;

        this.renderer.removeClass(this.element.nativeElement, 'mat-menu-item-active-parent' );
        this.renderer.removeClass( this.element.nativeElement.parentElement, 'menu-open' );
        if ( hostElem.innerHTML.match(/(class=")([^"]*mat-menu-item-active(?!-)[^"]*|[^"]*isActive[^"]*)(")/gi)) {
          this.renderer.addClass( this.element.nativeElement, 'mat-menu-item-active-parent' );
          this.renderer.addClass( this.element.nativeElement.parentElement, 'menu-open' );
        }

      }, 0);
    }

    ngOnChanges() {
      setTimeout(() => {
        this.element.nativeElement.setAttribute('href', 'javascript:void(0);');
        const hostElem = this.element.nativeElement.parentElement;

        if ( hostElem.innerHTML.match( this.className)  ) {
          this.renderer.addClass( this.element.nativeElement.parentElement, this.className );
        }
      }, 0);
    }


    @HostListener('click', ['$event'])
    toggle($event, renderer) {
      $event.stopPropagation();

      const currentClass = this.element.nativeElement.parentElement.attributes.class.nodeValue;
      
      // Close opened submenus
      let openSubmenus = document.querySelectorAll('.subcategory.menu-open');
      openSubmenus[0] && openSubmenus[0].classList.remove('menu-open');

      if ( currentClass.indexOf( this.className ) !== -1) {
        this.renderer.removeClass(this.element.nativeElement.parentElement, this.className );
      } else {
        this.renderer.addClass( this.element.nativeElement.parentElement, this.className );
      }

    }

}
