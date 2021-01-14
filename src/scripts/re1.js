import p5 from "p5";

export class RE1 {
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

  re1 = (events) => {
    /* eslint-disable no-undef, no-unused-vars */
    let barSize = 5;
    let squareSize;
    let numBars;

    let sketchRenderer;
    let sketch2Renderer;
    const $modal2 = document.getElementById("modal-2");
    let windowWidth = $modal2.offsetWidth;
    let windowHeight = $modal2.offsetHeight;
    const frameRate = 30;

    const maxBarSize = 20;
    const minBarSize = 1;

    const startSquareSize = 0.5;
    const minSquareSize = 0.3;
    const maxSquareSize = 0.7;

    let barColor1, barColor2, squareColor;
    let clickToggle = false;

    const mapRange = function (value, low1, high1, low2, high2) {
      return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
    };

    //let p1, p2; //p5 instances of each sketch

    const s1 = function (sketch) {
      sketch.setup = function () {
        sketchRenderer = sketch.createCanvas(windowWidth, windowHeight);
        sketchRenderer.parent("sketch");
        sketch.frameRate(frameRate);
        sketch.handleSizeCalcs();
        sketch.assignColors();
      };

      sketch.assignColors = function () {
        barColor1 = sketch.color(255, 0, 255);
        barColor2 = sketch.color(0);
        squareColor = sketch.color(255, 0, 0);
      };

      sketch.handleSizeCalcs = function () {
        squareSize = windowHeight * startSquareSize;
        numBars = Math.ceil(windowHeight / barSize);
      };

      sketch.draw = function () {
        sketch.clear();
        sketch.noStroke();

        for (let i = 0; i < numBars; i++) {
          if (i % 2 === 0) {
            if (clickToggle) {
              sketch.fill(barColor1);
            } else {
              sketch.fill(squareColor);
            }
          } else {
            sketch.fill(barColor2);
          }
          sketch.rect(
            windowWidth / 2 - windowHeight / 2,
            barSize * i - (sketch.frameCount % (barSize * 2)),
            windowHeight,
            barSize
          );
        }
      };

      sketch.mouseClicked = function () {
        // console.log(
        //   "click",
        //   sketch.mouseX,
        //   sketch.mouseY,
        //   windowWidth,
        //   windowHeight
        // );
        clickToggle = !clickToggle;
      };

      sketch.handleMouseMove = function (x, y) {
        barSize = mapRange(y, 0, 1, minBarSize, maxBarSize);
        numBars = Math.ceil(windowHeight / barSize);
      };

      sketch.handleResizeCanvas = function (cw, ch) {
        windowWidth = cw;
        windowHeight = ch;
        sketch.handleSizeCalcs();
      };

      return;
    };

    const s2 = function (sketch) {
      sketch.setup = function () {
        sketch2Renderer = sketch.createCanvas(windowWidth, windowHeight);
        sketch2Renderer.parent("sketch2"); //p5 won't let you do multiple canvases, but this doesn't work either
        sketch.frameRate(frameRate);
      };

      sketch.draw = function () {
        sketch.clear();
        sketch.noStroke();
        if (clickToggle) {
          sketch.fill(squareColor);
        } else {
          sketch.fill(barColor1);
        }
        sketch.rect(
          windowWidth / 2 - squareSize / 2,
          windowHeight / 2 - squareSize / 2 - (sketch.frameCount % barSize),
          squareSize,
          squareSize
        );
      };

      sketch.handleMouseMove = function (x, y) {
        const squareRatio = mapRange(x, 0, 1, minSquareSize, maxSquareSize);
        squareSize = windowHeight * squareRatio;
      };
    };

    const initSketch = () => {
      this.p1 = new p5(s1);
      this.p2 = new p5(s2);
    };

    initSketch();
  };

  init() {
    return this.re1();
  }

  removeSketch() {
    this.p1.remove();
    this.p2.remove();
  }
}
