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
//TODO: avoid having quads shrunk only a little - the crappy tangents look like mistakes.  e.g. round to 20%?
import gsap from "gsap";
//run p5
import "p5";
//import the p5 value (to reference p5.Vector.random2D() etc)
import p5 from "p5";

import {
    createStartingQuad,
    drawQuad,
    findQuadCentroid,
    findQuadNearestToPos,
    splitQuadIfBig,
    subdivideAllRepeatedly,
    type Options,
    type Quad,
} from "./quad.ts";
import { mousePos } from "./randomStuff.ts";

let quads: Quad[];
let commands: Command[];

//just checking this ts setup can handle the p5 value.
p5.disableFriendlyErrors = true;

window.setup = function setup() {
    createCanvas(windowWidth, windowHeight);
    commands = createCommands();
    // blendMode(DARKEST);
    actionRegenerate();
};

window.draw = function draw() {
    background(30);

    quads.forEach((q) => {
        drawQuad(q, options);
    });
    if (options.shouldDrawDebugText) {
        drawDebugText();
    }
};

const options: Options = {
    shouldDrawDebugText: true,
    shouldDrawDebugNormals: false,
    shouldLogKeyCommands: true,
    quadBrushRadius: 120,
    shouldShrink: true,
    numSplits: 4,
    shouldGenerateUnshrunk: true,
    shrinkFraction: 0.05, //0-1 exclusive
    minAllowedLength: 15,
    seed: 123,
};

interface Command {
    title: string;
    description: string;
    key: string;
    action: () => void;
}

function createCommands(): Command[] {
    const cmds: Command[] = [];
    cmds.push({
        key: " ",
        action: actionRegenerate,
        title: "regenerate",
        description:
            "Regenerate a new set of quads preserving the current config",
    });

    cmds.push({
        key: "r",
        action: animateRandomShrinkFractionChanges,
        title: "random shrinks",
        description:
            "Animate random quad shrink/grows from a variety of options",
    });
    cmds.push({
        key: "s",
        action: actionTakeAScreenshot,
        title: "screenshot",
        description: "Take a screenshot of the current canvas",
    });
    cmds.push({
        key: "d",
        action: () => splitQuadUnderPos(mousePos()),
        title: "split quad at mouse",
        description: "Split the quad under the current mouse/touch position",
    });
    cmds.push({
        key: "-",
        action: () => actionChangeShrinkFraction(-1),
        title: "decrease global shrink fraction",
        description:
            "Decrease the global shrink fraction (fractions by which all quad corners are lerped towards their centroid)",
    });
    cmds.push({
        key: "=",
        action: () => actionChangeShrinkFraction(1),
        title: "increase global shrink fraction",
        description:
            "Increase the global shrink fraction (fractions by which all quad corners are lerped towards their centroid)",
    });

    cmds.push({
        key: ",",
        action: () => actionChangeNumSplits(-1),
        title: "decrease num splits",
        description:
            "Decrease the number of quad-splitting passes done over the quads.  Bigger quads will result.",
    });

    cmds.push({
        key: ".",
        action: () => actionChangeNumSplits(1),
        title: "increase num splits",
        description:
            "Increase the number of quad-splitting passes done over the quads.  Smaller quads will result.",
    });

    return cmds;
}

function actionChangeNumSplits(sign: -1 | 1) {
    const newCount = constrain(options.numSplits + sign, 0, 10);
    options.numSplits = newCount;
    options.shouldGenerateUnshrunk = random([true, false]);
    actionRegenerate();
}

function actionChangeShrinkFraction(sign: 1 | -1) {
    const newDistance = constrain(options.shrinkFraction + sign * 0.05, 0, 1);
    gsap.to(options, {
        duration: 0.6,
        shrinkFraction: newDistance,
        ease: "bounce.out",
    });
}

function actionTakeAScreenshot() {
    options.shouldDrawDebugText = false;
    //to queue a draw without the debug text
    redraw();
    //can't save immediately - it won't wait for the redraw.
    setTimeout(() => save("wccc-split-neill"), 0);
}
function actionRegenerate() {
    options.seed = millis();
    randomSeed(options.seed);
    quads = [createStartingQuad(options)];
    quads = subdivideAllRepeatedly(quads, options);
    animateRandomShrinkFractionChanges();
}

window.mousePressed = function mousePressed(_evt) {
    if (mouseButton.left) {
    }
};

function animateRandomShrinkFractionChanges() {
    //todo: try to do this with all elements at once, passing a fn to calc the unique shrinkFraction value for each
    //that will allow stagger
    //https://gsap.com/community/forums/topic/22266-staggerto-different-values/

    const unshrink = random() < 0.5;

    const shouldStagger = random([true, false]);
    const totalElapsedTime = 1;
    //go faster with higher number of quads
    const staggerTime = totalElapsedTime / quads.length;
    gsap.to(quads, {
        duration: totalElapsedTime,
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
        stagger: shouldStagger ? staggerTime : undefined,
        ease: "bounce.out",
    });
}
window.keyPressed = function keyPressed(_evt) {
    //see createCommands for the actions taken on key presses

    const foundCommand = commands.find((cmd) => cmd.key === key);

    if (foundCommand) {
        if (options.shouldLogKeyCommands) {
            console.log(
                "running cmd: " +
                    foundCommand.title +
                    ` (${foundCommand.action.name})`
            );
        }

        foundCommand.action();
    }
};

window.mouseDragged = function mouseDragged(_evt) {
    splitQuadUnderPos(mousePos());
};

window.mouseMoved = function mouseMoved(_evt) {
    if (quads.length === 0) {
        return;
    }
    const mouseP = mousePos();
    const nearbyQuads = quads.filter(
        (q) => findQuadCentroid(q.pts).dist(mouseP) < options.quadBrushRadius
    );

    //so far, this doesn't really need gsap.
    if (nearbyQuads.length > 0) {
        gsap.to(nearbyQuads, {
            duration: 0.5,
            shrinkFraction: 0,
        });
    }
};

window.windowResized = function () {
    resizeCanvas(windowWidth, windowHeight);
};

export function splitQuadUnderPos(pos: p5.Vector) {
    //TODO: when ditching a split quad, clear any gsap anims on it.
    const nearestResult = findQuadNearestToPos(quads, pos);
    const splitResult = splitQuadIfBig(nearestResult.element, {
        ...options,
        shouldGenerateUnshrunk: false,
    });
    if (splitResult) {
        quads.push(...splitResult);
        quads = quads.filter((q) => q !== nearestResult.element);
        gsap.to(splitResult, { shrinkFraction: 0, duration: 0.5 });
    }
    return splitResult;
}

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
