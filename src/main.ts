//original inspiration and learning from https://openprocessing.org/sketch/1045334/

//See readme.md for more info

//this import RUNS p5 - it's not for type purposes - that's set up by  global.d.ts
import "p5"; //TODO: remove this import when building for OP

//This import brings in the runtime p5 value (to reference p5.Vector.random2D() etc)
import p5 from "p5"; //TODO: remove this import when building for OP

import {
    actionAnimateRandomShrinkFractionChanges,
    actionAnimateUnshrinkAll,
    actionRegenerateFromGrid,
    actionRegenerateObservingMode,
    actionRegenerateWithSingleStartingQuad,
    actionSelectInflaterBrush,
    actionSelectShrinkerBrush,
    actionSelectSplitterBrush,
    createCommands,
    type Command,
} from "./actions.js";

import "./interaction.js";
import { drawQuad, type Options, type Quad } from "./quad.js";
import { drawDebugText, setDescription } from "./randomStuff.js";

import * as dat from "dat.gui"; //TODO: remove this import when building for OP

import { createGUI } from "./gui.js";
import { drawQuadsByUnderlyingImage, loadImagePack } from "./underimage.js";

export interface World {
    quads: Quad[];
    commands: Command[];
    options: Options;
    gui?: dat.GUI;
    images: p5.Image[] | null;
}

/** Encapsulates our entire global state that will be made available to most of our functions */
let world: World;

//just checking this ts setup can handle the p5 value.
p5.disableFriendlyErrors = true;

window.setup = async function setup() {
    createCanvas(windowWidth, windowHeight);
    world = createWorld();
    world.images = await loadImagePack("/images/scImagePack");
    setDescription();
    // blendMode(DARKEST);
    actionRegenerateObservingMode();
};

window.draw = function draw() {
    background(30);
    const { options } = world;
    switch (options.quadDrawMode) {
        case "normal":
            world.quads.forEach((q) => {
                drawQuad(q, options);
            });
            break;
        case "under-image":
            if (world.images) {
                drawQuadsByUnderlyingImage();
            }
            break;
        default:
            throw new Error(
                "unrecognised quadDrawMode: " + options.quadDrawMode
            );
    }

    if (options.shouldDrawDebugText) {
        drawDebugText(world);
    }
};

function createOptions(): Options {
    const shouldUseGridMode = random([true, false]);
    const quadDrawMode: Options["quadDrawMode"] = true
        ? "normal"
        : "under-image";
    return {
        quadDrawMode,
        imageIx: 0,
        shouldUseGridMode,
        shouldDrawDebugText: false,
        shouldDrawDebugNormals: false,
        shouldLogKeyCommands: false,
        quadBrushRadius: 120,
        shouldShrink: true,
        numSplits:
            quadDrawMode === "under-image"
                ? 10
                : shouldUseGridMode
                ? random([1, 2, 3])
                : random([4, 5, 6]),
        shouldGenerateUnshrunk: true,
        globalShrinkFraction: 0.05, //0-1 exclusive
        minAllowedLength: quadDrawMode === "under-image" ? 5 : 15,
        seed: 123,
        paletteIx: 0,
        brushMode: "no-op",
        actionSelectShrinkerBrush,
        actionSelectInflaterBrush,
        actionSelectSplitterBrush,
        actionAnimateUnshrinkAll,
        actionAnimateRandomShrinkFractionChanges,
        actionRegenerateFromGrid,
        actionRegenerateWithSingleStartingQuad,
    };
}

/** Create and return all the essentially global state that will be made available between modules. */
function createWorld(): World {
    const w: World = {
        quads: [],
        commands: createCommands(),
        options: createOptions(),
        images: null,
    };
    w.gui = createGUI(w);

    return w;
}

export function getWorld() {
    return world;
}
