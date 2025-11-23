import gsap from "gsap";
import { getWorld, postMessage } from "./main.js";

import {
    createGridOfStartingQuads,
    createStartingQuad,
    findQuadNearestToPos,
    splitQuadIfBig,
    subdivideAllRepeatedly,
    type Quad,
} from "./quad.js";
import { mousePos } from "./randomStuff.js";
import { palettes } from "./palettes.js";

export interface Command {
    title: string;
    description: string;
    key: string;
    action: () => void;
    beginnerPriority: "1: high" | "2: med" | "3: low";
}

export function createCommands(): Command[] {
    const cmds: Command[] = [];

    cmds.push({
        key: "i",
        beginnerPriority: "3: low",
        action: () => {
            actionSetDrawModeToUseReferenceImage();

            actionRegenerateObservingMode();
        },
        title: "Draw mode: reference image",
        description:
            "have the quads observe the brightness or colour of a loaded but hidden reference image",
    });
    cmds.push({
        key: "n",
        action: () => {
            getWorld().options.numSplits = 5;
            actionSetDrawModeNormal();
            actionRegenerateObservingMode();
        },
        title: "Draw mode: normal",
        description: "set normal draw mode",
        beginnerPriority: "3: low",
    });
    cmds.push({
        key: "1",
        action: actionSelectMaxShrinkerBrush,
        title: "Select brush: shrinkmax",
        description: "change the current brush mode to shrink quads completely",
        beginnerPriority: "1: high",
    });
    cmds.push({
        key: "2",
        action: actionSelectShrinkerBrush,
        title: "Select brush: shrink",
        description: "change the current brush mode to shrink quads",
        beginnerPriority: "1: high",
    });
    cmds.push({
        key: "3",
        action: actionSelectSplitterBrush,
        title: "Select brush: split",
        description: "change the current brush mode to split quads",
        beginnerPriority: "1: high",
    });
    cmds.push({
        key: "4",
        action: actionSelectInflaterBrush,
        title: "Select brush: inflate",
        description: "change the current brush mode to inflate quads",
        beginnerPriority: "1: high",
    });
    cmds.push({
        key: "5",
        action: actionSelectInflateByColourBrush,
        title: "Select brush: inflate-by-colour",
        description:
            "change the current brush mode to inflate quads having the same colour as the under mouse",
        beginnerPriority: "1: high",
    });
    cmds.push({
        key: "?",
        action: actionToggleHelp,
        title: "Toggle help",
        description: "Toggle display of help on commands and interaction.",
        beginnerPriority: "1: high",
    });
    cmds.push({
        key: "h",
        action: () => {}, //implemented by dat.gui automatically
        title: "Toggle hide dat.gui",
        description: "Toggle complete hide of dat.gui",
        beginnerPriority: "3: low",
    });
    cmds.push({
        key: " ",
        action: actionRegenerateObservingMode,
        title: "Regenerate",
        description:
            "Regenerate a new set of quads preserving the current config (maintaining grid mode if enabled)",
        beginnerPriority: "2: med",
    });

    cmds.push({
        key: "g",
        action: actionRegenerateFromGrid,
        title: "Regenerate from grid",
        description:
            "Regenerate a new set of quads by repeatedly bisecting a grid of starting quads",
        beginnerPriority: "1: high",
    });

    cmds.push({
        key: "o",
        action: actionRegenerateWithSingleStartingQuad,
        title: "Regenerate from one quad",
        description:
            "Regenerate a new set of quads starting from a single large quad",
        beginnerPriority: "1: high",
    });
    cmds.push({
        key: "r",
        action: actionShrinkAllRandomly,
        title: "Shrink all randomly",
        description:
            "Animate random quad shrink/grows from a variety of options",
        beginnerPriority: "1: high",
    });
    cmds.push({
        key: "u",
        action: actionUnshrinkAll,
        title: "Unshrink all fully",
        description: "Unshrinking all quads to full size",
        beginnerPriority: "1: high",
    });
    cmds.push({
        key: "p",
        action: actionPickNewRandomPalette,
        title: "Pick random palette",
        description: "Pick random palette from those available",
        beginnerPriority: "1: high",
    });
    cmds.push({
        key: "s",
        action: actionTakeAScreenshot,
        title: "Screenshot",
        description: "Take a screenshot of the current canvas",
        beginnerPriority: "2: med",
    });
    cmds.push({
        key: "d",
        action: () => splitQuadUnderPos(mousePos()),
        title: "Split quad at mouse",
        description: "Split the quad under the current mouse/touch position",
        beginnerPriority: "3: low",
    });
    cmds.push({
        key: "t",
        action: actionToggleDebugText,
        title: "Toggle debug text",
        description:
            "Toggle the display of some debug text (num quads, num iterations of bisection, palette name, etc)",
        beginnerPriority: "3: low",
    });
    cmds.push({
        key: "m",
        action: actionToggleMessages,
        title: "Toggle messages",
        description:
            "Toggle the display of info messages when you take certain actions",
        beginnerPriority: "3: low",
    });
    cmds.push({
        key: "=",
        action: () => actionChangeGlobalShrinkFraction(-1),
        title: "Unshrink all a little",
        description:
            "Decreate the global shrink fraction (fractions by which all quad corners are lerped towards their centroid)",
        beginnerPriority: "3: low",
    });
    cmds.push({
        key: "-",
        action: () => actionChangeGlobalShrinkFraction(1),
        title: "Shrink all a little",
        description:
            "Increase the global shrink fraction (fractions by which all quad corners are lerped towards their centroid)",
        beginnerPriority: "3: low",
    });

    cmds.push({
        key: ",",
        action: () => actionChangeNumSplits(-1),
        title: "Decrease num splits",
        description:
            "Decrease the maximum number of quad-splitting passes done over the quads.  Bigger quads will result.",
        beginnerPriority: "1: high",
    });

    cmds.push({
        key: ".",
        action: () => actionChangeNumSplits(1),
        title: "Increase num splits",
        description:
            "Increase the maximum number of quad-splitting passes done over the quads.  Smaller quads will result.",
        beginnerPriority: "1: high",
    });
    cmds.push({
        key: "z",
        action: () => actionShrinkAllCompletely(),
        title: "Shink all to zero",
        description:
            "Increase the number of quad-splitting passes done over the quads.  Smaller quads will result.",
        beginnerPriority: "3: low",
    });

    return cmds;
}
function generateHelpReportForConsole(): String[] {
    const items = createHelpItems();

    return items.map((c) => {
        let keyCol = (
            c.type === "key" ? `"${c.key}"` : c.interactionDescription
        ).padStart(12, " ");
        return `${keyCol}: ${c.title} (${c.description}).`;
    });
}

