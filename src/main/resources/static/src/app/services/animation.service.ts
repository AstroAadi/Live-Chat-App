// background-animation.service.ts

import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class animationService {
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  addBackgroundEffect(): void {
    const background = this.renderer.createElement('div');
    this.renderer.addClass(background, 'background');
    this.renderer.appendChild(document.body, background);

    // Add stars
    for (let i = 0; i < 50; i++) {
      const star = this.renderer.createElement('div');
      this.renderer.addClass(star, 'star');
      this.renderer.setStyle(star, 'top', `${Math.random() * 100}%`);
      this.renderer.setStyle(star, 'left', `${Math.random() * 100}%`);
      this.renderer.appendChild(background, star);
    }

    // Add flowers
    for (let i = 0; i < 15; i++) {
      const flower = this.renderer.createElement('div');
      this.renderer.addClass(flower, 'flower');
      this.renderer.setStyle(flower, 'top', `${Math.random() * 100}%`);
      this.renderer.setStyle(flower, 'left', `${Math.random() * 100}%`);
      this.renderer.appendChild(background, flower);
    }
  }
}
