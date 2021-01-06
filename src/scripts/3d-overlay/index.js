import { Engine } from '@babylonjs/core/Engines/engine';

import createScene from './scene';

export default async function (canvas, events) {
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
  engine.hideLoadingUI();

  const scene = await createScene(engine, events);

  engine.runRenderLoop(function(){
    scene.render();
  });

  window.addEventListener('resize', function(){
    engine.resize(true);
  });

  // allow mouse interaction with both the 3D overlay and the underlying HTML
  // by setting pointer-events: false on the render canvas
  // when the pixel at the current mouse location has an alpha value of 0

  async function readAlpha(x, y) {
    const invertedY = engine.getRenderHeight() - y;
    const [, , , alpha] = await engine.readPixels(x, invertedY, 1, 1);
    return alpha;
  }

  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    window.addEventListener('touchstart', async e => {
      const { clientX: x, clientY: y } = e.touches[0];
      const alpha = await readAlpha(x, y);
      if (alpha === 0) {
        canvas.style.pointerEvents = 'none';
        const underlyingElement = document.elementFromPoint(x, y);
        if (underlyingElement) {
          underlyingElement.click();
        }
        canvas.style.pointerEvents = 'auto';
      }
    });
  } else {
    window.addEventListener('mousemove', async e => {
      const { x, y } = e;
      const alpha = await readAlpha(x, y);
      if (alpha === 0) {
        canvas.style.pointerEvents = 'none';
      } else {
        canvas.style.pointerEvents = 'auto';
      }
    });
  }
}
