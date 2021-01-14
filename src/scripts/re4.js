import p5 from "p5";

export class RE4 {
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

  re4 = () => {
    const $modal2 = document.getElementById("modal-2");
    let windowWidth = $modal2.offsetWidth;
    let windowHeight = $modal2.offsetHeight;

    const startBarSize = 5;
    let barSize = startBarSize;
    let minBarSize = 3;
    let maxBarSize = 8;
    let squareSize;
    let numBars;

    let sketchRenderer;
    let sketch2Renderer;

    const frameRate = 30;

    let squareRotIncrement = 0.5;
    let minRotIncrement = -5;
    let maxRotIncrement = 5;

    let fillColors;

    let fillIndex = 0;

    let mouseDown = false;

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
        sketch.handleSizeCalcs();
        fillColors = [
          [
            sketch.color(255, 0, 0),
            sketch.color(0, 0, 0),
            sketch.color(0, 255, 0),
          ],
          [
            sketch.color(255, 0, 0),
            sketch.color(0, 255, 0),
            sketch.color(0, 0, 0),
          ],
          [
            sketch.color(0, 0, 0),
            sketch.color(0, 255, 0),
            sketch.color(255, 0, 0),
          ],
        ];
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

      sketch.mousePressed = function () {
        mouseDown = true;
      };

      sketch.mouseReleased = function () {
        mouseDown = false;
        barSize = startBarSize;
        numBars = Math.ceil(windowWidth / barSize);
      };

      sketch.handleMouseMove = function (x, y) {
        if (mouseDown) {
          return;
        }
        fillIndex = randomInt(0, fillColors.length - 1);
        barSize = mapRange(y, 0, 1, minBarSize, maxBarSize);
        numBars = Math.ceil(windowWidth / barSize);
      };

      sketch.draw = function () {
        sketch.clear();
        sketch.noStroke();

        if (mouseDown) {
          barSize++;
        }

        for (let i = 0; i < numBars; i++) {
          if (i % 4 === 0) {
            sketch.fill(fillColors[fillIndex][0]);
          } else if (i % 4 === 2) {
            sketch.fill(fillColors[fillIndex][2]);
          } else {
            sketch.fill(fillColors[fillIndex][1]);
          }
          sketch.rect(barSize * i, 0, barSize, windowHeight);
        }
      };
    };

    const s2 = function (sketch) {
      let squareRot = 0;

      sketch.setup = function () {
        sketch2Renderer = sketch.createCanvas(windowWidth, windowHeight);
        sketch2Renderer.parent("sketch2"); //p5 won't let you do multiple canvases, but this doesn't work either
        sketch.frameRate(frameRate);
        sketch.angleMode(sketch.DEGREES);
      };

      sketch.handleMouseMove = function (x, y) {
        squareRotIncrement = mapRange(
          x,
          0,
          1,
          minRotIncrement,
          maxRotIncrement
        );
      };

      sketch.draw = function () {
        sketch.clear();
        sketch.noStroke();
        sketch.fill(255, 0, 0);
        sketch.translate(windowWidth / 2, windowHeight / 2);
        sketch.rotate(squareRot);
        sketch.rect(-squareSize / 2, -squareSize / 2, squareSize, squareSize);
        squareRot += squareRotIncrement;
      };
    };

    const initSketch = () => {
      this.p1 = new p5(s1);
      this.p2 = new p5(s2);
    };

    initSketch();
  };

  init() {
    return this.re4();
  }
  removeSketch() {
    this.p1.remove();
    this.p2.remove();
  }
}
