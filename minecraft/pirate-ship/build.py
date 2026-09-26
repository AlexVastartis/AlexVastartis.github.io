#!/usr/bin/env python3
"""Builds the Pirate Ship add-on.

One ship design (the voxel layout below) drives everything that has to agree
with everything else:

  * the hull model the players see (RP/models/entity/pirate_ship.geo.json)
  * the sail model (RP/models/entity/pirate_ship_sails.geo.json)
  * the invisible deck/walls the script builds under players' feet
    (BP/scripts/layout.js)

It also paints every texture procedurally (no vanilla art is copied), writes
one crafting recipe per wool colour, and zips both packs into
dist/PirateShip.mcaddon.

Ship space: a = forward (+ is the bow), b = sideways, h = height where h = 0 is
the first air layer above the main deck and h = -1 is the deck floor. The ship
entity sits on the water surface, so the deck floor block is the air block just
above the water.

Usage: python3 build.py   (needs Pillow: pip install pillow)
"""
import json
import os
import random
import shutil
import zipfile

from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
BP = os.path.join(HERE, "PirateShip_BP")
RP = os.path.join(HERE, "PirateShip_RP")
DIST = os.path.join(HERE, "dist")

# ---------------------------------------------------------------- the design

A_MIN, A_MAX = -13, 13
QD_FRONT = -6  # quarterdeck / captain's cabin covers a <= QD_FRONT

# half-width of the deck at each a (cells b in [-hw, hw])
HALF_WIDTH = {a: 4 for a in range(-12, 7)}
HALF_WIDTH.update({-13: 3, 7: 3, 8: 3, 9: 2, 10: 2, 11: 1, 12: 1, 13: 0})

# hull layers below the deck: (h, shrink in width, a range)
HULL_LAYERS = [(-2, 0, (-13, 12)), (-3, 1, (-12, 12)), (-4, 2, (-11, 11))]

HELM = {"a": -8, "b": 0, "h": 3}     # ship's wheel, on the quarterdeck
CHEST = {"a": -12, "b": 0, "h": 0}   # large chest at the back of the cabin
MASTS = [  # (a, first h, last h, half thickness px)
    (1, 0, 19, 5),    # main mast
    (8, 0, 14, 4),    # fore mast
    (-11, 3, 13, 4),  # mizzen, stands on the quarterdeck
]
SAILS = [  # (a, half width px, bottom y px, top y px)
    (1, 68, 112, 224),   # main course
    (1, 44, 256, 296),   # main topsail
    (8, 52, 96, 192),    # fore sail
    (-11, 36, 112, 192), # mizzen
]
WINDOWS = {(-13, -2, 1), (-13, 0, 1), (-13, 2, 1),
           (-8, -4, 1), (-8, 4, 1), (-11, -4, 1), (-11, 4, 1)}
CANNONS = [-3, 0, 4]

# materials -> row in the texture atlas
M_HULL, M_DECK, M_TRIM, M_MAST, M_WINDOW, M_IRON, M_GOLD, M_YARD, M_CHEST, M_BLACK = range(10)
N_MAT = 10


def in_footprint(a, b):
    return a in HALF_WIDTH and abs(b) <= HALF_WIDTH[a]


def is_edge(a, b):
    return in_footprint(a, b) and not all(
        in_footprint(a + da, b + db) for da, db in ((1, 0), (-1, 0), (0, 1), (0, -1)))


def build_voxels():
    vox = {}
    for a in range(A_MIN, A_MAX + 1):
        for b in range(-4, 5):
            if not in_footprint(a, b):
                continue
            edge = is_edge(a, b)
            vox[(a, b, -1)] = M_TRIM if edge else M_DECK
            for h, shrink, (lo, hi) in HULL_LAYERS:
                if lo <= a <= hi and abs(b) <= HALF_WIDTH[a] - shrink:
                    vox[(a, b, h)] = M_HULL
            if a <= QD_FRONT:
                if edge:                        # cabin walls + quarterdeck rail
                    for h in range(0, 4):
                        vox[(a, b, h)] = M_WINDOW if (a, b, h) in WINDOWS else M_HULL
                elif a == QD_FRONT:             # front wall with a door
                    for h in range(0, 3):
                        if not (b == 0 and h < 2):
                            vox[(a, b, h)] = M_HULL
                    if abs(b) <= 1:
                        vox[(a, b, 3)] = M_HULL
                else:                           # cabin ceiling = quarterdeck floor
                    vox[(a, b, 2)] = M_DECK
            elif edge:
                vox[(a, b, 0)] = M_HULL         # bulwark rail
    # stairs up to the quarterdeck, both sides
    for b in (-3, -2, 2, 3):
        vox[(QD_FRONT + 2, b, 0)] = M_TRIM
        vox[(QD_FRONT + 1, b, 0)] = M_TRIM
        vox[(QD_FRONT + 1, b, 1)] = M_TRIM
    # figurehead post at the bow
    vox[(A_MAX, 0, 1)] = M_TRIM
    return vox


