import gsap from "gsap";
import { getWorld } from "./main.ts";

import {
    createStartingQuad,
    findQuadNearestToPos,
    splitQuadIfBig,
    subdivideAllRepeatedly,
} from "./quad.ts";
import { mousePos } from "./randomStuff.ts";
import { palettes } from "./palettes.ts";

export interface Command {
    title: string;
    description: string;
    key: string;
    action: () => void;
}

export function createCommands(): Command[] {
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
        action: actionAnimateRandomShrinkFractionChanges,
        title: "random shrinks",
        description:
            "Animate random quad shrink/grows from a variety of options",
    });
    cmds.push({
        key: "u",
        action: actionAnimateUnshrinkAll,
        title: "unshrink all",
        description: "Animate all quads unshrinking to full size",
    });
    cmds.push({
        key: "p",
        action: actionPickNewRandomPalette,
        title: "pick random palette",
        description: "Pick random palette from those available",
    });
    cmds.push({
        key: "s",
        action: actionTakeAScreenshot,
        title: "screenshot",
        description: "Take a screenshot of the current canvas",
    });
    cmds.push({
        key: "d",
        action: () => actionSplitQuadUnderPos(mousePos()),
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

export function actionChangeNumSplits(sign: -1 | 1) {
    const options = getWorld().options;
    const newCount = constrain(options.numSplits + sign, 0, 10);
    options.numSplits = newCount;
    options.shouldGenerateUnshrunk = random([true, false]);
    actionRegenerate();
}

export function actionChangeShrinkFraction(sign: 1 | -1) {
    const options = getWorld().options;
    const newDistance = constrain(options.shrinkFraction + sign * 0.05, 0, 1);
    gsap.to(options, {
        duration: 0.6,
        shrinkFraction: newDistance,
        ease: "bounce.out",
    });
}

export function actionTakeAScreenshot() {
    getWorld().options.shouldDrawDebugText = false;
    //to queue a draw without the debug text
    redraw();
    //can't save immediately - it won't wait for the redraw.
    setTimeout(() => save("wccc-split-neill"), 0);
}
export function actionRegenerate() {
    const options = getWorld().options;
    options.seed = millis();
    randomSeed(options.seed);
    const world = getWorld();

    world.quads = [createStartingQuad(options)];
    world.quads = subdivideAllRepeatedly(world.quads, options);
    actionAnimateRandomShrinkFractionChanges();
}

export function actionAnimateUnshrinkAll() {
    const quads = getWorld().quads;
    gsap.to(quads, {
        duration: 0.2,
        stagger: 0.1 / quads.length,
        shrinkFraction: 0,
        ease: "power3.out",
    });
}
export function actionAnimateRandomShrinkFractionChanges() {
    //todo: try to do this with all elements at once, passing a fn to calc the unique shrinkFraction value for each
    //that will allow stagger
    //https://gsap.com/community/forums/topic/22266-staggerto-different-values/

    const quads = getWorld().quads;
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

export function actionSplitQuadUnderPos(pos: p5.Vector) {
    //TODO: when ditching a split quad, clear any gsap anims on it.

    const w = getWorld();
    const nearestResult = findQuadNearestToPos(w.quads, pos);
    const splitResult = splitQuadIfBig(nearestResult.element, {
        ...w.options,
        shouldGenerateUnshrunk: false,
    });
    if (splitResult) {
        w.quads.push(...splitResult);
        w.quads = w.quads.filter((q) => q !== nearestResult.element);
        gsap.to(splitResult, { shrinkFraction: 0, duration: 0.5 });
    }
    return splitResult;
}

export function actionPickNewRandomPalette() {
    console.log("action pick");
    const options = getWorld().options;
    const oldIx = options.paletteIx;
    const otherIndices = palettes
        .map((_p, ix) => ix)
        .filter((ix) => ix !== oldIx);
    if (otherIndices.length === 0) {
        return 0;
    }
    options.paletteIx = random(otherIndices);
    actionRegenerate();
}
