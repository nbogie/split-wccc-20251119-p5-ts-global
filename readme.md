## what's this

An interactive p5.js sketch for the [#WCCChallenge](https://openprocessing.org/curation/78544) Nov'25 themed "split".  In it, the user can play around bisecting / inflating / shrinking quads to various depths with mouse and keyboard.
    
Written in typescript and p5 v2.x in global-mode with modules, partly to test v2 typescript types and global mode setup.  (Bundled with vite)

<img width="1920" height="1113" alt="wccc-split-screenshot-square-grid" src="https://github.com/user-attachments/assets/68b323eb-4b7a-4abd-b753-867052d82b74" />



## "Split" - Interactive quad bisection painting sketch with p5.js

I've written similar sketches years ago (studying Okazz, mostly) but did this one without consulting/reusing any code.

-   Original quad bisection inspiration and education from [Okazz's sketch "201216a"](https://openprocessing.org/sketch/1045334/)
-   Some palette(s) from [kgolid's chromotome](https://github.com/kgolid/chromotome) via [https://nice-colours-quicker.netlify.app/](nice-colours-quicker)

## WCCChallenge?

Join the Birb's Nest Discord for friendly creative coding community
and future challenges and contributions: https://discord.gg/S8c7qcjw2b

## TODO:

### Keen TODOs:

-   Correct grid layout and make responsive to screen size.
-   Try inset by shrinking corners to the intersection of the two inset lines parallel to their edges.
-   Instead of unshrinking only the nearest, try all within a threshold of mouse
-   Quads unshrink by colour, periodically? (or all quads with same colour as hovered-quad?)
-   Unshrink all quads lying on one or two perpendicular edges (or intersecting one or two simple straight lines across the design. Really wants to be a thick line though to ensure fewer near misses)
    -   This would look good animated (stagger might work but should be in order they line passes through them)
-   Prepare a paper texture to an offscreen and compose it each frame.
-   maybe fill with p5.brush? https://openprocessing.org/sketch/2117088
-   auto-play that demos some of the features and has a simulated "mouse pointer" moving and dragging etc.

### Less keen TODOs:

-   round the corners?
-   on splitting quads, spawn and animate some particles for teh JUICE?
-   animate a little rotation around centroid for a human feel?
-   draw outlines / hatching with rough.js?
-   don't shrink, disturb,wobble, rotate?
-   let the user use a knife to draw a long line which cuts the geom, animate.
-   extrude to 3d w custom geom?

## Done

-   Draw "g" grid of squares each one split level only, with random and significant shrinkage. bold look.
-   allow click to further split a selected quad (or few surrounding ones)
-   avoid having quads shrunk only a little - the crappy tangents look like mistakes. e.g. round to 20%?

## other studies around this idea

-   Okazz original (to my knowledge): https://openprocessing.org/sketch/1045334/
-   from 2023 a minimal featured and hopefully clearer re-write, recursive as per original. https://openprocessing.org/sketch/1970161
-   from 2021 https://openprocessing.org/sketch/1303469 somewhat interactive reveal with optional insetting
