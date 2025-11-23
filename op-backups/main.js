//See original (typescript) code and readme at
//https://github.com/nbogie/split-wccc-20251119-p5-ts-global

/**

# "Split" - Interactive quad bisection painting sketch with p5.js

This is an interactive p5.js sketch for the 
[#WCCChallenge](https://openprocessing.org/curation/78544) Nov'25 themed 
"split". 

In it, the user can play around bisecting / inflating / shrinking 
quads to various depths with mouse and keyboard.

Hit ? for help

Written in typescript and p5 v2.x in global-mode with modules, partly to test 
v2 typescript types and global mode setup. (Bundled with vite)

## Credits

-   The basic sketch is very much informed by [Okazz's wonderful, elegant 
sketch "201216a"](https://openprocessing.org/sketch/1045334/) though all I've 
started with here is an approximation of their conceptual algorithm from memory 
(no doubt I butchered that).
-   I've written other non-interactive versions of this some years ago but 
started from scratch for the challenge without reusing / consulting any code 
unless otherwise noted here in credits.
-   Uses various palette(s) from [Kjetil Golid's 
chromotome](https://github.com/kgolid/chromotome) via 
[https://nice-colours-quicker.netlify.app/](nice-colours-quicker).
-   Uses GSAP for animation (Unnecessarily, but I wanted to learn).
-   Uses roughjs for one of the drawing modes
-   Procedural canvas texture (if used) is taken from [this Manohar Vanga 
article on watercolor 
simulation](https://sighack.com/post/generative-watercolor-in-processing) - [p5 
demo](https://openprocessing.org/sketch/942231).

## WCCChallenge?

The Weekly Creative Code Challenge is a friendly jam for generative artists and 
creative coders.

[You can see the other entries here.](https://openprocessing.org/curation/78544)

Join the Birb's Nest Discord for friendly creative coding community and future 
challenges and contributions: https://discord.gg/S8c7qcjw2b


### controls:

(get latest keys with "?". This summary might be out of date)

drag mouse: Manipulate quads (Depending on the currently selected brush, you can shrink / inflate / split the quads under or near the pointer).
"1": Select brush: split (change the current brush mode to split quads).
"2": Select brush: shrinkmax (change the current brush mode to shrink quads completely).
"3": Select brush: shrink (change the current brush mode to shrink quads).
"4": Select brush: inflate (change the current brush mode to inflate quads).
"5": Select brush: inflate-by-colour (change the current brush mode to inflate quads having the same colour as the under mouse).
",": Decrease num splits (Decrease the maximum number of quad-splitting passes done over the quads. Bigger quads will result.).
".": Increase num splits (Increase the maximum number of quad-splitting passes done over the quads. Smaller quads will result.).
"g": Regenerate from grid (Regenerate a new set of quads by repeatedly bisecting a grid of starting quads).
"o": Regenerate from one quad (Regenerate a new set of quads starting from a single large quad).
"s": Shrink all randomly (Animate random quad shrink/grows from a variety of options).
"u": Unshrink all fully (Unshrinking all quads to full size).
"p": Pick random palette (Pick random palette from those available).
"r": Draw mode: roughjs (experimental) (use roughjs for drawing - maybe very slow).
"?": Toggle help (Toggle display of help on commands and interaction.).
"SPACE": Regenerate (Regenerate a new set of quads preserving the current config (maintaining grid mode if enabled)).
"n": Draw mode: normal (set normal draw mode).
"v": saVe screenshot (Save a screenshot of the current canvas).
"h": Toggle hide dat.gui (Toggle complete hide of dat.gui).
"d": Split quad at mouse (Split the quad under the current mouse/touch position).
"t": Toggle debug text (Toggle the display of some debug text (num quads, num iterations of bisection, palette name, etc)).
"m": Toggle messages (Toggle the display of info messages when you take certain actions).
"=": Unshrink all a little (Decreate the global shrink fraction (fractions by which all quad corners are lerped towards their centroid)).
"-": Shrink all a little (Increase the global shrink fraction (fractions by which all quad corners are lerped towards their centroid)).
"z": Shink all to zero (Increase the number of quad-splitting passes done over the quads. Smaller quads will result.).
"i": Draw mode: reference image (have the quads observe the brightness or colour of a loaded but hidden reference image).

*/
import rough from "https://cdn.jsdelivr.net/npm/roughjs@4.6.6/+esm";

