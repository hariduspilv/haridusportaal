import { Injectable } from '@angular/core';

@Injectable()
export class RippleService {
  animate(nativeElement, $event) {
    const target = $event.originalTarget || $event.target;

    const left = $event.pageX - target.offsetLeft;
    const top = $event.pageY - target.offsetTop;

    const width = target.offsetWidth;
    const ratio = width / 200;
    const speed = 0.75;

    const ripple = document.createElement('span');
    ripple.style.left = `${left}px`;
    ripple.style.top = `${top}px`;
    ripple.style.position = 'absolute';
    ripple.style.width = '1em';
    ripple.style.height = '1em';
    ripple.style.background = '#cfcfcf';
    ripple.style.marginLeft = '-0.5em';
    ripple.style.marginTop = '-0.5em';
    ripple.style.borderRadius = '1em';
    ripple.style.fontSize = `${ratio}rem`;
    ripple.style.pointerEvents = 'none';
    ripple.style.animation = `ripple ${speed}s`;
    ripple.classList.add('ripple');

    nativeElement.appendChild(ripple);
    setTimeout(
      () => {
        nativeElement.removeChild(ripple);
      },
      speed * 1000);
  }
}