def build_layout(vox):
    """Solid levels (h >= -1) per deck cell, used for the invisible barriers."""
    cells = {}
    for (a, b, h) in vox:
        if h >= -1:
            cells.setdefault((a, b), set()).add(h)
    for a, h0, h1, _ in MASTS:
        cells.setdefault((a, 0), set()).update(range(h0, h1 + 1))
    layout = {f"{a},{b}": sorted(v) for (a, b), v in sorted(cells.items())}
    edge = [[a, b] for (a, b) in sorted(cells) if is_edge(a, b)]
    return layout, edge

# ---------------------------------------------------------------- textures

STRIP = 512           # length of each tiling strip in the atlas (32 blocks)
V_TOP = 16 * N_MAT    # vertical strips start below the horizontal ones
ATLAS_W, ATLAS_H = STRIP, V_TOP + STRIP
FLAG = (256, V_TOP, 32, 20)  # x, y, w, h of the jolly roger


def shade(c, f):
    return tuple(max(0, min(255, int(v * f))) for v in c) + (255,)


def planks_tile(base, rnd, boards=4):
    img = Image.new("RGBA", (16, 16))
    px = img.load()
    rows = 16 // boards
    for i in range(boards):
        bf = rnd.uniform(0.85, 1.12)
        joint = rnd.randrange(3, 13)
        for y in range(i * rows, (i + 1) * rows):
            for x in range(16):
                f = bf * rnd.uniform(0.93, 1.05)
                if y == i * rows:
                    f *= 0.62          # seam between boards
                if x == joint and y > i * rows:
                    f *= 0.7           # end joint
                px[x, y] = shade(base, f)
    return img


def grain_tile(base, rnd, dark=0.75):
    img = Image.new("RGBA", (16, 16))
    px = img.load()
    for y in range(16):
        lf = rnd.uniform(0.85, 1.1) * (dark if y % 4 == 0 else 1.0)
        for x in range(16):
            px[x, y] = shade(base, lf * rnd.uniform(0.92, 1.06))
    return img


def flat_tile(base, rnd, noise=0.08):
    img = Image.new("RGBA", (16, 16))
    px = img.load()
    for y in range(16):
        for x in range(16):
            px[x, y] = shade(base, rnd.uniform(1 - noise, 1 + noise))
    return img


def window_tile(rnd):
    img = flat_tile((58, 38, 20), rnd)
    d = ImageDraw.Draw(img)
    d.rectangle([3, 3, 12, 12], fill=(255, 196, 92, 255))
    d.rectangle([4, 4, 11, 11], fill=(255, 214, 120, 255))
    d.line([7, 3, 7, 12], fill=(58, 38, 20, 255))
    d.line([3, 7, 12, 7], fill=(58, 38, 20, 255))
    return img


def chest_tile(rnd):
    img = planks_tile((164, 118, 62), rnd)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 15, 15], outline=(92, 62, 30, 255))
    return img


def material_tiles():
    rnd = random.Random(7)
    return [
        planks_tile((82, 52, 28), rnd),        # hull: dark planks
        planks_tile((150, 108, 64), rnd),      # deck: light planks
        grain_tile((62, 42, 24), rnd),         # trim: dark wood
        grain_tile((108, 78, 46), rnd, 0.7),   # mast: log
        window_tile(rnd),                      # window
        flat_tile((46, 46, 52), rnd),          # iron
        flat_tile((222, 178, 60), rnd, 0.12),  # gold
        grain_tile((168, 128, 80), rnd),       # yard / light wood
        chest_tile(rnd),                       # chest
        flat_tile((22, 22, 24), rnd, 0.1),     # black cloth
    ]


