import p5 from "p5";
import { getWorld, type World } from "./main.js";
import { palettes } from "./palettes.js";

export function randomColourFromPalette(): p5.Color {
    const colours = palettes[getWorld().options.paletteIx].colors;

    const c = color(random(colours));
    // c.setAlpha(100);
    return c;
}

/**
 * Will return the element that generates the minimum value according to the given fn.  Earliest tied candidate wins ties.  Also returns the actual min value generated.
 * @param inputArray
 * @param iterateeFn fn to call on each element of input array to generate value for comparison.
 * @returns the "best" element and its generated minimum value
 * @author Gemini LLM initially (and then heavily modded to return both the prize element and its converted min value, and again to throw, and again to make use of first, ...others)
 */
export function minByOrThrow<Elem, Val extends number | string>(
    inputArray: Elem[],
    iterateeFn: (value: Elem) => Val
): { element: Elem; record: Val } {
    if (!inputArray || inputArray.length === 0) {
        throw new Error("Empty/undefined array passed to " + minByOrThrow.name);
    }
    const [firstElement, ...otherElements] = inputArray;

    let minElement = firstElement;
    let minValue = iterateeFn(minElement);

    for (const currentElement of otherElements) {
        const currConvertedValue = iterateeFn(currentElement);
        if (currConvertedValue < minValue) {
            minValue = currConvertedValue;
            minElement = currentElement;
        }
    }

    return { element: minElement, record: minValue };
}

export function mousePos(): p5.Vector {
    return createVector(mouseX, mouseY);
}

export function collect<T>(numItems: number, fn: (ix: number) => T): T[] {
    const arr = [];
    for (let i = 0; i < numItems; i++) {
        arr.push(fn(i));
    }
    return arr;
}

export function drawDebugText(world: World) {
    const { quads, options } = world;
    fill(255);

    push();
    translate(100, height - 100);
    const lines = [
        "quads: " + quads.length,
        "shrinkFraction: " + options.globalShrinkFraction.toFixed(2),
        "num splits: " + options.numSplits,
        "palette: " + palettes[options.paletteIx].name,
        "brushMode: " + options.brushMode,
    ];
    for (let line of [...lines].reverse()) {
        text(line, 0, 0);
        translate(0, -30);
    }
    pop();
}

export function setDescription() {
    describe(
        "Colourful repeatedly bisected and sometimes shrunk quads.  " +
            "User interactions can grow and shrink them and " +
            "break them down into further subdivisions."
    );
}
