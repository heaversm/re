import p5 from "p5";

export class RE5 {
  constructor() {
    //will hold references to each sketch
    this.p1 = null;
    this.p2 = null;
  }

  re5 = () => {
    const $modal2 = document.getElementById("modal-2");
    const windowWidth = $modal2.offsetWidth;
    const windowHeight = $modal2.offsetHeight;

    let sketchRenderer;
    let sketch2Renderer;
    const frameRate = 10;

    const s1 = function (sketch) {
      const barSize = 1;
      const numBars = windowWidth;
      const squareSize = windowHeight * (2 / 3);

      sketch.setup = function () {
        sketchRenderer = sketch.createCanvas(windowWidth, windowHeight);
        sketchRenderer.parent("sketch");
        sketch.frameRate(frameRate);
      };

      sketch.draw = function () {
        sketch.clear();
        sketch.noStroke();
        const frameMod = sketch.frameCount % 3;
        let frameAdjust = 0;
        if (frameMod === 0) {
          frameAdjust = -1;
        } else if (frameMod === 2) {
          frameAdjust = 1;
        }

        for (let i = 0; i < numBars; i++) {
          if (i % 2 === 0) {
            sketch.fill("white");
          } else {
            sketch.fill("black");
          }
          sketch.rect(barSize * i, 0, barSize, windowHeight);
        }

        sketch.fill("black");
        sketch.rect(
          windowWidth / 2 - windowHeight / 2 + frameAdjust,
          0,
          windowHeight,
          windowHeight
        );
        sketch.fill(234, 62, 246);
        sketch.rect(
          windowWidth / 2 - squareSize / 2 - frameAdjust,
          windowHeight / 2 - squareSize / 2,
          squareSize,
          squareSize
        );
      };
    };

    const s2 = function (sketch) {
      const squareSize = windowHeight / 3;
      sketch.setup = function () {
        sketch2Renderer = sketch.createCanvas(windowWidth, windowHeight);
        sketch2Renderer.parent("sketch2"); //p5 won't let you do multiple canvases, but this doesn't work either
        sketch.frameRate(frameRate);
      };

      sketch.draw = function () {
        sketch.clear();
        sketch.noStroke();
        sketch.fill("yellow");

        const frameMod = sketch.frameCount % 3;
        let frameAdjust = 0;
        if (frameMod === 0) {
          frameAdjust = 1;
        } else if (frameMod === 2) {
          frameAdjust = -1;
        }

        sketch.rect(
          windowWidth / 2 - squareSize / 2 - frameAdjust,
          windowHeight / 2 - squareSize / 2,
          squareSize,
          squareSize
        );
      };
    };

    const initSketch = () => {
      this.p1 = new p5(s1);
      this.p2 = new p5(s2);
    };

    initSketch();
  };

  init() {
    return this.re5();
  }
  removeSketch() {
    this.p1.remove();
    this.p2.remove();
  }
}
