import { Injectable } from '@angular/core';

@Injectable()
export class RippleService {
  animate($event, theme:string = 'light') {
    const target = $event.originalTarget || $event.target;

    const left = $event.pageX - target.offsetLeft;
    const top = $event.pageY - target.offsetTop;

    const width = target.offsetWidth;
    const ratio = width / 100;
    const speed = 1.3 * ((ratio / 4) < 1.3 ? 1.3 : (ratio / 3));
    console.log(ratio);
    const ripple = document.createElement('span');
    ripple.style.left = `${left}px`;
    ripple.style.top = `${top}px`;
    ripple.style.position = 'absolute';
    ripple.style.width = '1em';
    ripple.style.height = '1em';
    ripple.style.background = theme === 'light' ? '#fff' : '#cfcfcf';
    ripple.style.marginLeft = '-0.5em';
    ripple.style.marginTop = '-0.5em';
    ripple.style.borderRadius = '1em';
    ripple.style.fontSize = `${ratio}rem`;
    ripple.style.pointerEvents = 'none';
    ripple.style.animationFillMode = 'both';
    ripple.style.animation = `ripple ${speed}s`;
    ripple.classList.add('ripple');

    target.appendChild(ripple);

    setTimeout(
      () => {
        target.removeChild(ripple);
      },
      speed * 1000);
  }
}
