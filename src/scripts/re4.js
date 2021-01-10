import p5 from "p5";

export class RE4 {
  constructor() {
    //will hold references to each sketch
    this.p1 = null;
    this.p2 = null;
  }

  re4 = () => {
    const $modal2 = document.getElementById("modal-2");
    const windowWidth = $modal2.offsetWidth;
    const windowHeight = $modal2.offsetHeight;

    const barSize = 5;
    let squareSize;
    let numBars;

    let sketchRenderer;
    let sketch2Renderer;

    const frameRate = 30;

    const s1 = function (sketch) {
      sketch.setup = function () {
        squareSize = windowHeight / 2;
        sketchRenderer = sketch.createCanvas(windowWidth, windowHeight);
        sketchRenderer.parent("sketch");
        numBars = Math.ceil(windowWidth / barSize);
        sketch.frameRate(frameRate);
      };

      sketch.draw = function () {
        sketch.clear();
        sketch.noStroke();

        for (let i = 0; i < numBars; i++) {
          if (i % 4 === 0) {
            sketch.fill("red");
          } else if (i % 4 === 2) {
            sketch.fill("green");
          } else {
            sketch.fill(0);
          }
          sketch.rect(barSize * i, 0, barSize, windowHeight);
        }
      };
    };

    const s2 = function (sketch) {
      const squareRotIncrement = 0.5;
      let squareRot = 0;

      sketch.setup = function () {
        sketch2Renderer = sketch.createCanvas(windowWidth, windowHeight);
        sketch2Renderer.parent("sketch2"); //p5 won't let you do multiple canvases, but this doesn't work either
        sketch.frameRate(frameRate);
        sketch.angleMode(sketch.DEGREES);
      };

      sketch.draw = function () {
        sketch.clear();
        sketch.noStroke();
        sketch.fill("red");
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
