import p5 from "p5";

export class RE1 {
  constructor() {
    //will hold references to each sketch
    this.p1 = null;
    this.p2 = null;
  }

  re1 = () => {
    /* eslint-disable no-undef, no-unused-vars */
    const barSize = 5;
    let squareSize;
    let numBars;

    let sketchRenderer;
    let sketch2Renderer;
    const $modal2 = document.getElementById("modal-2");
    const windowWidth = $modal2.offsetWidth;
    const windowHeight = $modal2.offsetHeight;
    const frameRate = 30;

    //let p1, p2; //p5 instances of each sketch

    const s1 = function (sketch) {
      sketch.setup = function () {
        squareSize = windowHeight / 2;
        sketchRenderer = sketch.createCanvas(windowWidth, windowHeight);
        sketchRenderer.parent("sketch");
        numBars = Math.ceil(windowHeight / barSize);
        sketch.frameRate(frameRate);
      };

      sketch.draw = function () {
        sketch.clear();
        sketch.noStroke();

        for (let i = 0; i < numBars; i++) {
          if (i % 2 === 0) {
            sketch.fill(234, 62, 246);
          } else {
            sketch.fill(0);
          }
          sketch.rect(
            windowWidth / 2 - windowHeight / 2,
            barSize * i - (sketch.frameCount % (barSize * 2)),
            windowHeight,
            barSize
          );
        }
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
        sketch.fill("red");
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
    return this.re1();
  }
  removeSketch() {
    this.p1.remove();
    this.p2.remove();
  }
}