export function actionToggleHelp() {
    const w = getWorld();
    w.options.shouldShowHelpScreen = !w.options.shouldShowHelpScreen;
    if (w.options.shouldShowHelpScreen) {
        console.log(generateHelpReportForConsole().join("\n"));
        postMessage("Commands help posted to console");
    }
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
    postMessage(
        `Regenerating from a grid of starting quads. (Num splits: ${w.options.numSplits})`
    );
}

export function actionChangeNumSplits(sign: -1 | 1) {
    const options = getWorld().options;
    const newCount = constrain(options.numSplits + sign, 0, 30);
    options.numSplits = newCount;
    options.shouldGenerateUnshrunk = random([true, false]);
    actionRegenerateObservingMode();
    postMessage("Max number of splits " + options.numSplits);
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
    actionShrinkAllRandomly();
    postMessage(
        `Regenerating from one quad. (Num splits: ${options.numSplits})`
    );
}
export function actionRegenerateObservingMode() {
    if (getWorld().options.shouldUseGridMode) {
        actionRegenerateFromGrid();
    } else {
        actionRegenerateWithSingleStartingQuad();
    }
}

export function actionShrinkAllCompletely() {
    const shouldStagger = random([true, false]);

    const quads = getWorld().quads;
    gsap.to(quads, {
        duration: 0.2,
        stagger: shouldStagger ? 0.5 / quads.length : undefined,
        shrinkFraction: 1,
        ease: "power3.out",
    });
}

export function actionUnshrinkAll() {
    const quads = getWorld().quads;
    gsap.to(quads, {
        duration: 0.2,
        stagger: 0.1 / quads.length,
        shrinkFraction: 0,
        ease: "power3.out",
    });
}

