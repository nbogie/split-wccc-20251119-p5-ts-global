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
        gsap.to(nearbyQuads, {
            duration: 0.5,
            shrinkFraction: 0,
        });
    }
};

window.windowResized = function () {
    resizeCanvas(windowWidth, windowHeight);
};
