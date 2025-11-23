import gsap from "gsap";
import {
    actionUnshrinkBySameColourAsUnderMouse,
    splitAndAddGivenQuads,
} from "./actions.js";
import { getWorld } from "./main.js";
import { findQuadNearestToPos, findQuadsNearPos } from "./quad.js";
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

    switch (w.options.brushMode) {
        case "split":
            {
                //we always want at least one quad, even if the mouse isn't very close to the centroid of a big quad.
                //(wouldn't be necessary if this was intersection-based hit-test rather than distance-based)
                const nearest = findQuadNearestToPos(w.quads, mouseP);
                const nearbyQuads = findQuadsNearPos(
                    mouseP,
                    w.options.quadBrushRadius / 4,
                    w.quads
                );
                splitAndAddGivenQuads([
                    nearest.element,
                    ...nearbyQuads.filter((q) => q !== nearest.element),
                ]);
                return;
            }
            break;
        case "inflate":
            {
                const nearbyQuads = findQuadsNearPos(
                    mouseP,
                    w.options.quadBrushRadius,
                    w.quads
                );
                if (nearbyQuads.length > 0) {
                    gsap.to(nearbyQuads, {
                        duration: 0.5,
                        shrinkFraction: 0,
                    });
                    return;
                }
            }
            break;

        case "inflate-by-colour":
            {
                actionUnshrinkBySameColourAsUnderMouse();
            }
            break;

        case "shrink":
            {
                const nearbyQuads = findQuadsNearPos(
                    mouseP,
                    w.options.quadBrushRadius,
                    w.quads
                );
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
