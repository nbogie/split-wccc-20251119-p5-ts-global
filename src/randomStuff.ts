import p5 from "p5";

export function randomColourFromPalette(): p5.Color {
    //palette from kgolid
    const palette = {
        name: "system.#04",
        colors: [
            "#e31f4f",
            "#f0ac3f",
            "#18acab",
            "#26265a",
            "#ea7d81",
            "#dcd9d0",
        ],
        stroke: "#26265a",
        backgrund: "#dcd9d0",
        size: 6,
        type: "chromotome",
    };
    const c = color(random(palette.colors));
    // c.setAlpha(100);
    return c;
}
