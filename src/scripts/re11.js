import p5 from "p5";

export class RE11 {
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

  re11 = () => {
    const $modal2 = document.getElementById("modal-2");
    let windowWidth = $modal2.offsetWidth;
    let windowHeight = $modal2.offsetHeight;

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
      let squareSize;
      let squareHyp;

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
        squareHyp = Math.hypot(squareSize, squareSize);
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
        const frameMod = sketch.frameCount % 4;
        sketch.clear();
        sketch.background(0, 0, 255);
        sketch.noStroke();

        sketch.fill(255, 0, 0);
        sketch.rect(
          windowWidth / 2 + squareSize / 2,
          windowHeight / 2,
          squareSize,
          squareSize
        );

        sketch.fill(255);

        if (frameMod === 0) {
          sketch.push();
          sketch.translate(squareHyp / 2, windowHeight / 2);
          sketch.rotate(45);
          sketch.rect(0, 0, squareSize, squareSize);
          sketch.pop();
        } else if (frameMod === 2) {
          sketch.push();
          sketch.translate(windowWidth - squareHyp / 2, windowHeight / 2);
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

    const s2 = function (sketch) {
      let squareSize;
      let squareHyp;

      sketch.setup = function () {
        sketch2Renderer = sketch.createCanvas(windowWidth, windowHeight);
        sketch2Renderer.parent("sketch2"); //p5 won't let you do multiple canvases, but this doesn't work either
        sketch.frameRate(frameRate);
        sketch.angleMode(sketch.DEGREES);
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
        sketch.clear();
        const frameMod = sketch.frameCount % 2;
        sketch.fill(0);

        if (frameMod === 0) {
          sketch.push();
          sketch.translate(windowWidth / 2, windowHeight - squareHyp);
          sketch.rotate(45);
          sketch.rect(0, 0, squareSize, squareSize);
        } else {
          sketch.push();
          sketch.translate(windowWidth / 2, 0);
          sketch.rotate(45);
          sketch.rect(0, 0, squareSize, squareSize);
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
    return this.re11();
  }
  removeSketch() {
    this.p1.remove();
    this.p2.remove();
  }
}
