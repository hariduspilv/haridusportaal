import { Injectable } from '@angular/core';

@Injectable()
export class RippleService {

  animate($event, theme:string = 'light') {
    const target = $event.originalTarget || $event.target;

    const left = $event.pageX - target.getBoundingClientRect().left - window.pageXOffset;
    const top = $event.pageY - target.getBoundingClientRect().top - window.pageYOffset;

    const width = target.offsetWidth;
    const ratio = width / 100;
    const speed = 1.3 * ((ratio / 6) < 1.3 ? 1.3 : (ratio / 6));

    const ripple = document.createElement('span');
    ripple.style.left = `${left}px`;
    ripple.style.top = `${top}px`;
    ripple.style.position = 'absolute';
    ripple.style.width = '1em';
    ripple.style.height = '1em';
    ripple.style.background = theme === 'light' ? '#fff' : '#cfcfcf';
    ripple.style.marginLeft = '-0.5em';
    ripple.style.marginTop = '-0.5em';
    ripple.style.opacity = '0';
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
