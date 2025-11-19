//originally inspired by https://openprocessing.org/sketch/1045334/
//TODO:
//maybe fill with p5.brush? https://openprocessing.org/sketch/2117088
// allow click to further split a selected quad (or few surrounding ones), animated with particles and lerp
//don't shrink, disturb?
//extrude to 3d w custom geom?
//let the user use a knife to cut the geom, animate.
//TODO: try shrinking corners to the intersection of the two inset lines parallel to their edges.

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
    shrinkFraction: 0.05, //0-1 exclusive
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
    drawDebugText();
};

window.mousePressed = function mousePressed(_evt) {
    if (mouseButton.left) {
        gsap.to(options, {
            duration: 0.6,
            shrinkFraction: map(noise(1000 * millis()), 0.15, 0.85, 0, 1, true),

            ease: "bounce.out",
        });
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
            options.shrinkFraction + sign * 0.05,
            0,
            1
        );
        gsap.to(options, {
            duration: 0.6,
            shrinkFraction: newDistance,
            ease: "bounce.out",
        });
    }
    if (key === "," || key === ".") {
        const sign = key === "." ? 1 : -1;
        const newCount = constrain(options.numSplits + sign, 0, 10);
        options.numSplits = newCount;
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

function drawDebugText() {
    fill(255);
    push();
    translate(100, height - 100);
    const lines = [
        "quads: " + quads.length,
        "shrinkFraction: " + options.shrinkFraction.toFixed(2),
        "num splits: " + options.numSplits,
    ];
    for (let line of [...lines].reverse()) {
        text(line, 0, 0);
        translate(0, -30);
    }
    pop();
}
