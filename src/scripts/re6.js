import p5 from "p5";

export class RE6 {
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

  re6 = () => {
    const $modal2 = document.getElementById("modal-2");
    let windowWidth = $modal2.offsetWidth;
    let windowHeight = $modal2.offsetHeight;
    let sketchRenderer;
    let sketch2Renderer;
    const frameRate = 30;

    let minRotIncrement = -5;
    let maxRotIncrement = 5;
    let squareRotIncrement = 0.5;

    let squareSize;
    let initialSquareSize;
    let minSquareAdjust = 0.8;
    let maxSquareAdjust = 1.2;

    const mapRange = function (value, low1, high1, low2, high2) {
      return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
    }; //MH TODO: make this a global

    const s1 = function (sketch) {
      let squareColor, startColor, endColor;

      sketch.setup = function () {
        sketchRenderer = sketch.createCanvas(windowWidth, windowHeight);
        sketchRenderer.parent("sketch");
        sketch.frameRate(frameRate);
        sketch.handleSizeCalcs();
        sketch.colorMode(sketch.RGB);
        squareColor = sketch.color(0, 0, 255);
        startColor = sketch.color(0, 0, 255);
        endColor = sketch.color(255, 0, 0);
      };

      sketch.handleResizeCanvas = function (cw, ch) {
        windowWidth = cw;
        windowHeight = ch;
        sketch.handleSizeCalcs();
      };

      sketch.handleMouseMove = function (x, y) {
        squareSize = mapRange(
          y,
          0,
          1,
          initialSquareSize * minSquareAdjust,
          initialSquareSize * maxSquareAdjust
        );
        squareColor = sketch.lerpColor(startColor, endColor, y);
      };

      sketch.handleSizeCalcs = function () {
        initialSquareSize = squareSize = windowHeight / 2;
      };

      sketch.draw = function () {
        sketch.clear();
        sketch.noStroke();
        if (sketch.frameCount % 2 === 0) {
          sketch.fill(255, 255, 255);
        } else {
          //sketch.fill(255,255,255);
          sketch.fill(0, 255, 255);
        }
        sketch.rect(
          windowWidth / 2 - windowHeight / 2,
          0,
          windowHeight,
          windowHeight
        );
        sketch.fill(squareColor);
        sketch.rect(
          windowWidth / 2 - squareSize / 2,
          windowHeight / 2 - squareSize / 2,
          squareSize,
          squareSize
        );
      };
    };

    const s2 = function (sketch) {
      const numRows = 3;
      const numCols = 3;
      const numSquares = numRows * numCols;
      let squareRot = 0;
      let squareHyp;
      let squareSize;

      sketch.setup = function () {
        sketch2Renderer = sketch.createCanvas(windowWidth, windowHeight);
        sketch2Renderer.parent("sketch2"); //p5 won't let you do multiple canvases, but this doesn't work either
        sketch.frameRate(frameRate);
        sketch.angleMode(sketch.DEGREES);
        sketch.handleSizeCalcs();
      };

      sketch.handleResizeCanvas = function (cw, ch) {
        windowWidth = cw;
        windowHeight = ch;
        sketch.handleSizeCalcs();
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

      sketch.handleSizeCalcs = function () {
        squareHyp = windowHeight / 3;
        squareSize = Math.sqrt(Math.pow(squareHyp, 2) / 2);
      };

      sketch.draw = function () {
        sketch.clear();
        sketch.noStroke();
        if (sketch.frameCount % 2 === 0) {
          sketch.fill(0, 255, 255);
        } else {
          sketch.fill(255, 255, 255);
        }

        sketch.translate(windowWidth / 2 - windowHeight / 2, 0);

        for (let i = 0; i < numSquares; i++) {
          sketch.push(); // Start a new drawing state
          sketch.translate((i % 3) * squareHyp, Math.floor(i / 3) * squareHyp); //move to the centerpoint of each triangle
          sketch.translate(squareHyp / 2, squareHyp / 2); //move again to half the hypotenuse width
          sketch.rotate(45 + squareRot); //create a rotation point around which to rotate each square
          sketch.rect(-squareSize / 2, -squareSize / 2, squareSize, squareSize); //draw a square at each point
          sketch.pop();
        }
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
    return this.re6();
  }
  removeSketch() {
    this.p1.remove();
    this.p2.remove();
  }
}
