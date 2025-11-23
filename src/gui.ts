import * as dat from "dat.gui"; //TODO: remove this at OP deploy

import { actionRegenerateObservingMode } from "./actions.js";
import type { World } from "./main.js";
import { palettes } from "./palettes.js";
import { actions } from "./actions.js";
export function createGUI(w: World): dat.GUI {
    const gui = new dat.GUI({ closed: true });

    gui.add(w.options, "numSplits", 0, 30, 1)
        .name("max splits")
        .listen()
        .onFinishChange((_v) => actionRegenerateObservingMode());

    gui.add(actions, "actionSelectMaxShrinkerBrush").name(
        "⬇️⬇️ brush:shrinkmax"
    );
    gui.add(actions, "actionSelectShrinkerBrush").name("⬇️ brush:shrink");
    gui.add(actions, "actionSelectInflaterBrush").name("⬆️ brush:inflate");
    gui.add(actions, "actionSelectSplitterBrush").name("🔪 brush:split");

    const actsFolder = gui.addFolder("actions");
    actsFolder.add(actions, "actionUnshrinkAll").name("unshrink all");
    actsFolder.add(actions, "actionShrinkAllRandomly").name("shrink randomly");
    actsFolder.add(actions, "actionRegenerateFromGrid").name("regen: grid");
    actsFolder
        .add(actions, "actionRegenerateWithSingleStartingQuad")
        .name("regen: one quad");
    actsFolder.add(actions, "actionSetDrawModeRough").name("roughjs draw mode");
    actsFolder.add(actions, "actionSetDrawModeNormal").name("normal draw mode");

    actsFolder
        .add(actions, "actionPickNewRandomPalette")
        .name("random palette");

    const misc = gui.addFolder("otherStuff");

    misc.add(w.options, "paletteIx", 0, palettes.length - 1, 1);

    misc.add(w.options, "disableMultiStroke");
    misc.add(w.options, "defaultRoughness", 0, 3, 0.2);

    misc.add(w.options, "quadBrushRadius", 1, 200, 10)
        .listen()
        .onChange(
            () => (w.options._lastQuadBrushRadiusChangeMillis = millis())
        );
    misc.add(w.options, "shouldDrawCanvasTexture").name("🙈 textured canvas");
    misc.add(w.options, "shouldShowHelpScreen").name("❓ show help");
    return gui;
}
