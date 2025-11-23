export type BrushMode =
    | "inflate"
    | "shrink"
    | "shrinkmax"
    | "split"
    | "inflate-by-colour"
    | "no-op";

export interface Options {
    shouldShowHelpScreen: boolean;
    defaultMessageDurationMillis: number;
    quadDrawMode: "normal" | "under-image";
    quadDrawFillMode: "useBrightness" | "usePalette";
    imageIx: number;
    brushMode: BrushMode;
    shouldDrawCanvasTexture: boolean;
    /** next time we're asked to generate from scratch, should we lay out in a grid? */
    shouldUseGridMode: boolean;
    shouldDrawMessages: boolean;
    shouldDrawDebugText: boolean;
    shouldDrawDebugNormals: boolean;
    shouldLogKeyCommands: boolean;
    /**when dragging over quads, how near must a quad centroid be to mouse pos to be considered targeted */
    quadBrushRadius: number;
    /** A number between 0 (no shrink) and 1 (entirely shrunk - avoid).  Each quad maintains its own but sometimes we set all to this value.
     * @see {@link Quad.shrinkFraction} for more on the meaning. */
    globalShrinkFraction: number;
    shouldShrink: boolean;
    numSplits: number;
    shouldGenerateUnshrunk: boolean;
    minAllowedLength: number;
    seed: number;
    paletteIx: number;

    // these should probably go in a separate object and interface - controls
    actionSelectMaxShrinkerBrush: () => void;
    actionSelectInflateByColourBrush: () => void;
    actionSelectShrinkerBrush: () => void;
    actionSelectInflaterBrush: () => void;
    actionSelectSplitterBrush: () => void;
    actionUnshrinkAll: () => void;
    actionShrinkAllRandomly: () => void;
    actionRegenerateFromGrid: () => void;
    actionPickNewRandomPalette: () => void;
    actionRegenerateWithSingleStartingQuad: () => void;
}
