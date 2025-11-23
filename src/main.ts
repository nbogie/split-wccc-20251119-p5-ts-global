//original inspiration and learning from https://openprocessing.org/sketch/1045334/

//See readme.md for more info

//this import RUNS p5 - it's not for type purposes - that's set up by  global.d.ts
import "p5"; //TODO: remove this import when building for OP

//This import brings in the runtime p5 value (to reference p5.Vector.random2D() etc)
import p5 from "p5"; //TODO: remove this import when building for OP

import {
    actionShrinkAllRandomly,
    actionUnshrinkAll,
    actionRegenerateFromGrid,
    actionRegenerateObservingMode,
    actionRegenerateWithSingleStartingQuad,
    actionSelectInflaterBrush,
    actionSelectShrinkerBrush,
    actionSelectSplitterBrush,
    createCommands,
    createHelpItems,
    type Command,
    actionSelectInflateByColourBrush,
    actionSelectMaxShrinkerBrush,
    actionPickNewRandomPalette,
} from "./actions.js";

import "./interaction.js";
import { drawQuad, type Quad } from "./quad.js";
import { drawDebugText, setDescription } from "./randomStuff.js";

import * as dat from "dat.gui"; //TODO: remove this import when building for OP

import { createGUI } from "./gui.js";
import { drawQuadsByUnderlyingImage, loadImagePack } from "./underimage.js";
import { drawCanvasTextureTo } from "./canvasTexture.js";
import type { Options } from "./options.js";

export interface World {
    quads: Quad[];
    commands: Command[];
    options: Options;
    messages: Message[];
    gui?: dat.GUI;
    images: p5.Image[] | null;
}

/** Encapsulates our entire global state that will be made available to most of our functions */
let world: World;
let textureGraphic: ReturnType<typeof createGraphics>;
//just checking this ts setup can handle the p5 value.
p5.disableFriendlyErrors = true;

window.setup = async function setup() {
    createCanvas(windowWidth, windowHeight);
    world = createWorld();
    world.images = await loadImagePack("/images/scImagePack");
    setDescription();
    // blendMode(DARKEST);
    actionRegenerateObservingMode();

    textureGraphic = createGraphics(width, height);
    drawCanvasTextureTo({ alphaRange: [10, 40], spacing: 10 }, textureGraphic);
};

window.draw = function draw() {
    background(30);
    const { options } = world;

    push();

    if (options.shouldDrawCanvasTexture) {
        image(textureGraphic, 0, 0);
        blendMode(ADD);
    }

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
    pop();
    if (options.shouldShowHelpScreen) {
        drawHelpScreen();
    }

    drawBrushFeedback();
    drawRecentPostedMessages();
    updatePostedMessages();

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
        quadDrawFillMode: random(["useBrightness", "usePalette"]),
        imageIx: 0,
        shouldUseGridMode,

        shouldDrawMessages: true,
        shouldDrawDebugText: false,
        shouldShowHelpScreen: false,
        shouldDrawDebugNormals: false,
        shouldDrawCanvasTexture: true,
        shouldLogKeyCommands: false,
        quadBrushRadius: 120,
        _lastQuadBrushRadiusChangeMillis: -10_000,
        shouldShrink: true,
        numSplits:
            quadDrawMode === "under-image"
                ? 10
                : shouldUseGridMode
                ? random([1, 2, 3])
                : random([5, 6]),
        shouldGenerateUnshrunk: true,
        globalShrinkFraction: 0.05, //0-1 exclusive
        minAllowedLength: quadDrawMode === "under-image" ? 5 : 15,
        seed: 123,
        paletteIx: 0,
        defaultMessageDurationMillis: 2000,
        brushMode: "no-op",
        actionRegenerateFromGrid,
        actionRegenerateWithSingleStartingQuad,
        actionSelectInflateByColourBrush,
        actionSelectInflaterBrush,
        actionSelectMaxShrinkerBrush,
        actionSelectShrinkerBrush,
        actionSelectSplitterBrush,
        actionShrinkAllRandomly,
        actionUnshrinkAll,
        actionPickNewRandomPalette,
    };
}

export interface Message {
    str: string;
    postedAtMillis: number;
}
/** Create and return all the essentially global state that will be made available between modules. */
function createWorld(): World {
    const w: World = {
        quads: [],
        commands: createCommands(),
        options: createOptions(),
        images: null,
        messages: [],
    };
    w.gui = createGUI(w);

    return w;
}

export function getWorld() {
    return world;
}

export function postMessage(str: string) {
    const m: Message = createMessage(str);
    world.messages.push(m);
}

export function drawRecentPostedMessages() {
    if (!world.options.shouldDrawMessages) {
        return;
    }
    push();
    textAlign(RIGHT, BOTTOM);
    translate(width, height - 50);
    fill(255);
    textSize(round(min(width, height) * 0.03));
    text(world.messages.at(-1)?.str ?? "", -50, 0);
    pop();
}
export function updatePostedMessages() {
    world.messages = world.messages.filter(
        (m) =>
            m.postedAtMillis >
            millis() - world.options.defaultMessageDurationMillis
    );
}

export function createMessage(str: string): Message {
    return { str, postedAtMillis: millis() };
}

function drawHelpScreen() {
    const items = createHelpItems();
    push();
    background(20);

    const lineColours = ["#ef9e28", "#c6ac71"];

    const lineHeight = 30;
    stroke(30);
    textAlign(LEFT, TOP);
    translate(width / 2, 50);
    const baseSize = 15;
    for (let [ix, info] of items.entries()) {
        fill(lineColours[ix % 2]);
        textWeight(800);
        textAlign(RIGHT, TOP);
        textSize(baseSize * 1.3);
        text(
            info.type === "key" ? info.key : info.interactionDescription,
            -50,
            0
        );
        textAlign(LEFT, TOP);
        textSize(baseSize);
        textWeight(400);
        text(info.title, 50, 0);
        // text(info.description, 300, 0);//too much info in this form.  better on hover, or in reference page.
        translate(0, lineHeight);
    }
    pop();
}

function drawBrushFeedback() {
    const now = millis();
    const brushRadiusIndicatorAlphaFrac = map(
        now - world.options._lastQuadBrushRadiusChangeMillis,
        0,
        3000,
        1,
        0,
        true
    );
    push();
    stroke(200, 255 * brushRadiusIndicatorAlphaFrac);
    strokeWeight(3);
    noFill();
    circle(mouseX, mouseY, world.options.quadBrushRadius * 2);

    pop();
}
