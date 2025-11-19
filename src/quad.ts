import p5 from "p5";
import { randomColourFromPalette } from "./randomStuff.ts";
export type Quad = {
    colour: p5.Color;
    pts: [p5.Vector, p5.Vector, p5.Vector, p5.Vector];
};

interface Options {
    shouldShrink: boolean;
    numSplits: number;
    shrinkDistance: number;
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
    fill(quad.colour);
    // c.setAlpha(100);
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
            { colour: randomColourFromPalette(), pts: [a, b, e, f] },
            { colour: randomColourFromPalette(), pts: [f, e, c, d] },
        ];
    } else {
        //cut a-b (creating e) and c-d (creating f) to give [a,e,f,d] and [e,b,c,f]
        const e = p5.Vector.lerp(a, b, cutFrac1);
        const f = p5.Vector.lerp(c, d, cutFrac2);
        return [
            { colour: randomColourFromPalette(), pts: [a, e, f, d] },
            { colour: randomColourFromPalette(), pts: [e, b, c, f] },
        ];
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

export function splitQuadIfBig(quad: Quad): Quad[] | null {
    if (smallestSide(quad) < 100) {
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
    console.log("subdivideAllRepeatedly", { quadsLen: quads.length }, millis());
    let newQuads: Quad[] = [...quads];
    for (let i = 0; i < options.numSplits; i++) {
        newQuads = subdivideAllQuadsOnce(newQuads, options);
    }
    return newQuads;
}

export function subdivideAllQuadsOnce(quads: Quad[], options: Options): Quad[] {
    console.log(subdivideAllQuadsOnce.name, { ql: quads.length });

    const newQuads = [];
    for (const quad of quads) {
        const result = splitQuadIfBig(quad);

        if (!result) {
            console.log("fail");
            newQuads.push(quad);
            continue;
        }
        if (options.shouldShrink) {
            const shrunkenQuads = result.map((q) =>
                shrinkQuad(q, options.shrinkDistance)
            );
            newQuads.push(...shrunkenQuads);
        } else {
            newQuads.push(...result);
        }
    }
    console.log(subdivideAllQuadsOnce.name, { returnLen: newQuads.length });
    return newQuads;
}
function shrinkQuad(quad: Quad, shrinkDist: number): Quad {
    const [a, _b, c, _d] = quad.pts;
    const midpoint = p5.Vector.lerp(a, c, 0.5);
    return {
        ...quad,
        pts: quad.pts.map((pt) => {
            const cornerToMid = p5.Vector.sub(midpoint, pt);
            if (cornerToMid.mag() < shrinkDist) {
                return pt;
            }
            const offset = p5.Vector.sub(midpoint, pt).setMag(shrinkDist);
            return p5.Vector.add(pt, offset);
        }),
    } as Quad;
}
