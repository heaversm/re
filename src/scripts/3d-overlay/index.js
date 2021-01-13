import { Engine } from '@babylonjs/core/Engines/engine';

import createOverlayScene from './overlay-scene';
import createCharacterScene from './character-scene';

export default async function (overlayCanvas, characterCanvas, models, events, isMobile) {
  // Babylon.js views rely on canvas.drawImage() which has bad performance on Firefox
  // see https://bugzilla.mozilla.org/show_bug.cgi?id=1602299
  const useMultipleEngines = true;
  // const useMultipleEngines = /Firefox/.test(navigator.userAgent);

  const engineOptions = { preserveDrawingBuffer: true, stencil: true };

  let overlayEngine = null;
  let characterEngine = null;
  if (!useMultipleEngines) {
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = overlayCanvas.width;
    offscreenCanvas.height = overlayCanvas.height;

    overlayEngine = characterEngine = new Engine(offscreenCanvas, false, engineOptions, true);
    overlayEngine.hideLoadingUI();
    overlayEngine.inputElement = overlayCanvas;
  } else {
    overlayEngine = new Engine(overlayCanvas, false, engineOptions, true);
    overlayEngine.hideLoadingUI();

    characterEngine = new Engine(characterCanvas, false, engineOptions, true);
    characterEngine.hideLoadingUI();
    characterEngine.resize(true);
  }

  const overlayScene = await createOverlayScene(overlayEngine, models, events, isMobile);
  const characterScene = await createCharacterScene(characterEngine, models, events);

  if (useMultipleEngines) {
    overlayEngine.runRenderLoop(function() {
      overlayScene.render();
    });
    characterEngine.runRenderLoop(function() {
      characterScene.render();
    })
  } else {
    const overlayView = overlayEngine.registerView(overlayCanvas, overlayScene.activeCamera);
    const overlay2DContext = overlayCanvas.getContext('2d');
    overlay2DContext.imageSmoothingEnabled = false;

    const characterView = overlayEngine.registerView(characterCanvas, characterScene.activeCamera);
    const character2DContext = characterCanvas.getContext('2d');
    character2DContext.imageSmoothingEnabled = false;

    overlayEngine.runRenderLoop(function() {
      if (overlayEngine.activeView === overlayView) {
        overlay2DContext.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        overlayScene.render();
      } else if (overlayEngine.activeView === characterView) {
        character2DContext.clearRect(0, 0, characterCanvas.width, characterCanvas.height);
        characterScene.render();
      }
    });
  }

  window.addEventListener('resize', function() {
    overlayEngine.resize(true);
    if (useMultipleEngines) {
      characterEngine.resize(true);
    }
  });

  events.onResizeSketchContainer.add(() => {
    if (useMultipleEngines) {
      characterEngine.resize(true);
    }
  })

  // allow mouse interaction with both the 3D overlay and the underlying HTML
  // by setting pointer-events: false on the render canvas
  // when the pixel at the current mouse location has an alpha value of 0

  async function readAlpha(x, y) {
    const invertedY = overlayEngine.getRenderHeight() - y / overlayEngine.getHardwareScalingLevel();
    const [, , , alpha] = await overlayEngine.readPixels(x / overlayEngine.getHardwareScalingLevel(), invertedY, 1, 1);
    return alpha;
  }

  if (!isMobile) {
    window.addEventListener('mousemove', async e => {
      const { x, y } = e;
      const alpha = await readAlpha(x, y);
      if (alpha === 0) {
        overlayCanvas.style.pointerEvents = 'none';
      } else {
        overlayCanvas.style.pointerEvents = 'auto';
      }
      events.onMouseMove.notifyObservers({
        x: x / overlayEngine.getHardwareScalingLevel() / overlayEngine.getRenderWidth(),
        y: y / overlayEngine.getHardwareScalingLevel() / overlayEngine.getRenderHeight(),
      });
    });
  }
}
