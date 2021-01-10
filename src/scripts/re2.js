import p5 from "p5";

export class RE2 {
  constructor() {
    //will hold references to each sketch
    this.p1 = null;
    this.p2 = null;
  }

  re2 = () => {
    /* eslint-disable no-undef, no-unused-vars */
    const barSize = 2;
    let squareSize;
    let numBars;
    const squareAdjust = 10;

    let sketchRenderer;
    let sketch2Renderer;
    const $modal2 = document.getElementById("modal-2");
    const windowWidth = $modal2.offsetWidth;
    const windowHeight = $modal2.offsetHeight;
    const frameRate = 10;

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
            sketch.fill(255);
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

      sketch.draw = function () {
        sketch.clear();
        let xAdjust;
        let frameHold = 2;

        if (sketch.frameCount % frameHold < frameHold / 2) {
          xAdjust = -squareAdjust;
        } else {
          xAdjust = squareAdjust;
        }

        sketch.noStroke();
        sketch.fill("cyan");
        sketch.rect(
          windowWidth / 2 -
            squareSize / 2 +
            (sketch.frameCount % 2 === 0 ? squareAdjust : -squareAdjust),
          windowHeight / 2 - squareSize / 2 - (sketch.frameCount % barSize),
          squareSize,
          squareSize
        );

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
    return this.re2();
  }
  removeSketch() {
    this.p1.remove();
    this.p2.remove();
  }
}