def jolly_roger():
    w, h = FLAG[2], FLAG[3]
    img = Image.new("RGBA", (w, h), (20, 20, 22, 255))
    d = ImageDraw.Draw(img)
    white = (235, 235, 225, 255)
    cx = w // 2
    d.ellipse([cx - 5, 2, cx + 5, 11], fill=white)                 # skull
    d.rectangle([cx - 3, 10, cx + 3, 13], fill=white)              # jaw
    d.rectangle([cx - 3, 5, cx - 1, 7], fill=(20, 20, 22, 255))    # eyes
    d.rectangle([cx + 1, 5, cx + 3, 7], fill=(20, 20, 22, 255))
    d.line([cx - 10, 12, cx + 10, 19], fill=white, width=2)        # bones
    d.line([cx - 10, 19, cx + 10, 12], fill=white, width=2)
    return img


def build_atlas(path):
    atlas = Image.new("RGBA", (ATLAS_W, ATLAS_H), (0, 0, 0, 0))
    for m, tile in enumerate(material_tiles()):
        for i in range(STRIP // 16):
            atlas.paste(tile, (i * 16, m * 16))                          # horizontal
            atlas.paste(tile.rotate(90, expand=True), (m * 16, V_TOP + i * 16))  # vertical
    atlas.paste(jolly_roger(), FLAG[:2])
    atlas.save(path)


DYES = ["white", "orange", "magenta", "light_blue", "yellow", "lime", "pink", "gray",
        "light_gray", "cyan", "purple", "blue", "brown", "green", "red", "black"]
DYE_RGB = {
    "white": (240, 240, 232), "orange": (230, 120, 30), "magenta": (190, 70, 180),
    "light_blue": (100, 170, 220), "yellow": (240, 210, 60), "lime": (120, 200, 40),
    "pink": (240, 150, 175), "gray": (75, 80, 85), "light_gray": (160, 160, 155),
    "cyan": (30, 140, 150), "purple": (120, 45, 170), "blue": (50, 60, 160),
    "brown": (120, 80, 45), "green": (80, 105, 30), "red": (170, 40, 35),
    "black": (28, 28, 32),
}
# extra (older) dye items that also count
DYE_ALIASES = {"white": ["minecraft:bone_meal"], "blue": ["minecraft:lapis_lazuli"],
               "brown": ["minecraft:cocoa_beans"], "black": ["minecraft:ink_sac"]}


def sail_texture(rgb, path):
    rnd = random.Random(hash(rgb) & 0xffff)
    img = Image.new("RGBA", (64, 64))
    px = img.load()
    for y in range(64):
        for x in range(64):
            f = rnd.uniform(0.94, 1.04)
            if x % 16 == 0:
                f *= 0.86          # cloth seams
            if y < 2 or y > 61 or x < 1 or x > 62:
                f *= 0.8           # hem
            px[x, y] = shade(rgb, f)
    lum = 0.3 * rgb[0] + 0.59 * rgb[1] + 0.11 * rgb[2]
    ink = (25, 25, 28, 255) if lum > 110 else (235, 235, 225, 255)
    d = ImageDraw.Draw(img)
    d.ellipse([24, 16, 40, 32], fill=ink)
    d.rectangle([27, 30, 37, 36], fill=ink)
    bg = shade(rgb, 1.0)
    d.rectangle([27, 21, 30, 25], fill=bg)
    d.rectangle([34, 21, 37, 25], fill=bg)
    d.line([16, 38, 48, 50], fill=ink, width=3)
    d.line([16, 50, 48, 38], fill=ink, width=3)
    img.save(path)


def item_icon(path):
    img = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(1, 10), (15, 10), (13, 14), (3, 14)], fill=(82, 52, 28, 255))
    d.line([(1, 10), (15, 10)], fill=(62, 42, 24, 255))
    d.line([(8, 1), (8, 10)], fill=(108, 78, 46, 255))
    d.line([(4, 2), (4, 10)], fill=(108, 78, 46, 255))
    d.rectangle([5, 2, 11, 8], fill=(240, 240, 232, 255))
    d.rectangle([2, 4, 3, 8], fill=(240, 240, 232, 255))
    d.point([(8, 4), (7, 5), (9, 5)], fill=(25, 25, 28, 255))
    d.rectangle([9, 0, 11, 1], fill=(20, 20, 22, 255))
    img.save(path)

# ---------------------------------------------------------------- geometry

FACES = {  # face -> (normal axis, sign, u axis, v axis)
    "north": (2, -1, 0, 1), "south": (2, 1, 0, 1),
    "east": (0, 1, 2, 1), "west": (0, -1, 2, 1),
    "up": (1, 1, 0, 2), "down": (1, -1, 0, 2),
}


