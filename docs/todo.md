# TODO list

## Keen TODOs:

-   Do alternative insetting by shrinking corners to the intersection of the two inset lines parallel to their edges.
-   add changing palette without re-drawing. especially for allowing colour palette over greyscale, or vice versa.
-   make grid layout responsive to screen size.
-   make a dedicated brush selection tool for mobile - dat.gui is too much.
-   Instead of unshrinking only the nearest, try all within a threshold of mouse
-   Allow unshrink by colour. Perhaps runs periodically? (or all quads with same colour as hovered-quad?)
-   add message system (shows the last line only and fades)
-   Unshrink all quads lying on one or two perpendicular edges of the whole image (or intersecting one or two simple straight lines across the design. Really wants to be a thick line though to ensure fewer near misses)
    -   This would look good animated (stagger might work but should be in order they line passes through them)
-   Prepare a paper texture to an offscreen and compose it each frame.
-   maybe fill with p5.brush? https://openprocessing.org/sketch/2117088
-   auto-play that demos some of the features and has a simulated "mouse pointer" moving and dragging etc.
-   dat.gui but completely hideable
-   float UI hints for user making suggestions on operations.
-   fix dat.gui and p5 loading for openprocessing - load in script tag, don't import. Vite "externalize dependency" seems to handle this - in library mode, at least: https://vite.dev/guide/build#library-mode

## Less keen TODOs:

-   shrink all to zero is interesting - hides them and lets you magic the quads in by inflating them.
-   split according to an underlying image pixel brightness
-   round the corners?
-   on splitting quads, spawn and animate some particles for teh JUICE?
-   animate a little rotation around centroid for a human feel?
-   draw outlines / hatching with rough.js?
-   don't shrink, disturb,wobble, rotate?
-   let the user use a knife to draw a long line which cuts the geom, animate.
-   extrude to 3d w custom geom?
-   fix the occasional pesky hairline gaps between quads

## Done

-   on auto-shrink after creating grid, don't allow 0 shrink. the contacts look crap sometimes, though form interesting composites other times.
-   Correctly centre grid layout
-   Draw "g" grid of squares each one split level only, with random and significant shrinkage. bold look.
-   allow click to further split a selected quad (or few surrounding ones)
-   avoid having quads shrunk only a little - the crappy tangents look like mistakes. e.g. round to 20%?
-   stop shrink-wriggling on ctrl-mouseover by observing a last-modded time per quad.
-   greyscale palette (crappy one, at least)
