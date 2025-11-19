console.log("hello world. in main.ts");

function setup() {
    console.log("in setup()");
    createCanvas(windowWidth, windowHeight);
}

function draw() {
    fill("dodgerblue");
    circle(width / 2, height / 2, 200);
}
