/* globals BABYLON */

import createScene from "./scene.js";

window.addEventListener("DOMContentLoaded", async function () {
  const canvas = document.getElementById("renderCanvas");
  const fpsDiv = document.getElementById("fps");

  const engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
  });
  engine.hideLoadingUI();

  const scene = await createScene(engine);

  window.engine = engine;

  engine.runRenderLoop(function () {
    scene.render();
    fpsDiv.innerHTML = engine.getFps().toFixed();
  });

  window.addEventListener("resize", function () {
    engine.resize();
  });

  async function readAlpha(x, y) {
    const invertedY = engine.getRenderHeight() - y;
    const [, , , alpha] = await engine.readPixels(x, invertedY, 1, 1);
    return alpha;
  }

  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    window.addEventListener("touchstart", async (e) => {
      const { clientX: x, clientY: y } = e.touches[0];
      const alpha = await readAlpha(x, y);
      if (alpha === 0) {
        canvas.style.pointerEvents = "none";
        const underlyingElement = document.elementFromPoint(x, y);
        if (underlyingElement) {
          underlyingElement.click();
        }
        canvas.style.pointerEvents = "auto";
      }
    });
  } else {
    window.addEventListener("mousemove", async (e) => {
      const { x, y } = e;
      const alpha = await readAlpha(x, y);
      if (alpha === 0) {
        canvas.style.pointerEvents = "none";
      } else {
        canvas.style.pointerEvents = "auto";
      }
    });
  }
});
