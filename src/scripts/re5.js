import p5 from "p5";

export class RE5 {
  constructor(onResizeObserver, onMouseMoveObserver) {
    //will hold references to each sketch
    this.p1 = null;
    this.p2 = null;
    onResizeObserver.add(([containerWidth, containerHeight]) => {
      if (this.p1) {
        this.p1.resizeCanvas(containerWidth, containerHeight);
        this.p1.handleResizeCanvas(containerWidth, containerHeight);
      }
      if (this.p2) {
        this.p2.resizeCanvas(containerWidth, containerHeight);
      }
    });
    onMouseMoveObserver.add(({ x, y }) => {
      if (this.p1) {
        this.p1.handleMouseMove(x, y);
      }

      if (this.p2) {
        this.p2.handleMouseMove(x, y);
      }
    });
  }

  re5 = () => {
    const $modal2 = document.getElementById("modal-2");
    let windowWidth = $modal2.offsetWidth;
    let windowHeight = $modal2.offsetHeight;

    let sketchRenderer;
    let sketch2Renderer;
    const frameRate = 30;

    let adjustAmount;
    const minAdjust = -15;
    const maxAdjust = 15;

    let insideBox = false;

    const mapRange = function (value, low1, high1, low2, high2) {
      return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
    };

    const s1 = function (sketch) {
      const barSize = 1;
      let numBars;
      let squareSize;

      sketch.setup = function () {
        sketchRenderer = sketch.createCanvas(windowWidth, windowHeight);
        sketchRenderer.parent("sketch");
        sketch.frameRate(frameRate);
        sketch.handleSizeCalcs();
      };

      sketch.handleResizeCanvas = function (cw, ch) {
        windowWidth = cw;
        windowHeight = ch;
        sketch.handleSizeCalcs();
      };

      sketch.handleSizeCalcs = function () {
        squareSize = windowHeight / 2;
        numBars = Math.ceil(windowWidth / barSize);
      };

      sketch.handleMouseMove = function (x, y) {
        adjustAmount = mapRange(x, 0, 1, minAdjust, maxAdjust);
        if (x > 0.3 && x < 0.7) {
          insideBox = true;
        } else {
          insideBox = false;
        }
      };

      sketch.draw = function () {
        sketch.clear();
        sketch.noStroke();
        const frameMod = sketch.frameCount % 3;
        let frameAdjust = 0;
        const startSquareX = windowWidth / 2 - windowHeight / 2;
        const availableSpace = windowWidth - windowHeight;
        if (frameMod === 0) {
          frameAdjust = -adjustAmount;
        } else if (frameMod === 2) {
          frameAdjust = adjustAmount;
        }

        for (let i = 0; i < numBars; i++) {
          if (i % 2 === 0) {
            sketch.fill(255, 255, 255);
          } else {
            sketch.fill(0, 0, 0);
          }
          sketch.rect(barSize * i, 0, barSize, windowHeight);
        }
        sketch.fill(0, 0, 0);
        if (!insideBox) {
          sketch.rect(
            startSquareX + frameAdjust,
            0,
            windowHeight,
            windowHeight
          );
          sketch.fill(255, 0, 255);
        } else {
          sketch.rect(frameAdjust, 0, startSquareX, windowHeight);

          sketch.rect(
            startSquareX + windowHeight + frameAdjust,
            0,
            availableSpace / 2,
            windowHeight
          );
          sketch.fill(255, 255, 0);
        }

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

      sketch.handleMouseMove = function (x, y) {};

      sketch.draw = function () {
        sketch.clear();
        sketch.noStroke();

        const frameMod = sketch.frameCount % 3;
        let frameAdjust = 0;
        if (frameMod === 0) {
          frameAdjust = adjustAmount;
        } else if (frameMod === 2) {
          frameAdjust = -adjustAmount;
        }

        if (insideBox) {
          sketch.fill(255, 0, 255);
        } else {
          sketch.fill(255, 255, 0);
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
