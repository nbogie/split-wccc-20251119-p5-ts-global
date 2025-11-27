//@ts-check
//reading:
//configuring vite: https://vite.dev/config/
//build options: https://vite.dev/config/build-options
//building for production: https://vite.dev/guide/build
import { defineConfig } from "vite";
import { resolve } from "path"; // Need this to resolve the file path
export default defineConfig((_options) => {
    return {
        build: {
            manifest: "myManifest.json",
            //more readable code for upload on openprocessing etc
            minify: false,
            //maybe use dynamic import vars ?
            // https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars

            //https://vite.dev/config/build-options#build-modulepreload
            //remove unreadable polyfill chunk at start of our output
            //this is the readable version of the build!
            modulePreload: { polyfill: false },

            rollupOptions: {
                input: {
                    app: resolve(__dirname, "index.for-web-editors.html"),
                },

                //externalize deps that shouldn't be bundled
                external: ["dat.gui", "gsap", "p5", "roughjs"],
                //https://rollupjs.org/configuration-options/
                preserveEntrySignatures: "strict",
                output: {
                    format: "es",
                    dir: resolve(__dirname, "dist-for-web-editors"),
                    // preserveModules: true,
                    // chunkFileNames: `[name].js`, // ensures chunks are named clearly
                    // entryFileNames: `[name].js`, // ensures module files are named clearly
                },
            },
        },
    };
});
