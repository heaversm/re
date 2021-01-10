import p5 from "p5";

export class RE3 {
  constructor() {
    //will hold references to each sketch
    this.p1 = null;
    this.p2 = null;
  }

  re3 = () => {
    /* eslint-disable no-undef, no-unused-vars */
    let squareSize;
    let numBars;

    let sketchRenderer;
    let sketch2Renderer;
    const $modal2 = document.getElementById("modal-2");
    const windowWidth = $modal2.offsetWidth;
    const windowHeight = $modal2.offsetHeight;

    const colorSize = 2;
    const gapSize = 8;
    const frameRate = 10;

    let barSize;

    let adjustDistance = 1; //distance to move rectangles each frame
    let isForward = true; //handles alternating directions
    let xAdjust = 0; //distance at which square is drawn

    const s1 = function (sketch) {
      sketch.setup = function () {
        squareSize = windowHeight / 2;
        sketchRenderer = sketch.createCanvas(windowWidth, windowHeight);
        sketchRenderer.parent("sketch");
        numBars = Math.ceil(windowHeight / barSize);
        sketch.frameRate(frameRate);

        sketch.clear();
      };

      sketch.draw = function () {
        sketch.clear();
        sketch.noStroke();
        let totalHeight = 0;
        let i = 0;

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

        sketch.fill("blue");
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

      sketch.draw = function () {
        sketch.clear();

        sketch.noStroke();
        sketch.fill("red");
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
