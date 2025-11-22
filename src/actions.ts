import gsap from "gsap";
import { getWorld } from "./main.js";

import {
    createGridOfStartingQuads,
    createStartingQuad,
    findQuadNearestToPos,
    splitQuadIfBig,
    subdivideAllRepeatedly,
} from "./quad.js";
import { mousePos } from "./randomStuff.js";
import { palettes } from "./palettes.js";

export interface Command {
    title: string;
    description: string;
    key: string;
    action: () => void;
}

export function createCommands(): Command[] {
    const cmds: Command[] = [];

    cmds.push({
        key: "1",
        action: actionSelectSplitterBrush,
        title: "select brush: split",
        description: "change the current brush mode to split quads",
    });
    cmds.push({
        key: "2",
        action: actionSelectShrinkerBrush,
        title: "select brush: shrink",
        description: "change the current brush mode to shrink quads",
    });
    cmds.push({
        key: "3",
        action: actionSelectInflaterBrush,
        title: "select brush: inflate",
        description: "change the current brush mode to inflate quads",
    });
    cmds.push({
        key: "h",
        action: actionShowHelp,
        title: "show help",
        description:
            "show some help on commands and interaction.  to console for now.",
    });
    cmds.push({
        key: " ",
        action: actionRegenerateObservingMode,
        title: "regenerate",
        description:
            "Regenerate a new set of quads preserving the current config (maintaining grid mode if enabled)",
    });

    cmds.push({
        key: "g",
        action: actionRegenerateFromGrid,
        title: "make grid",
        description:
            "setup a grid of starting quads and bisect them a (small) amount",
    });

    cmds.push({
        key: "o",
        action: actionRegenerateWithSingleStartingQuad,
        title: "regenerate from one quad",
        description:
            "Regenerate a new set of quads starting from a single large quad",
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
        key: "t",
        action: actionToggleDebugText,
        title: "toggle debug text",
        description:
            "Toggle the display of some debug text (num quads, num iterations of bisection, palette name, etc)",
    });
    cmds.push({
        key: "-",
        action: () => actionChangeGlobalShrinkFraction(-1),
        title: "decrease global shrink fraction",
        description:
            "Decrease the global shrink fraction (fractions by which all quad corners are lerped towards their centroid)",
    });
    cmds.push({
        key: "=",
        action: () => actionChangeGlobalShrinkFraction(1),
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
export function actionShowHelp() {
    const cmds = getWorld().commands;
    const lines = cmds.map(
        (c) => `Key: "${c.key}": ${c.title}  (${c.description}).`
    );
    const mouseInteractionNotes = [
        "mouse over with shift or control to inflate/shrink nearby quads",
        "mouse-drag to subdivide the quad under mouse (keybd 'd' for more accuracy)",
    ];
    lines.push(...mouseInteractionNotes);
    console.log(lines.join("\n"));
}

export function actionRegenerateFromGrid() {
    const w = getWorld();
    w.options.seed = millis();
    w.options.shouldUseGridMode = true;
    randomSeed(w.options.seed);
    w.quads = createGridOfStartingQuads(w.options);
    w.quads = subdivideAllRepeatedly(w.quads, w.options);
    const isBigGrid = w.options.numSplits < 2;
    const shouldFakeOut = random() < 0.2;
    gsap.to(w.quads, {
        delay: 0.1,
        duration: 0.5,
        shrinkFraction: isBigGrid
            ? "random(0.0, 0.4, 0.2)"
            : "random(0.2, 0.6, 0.2)",
        repeat: shouldFakeOut ? 1 : 0,
        yoyo: shouldFakeOut,
    });
}

export function actionChangeNumSplits(sign: -1 | 1) {
    const options = getWorld().options;
    const newCount = constrain(options.numSplits + sign, 0, 10);
    options.numSplits = newCount;
    options.shouldGenerateUnshrunk = random([true, false]);
    actionRegenerateObservingMode();
}

export function actionChangeGlobalShrinkFraction(sign: 1 | -1) {
    const options = getWorld().options;
    const newDistance = constrain(
        options.globalShrinkFraction + sign * 0.05,
        0,
        1
    );

    options.globalShrinkFraction = newDistance;

    gsap.to(getWorld().quads, {
        duration: 0.6,
        shrinkFraction: options.globalShrinkFraction,
        ease: "power3.out",
    });
}

export function actionTakeAScreenshot() {
    getWorld().options.shouldDrawDebugText = false;
    //to queue a draw without the debug text
    redraw();
    //can't save immediately - it won't wait for the redraw.
    setTimeout(() => save("wccc-split-neill"), 0);
}
export function actionRegenerateWithSingleStartingQuad() {
    const world = getWorld();
    const options = world.options;
    //for next time
    options.shouldUseGridMode = false;
    options.seed = millis();
    randomSeed(options.seed);

    world.quads = [createStartingQuad(options)];
    world.quads = subdivideAllRepeatedly(world.quads, options);
    actionAnimateRandomShrinkFractionChanges();
}
export function actionRegenerateObservingMode() {
    if (getWorld().options.shouldUseGridMode) {
        actionRegenerateFromGrid();
    } else {
        actionRegenerateWithSingleStartingQuad();
    }
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
    const quads = getWorld().quads;
    const shouldStagger = random([true, false]);
    const totalElapsedTime = 0.4;
    //go faster with higher number of quads
    const staggerTime = totalElapsedTime / quads.length;
    gsap.to(quads, {
        duration: totalElapsedTime,
        shrinkFraction: (ix: number, _elem: any) =>
            map(noise(ix * 777 + 1000 * millis()), 0.15, 0.85, 0, 0.9, true),
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

export function actionToggleDebugText() {
    const options = getWorld().options;
    options.shouldDrawDebugText = !options.shouldDrawDebugText;
}

export function actionPickNewRandomPalette() {
    const options = getWorld().options;
    const oldIx = options.paletteIx;
    const otherIndices = palettes
        .map((_p, ix) => ix)
        .filter((ix) => ix !== oldIx);
    if (otherIndices.length === 0) {
        return 0;
    }
    options.paletteIx = random(otherIndices);
    actionRegenerateObservingMode();
}

export function actionSelectShrinkerBrush() {
    getWorld().options.brushMode = "shrink";
}
export function actionSelectSplitterBrush() {
    getWorld().options.brushMode = "split";
}
export function actionSelectInflaterBrush() {
    getWorld().options.brushMode = "inflate";
}
