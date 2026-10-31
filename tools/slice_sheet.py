"""Slice a transparent-background sprite sheet into an aligned, equal-width horizontal strip.

The game plays strips as animations: N equal-width frames side by side, left to right
(see docs/assets.md). AI-generated sheets are rarely on a clean grid and often have capes or
weapons that cross a nominal cell boundary, so frames are found from the alpha channel instead:
rows are split at fully empty rows, then each row is split at fully empty columns. Frames must not
touch each other.

    python tools/slice_sheet.py SHEET.png --frames 8 --out public/assets/images/lich-idle.png \
        --preview preview.png --anchor left-edge --align top

Needs Pillow and numpy. Treat the input as untrusted data: run it on a copy, not from the folder
that holds the download.

--anchor picks the point of each frame that lands on the center of its cell, so the body stays put
while the cape moves:
  head       horizontal center of the top quarter of the frame (horns/hood). Fails when a cape tip
             curls up into the head area.
  left-edge  the frame's left edge plus the median left-edge-to-head offset across all frames. Good
             when everything flares to one side and the near edge is stable.
  center     the center of the frame's bounding box.

--align top keeps heads level; --align bottom keeps feet level.

--height-fraction F pads the cell so the tallest frame is only F of the cell height. Use it for a pose
that is drawn at the same scale as the standing figure but is shorter, like a kneeling Lich (F=0.6):
the game draws every sprite at a fixed on-screen height, so without it a short figure cropped tight
would be blown up to standing size. The padding goes above the figure with --align bottom and below it
with --align top. Leave it off when the renderer draws the sprite at its own height, as it does for
the slide.
"""

import argparse
import sys

import numpy as np
from PIL import Image, ImageDraw


def runs(flags):
    out, start = [], None
    for i, on in enumerate(flags):
        if on and start is None:
            start = i
        if not on and start is not None:
            out.append((start, i - 1))
            start = None
    if start is not None:
        out.append((start, len(flags) - 1))
    return out


def find_frames(mask):
    frames = []
    for y0, y1 in runs(mask.any(axis=1)):
        band = mask[y0 : y1 + 1]
        for x0, x1 in runs(band.any(axis=0)):
            ys = np.where(band[:, x0 : x1 + 1].any(axis=1))[0]
            frames.append({"x0": x0, "x1": x1, "y0": y0 + int(ys[0]), "y1": y0 + int(ys[-1])})
    return frames


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("sheet")
    ap.add_argument("--frames", type=int, required=True, help="expected number of frames")
    ap.add_argument("--out", required=True, help="output strip PNG")
    ap.add_argument("--preview", help="optional checkerboard preview with the center line drawn")
    ap.add_argument("--anchor", choices=["head", "left-edge", "center"], default="head")
    ap.add_argument("--align", choices=["top", "bottom"], default="top")
    ap.add_argument("--height-fraction", type=float, help="tallest frame / cell height, in (0, 1]")
    ap.add_argument("--alpha-threshold", type=int, default=8)
    args = ap.parse_args()

    im = Image.open(args.sheet).convert("RGBA")
    mask = np.array(im)[..., 3] > args.alpha_threshold
    frames = find_frames(mask)
    if len(frames) != args.frames:
        sys.exit(f"expected {args.frames} frames, found {len(frames)}: {frames}. "
                 "Frames must not touch, and the background must be transparent.")

    for f in frames:
        h = f["y1"] - f["y0"] + 1
        top = mask[f["y0"] : f["y0"] + max(8, h // 4), f["x0"] : f["x1"] + 1]
        cols = np.where(top.any(axis=0))[0]
        f["head"] = f["x0"] + (cols[0] + cols[-1]) / 2
    if args.anchor == "left-edge":
        off = float(np.median([f["head"] - f["x0"] for f in frames]))
        for f in frames:
            f["ax"] = f["x0"] + off
    elif args.anchor == "center":
        for f in frames:
            f["ax"] = (f["x0"] + f["x1"] + 1) / 2
    else:
        for f in frames:
            f["ax"] = f["head"]

    cell_h = max(f["y1"] - f["y0"] + 1 for f in frames)
    if args.height_fraction is not None:
        if not 0 < args.height_fraction <= 1:
            sys.exit("--height-fraction must be in (0, 1]")
        cell_h = int(np.ceil(cell_h / args.height_fraction))
    half = int(np.ceil(max(max(f["ax"] - f["x0"], f["x1"] + 1 - f["ax"]) for f in frames))) + 2
    cell_w = half * 2

    strip = Image.new("RGBA", (cell_w * len(frames), cell_h), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        crop = im.crop((f["x0"], f["y0"], f["x1"] + 1, f["y1"] + 1))
        ox = int(round(half - (f["ax"] - f["x0"])))
        oy = 0 if args.align == "top" else cell_h - crop.height
        strip.alpha_composite(crop, (i * cell_w + ox, oy))
    strip.save(args.out, optimize=True)
    print(f"{len(frames)} frames, cell {cell_w}x{cell_h}, strip {strip.size[0]}x{strip.size[1]} -> {args.out}")

    if args.preview:
        pv = Image.new("RGBA", strip.size, (200, 200, 200, 255))
        d = ImageDraw.Draw(pv)
        for y in range(0, strip.height, 16):
            for x in range(0, strip.width, 16):
                if (x // 16 + y // 16) % 2:
                    d.rectangle([x, y, x + 15, y + 15], fill=(170, 170, 170, 255))
        pv.alpha_composite(strip)
        d = ImageDraw.Draw(pv)
        for i in range(len(frames)):
            d.line([(i * cell_w + half, 0), (i * cell_w + half, cell_h)], fill=(255, 0, 0, 255))
            d.rectangle([i * cell_w, 0, (i + 1) * cell_w - 1, cell_h - 1], outline=(0, 120, 255, 255))
        pv.convert("RGB").save(args.preview)


if __name__ == "__main__":
    main()
