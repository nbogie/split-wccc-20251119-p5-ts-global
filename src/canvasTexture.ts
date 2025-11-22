// Canvas texture is taken from this Manohar Vanga article on watercolor simulation:
// https://sighack.com/post/generative-watercolor-in-processing
// See also https://openprocessing.org/sketch/942231

//Slow, but we can cache it.
export function drawCanvasTextureTo(
    { alphaRange, spacing }: { alphaRange: [number, number]; spacing: number },
    g: ReturnType<typeof createGraphics>
): void {
    for (let i = -g.height; i < g.height + g.width; i += spacing) {
        g.stroke(255, random(...alphaRange));
        gridline(i, 0, i + g.height, g.height, g);
    }
    for (let i = g.height + g.width; i >= -g.width; i -= spacing) {
        g.stroke(255, random(...alphaRange));
        gridline(i, 0, i - g.height, g.height, g);
    }
}

function gridline(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    g: ReturnType<typeof createGraphics>
) {
    let tmp;
    /* Swap coordinates if needed so that x1 <= x2 */
    if (x1 > x2) {
        tmp = x1;
        x1 = x2;
        x2 = tmp;
        tmp = y1;
        y1 = y2;
        y2 = tmp;
    }

    let dx = x2 - x1;
    let dy = y2 - y1;
    let step = 1;

    if (x2 < x1) step = -step;

    let sx = x1;
    let sy = y1;
    for (let x = x1 + step; x <= x2; x += step) {
        let y = y1 + (step * dy * (x - x1)) / dx;
        g.strokeWeight(1 + map(noise(sx, sy), 0, 1, -0.5, 0.5));
        g.line(
            sx,
            sy,
            x + map(noise(x, y), 0, 1, -1, 1),
            y + map(noise(x, y), 0, 1, -1, 1)
        );
        sx = x;
        sy = y;
    }
}
