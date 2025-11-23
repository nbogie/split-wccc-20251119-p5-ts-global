import { defineConfig } from "vite";

export default defineConfig({
    build: {
        //more readable code for upload on openprocessing etc
        minify: false,

        rollupOptions: {
            //externalize deps that shouldn't be bundled
            external: ["dat.gui", "gsap", "p5"],
            output: {},
        },
    },
});
