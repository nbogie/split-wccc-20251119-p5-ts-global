import * as dat from "dat.gui"; //TODO: remove this at OP deploy

import { actionRegenerateObservingMode } from "./actions.js";
import type { World } from "./main.js";
import { palettes } from "./palettes.js";

export function createGUI(w: World): dat.GUI {
    const gui = new dat.GUI({ closed: true });

    gui.add(w.options, "paletteIx", 0, palettes.length - 1, 1);
    gui.add(w.options, "quadBrushRadius", 1, 200, 10);
    gui.add(w.options, "numSplits", 0, 30, 1)
        .listen()
        .onFinishChange((_v) => actionRegenerateObservingMode());
    gui.add(w.options, "actionSelectShrinkerBrush").name("⬇️ brush:shrink");
    gui.add(w.options, "actionSelectInflaterBrush").name("⬆️ brush:inflate");
    gui.add(w.options, "actionSelectSplitterBrush").name("🔪 brush:split");
    gui.add(w.options, "shouldDrawCanvasTexture").name("🙈 canvas texture");
    gui.add(w.options, "actionAnimateUnshrinkAll").name("unshrink all");
    gui.add(w.options, "actionAnimateRandomShrinkFractionChanges").name(
        "shrink randomly"
    );
    gui.add(w.options, "actionRegenerateFromGrid").name("regen: grid");
    gui.add(w.options, "actionRegenerateWithSingleStartingQuad").name(
        "regen: one quad"
    );

    return gui;
}
