import { getWorld } from "./main.ts";
import { drawQuadWithBrightness, findQuadCentroid } from "./quad.ts";

/**
 * Load and return set of images described in an imageList.json file in the given folderPath.
 * @param folderPath absolute path on server of folder containing imageList.json file and the images it refers to.
 * @returns promise resolving to array of loaded p5.Image objects, or resolving to null if error loading.
 */
export async function loadImagePack(folderPath: string) {
    const url = folderPath + "/imageList.json";
    try {
        const imgFilenames = (await loadJSON(url)) as unknown as string[]; //TODO: validate this structure. don't assume

        return shuffle(
            await Promise.all(
                imgFilenames.map((n) => loadImage(folderPath + "/" + n))
            )
        );
    } catch (err) {
        console.error("error loading image pack: url " + url, err);
        return null;
    }
}

export function drawQuadsByUnderlyingImage() {
    const world = getWorld();
    if (!world.images) {
        return;
    }
    const imageToUse = world.images[0];
    const leftMargin = (width - imageToUse.width) / 2;
    const topMargin = (height - imageToUse.height) / 2;
    const topLeftOffset = createVector(leftMargin, topMargin);
    // image(imageToUse, topLeftOffset.x, topLeftOffset.y);

    world.quads
        .filter((q) => q.isLeaf)
        .forEach((q) => {
            const centroid = findQuadCentroid(q.pts);
            const [r, _g, _b, _a] = imageToUse.get(
                centroid.x + -topLeftOffset.x,
                centroid.y + -topLeftOffset.y
            );
            drawQuadWithBrightness(q, r / 200);
        });
}
