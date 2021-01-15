import p5 from "p5";

export class RE3 {
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

  re3 = () => {
    /* eslint-disable no-undef, no-unused-vars */
    let squareSize;
    let numBars;

    let sketchRenderer;
    let sketch2Renderer;
    const $modal2 = document.getElementById("modal-2");
    let windowWidth = $modal2.offsetWidth;
    let windowHeight = $modal2.offsetHeight;

    let colorSize = 2;
    let minColorSize = 1;
    let maxColorSize = 8;
    let minGapSize = 5;
    let maxGapSize = 10;
    let gapSize = 8;
    const frameRate = 30;

    let barSize;

    let adjustDistance = 1; //distance to move rectangles each frame
    let minAdjustDistance = 0;
    let maxAdjustDistance = 3;
    let isForward = true; //handles alternating directions
    let xAdjust = 0; //distance at which square is drawn

    let fillColor1;
    let fillColor2;

    let mousePressed = false;

    const mapRange = function (value, low1, high1, low2, high2) {
      return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
    };

    const s1 = function (sketch) {
      sketch.setup = function () {
        sketchRenderer = sketch.createCanvas(windowWidth, windowHeight);
        sketchRenderer.parent("sketch");
        sketch.frameRate(frameRate);
        sketch.clear();
        sketch.handleSizeCalcs();
        fillColor1 = sketch.color(0, 0, 255);
        fillColor2 = sketch.color(255, 0, 0);
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

      sketch.mousePressed = function () {
        mousePressed = true;
      };

      sketch.mouseReleased = function () {
        mousePressed = false;
      };

      sketch.handleMouseMove = function (x, y) {
        colorSize = mapRange(x, 0, 1, minColorSize, maxColorSize);
        gapSize = mapRange(y, 0, 1, minGapSize, maxGapSize);
      };

      sketch.draw = function () {
        sketch.clear();
        sketch.noStroke();
        let totalHeight = 0;
        let i = 0;

        if (mousePressed) {
          if (xAdjust > 0) {
            sketch.fill(fillColor2);
            sketch.rect(0, 0, windowWidth / 2, windowHeight);
            sketch.fill(fillColor1);
            sketch.rect(windowWidth / 2, 0, windowWidth / 2, windowHeight);
          } else {
            sketch.fill(fillColor1);
            sketch.rect(0, 0, windowWidth / 2, windowHeight);
            sketch.fill(fillColor2);
            sketch.rect(windowWidth / 2, 0, windowWidth / 2, windowHeight);
          }
        }

        while (totalHeight < windowHeight) {
          if (i % 2 === 0) {
            sketch.fill(255); //white
            barSize = colorSize;
          } else {
            barSize = gapSize;
            sketch.fill(0); //black
          }

          sketch.rect(
            windowWidth / 2 - windowHeight / 2 + totalHeight,
            0,
            barSize,
            windowHeight
          );

          totalHeight += barSize;
          i++;
        }
        if (sketch.frameCount % Math.floor(squareSize / 3) === 0) {
          isForward = !isForward;
        } else {
          if (isForward) {
            xAdjust -= adjustDistance;
          } else {
            xAdjust += adjustDistance;
          }
        }
        if (mousePressed) {
          sketch.fill(0);
        } else {
          sketch.fill(fillColor1);
        }
        sketch.rect(
          windowWidth / 2 - squareSize / 2 - xAdjust,
          windowHeight / 2 - squareSize / 2,
          squareSize,
          squareSize
        );
      };
    };

    const s2 = function (sketch) {
      sketch.setup = function () {
        sketch2Renderer = sketch.createCanvas(windowWidth, windowHeight);
        sketch2Renderer.parent("sketch2"); //p5 won't let you do multiple canvases, but this doesn't work either
        sketch.frameRate(frameRate);
      };
      sketch.handleMouseMove = function (x, y) {
        adjustDistance = mapRange(
          x,
          0,
          1,
          minAdjustDistance,
          maxAdjustDistance
        );

        if (y > 0.5) {
          fillColor1 = sketch.color(255, 0, 0);
          fillColor2 = sketch.color(0, 0, 255);
        } else {
          fillColor2 = sketch.color(255, 0, 0);
          fillColor1 = sketch.color(0, 0, 255);
        }
      };

      sketch.draw = function () {
        sketch.clear();

        sketch.noStroke();
        if (mousePressed) {
          sketch.fill(0);
        } else {
          sketch.fill(fillColor2);
        }
        sketch.rect(
          windowWidth / 2 - squareSize / 2 + xAdjust,
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
    return this.re3();
  }
  removeSketch() {
    this.p1.remove();
    this.p2.remove();
  }
}