def strip_uv(m, du, dv):
    """UV for a face of du x dv pixels in material m, tiling along the long side."""
    du, dv = max(du, 1), max(dv, 1)
    if dv <= 16:
        return {"uv": [0, m * 16], "uv_size": [du, dv]}
    if du <= 16:
        return {"uv": [m * 16, V_TOP], "uv_size": [du, dv]}
    raise ValueError(f"face {du}x{dv} too big to tile")


def cube(m, origin, size, faces=None, **extra):
    uv = {}
    for name, (n, _s, ua, va) in FACES.items():
        if faces is None or name in faces:
            uv[name] = strip_uv(m, size[ua], size[va])
    c = {"origin": origin, "size": size, "uv": uv}
    c.update(extra)
    return c


def cell_origin(a, b, h):
    return [b * 16 - 8, (h + 1) * 16, -a * 16 - 8]


def voxel_cubes(vox):
    """Merge voxels into runs along the ship's length and cull hidden faces."""
    cubes, done = [], set()
    solid = set(vox)
    for (a, b, h) in sorted(vox, key=lambda k: (k[2], k[1], -k[0])):
        if (a, b, h) in done:
            continue
        m = vox[(a, b, h)]
        run = [a]
        while (run[-1] - 1, b, h) in vox and vox[(run[-1] - 1, b, h)] == m \
                and (run[-1] - 1, b, h) not in done:
            run.append(run[-1] - 1)
        done.update((x, b, h) for x in run)
        faces = set()
        for x in run:  # geometry z = -a*16, so "north" (-z) is the bow side
            if (x, b + 1, h) not in solid: faces.add("east")
            if (x, b - 1, h) not in solid: faces.add("west")
            if (x, b, h + 1) not in solid: faces.add("up")
            if (x, b, h - 1) not in solid: faces.add("down")
        if (run[0] + 1, b, h) not in solid: faces.add("north")
        if (run[-1] - 1, b, h) not in solid: faces.add("south")
        if not faces:
            continue
        o = cell_origin(run[0], b, h)
        cubes.append(cube(m, o, [16, 16, 16 * len(run)], faces))
    return cubes


def detail_cubes():
    cs = []
    for a, h0, h1, t in MASTS:
        z = -a * 16
        cs.append(cube(M_MAST, [-t, (h0 + 1) * 16, z - t], [2 * t, (h1 - h0 + 1) * 16, 2 * t]))
    for a, hw, y0, y1 in SAILS:  # yards above and below each sail
        z = -a * 16 - 9
        cs.append(cube(M_YARD, [-hw - 6, y1, z - 3], [2 * hw + 12, 5, 5]))
        cs.append(cube(M_YARD, [-hw - 2, y0 - 4, z - 2], [2 * hw + 4, 3, 3]))
    # bowsprit, angled up out of the bow
    bow_z = -(A_MAX + 0.5) * 16
    cs.append(cube(M_MAST, [-4, 28, bow_z - 96], [8, 8, 104],
                   pivot=[0, 32, bow_z], rotation=[-15, 0, 0]))
    # ship's wheel on the quarterdeck, facing the captain (stern side)
    wz = -HELM["a"] * 16
    floor = (HELM["h"] + 1) * 16
    cs.append(cube(M_TRIM, [-2, floor, wz - 2], [4, 16, 4]))
    hub_y = floor + 20
    cs.append(cube(M_GOLD, [-2, hub_y - 2, wz + 2], [4, 4, 3]))
    for rot in (0, 45, 90, 135):
        cs.append(cube(M_YARD, [-11, hub_y - 1, wz + 3], [22, 2, 2],
                       pivot=[0, hub_y, wz + 4], rotation=[0, 0, rot]))
    for x0, y0, sx, sy in ((-9, hub_y + 7, 18, 2), (-9, hub_y - 9, 18, 2),
                           (-9, hub_y - 7, 2, 14), (7, hub_y - 7, 2, 14)):
        cs.append(cube(M_TRIM, [x0, y0, wz + 3], [sx, sy, 2]))
    # cannons poking out of the bulwarks
    for a in CANNONS:
        z = -a * 16
        for side in (-1, 1):
            x_out = side * 72
            x0 = x_out - 4 if side > 0 else x_out - 8
            cs.append(cube(M_IRON, [x0, 21, z - 3], [12, 6, 6]))
    # lanterns either side of the cabin door
    fz = -QD_FRONT * 16 - 8
    for x in (-24, 24):
        cs.append(cube(M_WINDOW, [x - 3, 36, fz - 6], [6, 8, 6]))
        cs.append(cube(M_IRON, [x - 1, 44, fz - 4], [2, 3, 2]))
    # gold trim along the stern
    sz = -A_MIN * 16 + 8
    cs.append(cube(M_GOLD, [-56, 60, sz], [112, 3, 1]))
    # jolly roger flying off the top of the main mast
    ma, _, top, t = MASTS[0]
    fy = (top + 2) * 16 - 24
    fx, fy0, fw, fh = FLAG
    cs.append({"origin": [-0.5, fy, -ma * 16 + t], "size": [1, fh, fw],
               "uv": {"east": {"uv": [fx, fy0], "uv_size": [fw, fh]},
                      "west": {"uv": [fx + fw, fy0], "uv_size": [-fw, fh]}}})
    return cs


