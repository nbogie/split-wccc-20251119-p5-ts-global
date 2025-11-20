//originally inspired by https://openprocessing.org/sketch/1045334/
//TODO:
//maybe fill with p5.brush? https://openprocessing.org/sketch/2117088
// allow click to further split a selected quad (or few surrounding ones), animated with particles and lerp
//don't shrink, disturb?
//extrude to 3d w custom geom?
//let the user use a knife to cut the geom, animate.
//TODO: try shrinking corners to the intersection of the two inset lines parallel to their edges.
//TODO: instead of unshrinking only the nearest, try all within a threshold of mouse
//TODO: grid of squares with one split only, with random significant shrinkage.  looks bold.
//TODO: quads unshrink by colour, periodically? (or all quads with same colour as hovered-quad?)
//TODO: unshrink all quads on one or two perpendicular edges (or intersecting one or two simple straight lines across the design.  Really wants to be a thick line though to ensure fewer near misses)
//      this would look good animated (stagger might work but should be in order they line passes through them)
//TODO: animate a little humanised rotation around centroid?
//run p5
import "p5";
import gsap from "gsap";
//import the p5 value (to reference p5.Vector.random2D() etc)
import p5 from "p5";

import {
    createStartingQuad,
    drawQuad,
    findQuadCentroid,
    subdivideAllRepeatedly,
    type Options,
    type Quad,
} from "./quad.ts";
import { minByOrThrow, mousePos } from "./randomStuff.ts";

let quads: Quad[];
let selectedQuad: Quad | undefined;

p5.disableFriendlyErrors = true;

window.setup = function setup() {
    createCanvas(windowWidth, windowHeight);
    // blendMode(DARKEST);
    regenerate();
};
const options: Options = {
    shouldShrink: true,
    numSplits: 4,
    shouldGenerateUnshrunk: true,
    shrinkFraction: 0.05, //0-1 exclusive
    minAllowedLength: 10,
    seed: 123,
};

function regenerate() {
    options.seed = millis();
    randomSeed(options.seed);
    quads = [createStartingQuad(options)];
    quads = subdivideAllRepeatedly(quads, options);
    animateRandomShrinkFractionChanges();
}

window.draw = function draw() {
    push();
    blendMode(BLEND);
    background(30);
    pop();
    quads.forEach((q) => {
        drawQuad(q);
    });
    drawDebugText();
};

window.mousePressed = function mousePressed(_evt) {
    if (mouseButton.left) {
        animateRandomShrinkFractionChanges();
    }
};

function animateRandomShrinkFractionChanges() {
    //todo: try to do this with all elements at once, passing a fn to calc the unique shrinkFraction value for each
    //that will allow stagger
    //https://gsap.com/community/forums/topic/22266-staggerto-different-values/
    const unshrink = random() < 0.5;

    gsap.to(quads, {
        duration: 0.2,
        shrinkFraction: unshrink
            ? 0
            : (ix: number, _elem: any) =>
                  map(
                      noise(ix * 777 + 1000 * millis()),
                      0.15,
                      0.85,
                      0,
                      0.9,
                      true
                  ),
        stagger: 0.1,
        ease: "bounce.out",
    });
}
window.keyPressed = function keyPressed(_evt) {
    if (key === " ") {
        console.log("space pressed");

        regenerate();
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
        regenerate();
    }
};
window.mouseMoved = function mouseMoved(_evt) {
    if (quads.length === 0) {
        return;
    }
    const nearestQuad = minByOrThrow(quads, (quad: Quad) =>
        findQuadCentroid(quad.pts).dist(mousePos())
    );
    selectedQuad = nearestQuad.element;

    //so far, this doesn't really need gsap.
    gsap.to(selectedQuad, {
        duration: 0.3,
        shrinkFraction: 0,
    });
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
