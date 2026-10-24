"""EXPERIMENT: a 32x26 pixel-art gumdrop painted by code on a hard pixel grid.

Fixed palette, no antialiasing: every pixel is chosen, not blended. Used to compare how pixel art
behaves under the game's continuous depth scaling. Not for merging.

    python tools/exp_pixel_gumdrop.py public/assets/images/gumdrop-px.png
"""
import random
import sys

from PIL import Image

W, H = 32, 26
OUT, DARK, MID, LIGHT, SHINE, SUGAR = (
    (29, 22, 48, 255), (31, 122, 58, 255), (47, 178, 87, 255),
    (63, 209, 106, 255), (150, 244, 176, 255), (232, 255, 240, 255),
)

cx, base, rx, ry = 16.0, 25.0, 15.0, 23.0


def inside(x, y):
    if y > 24:  # the flat lip along the bottom
        return 2 <= x <= 29
    nx, ny = (x + 0.5 - cx) / rx, (y + 0.5 - base) / ry
    return nx * nx + ny * ny <= 1.0


mask = [[inside(x, y) for x in range(W)] for y in range(H)]
img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
px = img.load()
for y in range(H):
    for x in range(W):
        if not mask[y][x]:
            continue
        edge = any(not (0 <= x + dx < W and 0 <= y + dy < H and mask[y + dy][x + dx]) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
        if edge:
            px[x, y] = OUT
            continue
        nx, ny = (x + 0.5 - cx) / rx, (y + 0.5 - base) / ry
        lit = -nx * 0.5 - ny * 0.8  # light from the upper left
        px[x, y] = LIGHT if lit > 0.55 else MID if lit > 0.05 else DARK
        if y >= 23:
            px[x, y] = DARK
# highlight and sugar
for (x, y) in ((8, 8), (9, 7), (9, 8), (8, 9), (10, 7)):
    if px[x, y][3]:
        px[x, y] = SHINE
rnd = random.Random(3)
placed = 0
while placed < 12:
    x, y = rnd.randrange(3, 29), rnd.randrange(5, 22)
    if px[x, y] in (LIGHT, MID, DARK):
        px[x, y] = SUGAR
        placed += 1
img.save(sys.argv[1])
print("saved", sys.argv[1], img.size)
