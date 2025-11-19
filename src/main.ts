import "p5";
import p5 from "p5";

console.log("hello world. in main.ts");

window.setup = function setup() {
    console.log("in setup()");
    createCanvas(windowWidth, windowHeight);
    noLoop();
};

window.draw = function draw() {
    for (let i = 0; i < 10; i++) {
        const pos = randomPosition();

        fill(colourForPosition(pos));
        // noStroke();

        circle(pos.x, pos.y, random(10, 200));
    }
};

window.mouseDragged = function (evt) {
    push();
    const dx = evt?.movementX ?? 1;
    const dy = evt?.movementY ?? 1;
    const distMoved = sqrt(dx * dx + dy * dy);
    const movementVector = createVector(dx, dy).add(p5.Vector.random2D());

    noStroke();
    fill(colourForPosition(createVector(mouseX, mouseY)));
    const diameter = map(distMoved, 0, 300, 0, min(width, height), true);

    push();
    translate(mouseX, mouseY);
    rectMode(CENTER);
    rotate(movementVector.heading());
    rect(0, 0, diameter);
    pop();

    pop();
};
window.mousePressed = function (evt) {
    redraw();
};
function randomPosition(): p5.Vector {
    return createVector(random(width), random(height));
}

function colourForPosition(pos: p5.Vector): p5.Color {
    push();
    colorMode(HSB);

    const stops = [
        ["powderblue", 0],
        ["hotpink", 0.2],
        ["skyblue", 0.5],
        ["dodgerblue", 1],
    ] satisfies [string, number][];
    const frac = map(pos.x, 0, width, 0, 1, true);
    const myColor = paletteLerp(stops, frac);
    pop();

    return myColor;
}
