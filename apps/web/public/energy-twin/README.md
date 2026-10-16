# Energy Twin assets

The original PNGs are retained as supplied. The scene uses the original building and these transparent derivatives:

- `solar/solar-panels.png`: three individually masked panel strips from `solar-array 1.png`, with all building pixels excluded.
- `solar/solar-roof-transparent.png`: the masked strips projected onto the left roof plane of the building, on a 1248 x 832 transparent canvas matching the building image.
- `storage/battery-trimmed.png`: cabinet bounds (490 x 630 at 380,95).
- `grid/grid-site.png`: pole, meter, cables, and base bounds (1080 x 1370 at 790,85), measured against the original **2752 x 1536** source, not a resized preview.
- `equipment/hvac-trimmed.png`: equipment bounds (590 x 540 at 235,110).

The scene's building and solar frames must remain identical. Asset-local attachment points in `energy-twin-scene.tsx` account for transparent margins.

The solar perspective transform must specify both `-virtual-pixel transparent` and `-mattecolor none`. Without the latter, ImageMagick fills the invalid side of the perspective horizon with an opaque gray triangle.

Reproduce the solar derivatives from the repository root with ImageMagick:

```sh
magick 'apps/web/public/energy-twin/solar/solar-array 1.png' \( -size 1248x832 xc:none -fill white -draw 'polygon 380,335 651,173 713,211 442,375 polygon 454,382 723,220 784,256 516,419 polygon 528,426 795,263 855,299 585,462' \) -compose DstIn -composite -trim +repage 'apps/web/public/energy-twin/solar/solar-panels.png'
magick 'apps/web/public/energy-twin/solar/solar-panels.png' -virtual-pixel transparent -mattecolor none -define distort:viewport=1248x832+0+0 -distort Perspective '0,162 330,245 271,0 510,110 475,126 603,163 205,289 588,395' 'apps/web/public/energy-twin/solar/solar-roof-transparent.png'
```

The original building illustration includes fixed rooftop and facade equipment. These decorative pixels are not simulation telemetry; a clean building-only source would be needed to make every illustrated detail configuration-dependent.
