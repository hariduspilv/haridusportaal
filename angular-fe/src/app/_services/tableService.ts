import { Injectable } from '@angular/core';

@Injectable()
export class TableService {
  slide: any;

  /**
   * Scrolls start
   * @param id - scrollable element ID
   * @param right - right position in PX
   */
  scrollStart(id, right) {
    this.slide = setInterval(
      () => {
        const element = document.getElementById(id);
        if (right) {
          element.scrollLeft += 24;
        } else {
          element.scrollLeft -= 24;
        }
        if (
          (element.scrollWidth - element.scrollLeft) <= element.clientWidth ||
          element.scrollLeft === 0
        ) {
          this.scrollEnd();
        }
      },
      50);
  }

  /**
   * Clear scrolling interval
   */
  scrollEnd() {
    window.clearInterval(this.slide);
  }

  /**
   * Determines whether overflown while scrolling
   * @param event - scrolling event
   * @returns - boolean
   */
  isOverflownWhileScrolling(event) {
    const element = event.target || event.srcElement || event.currentTarget;
    return (element.scrollWidth - element.scrollLeft) > element.clientWidth;
  }

  /**
   * Determines whether elem is overflown
   * @param id - scrollable element ID
   * @returns - boolean
   */
  isElemOverflown(id) {
    const element = document.getElementById(id);
    if (element) {
      return (element.scrollWidth - element.scrollLeft) > element.clientWidth;
    }
    return false;
  }

  /**
   * Determines whether elem scrollLeft is 0
   * @param id - scrollable element ID
   * @returns - boolean
   */
  isElemAtStart(id) {
    const element = document.getElementById(id);
    return !(element && element.scrollLeft);
  }
}
