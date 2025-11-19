//run p5
import "p5";
import gsap from "gsap";
//import the p5 value (to reference p5.Vector.random2D() etc)
import p5 from "p5";

import {
    createStartingQuad,
    drawQuad,
    subdivideAllRepeatedly,
    type Options,
    type Quad,
} from "./quad.ts";

let quads: Quad[];

p5.disableFriendlyErrors = true;

window.setup = function setup() {
    createCanvas(windowWidth, windowHeight);
    // blendMode(DARKEST);
    restart();
};
const options: Options = {
    shouldShrink: true,
    numSplits: 4,
    shrinkDistance: 20,
    minAllowedLength: 10,
};

function restart() {}
window.draw = function draw() {
    quads = [createStartingQuad()];
    push();
    blendMode(BLEND);
    background(255);
    pop();
    randomSeed(1);
    quads = subdivideAllRepeatedly(quads, options);
    quads.forEach((q) => {
        drawQuad(q);
    });
    fill(30);

    text(quads.length, 100, height - 100);
};

window.mousePressed = function mousePressed(_evt) {
    if (mouseButton.left) {
    }
};
window.mouseMoved = function mouseMoved(_evt) {
    gsap.to(options, {
        duration: 0.2,
        shrinkDistance: map(mouseX, 0, width, 0, 100, true),
    });
};

window.windowResized = function () {
    resizeCanvas(windowWidth, windowHeight);
};
