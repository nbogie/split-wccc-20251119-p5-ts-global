//run p5
import "p5";

//import the p5 value (to reference p5.Vector.random2D() etc)
import p5 from "p5";

import {
    createStartingQuad,
    drawQuad,
    subdivideAllRepeatedly,
    type Quad,
} from "./quad.ts";

let quads: Quad[];

p5.disableFriendlyErrors = true;

window.setup = function setup() {
    createCanvas(windowWidth, windowHeight);
    // blendMode(DARKEST);
    restart();
};

function restart() {
    quads = [createStartingQuad()];
    redraw();
}
window.draw = function draw() {
    push();
    blendMode(BLEND);
    background(255);
    pop();
    // randomSeed(1);
    quads = subdivideAllRepeatedly(quads, {
        shouldShrink: true,
        numSplits: 3,
        shrinkDistance: 20,
    });
    quads.forEach((q) => {
        drawQuad(q);
    });
    fill(30);

    text(quads.length, 100, height - 100);
};

window.mousePressed = function mousePressed(_evt) {
    if (mouseButton.left) {
        restart();
    }
};

window.windowResized = function () {
    resizeCanvas(windowWidth, windowHeight);
};
