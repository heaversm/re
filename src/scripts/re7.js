import p5 from "p5";

export class RE7 {
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

  re7 = () => {
    const $modal2 = document.getElementById("modal-2");
    let windowWidth = $modal2.offsetWidth;
    let windowHeight = $modal2.offsetHeight;

    let sketchRenderer;
    let sketch2Renderer;
    const frameRate = 30;

    let adjustAmount = 10;
    const minAdjust = -15;
    const maxAdjust = 15;
    let frameAdjust;

    let insideBox = false;

    let mouseToggle = true; //this value gets flipped on load...

    const mapRange = function (value, low1, high1, low2, high2) {
      return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
    };

    const s1 = function (sketch) {

      let squareSize;
      let flipColors = false;

      sketch.setup = function () {
        sketchRenderer = sketch.createCanvas(windowWidth, windowHeight);
        sketchRenderer.parent("sketch");
        sketch.angleMode(sketch.DEGREES);
        sketch.frameRate(frameRate);
        sketch.handleSizeCalcs();
        //sketch.rectMode(sketch.CENTER);
      };

      sketch.handleResizeCanvas = function (cw, ch) {
        windowWidth = cw;
        windowHeight = ch;
        sketch.handleSizeCalcs();
      };

      sketch.handleSizeCalcs = function () {
        squareSize = windowHeight * ( 2 / 3);
      };

      sketch.mouseClicked = function () {
        mouseToggle = !mouseToggle;
      };

      sketch.handleMouseMove = function (x, y) {
        if (x > 0.5){
          flipColors = true;
        } else {
          flipColors = false;
        }
      };

      sketch.draw = function () {
        sketch.clear();
        sketch.noStroke();
        const frameMod = sketch.frameCount % 2;
        const startSquareX = windowWidth / 2 - windowHeight / 2;
        const availableSpace = windowWidth - windowHeight;
        
        if (flipColors){
          sketch.fill(41,252,57);
        } else {
          sketch.fill("yellow");
        }
        sketch.push();
        sketch.translate(windowWidth / 2,windowHeight / 2);
        if (frameMod === 0) {
          sketch.rotate(0);
        } else {
          sketch.rotate(10);
        }
        sketch.translate(-squareSize,-squareSize/2);
        sketch.rect(
          0,0,
          squareSize,
          squareSize
        );
        sketch.pop();


        sketch.push();
        sketch.translate(windowWidth / 2,windowHeight / 2);
        if (frameMod === 0) {
          sketch.rotate(10);
        } else {
          sketch.rotate(0);
        }
        if (flipColors){
          sketch.fill("yellow");
        } else {
          sketch.fill(41,252,57);
        }
        sketch.translate(0,-squareSize/2);
        sketch.rect(
          0,0,
          squareSize,
          squareSize
        );
        sketch.pop();

      };
    };

    const s2 = function (sketch) {
      const squareSize = windowHeight * (2 / 3);
      const squareSize2 = windowHeight * (1/3);
      let flipColors = false;
      
      sketch.setup = function () {
        sketch2Renderer = sketch.createCanvas(windowWidth, windowHeight);
        sketch2Renderer.parent("sketch2"); //p5 won't let you do multiple canvases, but this doesn't work either
        sketch.frameRate(frameRate);
        sketch.angleMode(sketch.DEGREES);
      };

      sketch.handleMouseMove = function (x, y) {

        if (y > 0.5){
          flipColors = true;
        } else {
          flipColors = false;
        }

      };

      sketch.draw = function () {
        const frameMod = sketch.frameCount % 2;

        sketch.clear();
        sketch.noStroke();

        if (flipColors){
          sketch.fill(255,255,255);
        } else {
          sketch.fill(0,0,0);
        }
        
        sketch.push();
        sketch.translate(windowWidth / 2,windowHeight / 2);
        if (frameMod === 0) {
          sketch.rotate(10);
        } else {
          sketch.rotate(0);
        }
        sketch.translate(-squareSize/2,-squareSize/2);
        sketch.rect(
          0,0,
          squareSize,
          squareSize
        );
        sketch.pop();

        

        if (flipColors){
          sketch.fill(0,0,0);
        } else {
          sketch.fill(255,255,255);
        }

        sketch.push();
        sketch.translate(windowWidth / 2,windowHeight / 2);
        if (frameMod === 0) {
          sketch.rotate(0);
        } else {
          sketch.rotate(10);
        }
        sketch.translate(-squareSize2/2,-squareSize2/2);
        sketch.rect(
          0,0,
          squareSize2,
          squareSize2
        );
        sketch.pop();

        
      };
    };

    const initSketch = () => {
      this.p1 = new p5(s1);
      this.p2 = new p5(s2);
    };

    initSketch();
  };

  init() {
    return this.re7();
  }
  removeSketch() {
    this.p1.remove();
    this.p2.remove();
  }
}
