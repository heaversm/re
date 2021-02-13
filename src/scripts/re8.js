import p5 from "p5";

export class RE8 {
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

  re8 = () => {
    const $modal2 = document.getElementById("modal-2");
    let windowWidth = $modal2.offsetWidth;
    let windowHeight = $modal2.offsetHeight;
    

    let squareSize;

    let sketchRenderer;
    let sketch2Renderer;

    const frameRate = 30;

    let squareRotIncrement = 0.5;
    let minRotIncrement = -5;
    let maxRotIncrement = 5;


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
        squareSize = windowHeight * 2 / 3;
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
        sketch.noStroke();
        sketch.fill(255,255, 255);
        sketch.translate(windowWidth / 2, windowHeight / 2);
        
        if (frameMod === 0) {
            sketch.rotate(45);
        }
        sketch.rect(-squareSize / 2, -squareSize / 2, squareSize, squareSize);
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
        //
      };

      sketch.draw = function () {
        const frameMod = sketch.frameCount % 2;
        sketch.clear();

        if (frameMod === 0) {
            sketch.noStroke();
            sketch.fill(0, 0, 255);
            sketch.translate(windowWidth / 2, windowHeight / 2);
            sketch.rotate(squareRot);
            sketch.rect(-squareSize / 2, -squareSize / 2, squareSize, squareSize);
            squareRot += squareRotIncrement;
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
    return this.re8();
  }
  removeSketch() {
    this.p1.remove();
    this.p2.remove();
  }
}
