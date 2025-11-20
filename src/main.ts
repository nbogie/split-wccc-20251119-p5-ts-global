//original inspiration and learning from https://openprocessing.org/sketch/1045334/

//See readme.md for more info

//this import RUNS p5 - it's not for type purposes - that's set up by  global.d.ts
import "p5";
//This import brings in the runtime p5 value (to reference p5.Vector.random2D() etc)
import p5 from "p5";

import { actionRegenerate, createCommands, type Command } from "./actions.ts";
import { drawQuad, type Options, type Quad } from "./quad.ts";
import "./interaction.ts";
import { drawDebugText } from "./randomStuff.ts";
export interface World {
    quads: Quad[];
    commands: Command[];
    options: Options;
}
let world: World;

//just checking this ts setup can handle the p5 value.
p5.disableFriendlyErrors = true;

window.setup = function setup() {
    createCanvas(windowWidth, windowHeight);
    world = {
        commands: createCommands(),
        quads: [],
        options: createOptions(),
    };
    // blendMode(DARKEST);
    actionRegenerate();
};

window.draw = function draw() {
    background(30);
    const { quads, options } = world;
    quads.forEach((q) => {
        drawQuad(q, options);
    });
    if (options.shouldDrawDebugText) {
        drawDebugText(world);
    }
};

function createOptions(): Options {
    return {
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
        paletteIx: 0,
    };
}

export function getWorld() {
    return world;
}
