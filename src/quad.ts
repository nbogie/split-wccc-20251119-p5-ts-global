import p5 from "p5";
import { minBy, randomColourFromPalette } from "./randomStuff.ts";
export type Quad = {
    colour: p5.Color;
    pts: [p5.Vector, p5.Vector, p5.Vector, p5.Vector];
};

export interface Options {
    shouldShrink: boolean;
    numSplits: number;
    shrinkDistance: number;
    shrinkFraction: number;
    minAllowedLength: number;
    seed: number;
}

export function createStartingQuad(): Quad {
    return {
        colour: randomColourFromPalette(),
        pts: [
            { x: 0.1, y: 0.1 },
            { x: 0.9, y: 0.1 },
            { x: 0.9, y: 0.9 },
            { x: 0.1, y: 0.9 },
        ].map((frac) => createVector(frac.x * width, frac.y * height)),
    } as Quad;
}

export function drawQuad(quad: Quad): void {
    push();
    const c = color(quad.colour.toString());
    fill(c);
    noStroke();
    beginShape();
    quad.pts.forEach((v) => vertex(v.x, v.y));
    endShape(CLOSE);
    pop();
}
export function splitQuad(
    inQuad: Quad,
    shouldCutFirstSide: boolean
): [Quad, Quad] {
    const [a, b, c, d] = inQuad.pts.map((v) => v.copy());
    const cutFrac1 = random([1, 2]) / 3;
    const cutFrac2 = random([1, 2]) / 3;
    if (shouldCutFirstSide) {
        //cut a-b (creating e) and c-d (creating f) to give [a,e,f,d] and [e,b,c,f]
        const e = p5.Vector.lerp(a, b, cutFrac1);
        const f = p5.Vector.lerp(c, d, cutFrac2);
        return [
            {
                colour: randomColourFromPalette(),
                pts: [a, e, f, d].map((pt) => pt.copy()) as Quad["pts"],
            },
            {
                colour: randomColourFromPalette(),
                pts: [e, b, c, f].map((pt) => pt.copy()) as Quad["pts"],
            },
        ];
    } else {
        //cut b-c (creating e) and d-a (creating f) to give [a,b,e,d] and [f,e,c,d]
        const e = p5.Vector.lerp(b, c, cutFrac1);
        const f = p5.Vector.lerp(d, a, cutFrac2);
        return [
            {
                colour: randomColourFromPalette(),
                pts: [a, b, e, f].map((pt) => pt.copy()) as Quad["pts"],
            },
            {
                colour: randomColourFromPalette(),
                pts: [f, e, c, d].map((pt) => pt.copy()) as Quad["pts"],
            },
        ];
    }
}
function smallestSide(quad: Quad): { len: number; startIx: 0 | 1 | 2 | 3 } {
    const [a, b, c, d] = quad.pts;
    const pairs = [
        [a, b],
        [b, c],
        [c, d],
        [d, a],
    ];
    const smallest = minBy(pairs, ([p1, p2]) => p5.Vector.dist(p1, p2));
    if (!smallest) {
        throw new Error("did you pass minBy an empty array?");
    }
    return {
        len: smallest.record,
        startIx: pairs.indexOf(smallest.element) as 0 | 1 | 2 | 3,
    };
}

export function splitQuadIfBig(
    quad: Quad,
    minAllowedLen: number
): Quad[] | null {
    const smallSide = smallestSide(quad);
    if (smallSide.len < minAllowedLen) {
        return null;
    }
    const cutFirstSide = smallSide.startIx % 2 === 1;
    const [q1, q2] = splitQuad(quad, cutFirstSide);
    return [q1, q2];
}

/** given array will not be modified. */
export function subdivideAllRepeatedly(
    quads: Quad[],
    options: Options
): Quad[] {
    let newQuads: Quad[] = [...quads];
    for (let i = 0; i < options.numSplits; i++) {
        newQuads = subdivideAllQuadsOnce(
            newQuads,
            options,
            i === options.numSplits - 1
        );
    }
    return newQuads;
}

export function subdivideAllQuadsOnce(
    quads: Quad[],
    options: Options,
    isLastLayer: boolean
): Quad[] {
    const newQuads = [];

    const shouldShrink = options.shouldShrink && isLastLayer;

    for (const quad of quads) {
        const result = splitQuadIfBig(quad, options.minAllowedLength);

        if (!result) {
            if (shouldShrink) {
                newQuads.push(shrinkQuad(quad, options));
            } else {
                newQuads.push(quad);
            }
            continue;
        }

        if (shouldShrink) {
            const shrunkenQuads = result.map((q) => shrinkQuad(q, options));
            newQuads.push(...shrunkenQuads);
        } else {
            newQuads.push(...result);
        }
    }

    return newQuads;
}
function shrinkQuad(quad: Quad, options: Options): Quad {
    return {
        ...quad,

        pts: shrinkQuadPoints(quad.pts, options),
    } as Quad;
}

type DecoratedEdge = {
    pts: [p5.Vector, p5.Vector];
    midpoint: p5.Vector;
    normal: p5.Vector;
    colour: string;
};

function shrinkQuadPoints(pts: Quad["pts"], options: Options): Quad["pts"] {
    const [a, b, c, d] = pts;

    //      Consistent winding means for any edge P1 -> P2, it's always P2 - P1 rotated by -PI/2 for outward normal, or PI/2 for the shrink dir

    function decorateEdge([p1, p2]: readonly [
        p5.Vector,
        p5.Vector
    ]): DecoratedEdge {
        return {
            pts: [p1, p2],
            midpoint: p5.Vector.lerp(p1, p2, 0.5),
            colour: random([
                "lime",
                "yellow",
                "white",
                "red",
                "cyan",
                "magenta",
            ]),
            normal: p5.Vector.sub(p2, p1)
                .normalize()
                .rotate(PI / 2),
        };
    }

    const edges = (
        [
            [a, b],
            [b, c],
            [c, d],
            [d, a],
        ] as const
    ).map((edge) => decorateEdge(edge));

    visNormals(edges);

    const centroid = findQuadCentroid(pts);

    return pts.map((pt) =>
        p5.Vector.lerp(pt, centroid, options.shrinkFraction)
    ) as Quad["pts"];
}

function visNormals(edges: DecoratedEdge[]) {
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
function findQuadCentroid(quadPts: Quad["pts"]): p5.Vector {
    return quadPts
        .reduce((prev, curr) => prev.add(curr), createVector(0, 0))
        .div(4);
}
