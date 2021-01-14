import p5 from "p5";

export class RE2 {
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

  re2 = () => {
    /* eslint-disable no-undef, no-unused-vars */
    let barSize = 2;
    let squareSize;
    let numBars;
    let squareAdjust = 10;
    const minAdjust = 5;
    const maxAdjust = 20;

    const minBarSize = 1;
    const maxBarSize = 3;

    let sketchRenderer;
    let sketch2Renderer;
    const $modal2 = document.getElementById("modal-2");
    let windowWidth = $modal2.offsetWidth;
    let windowHeight = $modal2.offsetHeight;
    const frameRate = 30;

    let minFramehold = 1;
    let frameHold = 2;
    let maxFramehold = 3;

    let clickState = -1; //registers a click on menu selection...

    let barColors, squareColors, edgeColors;

    const mapRange = function (value, low1, high1, low2, high2) {
      return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
    };

    const s1 = function (sketch) {
      sketch.setup = function () {
        sketchRenderer = sketch.createCanvas(windowWidth, windowHeight);
        sketchRenderer.parent("sketch");
        sketch.frameRate(frameRate);
        sketch.handleSizeCalcs();
        sketch.assignColors();
      };

      sketch.assignColors = function () {
        barColors = [
          sketch.color(255), //white
          sketch.color(0, 255, 255), //cyan
          sketch.color(255, 0, 0), //red
        ];

        squareColors = [
          sketch.color(255, 0, 0),
          sketch.color(255),
          sketch.color(0, 255, 255),
        ];

        edgeColors = [
          sketch.color(0, 255, 255),
          sketch.color(255, 0, 0),
          sketch.color(255),
        ];
      };

      sketch.handleResizeCanvas = function (cw, ch) {
        windowWidth = cw;
        windowHeight = ch;
        sketch.handleSizeCalcs();
      };

      sketch.handleSizeCalcs = function () {
        squareSize = windowHeight / 2;
        numBars = Math.ceil(windowHeight / barSize);
      };

      sketch.handleMouseMove = function (x, y) {
        barSize = mapRange(y, 0, 1, minBarSize, maxBarSize);
        squareAdjust = mapRange(y, 0, 1, minAdjust, maxAdjust);
        numBars = Math.ceil(windowHeight / barSize);
      };

      sketch.mouseClicked = function () {
        if (clickState < 2) {
          clickState++;
        } else {
          clickState = 0;
        }
      };

      sketch.draw = function () {
        sketch.clear();
        sketch.noStroke();

        for (let i = 0; i < numBars; i++) {
          if (i % 2 === 0) {
            sketch.fill(barColors[clickState]);
          } else {
            sketch.fill(0);
          }
          sketch.rect(
            windowWidth / 2 -
              windowHeight / 2 +
              barSize * i -
              (sketch.frameCount % (barSize * 2)) +
              (sketch.frameCount % 2 === 0 ? squareAdjust : -squareAdjust),
            0,
            barSize,
            windowHeight
          );
        }
      };
    };

    const s2 = function (sketch) {
      sketch.setup = function () {
        sketch2Renderer = sketch.createCanvas(windowWidth, windowHeight);
        sketch2Renderer.parent("sketch2"); //p5 won't let you do multiple canvases, but this doesn't work either
        sketch.frameRate(frameRate);
      };

      sketch.handleMouseMove = function (x, y) {
        frameHold = mapRange(x, 0, 1, minFramehold, maxFramehold);
      };

      sketch.draw = function () {
        sketch.clear();
        let xAdjust;

        if (sketch.frameCount % frameHold < frameHold / 2) {
          xAdjust = -squareAdjust;
        } else {
          xAdjust = squareAdjust;
        }

        sketch.noStroke();

        sketch.fill(edgeColors[clickState]);
        sketch.rect(
          windowWidth / 2 -
            squareSize / 2 +
            (sketch.frameCount % 2 === 0 ? squareAdjust : -squareAdjust),
          windowHeight / 2 - squareSize / 2 - (sketch.frameCount % barSize),
          squareSize,
          squareSize
        );

        sketch.fill(squareColors[clickState]);
        sketch.rect(
          windowWidth / 2 - squareSize / 2,
          windowHeight / 2 - squareSize / 2 - (sketch.frameCount % barSize),
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
    return this.re2();
  }
  removeSketch() {
    this.p1.remove();
    this.p2.remove();
  }
}
