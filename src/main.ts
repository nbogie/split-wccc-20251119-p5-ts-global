import "p5";
import p5 from "p5";
import { colourForPosition, drawRandomCircles } from "./randomStuff.ts";

p5.disableFriendlyErrors = true;

window.setup = function setup() {
    console.log("in setup()");
    createCanvas(windowWidth, windowHeight);
    blendMode(DARKEST);
    noLoop();
};

window.draw = function draw() {
    push();
    blendMode(BLEND);
    background(255);
    pop();
    drawRandomCircles();
};

window.mouseDragged = function mouseDragged(evt) {
    if (!evt) {
        return;
    }
    drawDraggedSquares(evt!);
};
window.mousePressed = function mousePressed(_evt) {
    if (mouseButton.left) {
        redraw();
    }
};

function drawDraggedSquares(evt: MouseEvent) {
    push();
    const dx = evt.movementX;
    const dy = evt.movementY;

    console.log(evt.movementX);
    const distMoved = sqrt(dx * dx + dy * dy);
    const movementVector = createVector(dx, dy).add(p5.Vector.random2D());

    fill(colourForPosition(createVector(mouseX, mouseY)));
    const diameter = map(distMoved, 0, 400, 0, min(width, height), true);

    push();

    translate(mouseX, mouseY);
    rectMode(CENTER);
    rotate(movementVector.heading());
    noStroke();
    rect(0, 0, diameter);

    if (distMoved > 30 && random() < 0.2) {
        rotate(randomGaussian(0, PI / 20));
        stroke(60);
        strokeWeight(4);
        noFill();
        rect(0, 0, diameter);
    }

    pop();

    pop();
}
