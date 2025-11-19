import p5 from "p5";

export function randomColourFromPalette(): p5.Color {
    const palette = {
        name: "tsu_arcade",
        colors: [
            "#4aad8b",
            "#e15147",
            "#f3b551",
            "#cec8b8",
            "#d1af84",
            "#544e47",
        ],
        stroke: "#251c12",
        background: "#cfc7b9",
        size: 6,
        type: "chromotome",
    };
    return color(random(palette.colors));
}