def geometry(identifier, cubes, tex_w, tex_h, bounds=(32, 28)):
    return {
        "format_version": "1.12.0",
        "minecraft:geometry": [{
            "description": {
                "identifier": identifier,
                "texture_width": tex_w, "texture_height": tex_h,
                "visible_bounds_width": bounds[0], "visible_bounds_height": bounds[1],
                "visible_bounds_offset": [0, 8, 0],
            },
            "bones": [{"name": "root", "pivot": [0, 0, 0], "cubes": cubes}],
        }],
    }


def sail_cubes():
    cs = []
    for a, hw, y0, y1 in SAILS:
        z = -a * 16 - 9  # just ahead of the mast (bow is -z)
        third = (2 * hw) / 3
        for i in range(3):
            x0 = -hw + i * third
            bulge = 4 if i == 1 else 0  # the middle panel bellies forward
            u0 = 64 * i / 3
            face = {"uv": [u0, 0], "uv_size": [64 / 3, 64]}
            back = {"uv": [u0 + 64 / 3, 0], "uv_size": [-64 / 3, 64]}
            edge = {"uv": [0, 0], "uv_size": [1, 1]}
            cs.append({"origin": [x0, y0, z - 1 - bulge], "size": [third, y1 - y0, 1],
                       "uv": {"north": face, "south": back, "east": edge, "west": edge,
                              "up": edge, "down": edge}})
    return cs


def chest_cubes():
    # a double chest, 2 blocks wide; -z is its front (the latch)
    return [
        cube(M_CHEST, [-15, 0, -7], [30, 10, 14]),
        cube(M_TRIM, [-15.5, 10, -7.5], [31, 5, 15]),
        cube(M_IRON, [-15.6, 2, -7.6], [1.2, 12, 15.2]),
        cube(M_IRON, [14.4, 2, -7.6], [1.2, 12, 15.2]),
        cube(M_GOLD, [-1.5, 7, -8.5], [3, 5, 1.5]),
    ]


def empty_geometry(identifier):
    g = geometry(identifier, [], 16, 16, (1, 1))
    g["minecraft:geometry"][0]["bones"][0].pop("cubes")
    return g

# ---------------------------------------------------------------- data files


def write_json(path, data, compact=False):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        if compact:
            json.dump(data, f, separators=(",", ":"))
        else:
            json.dump(data, f, indent=2)
        f.write("\n")


def write_layout_js(layout, edge):
    path = os.path.join(BP, "scripts", "layout.js")
    with open(path, "w") as f:
        f.write("// Generated by build.py from the ship design. Do not edit by hand.\n")
        f.write("// LAYOUT: solid block levels per deck cell, key \"a,b\"; level 0 is the\n")
        f.write("// first block above the main deck, -1 is the deck floor itself.\n")
        f.write(f"export const LAYOUT = {json.dumps(layout, separators=(',', ':'))};\n")
        f.write(f"export const EDGE = {json.dumps(edge, separators=(',', ':'))};\n")
        f.write(f"export const HELM = {json.dumps(HELM)};\n")
        f.write(f"export const CHEST = {json.dumps(CHEST)};\n")
        f.write(f"export const DYES = {json.dumps(DYES)};\n")


def write_recipes():
    rdir = os.path.join(BP, "recipes")
    shutil.rmtree(rdir, ignore_errors=True)
    for color in DYES:
        write_json(os.path.join(rdir, f"pirate_ship_{color}_wool.json"), {
            "format_version": "1.20.10",
            "minecraft:recipe_shaped": {
                "description": {"identifier": f"pirate:pirate_ship_from_{color}_wool"},
                "tags": ["crafting_table"],
                "pattern": [" W ", "WWW", "PPP"],
                "key": {"W": {"item": f"minecraft:{color}_wool"},
                        "P": {"tag": "minecraft:planks"}},
                "result": {"item": "pirate:pirate_ship"},
            },
        })


