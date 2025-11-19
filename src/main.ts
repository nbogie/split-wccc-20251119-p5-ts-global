import "p5";

console.log("hello world. in main.ts");

window.setup = function setup() {
    console.log("in setup()");
    createCanvas(windowWidth, windowHeight);
};

window.draw = function draw() {
    fill("dodgerblue");
    circle(width / 2, height / 2, 200);
};

window.mousePressed = function (evt) {
    text(JSON.stringify(evt, null, 2), 0, 0);
};
