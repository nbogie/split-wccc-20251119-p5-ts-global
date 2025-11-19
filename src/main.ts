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
    randomSeed(options.seed);
};
const options: Options = {
    shouldShrink: true,
    numSplits: 4,
    shrinkDistance: 0,
    minAllowedLength: 10,
    seed: 123,
};

window.draw = function draw() {
    randomSeed(options.seed);
    quads = [createStartingQuad()];

    push();
    blendMode(BLEND);
    background(30);
    pop();
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
window.keyPressed = function keyPressed(_evt) {
    if (key === " ") {
        console.log("space pressed");
        options.seed = millis();
    }
    if (key === "=" || key === "-") {
        const sign = key === "=" ? 1 : -1;
        const newDistance = constrain(
            options.shrinkDistance + sign * 1,
            0,
            200
        );
        gsap.to(options, {
            duration: 0.2,
            shrinkDistance: newDistance,
        });
    }
};
window.mouseMoved = function mouseMoved(_evt) {
    //so far, this doesn't really need gsap.
    // gsap.to(options, {
    //     duration: 0.05,
    //     shrinkDistance: map(mouseX, 0, width, 0, 300, true),
    // });
};

window.windowResized = function () {
    resizeCanvas(windowWidth, windowHeight);
};
