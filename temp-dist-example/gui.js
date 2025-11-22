import * as dat from "dat.gui";
import { actionRegenerateObservingMode } from "./actions.js";
import { palettes } from "./palettes.js";
export function createGUI(w) {
    const gui = new dat.GUI({ closed: true });
    gui.add(w.options, "paletteIx", 0, palettes.length - 1, 1);
    gui.add(w.options, "quadBrushRadius", 1, 200, 10);
    gui.add(w.options, "numSplits", 0, 10, 1)
        .listen()
        .onFinishChange((_v) => actionRegenerateObservingMode());
    gui.add(w.options, "actionSelectShrinkerBrush").name("⬇️ brush:shrink");
    gui.add(w.options, "actionSelectInflaterBrush").name("⬆️ brush:inflate");
    gui.add(w.options, "actionSelectSplitterBrush").name("🔪 brush:split");
    gui.add(w.options, "actionAnimateUnshrinkAll").name("unshrink all");
    gui.add(w.options, "actionAnimateRandomShrinkFractionChanges").name("shrink randomly");
    gui.add(w.options, "actionRegenerateFromGrid").name("regen: grid");
    gui.add(w.options, "actionRegenerateWithSingleStartingQuad").name("regen: one quad");
    return gui;
}
//# sourceMappingURL=gui.js.map