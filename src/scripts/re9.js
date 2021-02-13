import p5 from "p5";

export class RE9 {
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

  re9 = () => {
    const $modal2 = document.getElementById("modal-2");
    let windowWidth = $modal2.offsetWidth;
    let windowHeight = $modal2.offsetHeight;
    

    let squareSize;
    let squareSizeFront;

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
        squareSize = windowHeight;
        squareSizeFront = windowHeight * (2/3);
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
        sketch.clear();
        sketch.background(255);
        sketch.noStroke();
        sketch.fill(0,0, 255);
        
        
        if (frameMod === 0) {
            sketch.rect(0, 0, squareSize, squareSize);
        } else {
            sketch.rect(windowWidth - squareSize, 0, squareSize, squareSize);
        }
      };
    };

    const s2 = function (sketch) {

      sketch.setup = function () {
        sketch2Renderer = sketch.createCanvas(windowWidth, windowHeight);
        sketch2Renderer.parent("sketch2"); //p5 won't let you do multiple canvases, but this doesn't work either
        sketch.frameRate(frameRate);
        sketch.angleMode(sketch.DEGREES);
        sketch.noStroke();
      };

      sketch.handleMouseMove = function (x, y) {
        //
      };

      sketch.draw = function () {
        const frameMod = sketch.frameCount % 2;
        sketch.clear();
        sketch.translate(windowWidth / 2, windowHeight / 2);
        sketch.fill(255,0, 0);
        sketch.rect(-squareSizeFront / 2, -squareSizeFront / 2, squareSizeFront, squareSizeFront);
      };
    };

    const initSketch = () => {
      this.p1 = new p5(s1);
      this.p2 = new p5(s2);
    };

    initSketch();
  };

  init() {
    return this.re9();
  }
  removeSketch() {
    this.p1.remove();
    this.p2.remove();
  }
}
