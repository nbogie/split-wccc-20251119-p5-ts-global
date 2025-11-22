import gsap from "gsap";
import { actionSplitQuadUnderPos } from "./actions.js";
import { getWorld } from "./main.js";
import { findQuadCentroid } from "./quad.js";
import { mousePos } from "./randomStuff.js";
//TODO: quads, options, commands would need to be global

window.mousePressed = function mousePressed(evt) {
    if (!eventIsForCanvas(evt)) {
        return;
    }
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

window.mouseDragged = function mouseDragged(evt) {
    if (!eventIsForCanvas(evt)) {
        return;
    }

    const w = getWorld();

    if (w.quads.length === 0) {
        return;
    }
    const mouseP = mousePos();
    const nearbyQuads = w.quads.filter(
        (q) => findQuadCentroid(q.pts).dist(mouseP) < w.options.quadBrushRadius
    );

    switch (w.options.brushMode) {
        case "split":
            actionSplitQuadUnderPos(mousePos());
            break;
        case "inflate":
            if (w.options.brushMode === "inflate") {
                if (nearbyQuads.length > 0) {
                    gsap.to(nearbyQuads, {
                        duration: 0.5,
                        shrinkFraction: 0,
                    });
                    return;
                }
            }
            break;
        case "shrink":
            //investigate debouncing with gsap / lodash
            //https://css-tricks.com/debouncing-throttling-explained-examples/
            const oneSecAgo = millis() - 1000;
            const freshNearbyQuads = nearbyQuads.filter(
                (q) => q.lastMouseModMillis < oneSecAgo
            );
            if (freshNearbyQuads.length > 0) {
                gsap.to(freshNearbyQuads, {
                    delay: 0.05,
                    duration: 0.5,
                    shrinkFraction: "random(0.2, 0.6, 0.1)",
                });
                freshNearbyQuads.forEach(
                    (q) => (q.lastMouseModMillis = millis())
                );
            }
            break;
        case "no-op":
            break;
        default:
            throw new Error("Unrecognised brush mode: " + w.options.brushMode);
    }
};

window.mouseMoved = function mouseMoved(evt) {
    if (!eventIsForCanvas(evt)) {
        return;
    }
};

window.windowResized = function () {
    resizeCanvas(windowWidth, windowHeight);
};

function eventIsForCanvas(evt: MouseEvent | undefined) {
    return evt && evt.target && (evt.target as Node).nodeName === "CANVAS";
}
