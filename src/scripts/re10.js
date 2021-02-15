import p5 from "p5";

export class RE10 {
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

  re10 = () => {
    const $modal2 = document.getElementById("modal-2");
    let windowWidth = $modal2.offsetWidth;
    let windowHeight = $modal2.offsetHeight;

    let squareSize;
    let squareSize2;

    let sketchRenderer;
    let sketch2Renderer;

    const frameRate = 30;

    let mouseDown = false;

    const mapRange = function (value, low1, high1, low2, high2) {
      return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
    };

    const randomInt = function (min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    };

    const s1 = function (sketch) {
      let adjustX = 0;
      let adjustY = 0;
      let maxAdjust = 20;
      sketch.setup = function () {
        sketchRenderer = sketch.createCanvas(windowWidth, windowHeight);
        sketchRenderer.parent("sketch");
        sketch.frameRate(frameRate);
        sketch.handleSizeCalcs();
        sketch.rectMode(sketch.CENTER);
        sketch.angleMode(sketch.DEGREES);
      };

      sketch.handleResizeCanvas = function (cw, ch) {
        windowWidth = cw;
        windowHeight = ch;
        sketch.resizeCanvas(windowWidth, windowHeight);
        sketch.handleSizeCalcs();
      };

      sketch.handleSizeCalcs = function () {
        squareSize = windowHeight;
        squareSize2 = windowHeight * (2 / 3);
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
        adjustX = mapRange(x, 0, 1, -maxAdjust, maxAdjust);
        adjustY = mapRange(y, 0, 1, -maxAdjust, maxAdjust);
      };

      sketch.draw = function () {
        const frameMod = sketch.frameCount % 2;
        sketch.clear();

        if (mouseDown) {
          if (frameMod === 0) {
            sketch.background(0, 0, 255);
          } else {
            sketch.background(255);
          }
        } else {
          sketch.background(0, 0, 255);
        }
        sketch.noStroke();

        if (mouseDown) {
          if (frameMod === 0) {
            sketch.fill(255);
          } else {
            sketch.fill(0, 0, 255);
          }
        } else {
          sketch.fill(255);
        }
        sketch.translate(windowWidth / 2 + adjustX, windowHeight / 2 + adjustY);
        sketch.rotate(45);
        sketch.rect(0, 0, squareSize, squareSize);
        sketch.rotate(-45);
        sketch.translate(-adjustX * 2, -adjustY * 2);
        sketch.rotate(45);
        sketch.fill(0, 0, 255);
        sketch.rect(0, 0, squareSize2, squareSize2);
      };
    };

    const s2 = function (sketch) {
      let squareSize;
      let squareHyp;

      sketch.setup = function () {
        sketch2Renderer = sketch.createCanvas(windowWidth, windowHeight);
        sketch2Renderer.parent("sketch2"); //p5 won't let you do multiple canvases, but this doesn't work either
        sketch.frameRate(frameRate);
        sketch.angleMode(sketch.DEGREES);
        sketch.rectMode(sketch.CENTER);
        sketch.noStroke();
        sketch.handleSizeCalcs();
      };

      sketch.handleMouseMove = function (x, y) {
        //
      };

      sketch.handleResizeCanvas = function (cw, ch) {
        sketch.resizeCanvas(windowWidth, windowHeight);
        sketch.handleSizeCalcs();
      };

      sketch.handleSizeCalcs = function () {
        squareSize = windowHeight * (2 / 3);
        squareHyp = Math.hypot(squareSize, squareSize);
      };

      sketch.draw = function () {
        const frameMod = sketch.frameCount % 2;
        const frameMod2 = sketch.frameCount % 4;
        sketch.clear();

        sketch.fill(255, 0, 0);
        if (frameMod === 0) {
          sketch.push();
          sketch.translate(windowWidth / 2 - squareHyp / 2, windowHeight / 2);
          sketch.rotate(45);
          sketch.rect(0, 0, squareSize, squareSize);
          sketch.pop();
        } else {
          sketch.push();
          sketch.translate(windowWidth / 2 + squareHyp / 2, windowHeight / 2);
          sketch.rotate(45);
          sketch.rect(0, 0, squareSize, squareSize);
          sketch.pop();
        }

        if (frameMod2 === 0) {
          sketch.push();
          sketch.translate(windowWidth / 2, windowHeight / 2 - squareHyp / 2);
          sketch.rotate(45);
          sketch.rect(0, 0, squareSize, squareSize);
          sketch.pop();
        } else if (frameMod2 === 2) {
          sketch.push();
          sketch.translate(windowWidth / 2, windowHeight / 2 + squareHyp / 2);
          sketch.rotate(45);
          sketch.rect(0, 0, squareSize, squareSize);
          sketch.pop();
        } else {
          sketch.push();
          sketch.translate(windowWidth / 2, windowHeight / 2);
          sketch.rotate(45);
          sketch.rect(0, 0, squareSize, squareSize);
          sketch.pop();
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
    return this.re10();
  }
  removeSketch() {
    this.p1.remove();
    this.p2.remove();
  }
}