def write_helm_dye_interactions():
    """The helm entity: dye in hand -> dye sails, otherwise take the wheel."""
    path = os.path.join(BP, "entities", "ship_helm.json")
    with open(path) as f:
        helm = json.load(f)
    interactions, events = [], {}
    for i, color in enumerate(DYES):
        items = [f"minecraft:{color}_dye"] + DYE_ALIASES.get(color, [])
        interactions.append({
            "on_interact": {
                "filters": {"any_of": [
                    {"test": "has_equipment", "domain": "hand", "subject": "other", "value": it}
                    for it in items]},
                "event": f"pirate:dye_{i}", "target": "self"},
            "use_item": True,
            "interact_text": "Dye Sails",
        })
        events[f"pirate:dye_{i}"] = {"add": {"component_groups": ["pirate:dyed"]}}
    ent = helm["minecraft:entity"]
    ent["components"]["minecraft:interact"] = {"interactions": interactions}
    ent["component_groups"] = {"pirate:dyed": {}}
    ent["events"] = events
    write_json(path, helm)


def write_client_textures():
    tex = {"hull": "textures/entity/pirate_ship/hull"}
    for c in DYES:
        tex[f"sail_{c}"] = f"textures/entity/pirate_ship/sail_{c}"
    path = os.path.join(RP, "entity", "pirate_ship.entity.json")
    with open(path) as f:
        ce = json.load(f)
    ce["minecraft:client_entity"]["description"]["textures"] = tex
    write_json(path, ce)
    rc = os.path.join(RP, "render_controllers", "pirate_ship.render_controllers.json")
    with open(rc) as f:
        rcs = json.load(f)
    sails = rcs["render_controllers"]["controller.render.pirate_ship_sails"]
    sails["arrays"]["textures"]["Array.sails"] = [f"Texture.sail_{c}" for c in DYES]
    write_json(rc, rcs)


def pack(out):
    os.makedirs(DIST, exist_ok=True)
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for root_dir in (BP, RP):
            base = os.path.dirname(root_dir)
            for d, _, files in os.walk(root_dir):
                for fn in sorted(files):
                    full = os.path.join(d, fn)
                    z.write(full, os.path.relpath(full, base))


def main():
    vox = build_voxels()
    layout, edge = build_layout(vox)

    tdir = os.path.join(RP, "textures", "entity", "pirate_ship")
    os.makedirs(tdir, exist_ok=True)
    build_atlas(os.path.join(tdir, "hull.png"))
    for c in DYES:
        sail_texture(DYE_RGB[c], os.path.join(tdir, f"sail_{c}.png"))
    os.makedirs(os.path.join(RP, "textures", "items"), exist_ok=True)
    item_icon(os.path.join(RP, "textures", "items", "pirate_ship.png"))
    icon = Image.open(os.path.join(RP, "textures", "items", "pirate_ship.png"))
    framed = Image.new("RGBA", (128, 128), (70, 130, 200, 255))
    framed.alpha_composite(icon.resize((128, 128), Image.NEAREST))
    for pack_dir in (BP, RP):
        framed.save(os.path.join(pack_dir, "pack_icon.png"))

    mdir = os.path.join(RP, "models", "entity")
    write_json(os.path.join(mdir, "pirate_ship.geo.json"),
               geometry("geometry.pirate_ship", voxel_cubes(vox) + detail_cubes(), ATLAS_W, ATLAS_H),
               compact=True)
    write_json(os.path.join(mdir, "pirate_ship_sails.geo.json"),
               geometry("geometry.pirate_ship_sails", sail_cubes(), 64, 64))
    write_json(os.path.join(mdir, "pirate_ship_chest.geo.json"),
               geometry("geometry.pirate_ship_chest", chest_cubes(), ATLAS_W, ATLAS_H, (3, 2)))
    write_json(os.path.join(mdir, "pirate_ship_helm.geo.json"), empty_geometry("geometry.pirate_ship_helm"))

    write_layout_js(layout, edge)
    write_recipes()
    write_helm_dye_interactions()
    write_client_textures()

    out = os.path.join(DIST, "PirateShip.mcaddon")
    pack(out)
    n = len(voxel_cubes(vox)) + len(detail_cubes())
    print(f"hull cubes: {n}, deck cells: {len(layout)}, wrote {os.path.relpath(out, HERE)}")


if __name__ == "__main__":
    main()