export function actionUnshrinkBySameColourAsUnderMouse() {
    const quads = getWorld().quads;
    const nearestQuad = findQuadNearestToPos(quads, mousePos());
    if (!nearestQuad) {
        return;
    }
    //this will include the quad under pointer. good.
    const sameColourQuads = quads.filter(
        (q) => q.colourIx === nearestQuad.element.colourIx
    );

    gsap.to(sameColourQuads, {
        duration: 0.2,
        stagger: 1 / quads.length,
        shrinkFraction: 0,
        ease: "power3.out",
    });
}
export function actionShrinkAllRandomly() {
    const quads = getWorld().quads;
    const shouldStagger = random([true, false]);
    const totalElapsedTime = 0.4;
    //go faster with higher number of quads
    const staggerTime = totalElapsedTime / quads.length;

    const isUniformShrink = random([true, false]);

    const uniformShrink = random([0.2, 0.3, 0.3, 0.4]);
    const shrinkRange: [number, number] = isUniformShrink
        ? [uniformShrink, uniformShrink]
        : [0.15, 0.9];

    gsap.to(quads, {
        duration: totalElapsedTime,
        shrinkFraction: (ix: number, _elem: any) =>
            map(
                noise(ix * 777 + 1000 * millis()),
                0.15,
                0.85,
                shrinkRange[0],
                shrinkRange[1],
                true
            ),
        stagger: shouldStagger ? staggerTime : undefined,
        ease: "bounce.out",
    });
}

export function splitQuadUnderPos(pos: p5.Vector) {
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

export function splitAndAddGivenQuads(quads: Quad[]): Quad[] {
    //TODO: when ditching a split quad, clear any gsap anims on it.

    const w = getWorld();
    const createdQuads: Quad[] = [];

    for (let qToSplit of quads) {
        const splitResult = splitQuadIfBig(qToSplit, {
            ...w.options,
            shouldGenerateUnshrunk: false,
        });
        if (splitResult) {
            createdQuads.push(...splitResult);
            w.quads = w.quads.filter((q) => q !== qToSplit);
        }
    }
    if (createdQuads.length > 0) {
        w.quads.push(...createdQuads);
        gsap.to(createdQuads, { shrinkFraction: 0, duration: 0.5 });
    }
    return createdQuads;
}

export function actionToggleDebugText() {
    const options = getWorld().options;
    options.shouldDrawDebugText = !options.shouldDrawDebugText;
}
export function actionToggleMessages() {
    const options = getWorld().options;
    options.shouldDrawMessages = !options.shouldDrawMessages;
    postMessage("messages " + (options.shouldDrawMessages ? "on" : "off"));
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
    postMessage("Palette: " + palettes[options.paletteIx].name);
}

export function actionSelectShrinkerBrush() {
    getWorld().options.brushMode = "shrink";
    postMessage("Shrinker brush");
}
export function actionSelectMaxShrinkerBrush() {
    getWorld().options.brushMode = "shrinkmax";
    postMessage("MaxShrinker brush");
}

export function actionSelectSplitterBrush() {
    getWorld().options.brushMode = "split";
    postMessage("Splitter brush");
}
export function actionSelectInflaterBrush() {
    getWorld().options.brushMode = "inflate";
    postMessage("Inflater brush");
}

export function actionSelectInflateByColourBrush() {
    getWorld().options.brushMode = "inflate-by-colour";
    postMessage("Inflate-by-Colour brush");
}
export function actionSetDrawModeNormal(): void {
    const w = getWorld();
    w.options.quadDrawMode = "normal";
    w.options.minAllowedLength = 15;
}
export function actionSetDrawModeToUseReferenceImage(): void {
    const w = getWorld();
    if (w.images) {
        w.options.quadDrawMode = "under-image";
        w.options.quadDrawFillMode = random(["useBrightness", "usePalette"]);
        w.options.minAllowedLength = 5;
        w.options.numSplits = w.options.shouldUseGridMode ? 9 : 12;
        w.options.imageIx = (w.options.imageIx + 1) % w.images.length;
        postMessage(
            "using reference image.  Submode: " + w.options.quadDrawFillMode
        );
    }
}

type KeyHelpItem = {
    type: "key";
    key: string;
    title: string;
    description: string;
};
type InteractionHelpItem = {
    type: "interaction";
    interactionDescription: string;
    title: string;
    description: string;
};
export type HelpItem = KeyHelpItem | InteractionHelpItem;

export function createHelpItems(): HelpItem[] {
    const cmds = getWorld().commands.sort((a, b) =>
        a.beginnerPriority < b.beginnerPriority ? -1 : 1
    );
    const mouseHelpItems: InteractionHelpItem[] = [
        {
            type: "interaction",
            interactionDescription: "drag mouse",
            title: "Manipulate quads",
            description:
                "Depending on the currently selected brush, you can shrink / inflate / split the quads under or near the pointer",
        },
    ];

    function createHelpItemForCommand(cmd: Command): KeyHelpItem {
        return {
            ...cmd,
            type: "key",
            key: cmd.key === " " ? "SPACE" : cmd.key,
        };
    }

    const items: HelpItem[] = [
        ...mouseHelpItems,
        ...cmds.map(createHelpItemForCommand),
    ];
    return items;
}
