# Vast icon family: Vast Arcade's tile (indigo gradient, rounded square) + its "candy" blocks
# (light top band, dark bottom band) in its five colors, on its 3x3 grid.
# Usage: python apps/shelf/icons/make_icons.py <outdir>   -> arcade.png library.png trivia.png party.png (512) + sheet.png
import sys, os, math
from PIL import Image, ImageDraw, ImageFont

SS = 4                      # supersample
S = 512 * SS
RED, ORANGE, YELLOW, GREEN, BLUE = '#ff6b6b', '#ff9f43', '#ffd43b', '#69db7c', '#4dabf7'
INK = '#1b1f3b'
PAD = S * 0.14; CELL = (S - 2 * PAD) / 3; GAP = CELL * 0.1; RAD = CELL * 0.18

def rgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
def mix(c, t, f): return tuple(round(a + (b - a) * f) for a, b in zip(c, t))

def tile():
    im = Image.new('RGBA', (S, S))
    top, bot = rgb('#262c66'), rgb('#1b1f3b')
    grad = Image.new('RGBA', (1, S))
    for y in range(S): grad.putpixel((0, y), mix(top, bot, y / S) + (255,))
    grad = grad.resize((S, S))
    mask = Image.new('L', (S, S)); ImageDraw.Draw(mask).rounded_rectangle([0, 0, S - 1, S - 1], radius=S * 0.22, fill=255)
    im.paste(grad, (0, 0), mask)
    return im

def candy(w, h, color, shape='rect', radius=None, stripes=()):
    """A piece in its own w x h layer: base color, top 22% lighter, bottom 18% darker (like the Arcade blocks)."""
    c = rgb(color)
    fill = Image.new('RGBA', (w, h), c + (255,))
    d = ImageDraw.Draw(fill)
    d.rectangle([0, 0, w, h * 0.22], fill=mix(c, (255, 255, 255), 0.3) + (255,))
    for a, b, sc in stripes: d.rectangle([0, h * a, w, h * b], fill=rgb(sc) + (255,))
    d.rectangle([0, h * 0.82, w, h], fill=tuple(round(v * 0.7) for v in c) + (255,))
    mask = Image.new('L', (w, h)); md = ImageDraw.Draw(mask)
    if shape == 'rect':
        md.rounded_rectangle([0, 0, w - 1, h - 1], radius=RAD if radius is None else radius, fill=255)
    else:                                   # shape = list of (x, y) in 0..1 -> polygon
        md.polygon([(x * w, y * h) for x, y in shape], fill=255)
    fill.putalpha(mask)
    return fill

def place(im, piece, cx, cy, angle=0):
    if angle: piece = piece.rotate(angle, resample=Image.BICUBIC, expand=True)
    im.alpha_composite(piece, (round(cx - piece.width / 2), round(cy - piece.height / 2)))

def cell_box(c0, r0, c1=None, r1=None):
    c1 = c0 if c1 is None else c1; r1 = r0 if r1 is None else r1
    x0 = PAD + c0 * CELL + GAP / 2; y0 = PAD + r0 * CELL + GAP / 2
    x1 = PAD + (c1 + 1) * CELL - GAP / 2; y1 = PAD + (r1 + 1) * CELL - GAP / 2
    return x0, y0, x1, y1

def block(im, c0, r0, color, c1=None, r1=None, angle=0, dx=0, dy=0):
    x0, y0, x1, y1 = cell_box(c0, r0, c1, r1)
    p = candy(round(x1 - x0), round(y1 - y0), color)
    place(im, p, (x0 + x1) / 2 + dx, (y0 + y1) / 2 + dy, angle)
    return x0, y0, x1, y1

def font(px, name='ariblk.ttf'):
    return ImageFont.truetype(os.path.join(os.environ.get('WINDIR', 'C:/Windows'), 'Fonts', name), round(px))

def arcade():
    im = tile()
    for (c, r), col in {(0, 0): RED, (2, 0): YELLOW, (0, 1): ORANGE, (2, 1): GREEN, (1, 2): BLUE}.items(): block(im, c, r, col)
    return im

