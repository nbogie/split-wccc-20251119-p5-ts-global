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
    _lastQuadBrushRadiusChangeMillis: number;
    /** A number between 0 (no shrink) and 1 (entirely shrunk - avoid).  Each quad maintains its own but sometimes we set all to this value.
     * @see {@link Quad.shrinkFraction} for more on the meaning. */
    globalShrinkFraction: number;
    shouldShrink: boolean;
    numSplits: number;
    shouldGenerateUnshrunk: boolean;
    minAllowedLength: number;
    seed: number;
    paletteIx: number;
}

export function createOptions(): Options {
    const shouldUseGridMode = random([true, false]);
    const quadDrawMode: Options["quadDrawMode"] = true
        ? "normal"
        : "under-image";

    return {
        quadDrawMode,
        quadDrawFillMode: random(["useBrightness", "usePalette"]),
        imageIx: 0,
        shouldUseGridMode,

        shouldDrawMessages: true,
        shouldDrawDebugText: false,
        shouldShowHelpScreen: false,
        shouldDrawDebugNormals: false,
        shouldDrawCanvasTexture: false,
        shouldLogKeyCommands: false,
        quadBrushRadius: 120,
        _lastQuadBrushRadiusChangeMillis: -10_000,
        shouldShrink: true,
        numSplits:
            quadDrawMode === "under-image"
                ? 10
                : shouldUseGridMode
                ? random([1, 2, 3])
                : random([5, 6]),
        shouldGenerateUnshrunk: true,
        globalShrinkFraction: 0.05, //0-1 exclusive
        minAllowedLength: quadDrawMode === "under-image" ? 5 : 15,
        seed: 123,
        paletteIx: 0,
        defaultMessageDurationMillis: 2000,
        brushMode: "no-op",
    };
}
