import p5 from "p5";

export function randomColourFromPalette(): p5.Color {
    //palette from kgolid
    const palette = {
        name: "jung_bird",
        colors: ["#fc3032", "#fed530", "#33c3fb", "#ff7bac", "#fda929"],
        stroke: "#000000",
        background: "#ffffff",
        size: 5,
        type: "chromotome",
    };
    const c = color(random(palette.colors));
    c.setAlpha(100);
    return c;
}
