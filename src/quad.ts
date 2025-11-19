import p5 from "p5";
import { randomColourFromPalette } from "./randomStuff.ts";
export type Quad = {
    colour: p5.Color;
    pts: [p5.Vector, p5.Vector, p5.Vector, p5.Vector];
};

export interface Options {
    shouldShrink: boolean;
    numSplits: number;
    shrinkDistance: number;
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
    // c.setAlpha(100);
    fill(c);
    noStroke();
    // strokeWeight(10);
    // stroke(random(255));

    beginShape();
    quad.pts.forEach((v) => vertex(v.x, v.y));
    endShape(CLOSE);
    pop();
}
export function splitQuad(inQuad: Quad): [Quad, Quad] {
    const isHorizontal = random([true, false]);
    const [a, b, c, d] = inQuad.pts.map((v) => v.copy());
    const cutFrac1 = random([1, 2]) / 3;
    const cutFrac2 = random([1, 2]) / 3;
    if (isHorizontal) {
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
    } else {
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
    }
}
function randomColourMarking(dir: "vert" | "horiz"): p5.Color {
    if (dir === "horiz") {
        return color(random(100, 255), 0, 0);
    } else {
        return color(random(100, 255));
    }
}
function smallestSide(quad: Quad): number {
    const [a, b, c, d] = quad.pts;
    const pairs = [
        [a, b],
        [b, c],
        [c, d],
        [d, a],
    ];
    const distances = pairs.map(([p1, p2]) => p5.Vector.dist(p1, p2));
    return min(distances);
}

export function splitQuadIfBig(
    quad: Quad,
    minAllowedLen: number
): Quad[] | null {
    if (smallestSide(quad) < minAllowedLen) {
        return null;
    }
    const [q1, q2] = splitQuad(quad);
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
    for (const quad of quads) {
        const result = splitQuadIfBig(quad, options.minAllowedLength);

        if (!result) {
            newQuads.push(quad);
            continue;
        }
        if (options.shouldShrink && isLastLayer) {
            const shrunkenQuads = result.map((q) =>
                shrinkQuad(q, options.shrinkDistance)
            );
            newQuads.push(...shrunkenQuads);
        } else {
            newQuads.push(...result);
        }
    }

    return newQuads;
}
function shrinkQuad(quad: Quad, shrinkDist: number): Quad {
    return {
        ...quad,

        pts: shrinkQuadPoints(quad.pts, shrinkDist),
    } as Quad;
}

type DecoratedEdge = {
    pts: [p5.Vector, p5.Vector];
    midpoint: p5.Vector;
    normal: p5.Vector;
    colour: string;
};

function shrinkQuadPoints(pts: Quad["pts"], shrinkDist: number): Quad["pts"] {
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

    //mutating
    for (let edge of edges) {
        moveEdgeAlongNormalMutating(edge, shrinkDist);
    }
    if (mouseIsPressed) {
        // debugger;
    }
    return edges.map((e) => e.pts[0]) as Quad["pts"];
}

function moveEdgeAlongNormalMutating(
    edge: DecoratedEdge,
    shrinkDist: number
): void {
    const offset = p5.Vector.mult(edge.normal, shrinkDist);
    edge.pts.forEach((pt) => pt.add(offset));
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
