import gsap from "gsap";
import { actionSplitQuadUnderPos } from "./actions.ts";
import { getWorld } from "./main.ts";
import { findQuadCentroid } from "./quad.ts";
import { mousePos } from "./randomStuff.ts";
//TODO: quads, options, commands would need to be global

window.mousePressed = function mousePressed(_evt) {
    if (mouseButton.left) {
    }
};

window.keyPressed = function keyPressed(_evt) {
    //see createCommands for the actions taken on key presses

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

window.mouseDragged = function mouseDragged(_evt) {
    actionSplitQuadUnderPos(mousePos());
};

window.mouseMoved = function mouseMoved(_evt) {
    const w = getWorld();
    if (w.quads.length === 0) {
        return;
    }

    const mouseP = mousePos();
    const nearbyQuads = w.quads.filter(
        (q) => findQuadCentroid(q.pts).dist(mouseP) < w.options.quadBrushRadius
    );

    //so far, this doesn't really need gsap.
    if (nearbyQuads.length > 0) {
        if (keyIsDown(SHIFT)) {
            gsap.to(nearbyQuads, {
                duration: 0.5,
                shrinkFraction: 0,
            });
        }

        //This debouncing isn't working because we're making and assigning a new (albeit debounced) fn EVERY mousemove event
        // function shrinkRandomly(_ix: any, theQuad: Quad) {
        //     return random(0.2, 0.6);
        // }
        //https://lodash.com/docs/4.17.15#debounce
        //and https://css-tricks.com/debouncing-throttling-explained-examples/
        // const debouncedShrinkRandomly = debounce(shrinkRandomly, 500, {
        //     leading: true,
        //     trailing: false,
        // });

        if (keyIsDown(CONTROL)) {
            gsap.to(nearbyQuads, {
                duration: 0.5,
                shrinkFraction: "random(0.2, 0.6, 0.1)",
            });
        }
    }
};

window.windowResized = function () {
    resizeCanvas(windowWidth, windowHeight);
};