(function polyfill() {
    const relList = document.createElement("link").relList;
    if (relList && relList.supports && relList.supports("modulepreload"))
        return;
    for (const link of document.querySelectorAll('link[rel="modulepreload"]'))
        processPreload(link);
    new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type !== "childList") continue;
            for (const node of mutation.addedNodes)
                if (node.tagName === "LINK" && node.rel === "modulepreload")
                    processPreload(node);
        }
    }).observe(document, {
        childList: true,
        subtree: true,
    });
    function getFetchOpts(link) {
        const fetchOpts = {};
        if (link.integrity) fetchOpts.integrity = link.integrity;
        if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
        if (link.crossOrigin === "use-credentials")
            fetchOpts.credentials = "include";
        else if (link.crossOrigin === "anonymous")
            fetchOpts.credentials = "omit";
        else fetchOpts.credentials = "same-origin";
        return fetchOpts;
    }
    function processPreload(link) {
        if (link.ep) return;
        link.ep = true;
        const fetchOpts = getFetchOpts(link);
        fetch(link.href, fetchOpts);
    }
})();
const palettesRaw = [
    {
        name: "nowak",
        colors: [
            "#e85b30",
            "#ef9e28",
            "#c6ac71",
            "#e0c191",
            "#3f6279",
            "#ee854e",
            "#180305",
        ],
        stroke: "#180305",
        background: "#ede4cb",
        size: 7,
        type: "chromotome",
    },
    {
        name: "system.#04",
        colors: [
            "#e31f4f",
            "#f0ac3f",
            "#18acab",
            "#26265a",
            "#ea7d81",
            "#dcd9d0",
        ],
        stroke: "#26265a",
        background: "#dcd9d0",
        size: 6,
        type: "chromotome",
    },
    {
        name: "tsu_arcade",
        colors: [
            "#4aad8b",
            "#e15147",
            "#f3b551",
            "#cec8b8",
            "#d1af84",
            "#544e47",
        ],
        stroke: "#251c12",
        background: "#cfc7b9",
        size: 6,
        type: "chromotome",
    },
    {
        name: "tsu_akasaka",
        colors: [
            "#687f72",
            "#cc7d6c",
            "#dec36f",
            "#dec7af",
            "#ad8470",
            "#424637",
        ],
        stroke: "#251c12",
        background: "#cfc7b9",
        size: 6,
        type: "chromotome",
    },
    {
        name: "neill-grayscale",
        colors: ["#323232", "#646464", "#969696", "#c8c8c8", "#fafafa"],
        stroke: "#969696",
        background: "30",
        size: 5,
        type: "chromotome",
    },
    {
        name: "giftcard_sub",
        colors: [
            "#FBF5E9",
            "#FF514E",
            "#FDBC2E",
            "#4561CC",
            "#2A303E",
            "#6CC283",
            "#238DA5",
            "#9BD7CB",
        ],
        stroke: "#000",
        background: "#FBF5E9",
        size: 8,
        type: "chromotome",
    },
    {
        name: "revolucion",
        colors: ["#ed555d", "#fffcc9", "#41b797", "#eda126", "#7b5770"],
        stroke: "#fffcc9",
        background: "#2d1922",
        size: 5,
        type: "chromotome",
    },
    {
        name: "neill-rybitten1",
        colors: ["#906593", "#DE2C26", "#F2B47F", "#F6D3CA", "#B8D7BE"],
        stroke: "#141414",
        background: "#141414",
        size: 5,
        type: "chromotome",
    },
    {
        name: "book",
        colors: [
            "#be1c24",
            "#d1a082",
            "#037b68",
            "#d8b1a5",
            "#1c2738",
            "#c95a3f",
        ],
        stroke: "#0e0f27",
        background: "#f5b28a",
        size: 6,
        type: "chromotome",
    },
    {
        name: "system.#05",
        colors: ["#db4549", "#d1e1e1", "#3e6a90", "#2e3853", "#a3c9d3"],
        stroke: "#000",
        background: "#fff",
        size: 5,
        type: "chromotome",
    },
    {
        name: "mably",
        colors: [
            "#13477b",
            "#2f1b10",
            "#d18529",
            "#d72a25",
            "#e42184",
            "#138898",
            "#9d2787",
            "#7f311b",
        ],
        stroke: "#2a1f1d",
        background: "#dfc792",
        size: 8,
        type: "chromotome",
    },
];
const palettes = preprocessPalettes(palettesRaw);
function preprocessPalettes(ps) {
    const soloed = ps.filter((p) => p.solo);
    if (soloed.length > 0) {
        console.warn(
            "not all palettes prepared - at least one soloed: " +
                soloed.map((p) => p.name).join(", ")
        );
        return soloed;
    }
    return ps.filter((p) => !p.muted);
}
function randomColourAndIdFromPalette() {
    const colours = palettes[getWorld().options.paletteIx].colors;
    const ix = floor(random(0, colours.length));
    return [color(colours[ix]), ix];
}
function minByOrThrow(inputArray, iterateeFn) {
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
function mousePos() {
    return createVector(mouseX, mouseY);
}
function drawDebugText(world2) {
    const { quads, options } = world2;
    fill(255);
    stroke(0);
    strokeWeight(2);
    push();
    textSize(20);
    translate(100, height - 100);
    const lines = [
        "quads: " + quads.length,
        "shrinkFraction: " + options.globalShrinkFraction.toFixed(2),
        "num splits: " + options.numSplits,
        "palette: " + palettes[options.paletteIx].name,
        "brushMode: " + options.brushMode,
    ];
    for (let line2 of [...lines].reverse()) {
        text(line2, 0, 0);
        translate(0, -30);
    }
    pop();
}
function setDescription() {
    describe(
        "Colourful repeatedly bisected and sometimes shrunk quads.  User interactions can grow and shrink them and break them down into further subdivisions."
    );
}
let nextQuadId = 1;
const roughJSFillStyleNames = [
    "cross-hatch",
    "hachure",
    "solid",
    "zigzag",
    // "dots",
    "sunburst",
    "dashed",
    "zigzag-line",
];
function createStartingQuad(options) {
    const pts = [
        { x: 0.1, y: 0.1 },
        { x: 0.9, y: 0.1 },
        { x: 0.9, y: 0.9 },
        { x: 0.1, y: 0.9 },
    ].map((frac) => createVector(frac.x * width, frac.y * height));
    return createQuadWithPoints(pts, options);
}
function createGridOfStartingQuads(options) {
    const numColumns = 4;
    const numRows = 4;
    const cellSize = min(width, height) / numRows;
    const gridQuads = [];
    for (let colIx = 0; colIx < numColumns; colIx++) {
        for (let rowIx = 0; rowIx < numRows; rowIx++) {
            gridQuads.push(
                createQuadOnGrid(
                    { colIx, rowIx, numColumns, numRows, cellSize },
                    options
                )
            );
        }
    }
    return gridQuads;
}
function createQuadOnGrid(
    { colIx, rowIx, numColumns, numRows, cellSize },
    options
) {
    const leftMargin = (width - cellSize * numColumns) / 2;
    const topMargin = (height - cellSize * numRows) / 2;
    const topLeft = createVector(
        colIx * cellSize + leftMargin,
        rowIx * cellSize + topMargin
    );
    const pts = [
        { x: 0.05, y: 0.05 },
        { x: 0.95, y: 0.05 },
        { x: 0.95, y: 0.95 },
        { x: 0.05, y: 0.95 },
    ].map((frac) =>
        createVector(frac.x * cellSize, frac.y * cellSize).add(topLeft)
    );
    return createQuadWithPoints(pts, options);
}
function createQuadWithPoints(pts, options) {
    const [colour, colourIx] = randomColourAndIdFromPalette();
    return {
        id: nextQuadId++,
        pts: pts.map((pt) => pt.copy()),
        isLeaf: false,
        lastMouseModMillis: -1,
        colour,
        colourIx,
        shrinkFraction: options.shouldGenerateUnshrunk
            ? 0
            : randomShrinkFraction(),
    };
}
function randomShrinkFraction() {
    const numDivisions = 10;
    return round(numDivisions * random(0, 0.9)) / numDivisions;
}
function drawQuad(quad, options) {
    if (quad.shrinkFraction > 0.999) {
        return;
    }
    push();
    const c = color(quad.colour.toString());
    if (options.shouldDrawDebugNormals) {
        drawDebugInfo(quad);
    }
    const shrunkPts = shrinkQuadPoints(quad.pts, quad.shrinkFraction);
    if (options.quadDrawMode === "normal") {
        fill(c);
        noStroke();
        beginShape();
        shrunkPts.forEach((v) => vertex(v.x, v.y));
        endShape(CLOSE);
        pop();
    } else if (options.quadDrawMode === "rough") {
        getWorld().roughCanvas.polygon(
            shrunkPts.map((v) => [v.x, v.y]),
            {
                fill: quad.colour.toString(),
                stroke: "#FFFFFFAA",
                strokeWidth: 2,
                roughness: options.defaultRoughness,
                //should go less as quads get tiny
                disableMultiStroke: options.disableMultiStroke,
                fillStyle:
                    roughJSFillStyleNames[
                        quad.id % roughJSFillStyleNames.length
                    ],
                seed: quad.id * 33,
            }
        );
    }
}
function drawQuadWithBrightness(quad, brightnessFrac, fillMode) {
    push();
    const level = max(30, brightnessFrac * 200);
    if (fillMode === "useBrightness") {
        fill(level);
    } else {
        if (level > 100) {
            const c = color(quad.colour.toString());
            fill(c);
        } else {
            fill(level);
        }
    }
    noStroke();
    const shrunkPts = shrinkQuadPoints(quad.pts, quad.shrinkFraction);
    beginShape();
    shrunkPts.forEach((v) => vertex(v.x, v.y));
    endShape(CLOSE);
    pop();
}
function splitQuad(inQuad, shouldCutFirstSide, options) {
    const [a, b, c, d] = inQuad.pts.map((v) => v.copy());
    const cutFrac1 = random([1, 2]) / 3;
    const cutFrac2 = random([1, 2]) / 3;
    if (shouldCutFirstSide) {
        const e = p5.Vector.lerp(a, b, cutFrac1);
        const f = p5.Vector.lerp(c, d, cutFrac2);
        return [
            createQuadWithPoints([a, e, f, d], options),
            createQuadWithPoints([e, b, c, f], options),
        ];
    } else {
        const e = p5.Vector.lerp(b, c, cutFrac1);
        const f = p5.Vector.lerp(d, a, cutFrac2);
        return [
            createQuadWithPoints([a, b, e, f], options),
            createQuadWithPoints([f, e, c, d], options),
        ];
    }
}
function smallestSide(quad) {
    const [a, b, c, d] = quad.pts;
    const pairs = [
        [a, b],
        [b, c],
        [c, d],
        [d, a],
    ];
    const smallest = minByOrThrow(pairs, ([p1, p2]) => p5.Vector.dist(p1, p2));
    return {
        len: smallest.record,
        startIx: pairs.indexOf(smallest.element),
    };
}
function splitQuadIfBig(quad, options) {
    const smallSide = smallestSide(quad);
    if (smallSide.len < options.minAllowedLength) {
        return null;
    }
    const cutFirstSide = smallSide.startIx % 2 === 1;
    const [q1, q2] = splitQuad(quad, cutFirstSide, options);
    return [q1, q2];
}
function subdivideAllRepeatedly(quads, options) {
    let newQuads = [...quads];
    for (let i = 0; i < options.numSplits; i++) {
        newQuads = subdivideAllQuadsOnce(
            newQuads,
            options,
            i === options.numSplits - 1
        );
    }
    return newQuads;
}
function subdivideAllQuadsOnce(quads, options, isLastLayer) {
    const newQuads = [];
    for (const quad of quads) {
        const result = splitQuadIfBig(quad, options);
        if (!result) {
            newQuads.push({ ...quad, isLeaf: true });
            continue;
        }
        const corrected = result.map((q) => ({
            ...q,
            isLeaf: isLastLayer,
        }));
        newQuads.push(...corrected);
    }
    return newQuads;
}
function decorateEdge([p1, p2]) {
    return {
        pts: [p1, p2],
        midpoint: p5.Vector.lerp(p1, p2, 0.5),
        colour: random(["lime", "yellow", "white", "red", "cyan", "magenta"]),
        normal: p5.Vector.sub(p2, p1)
            .normalize()
            .rotate(PI / 2),
    };
}
function shrinkQuadPoints(pts, shrinkFrac) {
    const centroid = findQuadCentroid(pts);
    return pts.map((pt) => p5.Vector.lerp(pt, centroid, shrinkFrac));
}
function visNormals(edges) {
    if (
        !edges.some(
            (edge) => edge.midpoint.dist(createVector(mouseX, mouseY)) < 30
        )
    ) {
        return;
    }
    for (let edge of edges) {
        const n = edge.normal;
        const mp = edge.midpoint;
        const normLineLen = 30 * n.mag();
        const [a, b] = edge.pts;
        push();
        stroke(edge.colour);
        line(a.x, a.y, b.x, b.y);
        translate(mp);
        rotate(n.heading());
        strokeWeight(2);
        line(0, 0, normLineLen, 0);
        circle(normLineLen, 0, 5);
        pop();
    }
}
function findQuadCentroid(quadPts) {
    return quadPts
        .reduce((prev, curr) => prev.add(curr), createVector(0, 0))
        .div(4);
}
function drawDebugInfo(quad) {
    const [a, b, c, d] = quad.pts;
    const edges = [
        [a, b],
        [b, c],
        [c, d],
        [d, a],
    ].map((edge) => decorateEdge(edge));
    visNormals(edges);
}
function findQuadNearestToPos(quads, pos) {
    return minByOrThrow(quads, (quad) => findQuadCentroid(quad.pts).dist(pos));
}
function findQuadsNearPos(pos, radius, fromQuads) {
    return fromQuads.filter((q) => findQuadCentroid(q.pts).dist(pos) < radius);
}
function createCommands() {
    const cmds = [];
    cmds.push({
        key: "1",
        action: actionSelectSplitterBrush,
        title: "Select brush: split",
        description: "change the current brush mode to split quads",
        beginnerPriority: "1: high",
    });
    cmds.push({
        key: "2",
        action: actionSelectMaxShrinkerBrush,
        title: "Select brush: shrinkmax",
        description: "change the current brush mode to shrink quads completely",
        beginnerPriority: "1: high",
    });
    cmds.push({
        key: "3",
        action: actionSelectShrinkerBrush,
        title: "Select brush: shrink",
        description: "change the current brush mode to shrink quads",
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
        key: "?",
        action: actionToggleHelp,
        title: "Toggle help",
        description: "Toggle display of help on commands and interaction.",
        beginnerPriority: "2: med",
    });
    cmds.push({
        key: "C",
        action: actionReportHelpToConsole,
        title: "report Help in console",
        description: "Generate a report of commands into the console",
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
        key: "s",
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
        key: "k",
        action: actionLoadRandomPreset,
        title: "Random Preset",
        description: "Load a random preset of parameters",
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
        key: "r",
        action: () => {
            getWorld().options.numSplits = 5;
            actionSetDrawModeRough();
            actionRegenerateObservingMode();
        },
        title: "Draw mode: roughjs (experimental)",
        description: "use roughjs for drawing - maybe very slow",
        beginnerPriority: "1: high",
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
        beginnerPriority: "2: med",
    });
    cmds.push({
        key: "h",
        action: () => {},
        //implemented by dat.gui automatically
        title: "Toggle hide dat.gui",
        description: "Toggle complete hide of dat.gui",
        beginnerPriority: "3: low",
    });
    cmds.push({
        key: "v",
        action: actionTakeAScreenshot,
        title: "saVe screenshot",
        description: "Save a screenshot of the current canvas",
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
        key: "z",
        action: () => actionShrinkAllCompletely(),
        title: "Shink all to zero",
        description:
            "Increase the number of quad-splitting passes done over the quads.  Smaller quads will result.",
        beginnerPriority: "3: low",
    });
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
    return cmds;
}
function generateHelpReportForConsole() {
    const items = createHelpItems();
    return items.map((c) => {
        let keyCol = (
            c.type === "key" ? `"${c.key}"` : c.interactionDescription
        ).padStart(12, " ");
        return `${keyCol}: ${c.title} (${c.description}).`;
    });
}
function actionToggleHelp() {
    const w = getWorld();
    w.options.shouldShowHelpScreen = !w.options.shouldShowHelpScreen;
}
function actionReportHelpToConsole() {
    console.log(generateHelpReportForConsole().join("\n"));
    postMessage("Commands help posted to console");
}
function actionRegenerateFromGrid() {
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
function actionChangeNumSplits(sign) {
    const options = getWorld().options;
    const newCount = constrain(options.numSplits + sign, 0, 30);
    options.numSplits = newCount;
    options.shouldGenerateUnshrunk = random([true, false]);
    actionRegenerateObservingMode();
    postMessage("Max number of splits " + options.numSplits);
}
function actionChangeGlobalShrinkFraction(sign) {
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
function actionTakeAScreenshot() {
    getWorld().options.shouldDrawDebugText = false;
    redraw();
    setTimeout(() => save("wccc-split-neill"), 0);
}
function actionRegenerateWithSingleStartingQuad() {
    const world2 = getWorld();
    const options = world2.options;
    options.shouldUseGridMode = false;
    options.seed = millis();
    randomSeed(options.seed);
    world2.quads = [createStartingQuad(options)];
    world2.quads = subdivideAllRepeatedly(world2.quads, options);
    actionShrinkAllRandomly();
    postMessage(
        `Regenerating from one quad. (Num splits: ${options.numSplits})`
    );
}
function actionRegenerateObservingMode() {
    if (getWorld().options.shouldUseGridMode) {
        actionRegenerateFromGrid();
    } else {
        actionRegenerateWithSingleStartingQuad();
    }
}
function actionShrinkAllCompletely() {
    const shouldStagger = random([true, false]);
    const quads = getWorld().quads;
    gsap.to(quads, {
        duration: 0.2,
        stagger: shouldStagger ? 0.5 / quads.length : void 0,
        shrinkFraction: 1,
        ease: "power3.out",
    });
}
function actionUnshrinkAll() {
    const quads = getWorld().quads;
    gsap.to(quads, {
        duration: 0.2,
        stagger: 0.1 / quads.length,
        shrinkFraction: 0,
        ease: "power3.out",
    });
}
function actionLoadRandomPreset() {
    const presets = [
        {
            name: "test",
            fn: () => {},
        },
    ];
    const chosenPreset = random(presets);
    chosenPreset.fn();
    // postMessage("running preset: " + chosenPreset.name);
}
function actionUnshrinkBySameColourAsUnderMouse() {
    const quads = getWorld().quads;
    const nearestQuad = findQuadNearestToPos(quads, mousePos());
    if (!nearestQuad) {
        return;
    }
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
function actionShrinkAllRandomly() {
    const quads = getWorld().quads;
    const shouldStagger = random([true, false]);
    const totalElapsedTime = 0.4;
    const staggerTime = totalElapsedTime / quads.length;
    const isUniformShrink = random([true, false]);
    const uniformShrink = random([0.2, 0.3, 0.3, 0.4]);
    const shrinkRange = isUniformShrink
        ? [uniformShrink, uniformShrink]
        : [0.15, 0.9];
    gsap.to(quads, {
        duration: totalElapsedTime,
        shrinkFraction: (ix, _elem) =>
            map(
                noise(ix * 777 + 1e3 * millis()),
                0.15,
                0.85,
                shrinkRange[0],
                shrinkRange[1],
                true
            ),
        stagger: shouldStagger ? staggerTime : void 0,
        ease: "bounce.out",
    });
}
function splitQuadUnderPos(pos) {
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
function splitAndAddGivenQuads(quads) {
    const w = getWorld();
    const createdQuads = [];
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
function actionToggleDebugText() {
    const options = getWorld().options;
    options.shouldDrawDebugText = !options.shouldDrawDebugText;
}
function actionToggleMessages() {
    const options = getWorld().options;
    options.shouldDrawMessages = !options.shouldDrawMessages;
    postMessage("messages " + (options.shouldDrawMessages ? "on" : "off"));
}
function actionPickNewRandomPalette() {
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
function actionSelectShrinkerBrush() {
    getWorld().options.brushMode = "shrink";
    postMessage("Shrinker brush");
}
function actionSelectMaxShrinkerBrush() {
    getWorld().options.brushMode = "shrinkmax";
    postMessage("MaxShrinker brush");
}
function actionSelectSplitterBrush() {
    getWorld().options.brushMode = "split";
    postMessage("Splitter brush");
}
function actionSelectInflaterBrush() {
    getWorld().options.brushMode = "inflate";
    postMessage("Inflater brush");
}
function actionSelectInflateByColourBrush() {
    getWorld().options.brushMode = "inflate-by-colour";
    postMessage("Inflate-by-Colour brush");
}
function actionSetDrawModeNormal() {
    const w = getWorld();
    w.options.quadDrawMode = "normal";
    w.options.minAllowedLength = 15;
    postMessage("normal drawing mode");
}
function actionSetDrawModeRough() {
    const w = getWorld();
    w.options.quadDrawMode = "rough";
    w.options.minAllowedLength = 15;
    postMessage("roughjs drawing mode (buggy)");
}
function actionSetDrawModeToUseReferenceImage() {
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
function createHelpItems() {
    const cmds = getWorld().commands.sort((a, b) =>
        a.beginnerPriority < b.beginnerPriority ? -1 : 1
    );
    const mouseHelpItems = [
        {
            type: "interaction",
            interactionDescription: "drag mouse",
            title: "Manipulate quads",
            description:
                "Depending on the currently selected brush, you can shrink / inflate / split the quads under or near the pointer",
        },
    ];
    function createHelpItemForCommand(cmd) {
        return {
            ...cmd,
            type: "key",
            key: cmd.key === " " ? "SPACE" : cmd.key,
        };
    }
    const items = [...mouseHelpItems, ...cmds.map(createHelpItemForCommand)];
    return items;
}
const actions = {
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
    actionSetDrawModeRough,
    actionSetDrawModeNormal,
};
window.mousePressed = function mousePressed(evt) {
    if (!eventIsForCanvas(evt)) {
        return;
    }
    if (mouseButton.left);
};
window.keyPressed = function keyPressed(_evt) {
    const foundCommand = getWorld().commands.find((cmd) => cmd.key === key);
    if (foundCommand) {
        if (getWorld().options.shouldLogKeyCommands) {
            console.log(
                "running cmd: " +
                    foundCommand.title +
                    ` (${foundCommand.action.name})`
            );
        }
        foundCommand.action();
    }
};
window.mouseDragged = function mouseDragged(evt) {
    if (!eventIsForCanvas(evt)) {
        return;
    }
    const w = getWorld();
    if (w.quads.length === 0) {
        return;
    }
    const mouseP = mousePos();
    switch (w.options.brushMode) {
        case "split": {
            const nearest = findQuadNearestToPos(w.quads, mouseP);
            const nearbyQuads = findQuadsNearPos(
                mouseP,
                w.options.quadBrushRadius / 4,
                w.quads
            );
            splitAndAddGivenQuads([
                nearest.element,
                ...nearbyQuads.filter((q) => q !== nearest.element),
            ]);
            return;
        }
        case "inflate":
            {
                const nearbyQuads = findQuadsNearPos(
                    mouseP,
                    w.options.quadBrushRadius,
                    w.quads
                );
                if (nearbyQuads.length > 0) {
                    gsap.to(nearbyQuads, {
                        duration: 0.5,
                        shrinkFraction: 0,
                    });
                    return;
                }
            }
            break;
        case "inflate-by-colour":
            {
                actionUnshrinkBySameColourAsUnderMouse();
            }
            break;
        case "shrink":
        case "shrinkmax":
            {
                const nearbyQuads = findQuadsNearPos(
                    mouseP,
                    w.options.quadBrushRadius,
                    w.quads
                );
                const oneSecAgo = millis() - 1e3;
                const freshNearbyQuads = nearbyQuads.filter(
                    (q) => q.lastMouseModMillis < oneSecAgo
                );
                if (freshNearbyQuads.length > 0) {
                    gsap.to(freshNearbyQuads, {
                        delay: 0.05,
                        duration: 0.5,
                        shrinkFraction:
                            w.options.brushMode === "shrinkmax"
                                ? 1
                                : "random(0.2, 0.6, 0.1)",
                    });
                    freshNearbyQuads.forEach(
                        (q) => (q.lastMouseModMillis = millis())
                    );
                }
            }
            break;
        case "no-op":
            break;
        default:
            throw new Error("Unrecognised brush mode: " + w.options.brushMode);
    }
};
window.mouseMoved = function mouseMoved(evt) {
    if (!eventIsForCanvas(evt)) {
        return;
    }
};
window.windowResized = function () {
    resizeCanvas(windowWidth, windowHeight);
};
function eventIsForCanvas(evt) {
    return evt && evt.target && evt.target.nodeName === "CANVAS";
}
function drawCanvasTextureTo({ alphaRange, spacing }, g) {
    for (let i = -g.height; i < g.height + g.width; i += spacing) {
        g.stroke(255, random(...alphaRange));
        gridline(i, 0, i + g.height, g.height, g);
    }
    for (let i = g.height + g.width; i >= -g.width; i -= spacing) {
        g.stroke(255, random(...alphaRange));
        gridline(i, 0, i - g.height, g.height, g);
    }
}
function gridline(x1, y1, x2, y2, g) {
    let tmp;
    if (x1 > x2) {
        tmp = x1;
        x1 = x2;
        x2 = tmp;
        tmp = y1;
        y1 = y2;
        y2 = tmp;
    }
    let dx = x2 - x1;
    let dy = y2 - y1;
    let step = 1;
    if (x2 < x1) step = -step;
    let sx = x1;
    let sy = y1;
    for (let x = x1 + step; x <= x2; x += step) {
        let y = y1 + (step * dy * (x - x1)) / dx;
        g.strokeWeight(1 + map(noise(sx, sy), 0, 1, -0.5, 0.5));
        g.line(
            sx,
            sy,
            x + map(noise(x, y), 0, 1, -1, 1),
            y + map(noise(x, y), 0, 1, -1, 1)
        );
        sx = x;
        sy = y;
    }
}
function createGUI(w) {
    const gui = new dat.GUI({ closed: true });
    gui.add(w.options, "numSplits", 0, 30, 1)
        .name("max splits")
        .listen()
        .onFinishChange((_v) => actionRegenerateObservingMode());
    gui.add(actions, "actionSelectMaxShrinkerBrush").name(
        "⬇️⬇️ brush:shrinkmax"
    );
    gui.add(actions, "actionSelectShrinkerBrush").name("⬇️ brush:shrink");
    gui.add(actions, "actionSelectInflaterBrush").name("⬆️ brush:inflate");
    gui.add(actions, "actionSelectSplitterBrush").name("🔪 brush:split");
    const actsFolder = gui.addFolder("actions");
    actsFolder.add(actions, "actionUnshrinkAll").name("unshrink all");
    actsFolder.add(actions, "actionShrinkAllRandomly").name("shrink randomly");
    actsFolder.add(actions, "actionRegenerateFromGrid").name("regen: grid");
    actsFolder
        .add(actions, "actionRegenerateWithSingleStartingQuad")
        .name("regen: one quad");
    actsFolder.add(actions, "actionSetDrawModeRough").name("roughjs draw mode");
    actsFolder.add(actions, "actionSetDrawModeNormal").name("normal draw mode");
    actsFolder
        .add(actions, "actionPickNewRandomPalette")
        .name("random palette");
    const misc = gui.addFolder("otherStuff");
    misc.add(w.options, "paletteIx", 0, palettes.length - 1, 1);
    misc.add(w.options, "disableMultiStroke");
    misc.add(w.options, "defaultRoughness", 0, 3, 0.2);
    misc.add(w.options, "quadBrushRadius", 1, 200, 10)
        .listen()
        .onChange(
            () => (w.options._lastQuadBrushRadiusChangeMillis = millis())
        );
    misc.add(w.options, "shouldDrawCanvasTexture").name("🙈 textured canvas");
    misc.add(w.options, "shouldShowHelpScreen").name("❓ show help");
    return gui;
}
function createOptions() {
    const shouldUseGridMode = random([true, false]);
    const quadDrawMode = "normal";
    return {
        quadDrawMode,
        quadDrawFillMode: random(["useBrightness", "usePalette"]),
        imageIx: 0,
        shouldUseGridMode,
        disableMultiStroke: false,
        defaultRoughness: 1,
        shouldDrawMessages: true,
        shouldDrawDebugText: false,
        shouldShowHelpScreen: false,
        shouldDrawDebugNormals: false,
        shouldDrawCanvasTexture: false,
        shouldLogKeyCommands: false,
        quadBrushRadius: 120,
        _lastQuadBrushRadiusChangeMillis: -1e4,
        shouldShrink: true,
        numSplits:
            quadDrawMode === "under-image"
                ? 10
                : shouldUseGridMode
                ? random([1, 2, 3])
                : random([5, 6]),
        shouldGenerateUnshrunk: true,
        globalShrinkFraction: 0.05,
        //0-1 exclusive
        minAllowedLength: quadDrawMode === "under-image" ? 5 : 15,
        seed: 123,
        paletteIx: 0,
        defaultMessageDurationMillis: 2e3,
        brushMode: "no-op",
    };
}
async function loadImagePack(folderPath) {
    const url = folderPath + "/imageList.json";
    try {
        const imgFilenames = await loadJSON(url);
        const allLoadedImages = await Promise.all(
            imgFilenames.map((n) => loadImage(folderPath + "/" + n))
        );
        return shuffle(allLoadedImages);
    } catch (err) {
        console.error("error loading image pack: url " + url, err);
        return null;
    }
}
function drawQuadsByUnderlyingImage() {
    const world2 = getWorld();
    if (!world2.images) {
        return;
    }
    const imageToUse = world2.images[world2.options.imageIx];
    const leftMargin = (width - imageToUse.width) / 2;
    const topMargin = (height - imageToUse.height) / 2;
    const topLeftOffset = createVector(leftMargin, topMargin);
    world2.quads.forEach((q) => {
        const centroid = findQuadCentroid(q.pts);
        const [r, _g, _b, _a] = imageToUse.get(
            centroid.x + -topLeftOffset.x,
            centroid.y + -topLeftOffset.y
        );
        drawQuadWithBrightness(q, r / 200, world2.options.quadDrawFillMode);
    });
}
let world;
let textureGraphic;
p5.disableFriendlyErrors = true;
window.setup = async function setup() {
    const cnv = createCanvas(windowWidth, windowHeight);
    world = createWorld();
    world.images = await loadImagePack("./");
    world.roughCanvas = rough.canvas(cnv.elt);
    setDescription();
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
        if (options.quadDrawMode !== "rough") {
            blendMode(ADD);
        }
    }
    switch (options.quadDrawMode) {
        case "normal":
        case "rough":
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
function createWorld() {
    const w = {
        quads: [],
        commands: createCommands(),
        options: createOptions(),
        images: null,
        messages: [],
        roughCanvas: null,
    };
    w.gui = createGUI(w);
    return w;
}
function getWorld() {
    return world;
}
function postMessage(str) {
    const m = createMessage(str);
    world.messages.push(m);
}
function drawRecentPostedMessages() {
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
function updatePostedMessages() {
    world.messages = world.messages.filter(
        (m) =>
            m.postedAtMillis >
            millis() - world.options.defaultMessageDurationMillis
    );
}
function createMessage(str) {
    return { str, postedAtMillis: millis() };
}
function drawHelpScreen() {
    const items = createHelpItems();
    push();
    background(20);
    const lineColours = ["#ef9e28", "#c6ac71"];
    stroke(30);
    textAlign(LEFT, TOP);
    translate(width / 2, 50);
    const baseSize = 15;
    const lineHeight = baseSize * 1.8;
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
        translate(0, lineHeight);
        push();
        stroke(255, 20);
        line(-180, -3, 300, -3);
        pop();
    }
    pop();
}
function drawBrushFeedback() {
    const now = millis();
    const brushRadiusIndicatorAlphaFrac = map(
        now - world.options._lastQuadBrushRadiusChangeMillis,
        0,
        3e3,
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
