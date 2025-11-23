//reading:
//configuring vite: https://vite.dev/config/
//build options: https://vite.dev/config/build-options
//building for production: https://vite.dev/guide/build
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        //more readable code for upload on openprocessing etc
        minify: false,

        //maybe use dynamic import vars ?
        // https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars

        rollupOptions: {
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
});
