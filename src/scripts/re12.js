import p5 from "p5";

export class RE12 {
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
        this.p2.handleResizeCanvas(containerWidth, containerHeight);
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

  re12 = () => {
    const $modal2 = document.getElementById("modal-2");
    let windowWidth = $modal2.offsetWidth;
    let windowHeight = $modal2.offsetHeight;

    let sketchRenderer;
    let sketch2Renderer;

    const frameRate = 30;

    let mouseDown = false;
    let maxAdjust = 50;
    let adjustAmount = 0;

    const mapRange = function (value, low1, high1, low2, high2) {
      return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
    };

    const randomInt = function (min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    };

    const s1 = function (sketch) {
      sketch.setup = function () {
        sketchRenderer = sketch.createCanvas(windowWidth, windowHeight);
        sketchRenderer.parent("sketch");
        sketch.frameRate(frameRate);
      };

      sketch.draw = function () {
        sketch.clear();
        sketch.background(51, 51, 51);
      };

      sketch.handleResizeCanvas = function (cw, ch) {
        windowWidth = cw;
        windowHeight = ch;
        sketch.resizeCanvas(windowWidth, windowHeight);
      };

      sketch.handleMouseMove = function (x, y) {
        if (mouseDown) {
          return;
        }
        adjustAmount = mapRange(y, 0, 1, -maxAdjust, maxAdjust);
      };
    };

    const s2 = function (sketch) {
      let squareSize;

      sketch.setup = function () {
        sketch2Renderer = sketch.createCanvas(windowWidth, windowHeight);
        sketch2Renderer.parent("sketch2");
        sketch.frameRate(frameRate);
        sketch.handleSizeCalcs();
        sketch.rectMode(sketch.CENTER);
        sketch.angleMode(sketch.DEGREES);
      };

      sketch.handleResizeCanvas = function (cw, ch) {
        sketch.handleSizeCalcs();
      };

      sketch.handleSizeCalcs = function () {
        squareSize = windowHeight / 3;
      };

      sketch.mousePressed = function () {
        mouseDown = true;
      };

      sketch.mouseReleased = function () {
        mouseDown = false;
      };

      sketch.handleMouseMove = function (x, y) {
        if (mouseDown) {
          return;
        }
      };

      sketch.draw = function () {
        const frameMod = sketch.frameCount % 2;
        const frameMod2 = sketch.frameCount % 3;
        sketch.clear();
        sketch.noStroke();

        sketch.fill(51, 51, 51);

        if (!mouseDown) {
          sketch.rect(
            windowWidth / 2,
            windowHeight / 2,
            squareSize,
            squareSize
          );
        } else {
          if (frameMod2 === 0) {
            sketch.rect(
              windowWidth / 2,
              windowHeight / 2 + adjustAmount,
              squareSize,
              squareSize
            );
          } else if (frameMod2 === 2) {
            sketch.rect(
              windowWidth / 2,
              windowHeight / 2 - adjustAmount,
              squareSize,
              squareSize
            );
          } else {
            sketch.rect(
              windowWidth / 2,
              windowHeight / 2,
              squareSize,
              squareSize
            );
          }
        }

        sketch.fill(0, 0, 255);

        if (frameMod === 0) {
          sketch.rect(
            windowWidth / 2 + squareSize,
            windowHeight / 2 + adjustAmount,
            squareSize,
            squareSize
          );
        } else {
          sketch.rect(
            windowWidth * (2 / 3) + squareSize / 2,
            windowHeight / 2,
            squareSize,
            squareSize
          );
        }

        sketch.fill(255, 0, 255);
        if (frameMod === 0) {
          sketch.rect(
            windowWidth / 2 - squareSize,
            windowHeight / 2,
            squareSize,
            squareSize
          );
        } else {
          sketch.rect(
            windowWidth * (1 / 3) - squareSize / 2,
            windowHeight / 2 - adjustAmount,
            squareSize,
            squareSize
          );
        }
      };
    };

    const initSketch = () => {
      this.p1 = new p5(s1);
      this.p2 = new p5(s2);
    };

    initSketch();
  };

  init() {
    return this.re12();
  }
  removeSketch() {
    this.p1.remove();
    this.p2.remove();
  }
}
