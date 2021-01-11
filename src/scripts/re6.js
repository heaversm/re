import p5 from "p5";

export class RE6 {
  constructor(onResizeObserver) {
    //will hold references to each sketch
    this.p1 = null;
    this.p2 = null;
    onResizeObserver.add(([containerWidth, containerHeight]) => {
      if (this.p1) {
        this.p1.resizeCanvas(containerWidth, containerHeight);
      }
      if (this.p2) {
        this.p2.resizeCanvas(containerWidth, containerHeight);
      }
    });
  }

  re6 = () => {
    const $modal2 = document.getElementById("modal-2");
    const windowWidth = $modal2.offsetWidth;
    const windowHeight = $modal2.offsetHeight;
    let sketchRenderer;
    let sketch2Renderer;
    const squareSize = windowHeight / 2;
    const frameRate = 30;

    const s1 = function (sketch) {
      sketch.setup = function () {
        sketchRenderer = sketch.createCanvas(windowWidth, windowHeight);
        sketchRenderer.parent("sketch");
        sketch.frameRate(frameRate);
      };

      sketch.draw = function () {
        sketch.clear();
        sketch.noStroke();
        if (sketch.frameCount % 2 === 0) {
          sketch.fill("white");
        } else {
          //sketch.fill("white");
          sketch.fill("cyan");
        }
        sketch.rect(
          windowWidth / 2 - windowHeight / 2,
          0,
          windowHeight,
          windowHeight
        );
        sketch.fill("blue");
        sketch.rect(
          windowWidth / 2 - squareSize / 2,
          windowHeight / 2 - squareSize / 2,
          squareSize,
          squareSize
        );
      };
    };

    const s2 = function (sketch) {
      const squareRotIncrement = 0.5;
      const numRows = 3;
      const numCols = 3;
      const numSquares = numRows * numCols;
      let squareRot = 0;
      let squareHyp = windowHeight / 3;
      let squareSize = Math.sqrt(Math.pow(squareHyp, 2) / 2);

      sketch.setup = function () {
        sketch2Renderer = sketch.createCanvas(windowWidth, windowHeight);
        sketch2Renderer.parent("sketch2"); //p5 won't let you do multiple canvases, but this doesn't work either
        sketch.frameRate(frameRate);
        sketch.angleMode(sketch.DEGREES);
      };

      sketch.draw = function () {
        sketch.clear();
        sketch.noStroke();
        if (sketch.frameCount % 2 === 0) {
          sketch.fill("cyan");
        } else {
          sketch.fill("white");
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
