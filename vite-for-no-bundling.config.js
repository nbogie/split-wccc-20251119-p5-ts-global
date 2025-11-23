//reading:
//configuring vite: https://vite.dev/config/
//build options: https://vite.dev/config/build-options
//building for production: https://vite.dev/guide/build
import { defineConfig } from "vite";
import { resolve } from "path"; // Need this to resolve the file path
export default defineConfig(({ mode }) => {
    // Vite automatically sets mode to 'development' for dev and 'production' for build.
    const isProduction = mode === "production";

    return {
        build: {
            //more readable code for upload on openprocessing etc
            minify: false,

            //maybe use dynamic import vars ?
            // https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars

            rollupOptions: {
                // 2. CONDITIONALLY set the build INPUT file
                input: {
                    // If building, use the production HTML file.
                    // Otherwise (for dev server), Vite defaults to the root index.html
                    app: isProduction
                        ? resolve(__dirname, "index.no-bundle.html")
                        : resolve(__dirname, "index.html"),
                },

                //externalize deps that shouldn't be bundled
                external: ["dat.gui", "gsap", "p5"],
                //https://rollupjs.org/configuration-options/
                preserveEntrySignatures: "strict",
                output: {
                    format: "es",
                    preserveModules: true,
                    // chunkFileNames: `[name].js`, // ensures chunks are named clearly
                    entryFileNames: `[name].js`, // ensures module files are named clearly
                },
            },
        },
    };
});
