import { Component, Output, Injectable} from '@angular/core';

@Injectable()
export class TableService {
  slide: any;

  scrollStart(id, right) {
    this.slide = setInterval(() => {
      const element = document.getElementById(id);
      if (right) {
        element.scrollLeft += 24;
      } else {
        element.scrollLeft -= 24;
      }
      if ((element.scrollWidth - element.scrollLeft) <= element.clientWidth || element.scrollLeft === 0) {
        this.scrollEnd()
      }
    }, 50);
  }

  scrollEnd() {
    window.clearInterval(this.slide);
  }

  isOverflownWhileScrolling(event) {
    const element = event.target || event.srcElement || event.currentTarget;
    return (element.scrollWidth - element.scrollLeft) > element.clientWidth;
  }

  isElemOverflown(id) {
    const element = document.getElementById(id);
    if (element) {
      return (element.scrollWidth - element.scrollLeft) > element.clientWidth;
    }
    return false
  }

  isElemAtStart(id) {
    const element = document.getElementById(id)
    return !(element && element.scrollLeft)
  }
  
}