# "Split" - Interactive quad bisection painting sketch with p5.js

This is an interactive p5.js sketch for the [#WCCChallenge](https://openprocessing.org/curation/78544) Nov'25 themed "split". In it, the user can play around bisecting / inflating / shrinking quads to various depths with mouse and keyboard.

Written in typescript and p5 v2.x in global-mode with modules, partly to test v2 typescript types and global mode setup. (Bundled with vite)

<!-- really 1920x1113 -->
<img width="640" height="371" alt="wccc-split-screenshot-square-grid" src="https://github.com/user-attachments/assets/68b323eb-4b7a-4abd-b753-867052d82b74" />

## Credits

-   The basic sketch is very much informed by [Okazz's wonderful, elegant sketch "201216a"](https://openprocessing.org/sketch/1045334/) though all I've started with here is an approximation of their conceptual algorithm from memory (no doubt I butchered that).
-   I've written other non-interactive versions of this some years ago but started from scratch for the challenge without reusing / consulting any code unless otherwise noted here in credits.
-   Uses various palette(s) from [Kjetil Golid's chromotome](https://github.com/kgolid/chromotome) via [https://nice-colours-quicker.netlify.app/](nice-colours-quicker).
-   Procedural canvas texture (if used) is taken from [this Manohar Vanga article on watercolor simulation](https://sighack.com/post/generative-watercolor-in-processing) - [p5 demo](https://openprocessing.org/sketch/942231).

## WCCChallenge?

The Weekly Creative Code Challenge is a friendly jam for generative artists and creative coders.

[You can see the other entries here.](https://openprocessing.org/curation/78544)

Join the Birb's Nest Discord for friendly creative coding community and future challenges and contributions: https://discord.gg/S8c7qcjw2b

## TODO:

See [docs/todo.md](docs/todo.md)

## Old studies around this idea

-   2023, a slight re-write of Okazz's sketch, hopefully clearer. Recursive as per original. https://openprocessing.org/sketch/1970161
-   2021 https://openprocessing.org/sketch/1303469
    I was aiming at a somewhat interactive reveal/breakdown but it was naff. The additional optional insetting was done well, iirc.

# hacky build process for openprocessing

Here are the bits I haven't automated yet. Mostly this is done by `vite-for-no-bundling.config.js`, as opposed to the normal bundling or netlify which uses vite defaults.

```bash
npm install
npm run build:no-bundle
code dist/
```

then edit `dist/assets/app-SOME-HASH-HERE.js:`

-   remove all imports - they're all done by script tag except:
-   add a CDN ESM import for roughjs:

```js
import rough from "https://cdn.jsdelivr.net/npm/roughjs@4.6.6/+esm";
```