def library():
    # a clapperboard: the clapper is three blocks (red, yellow, green) tilted open over a blue screen with a play mark
    im = tile()
    x0, y0, x1, y1 = block(im, 0, 1, BLUE, 2, 2, dy=CELL * 0.08)
    # play triangle cut in ink
    cx, cy = (x0 + x1) / 2 + CELL * 0.06, (y0 + y1) / 2 + CELL * 0.1
    r = CELL * 0.7
    ImageDraw.Draw(im).polygon([(cx - r * 0.5, cy - r * 0.62), (cx + r * 0.62, cy), (cx - r * 0.5, cy + r * 0.62)], fill=rgb(INK))
    # clapper: the row of three blocks, short and tilted up from the left hinge
    h = CELL * 0.62
    hinge = (x0 + GAP * 0.3, y0 + CELL * 0.02)
    ang = 12
    for i, col in enumerate((RED, YELLOW, GREEN)):
        w = CELL - GAP
        # centre of block i along the tilted row
        along = GAP / 2 + i * CELL + w / 2
        a = math.radians(ang)
        cx_ = hinge[0] + along * math.cos(a) - (h / 2) * math.sin(a)
        cy_ = hinge[1] - along * math.sin(a) - (h / 2) * math.cos(a)
        place(im, candy(round(w), round(h), col, radius=RAD * 0.8), cx_, cy_, ang)
    return im

def trivia():
    # a question block (yellow, "?") over three answer blocks (red, green, blue)
    im = tile()
    x0, y0, x1, y1 = block(im, 0, 0, YELLOW, 2, 1)
    d = ImageDraw.Draw(im)
    f = font(CELL * 1.62)
    d.text(((x0 + x1) / 2, (y0 + y1) / 2 + CELL * 0.04), '?', font=f, fill=rgb(INK), anchor='mm')
    for c, col in enumerate((RED, GREEN, BLUE)): block(im, c, 2, col)
    return im

def party():
    # a party popper: an orange cone (bottom-left) bursting blocks up and to the right
    im = tile()
    cone_w, cone_h = round(CELL * 1.25), round(CELL * 1.8)
    cone = candy(cone_w, cone_h, ORANGE, shape=[(0.5, 1.0), (0.0, 0.0), (1.0, 0.0)], stripes=((0.3, 0.42, RED), (0.56, 0.68, RED)))
    # put the cone's mouth (its top edge) toward the upper right
    place(im, cone, PAD + CELL * 0.95, S - PAD - CELL * 0.95, -45)
    small = CELL * 0.6
    for (c, r, col, ang) in ((1.45, 0.45, RED, 18), (2.45, 0.35, YELLOW, -14), (2.55, 1.45, GREEN, 24),
                             (1.75, 1.3, BLUE, -8)):
        p = candy(round(small), round(small), col, radius=RAD * 0.6)
        place(im, p, PAD + c * CELL, PAD + r * CELL, ang)
    for (c, r, col) in ((0.55, 0.5, YELLOW), (2.6, 2.45, RED)):
        p = candy(round(CELL * 0.3), round(CELL * 0.3), col, radius=RAD * 0.3)
        place(im, p, PAD + c * CELL, PAD + r * CELL, 30)
    return im

if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    made = {}
    for name, fn in (('arcade', arcade), ('library', library), ('trivia', trivia), ('party', party)):
        im = fn().resize((512, 512), Image.LANCZOS)
        im.save(os.path.join(out, name + '.png')); made[name] = im
    # contact sheet: big row + phone-size row (48 px x2)
    sheet = Image.new('RGBA', (4 * 280 + 40, 280 + 140), rgb('#11132a') + (255,))
    for i, im in enumerate(made.values()):
        sheet.alpha_composite(im.resize((256, 256), Image.LANCZOS), (20 + i * 280, 20))
        sheet.alpha_composite(im.resize((48, 48), Image.LANCZOS).resize((96, 96), Image.NEAREST), (100 + i * 280, 300))
    sheet.save(os.path.join(out, 'sheet.png'))
    print('ok', out)
