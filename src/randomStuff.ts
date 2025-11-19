import p5 from "p5";

export function randomPosition(): p5.Vector {
    return createVector(random(width), random(height));
}

export function randomDirection(): p5.Vector {
    return p5.Vector.random2D();
}

export function colourForPosition(pos: p5.Vector): p5.Color {
    push();
    colorMode(HSB);
    const stops = [
        ["hotpink", 0],
        ["yellow", 0.35],
        ["magenta", 0.5],
        ["cyan", 0.9],
    ] satisfies [string, number][];
    const frac = map(pos.x, 0, width, 0, 1, true);
    const myColor = paletteLerp(stops, frac);
    pop();

    return myColor;
}

export function drawRandomCircles() {
    push();
    for (let i = 0; i < 10; i++) {
        const pos = randomPosition();
        fill(colourForPosition(pos));
        noStroke();

        circle(pos.x, pos.y, random(10, 200));
    }
    pop();
}
