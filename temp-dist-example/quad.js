import { minByOrThrow, randomColourFromPalette } from "./randomStuff.js";
export function createStartingQuad(options) {
    const pts = [
        { x: 0.1, y: 0.1 },
        { x: 0.9, y: 0.1 },
        { x: 0.9, y: 0.9 },
        { x: 0.1, y: 0.9 },
    ].map((frac) => createVector(frac.x * width, frac.y * height));
    return createQuadWithPoints(pts, options);
}
export function createGridOfStartingQuads(options) {
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
    return {
        pts: pts.map((pt) => pt.copy()),
        isLeaf: false,
        lastMouseModMillis: -1,
        colour: randomColourFromPalette(),
        shrinkFraction: options.shouldGenerateUnshrunk
            ? 0
            : randomShrinkFraction(),
    };
}
//0.1, 0.2 - 0.9...
function randomShrinkFraction() {
    const numDivisions = 10;
    return round(numDivisions * random(0, 0.9)) / numDivisions;
}
export function drawQuad(quad, options) {
    push();
    const c = color(quad.colour.toString());
    if (options.shouldDrawDebugNormals) {
        drawDebugInfo(quad);
    }
    const shrunkPts = shrinkQuadPoints(quad.pts, quad.shrinkFraction);
    fill(c);
    noStroke();
    beginShape();
    shrunkPts.forEach((v) => vertex(v.x, v.y));
    endShape(CLOSE);
    pop();
}
export function splitQuad(inQuad, shouldCutFirstSide, options) {
    const [a, b, c, d] = inQuad.pts.map((v) => v.copy());
    const cutFrac1 = random([1, 2]) / 3;
    const cutFrac2 = random([1, 2]) / 3;
    if (shouldCutFirstSide) {
        //cut a-b (creating e) and c-d (creating f) to give [a,e,f,d] and [e,b,c,f]
        const e = p5.Vector.lerp(a, b, cutFrac1);
        const f = p5.Vector.lerp(c, d, cutFrac2);
        return [
            createQuadWithPoints([a, e, f, d], options),
            createQuadWithPoints([e, b, c, f], options),
        ];
    } else {
        //cut b-c (creating e) and d-a (creating f) to give [a,b,e,d] and [f,e,c,d]
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
export function splitQuadIfBig(quad, options) {
    const smallSide = smallestSide(quad);
    if (smallSide.len < options.minAllowedLength) {
        return null;
    }
    //TODO: if within some threshold of each other, choose randomly.
    //      Needed for grid of mulitple perfect square starting quads
    const cutFirstSide = smallSide.startIx % 2 === 1;
    const [q1, q2] = splitQuad(quad, cutFirstSide, options);
    return [q1, q2];
}
/** given array will not be modified.
 * options.numSplits controls max number of divisions. May stop earlier if too small.
 */
export function subdivideAllRepeatedly(quads, options) {
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
export function subdivideAllQuadsOnce(quads, options, isLastLayer) {
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
        //just in case the normal is not a unit vector, we'll incorp its len here.
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
export function findQuadCentroid(quadPts) {
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
export function findQuadNearestToPos(quads, pos) {
    return minByOrThrow(quads, (quad) => findQuadCentroid(quad.pts).dist(pos));
}
//# sourceMappingURL=quad.js.map
