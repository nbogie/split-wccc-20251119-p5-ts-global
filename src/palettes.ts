// Credit: Almost all palettes from [kgolid's chromotome](https://github.com/kgolid/chromotome)
// via [https://nice-colours-quicker.netlify.app/](nice-colours-quicker)

interface PaletteRaw {
    name: string;
    colors: string[];
    stroke: string;
    background: string;
    size: number;
    type: "chromotome";
    solo?: boolean;
    muted?: boolean;
}
export type Palette = Omit<PaletteRaw, "solo" | "muted">;

const palettesRaw: PaletteRaw[] = [
    {
        name: "nowak",
        colors: [
            "#e85b30",
            "#ef9e28",
            "#c6ac71",
            "#e0c191",
            "#3f6279",
            "#ee854e",
            "#180305",
        ],
        stroke: "#180305",
        background: "#ede4cb",
        size: 7,
        type: "chromotome",
    },
    {
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
        background: "#dcd9d0",
        size: 6,
        type: "chromotome",
    },

    {
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
    },
    {
        name: "tsu_akasaka",
        colors: [
            "#687f72",
            "#cc7d6c",
            "#dec36f",
            "#dec7af",
            "#ad8470",
            "#424637",
        ],
        stroke: "#251c12",
        background: "#cfc7b9",
        size: 6,
        type: "chromotome",
    },
    {
        name: "neill-grayscale",
        colors: ["#323232", "#646464", "#969696", "#c8c8c8", "#fafafa"],
        stroke: "#969696",
        background: "30",
        size: 5,
        type: "chromotome",
    },
    {
        name: "giftcard_sub",
        colors: [
            "#FBF5E9",
            "#FF514E",
            "#FDBC2E",
            "#4561CC",
            "#2A303E",
            "#6CC283",
            "#238DA5",
            "#9BD7CB",
        ],
        stroke: "#000",
        background: "#FBF5E9",
        size: 8,
        type: "chromotome",
    },
    {
        name: "revolucion",
        colors: ["#ed555d", "#fffcc9", "#41b797", "#eda126", "#7b5770"],
        stroke: "#fffcc9",
        background: "#2d1922",
        size: 5,
        type: "chromotome",
    },
    {
        name: "neill-rybitten1",
        colors: ["#906593", "#DE2C26", "#F2B47F", "#F6D3CA", "#B8D7BE"],
        stroke: "#141414",
        background: "#141414",
        size: 5,
        type: "chromotome",
    },

    {
        name: "book",
        colors: [
            "#be1c24",
            "#d1a082",
            "#037b68",
            "#d8b1a5",
            "#1c2738",
            "#c95a3f",
        ],
        stroke: "#0e0f27",
        background: "#f5b28a",
        size: 6,
        type: "chromotome",
    },
    {
        name: "system.#05",
        colors: ["#db4549", "#d1e1e1", "#3e6a90", "#2e3853", "#a3c9d3"],
        stroke: "#000",
        background: "#fff",
        size: 5,
        type: "chromotome",
    },
    {
        name: "mably",
        colors: [
            "#13477b",
            "#2f1b10",
            "#d18529",
            "#d72a25",
            "#e42184",
            "#138898",
            "#9d2787",
            "#7f311b",
        ],
        stroke: "#2a1f1d",
        background: "#dfc792",
        size: 8,
        type: "chromotome",
    },
];

export const palettes: Palette[] = preprocessPalettes(palettesRaw);

/** return only soloed palettes, omitting any muted ones. */
function preprocessPalettes(ps: PaletteRaw[]): Palette[] {
    const soloed = ps.filter((p) => p.solo);
    if (soloed.length > 0) {
        console.warn(
            "not all palettes prepared - at least one soloed: " +
                soloed.map((p) => p.name).join(", ")
        );
        return soloed;
    }
    return ps.filter((p) => !p.muted);
}
