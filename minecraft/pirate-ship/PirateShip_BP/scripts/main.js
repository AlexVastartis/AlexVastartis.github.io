// Pirate Ship add-on.
//
// The ship is three entities kept together by this script:
//   pirate:ship        the big model (hull + sails); it owns position and heading
//   pirate:ship_helm   the wheel on the quarterdeck; ride it to steer the ship
//   pirate:ship_chest  the large chest in the captain's cabin
//
// Entities can't be stood on, so the script builds an invisible deck out of
// barrier blocks around each player who is aboard, and moves those players
// (plus the helm and chest) every tick the ship moves. Barriers are only ever
// placed in air or still water and are put back the moment nobody needs them.

import { world, system, ItemStack } from "@minecraft/server";
import { LAYOUT, EDGE, HELM, CHEST, DYES } from "./layout.js";

const SHIP = "pirate:ship";
const HELM_TYPE = "pirate:ship_helm";
const CHEST_TYPE = "pirate:ship_chest";
const ITEM = "pirate:pirate_ship";
const BARRIER = "minecraft:barrier";
const DIMENSIONS = ["minecraft:overworld", "minecraft:nether", "minecraft:the_end"];

const MAX_SPEED = 0.3; // blocks per tick at full sail (6 blocks/s)
const MAX_REVERSE = 0.08;
const ACCEL = 0.005;
const DRAG = 0.985;
const TURN_RATE = 1.5; // degrees per tick
const REACH = 20; // players within this distance of the ship's centre are checked
const PASSABLE = new Set([
  "minecraft:water", "minecraft:flowing_water", BARRIER, "minecraft:seagrass",
  "minecraft:tall_seagrass", "minecraft:kelp", "minecraft:kelp_plant",
  "minecraft:waterlily", "minecraft:bubble_column",
]);

/** ship id -> { x, y, z, yaw, speed, helmId, chestId, ... } ; y is the water surface */
const ships = new Map();
/** "dim|x|y|z" -> { dim, x, y, z, orig } barriers we placed */
const placed = new Map();
let barriersDirty = false;
let pendingRestore = [];
let tickCount = 0;

// ------------------------------------------------------------------ geometry

function axes(yaw) {
  const r = (yaw * Math.PI) / 180;
  const s = Math.sin(r);
  const c = Math.cos(r);
  return { fx: -s, fz: c, rx: -c, rz: -s }; // forward and sideways unit vectors
}

function toWorld(pose, a, b) {
  const A = axes(pose.yaw);
  return { x: pose.x + a * A.fx + b * A.rx, z: pose.z + a * A.fz + b * A.rz };
}

function toLocal(pose, x, z) {
  const A = axes(pose.yaw);
  const dx = x - pose.x;
  const dz = z - pose.z;
  return { a: dx * A.fx + dz * A.fz, b: dx * A.rx + dz * A.rz };
}

function levelsAt(local) {
  return LAYOUT[`${Math.round(local.a)},${Math.round(local.b)}`];
}

/** First free level at or above h in a column. */
function surfaceFrom(levels, h) {
  while (levels.includes(h)) h++;
  return h;
}

function wrapYaw(y) {
  return ((((y + 180) % 360) + 360) % 360) - 180;
}

// ------------------------------------------------------------------ blocks

function getBlock(dim, x, y, z) {
  try {
    return dim.getBlock({ x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) });
  } catch {
    return undefined;
  }
}

function isWater(block) {
  return !!block && (block.typeId === "minecraft:water" || block.typeId === "minecraft:flowing_water");
}

function isPassable(block) {
  return !!block && (block.isAir || PASSABLE.has(block.typeId));
}

/** y of the water surface (the air block above the top water block) near loc. */
function findWaterSurface(dim, loc) {
  const top = Math.floor(loc.y) + 1;
  for (let y = top; y >= top - 5; y--) {
    if (isWater(getBlock(dim, loc.x, y, loc.z)) && !isWater(getBlock(dim, loc.x, y + 1, loc.z))) {
      return y + 1;
    }
  }
  return undefined;
}

// ------------------------------------------------------------------ ship state

function partPos(st, part) {
  const p = toWorld(st, part.a, part.b);
  return { x: p.x, y: st.y + 1 + part.h, z: p.z };
}

function getState(ship) {
  let st = ships.get(ship.id);
  if (st) return st;
  const surface = ship.getDynamicProperty("pirate:surface");
  if (surface === undefined) return undefined; // not set up yet
  const loc = ship.location;
  st = {
    x: loc.x, y: surface, z: loc.z,
    yaw: ship.getDynamicProperty("pirate:yaw") ?? ship.getRotation().y,
    speed: 0,
    helmId: ship.getDynamicProperty("pirate:helm"),
    chestId: ship.getDynamicProperty("pirate:chest"),
    helmMissing: 0, chestMissing: 0, yawDirty: false,
  };
  ships.set(ship.id, st);
  return st;
}

function spawnPart(ship, st, type, part, key) {
  const e = ship.dimension.spawnEntity(type, partPos(st, part));
  e.setDynamicProperty("pirate:ship", ship.id);
  e.setRotation({ x: 0, y: st.yaw });
  st[key] = e.id;
  ship.setDynamicProperty(`pirate:${key === "helmId" ? "helm" : "chest"}`, e.id);
  return e;
}

/** Find a ship's helm or chest; respawn it only after it's been missing a while. */
function findPart(ship, st, type, part, key, missingKey, patience) {
  let e = st[key] ? world.getEntity(st[key]) : undefined;
  if (e && e.isValid) {
    st[missingKey] = 0;
    return e;
  }
  const near = ship.dimension.getEntities({ type, location: partPos(st, part), maxDistance: 8 });
  e = near.find((n) => n.getDynamicProperty("pirate:ship") === ship.id);
  if (e) {
    st[key] = e.id;
    st[missingKey] = 0;
    return e;
  }
  if (++st[missingKey] > patience) {
    st[missingKey] = 0;
    return spawnPart(ship, st, type, part, key);
  }
  return undefined;
}

function setupShip(ship) {
  if (!ship.isValid || ship.getDynamicProperty("pirate:surface") !== undefined) return;
  const dim = ship.dimension;
  const loc = ship.location;
  // Sit on the water; on dry land, rest on the keel like a ship in dry dock.
  const surface = findWaterSurface(dim, loc) ?? Math.floor(loc.y) + 3;
  // Point the bow the way the placing player is looking.
  let yaw = 0;
  const placer = dim.getPlayers({ location: loc, maxDistance: 12, closest: 1 })[0];
  if (placer) yaw = placer.getRotation().y;
  ship.setDynamicProperty("pirate:surface", surface);
  ship.setDynamicProperty("pirate:yaw", yaw);
  ship.teleport({ x: loc.x, y: surface, z: loc.z }, { rotation: { x: 0, y: yaw } });
  const st = getState(ship);
  st.x = loc.x;
  st.z = loc.z;
  spawnPart(ship, st, HELM_TYPE, HELM, "helmId");
  spawnPart(ship, st, CHEST_TYPE, CHEST, "chestId");
}

// ------------------------------------------------------------------ sailing

function blocked(dim, pose) {
  if (!isWater(getBlock(dim, pose.x, pose.y - 1, pose.z))) return true; // needs water under the keel
  for (const [a, b] of EDGE) {
    const p = toWorld(pose, a, b);
    for (let dy = -1; dy <= 1; dy++) {
      if (!isPassable(getBlock(dim, p.x, pose.y + dy, p.z))) return true;
    }
  }
  return false;
}

function readHelm(captain, st) {
  try {
    const v = captain.inputInfo.getMovementVector();
    return { throttle: v.y, turn: v.x };
  } catch {
    // Fallback: sail where the captain looks; look down to slow down.
    const rot = captain.getRotation();
    const diff = wrapYaw(rot.y - st.yaw);
    return { throttle: rot.x > 50 ? -1 : 1, turn: Math.max(-1, Math.min(1, -diff / 30)) };
  }
}

function isRiding(player) {
  try {
    return !!player.getComponent("minecraft:riding");
  } catch {
    return false;
  }
}

/** Is a player standing (or jumping) on this ship? */
function aboard(st, loc) {
  const local = toLocal(st, loc.x, loc.z);
  const feet = loc.y - (st.y + 1);
  const levels = levelsAt(local);
  return levels && feet > -4.5 && feet < 22 ? { local, feet, levels } : undefined;
}

function tickShip(ship, dim, desired) {
  const st = getState(ship);
  if (!st) return;

  // Nothing else is allowed to move the ship.
  const loc = ship.location;
  if (Math.abs(loc.x - st.x) + Math.abs(loc.y - st.y) + Math.abs(loc.z - st.z) > 0.01) {
    ship.teleport({ x: st.x, y: st.y, z: st.z }, { rotation: { x: 0, y: st.yaw } });
  }

  const helm = findPart(ship, st, HELM_TYPE, HELM, "helmId", "helmMissing", 40);
  const chest = findPart(ship, st, CHEST_TYPE, CHEST, "chestId", "chestMissing", 200);
  const riders = helm?.getComponent("minecraft:rideable")?.getRiders() ?? [];
  const captain = riders.find((r) => r.typeId === "minecraft:player");

  // --- steering
  let dYaw = 0;
  if (captain) {
    const { throttle, turn } = readHelm(captain, st);
    if (throttle > 0.2) st.speed = Math.min(MAX_SPEED, st.speed + ACCEL * throttle);
    else if (throttle < -0.2) st.speed = Math.max(-MAX_REVERSE, st.speed + ACCEL * 2 * throttle);
    else st.speed *= DRAG;
    // Positive x on the movement vector is "left"; turning left lowers the yaw.
    if (Math.abs(turn) > 0.1) dYaw = -turn * TURN_RATE * (0.4 + (0.6 * Math.abs(st.speed)) / MAX_SPEED);
    if (tickCount % 10 === 0) {
      const knots = Math.round(Math.abs(st.speed) * 20 * 10) / 10;
      captain.onScreenDisplay.setActionBar(
        `Speed ${knots} blocks/s  |  W/S sails  A/D steer  Sneak to leave the helm`
      );
    }
  } else {
    st.speed *= 0.95;
  }
  if (Math.abs(st.speed) < 0.002) st.speed = 0;

  // --- move, unless we'd hit land
  const old = { x: st.x, y: st.y, z: st.z, yaw: st.yaw };
  let next;
  if (st.speed !== 0 || dYaw !== 0) {
    const yaw = wrapYaw(st.yaw + dYaw);
    const A = axes(yaw);
    next = { x: st.x + A.fx * st.speed, y: st.y, z: st.z + A.fz * st.speed, yaw };
    if (blocked(dim, next)) {
      st.speed = 0;
      next = dYaw !== 0 ? { ...old, yaw } : undefined;
      if (next && blocked(dim, next)) next = undefined;
    }
  }

  const players = dim.getPlayers({ location: { x: st.x, y: st.y, z: st.z }, maxDistance: REACH });
  const newPos = new Map();

  if (next) {
    const turned = next.yaw - old.yaw;
    Object.assign(st, { x: next.x, z: next.z, yaw: next.yaw, yawDirty: true });
    ship.teleport({ x: st.x, y: st.y, z: st.z }, { rotation: { x: 0, y: st.yaw } });
    // carry everyone on deck along
    for (const p of players) {
      if (isRiding(p)) continue;
      const on = aboard(old, p.location);
      if (!on) continue;
      const w = toWorld(st, on.local.a, on.local.b);
      const pos = { x: w.x, y: p.location.y, z: w.z };
      const opts = { keepVelocity: true };
      if (turned !== 0) {
        const r = p.getRotation();
        opts.rotation = { x: r.x, y: r.y + turned };
      }
      p.teleport(pos, opts);
      newPos.set(p.id, pos);
    }
  }
  if (next || tickCount % 20 === 0) {
    helm?.teleport(partPos(st, HELM), { rotation: { x: 0, y: st.yaw } });
    chest?.teleport(partPos(st, CHEST), { rotation: { x: 0, y: st.yaw } });
  }
  if (st.yawDirty && (tickCount % 20 === 0 || !next)) {
    ship.setDynamicProperty("pirate:yaw", st.yaw);
    st.yawDirty = false;
  }

  // --- the invisible deck
  const deckY = st.y + 1;
  for (const p of players) {
    if (isRiding(p)) continue;
    const loc = newPos.get(p.id) ?? p.location;
    const on = aboard(st, loc);
    if (!on) continue;
    const { feet, levels } = on;

    // Climb aboard from the water, or step out of a wall the ship turned into.
    let lift;
    const inside = Math.floor(feet + 0.05);
    if (feet < -1) lift = surfaceFrom(levels, -1);
    else if (levels.includes(inside) && feet - inside < 0.9) lift = surfaceFrom(levels, inside);
    if (lift !== undefined) {
      p.teleport({ x: loc.x, y: deckY + lift, z: loc.z });
      continue; // the barriers follow next tick
    }

    const hf = Math.floor(feet);
    const bx = Math.floor(loc.x);
    const bz = Math.floor(loc.z);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const cell = levelsAt(toLocal(st, bx + dx + 0.5, bz + dz + 0.5));
        if (!cell) continue;
        for (const h of cell) {
          if (h < hf - 1 || h > hf + 2) continue;
          const y = deckY + h;
          desired.set(`${dim.id}|${bx + dx}|${y}|${bz + dz}`, { dim: dim.id, x: bx + dx, y, z: bz + dz });
        }
      }
    }
  }
}

// ------------------------------------------------------------------ barriers

function syncBarriers(desired) {
  for (const [key, spot] of desired) {
    if (placed.has(key)) continue;
    const block = getBlock(world.getDimension(spot.dim), spot.x, spot.y, spot.z);
    if (!block) continue;
    let orig;
    if (block.isAir) orig = "minecraft:air";
    else if (block.typeId === "minecraft:water" && block.permutation.getState("liquid_depth") === 0) {
      orig = "minecraft:water";
    } else continue; // never replace anything real
    block.setType(BARRIER);
    placed.set(key, { ...spot, orig });
    barriersDirty = true;
  }
  for (const [key, spot] of placed) {
    if (desired.has(key)) continue;
    if (restore(spot)) {
      placed.delete(key);
      barriersDirty = true;
    }
  }
  if (barriersDirty && tickCount % 20 === 0) {
    world.setDynamicProperty(
      "pirate:barriers",
      JSON.stringify([...placed.values(), ...pendingRestore])
    );
    barriersDirty = false;
  }
}

/** Put a spot back how we found it. False if its chunk isn't loaded yet. */
function restore(spot) {
  const block = getBlock(world.getDimension(spot.dim), spot.x, spot.y, spot.z);
  if (!block) return false;
  if (block.typeId === BARRIER) block.setType(spot.orig);
  return true;
}

function restoreLeftovers() {
  // Barriers saved from a previous session (e.g. the world was closed mid-voyage).
  if (tickCount === 1) {
    try {
      pendingRestore = JSON.parse(world.getDynamicProperty("pirate:barriers") ?? "[]");
    } catch {
      pendingRestore = [];
    }
  }
  if (pendingRestore.length === 0) return;
  const before = pendingRestore.length;
  pendingRestore = pendingRestore.filter((spot) => !restore(spot));
  if (pendingRestore.length !== before) barriersDirty = true;
}

// ------------------------------------------------------------------ breaking & dyeing

function dropContents(chest) {
  const container = chest.getComponent("minecraft:inventory")?.container;
  if (!container) return;
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (item) chest.dimension.spawnItem(item, chest.location);
  }
  container.clearAll();
}

function breakShip(shipId, dim, at) {
  const ship = shipId ? world.getEntity(shipId) : undefined;
  const st = ships.get(shipId);
  const chestId = st?.chestId ?? ship?.getDynamicProperty("pirate:chest");
  const chest = chestId ? world.getEntity(chestId) : undefined;
  if (chest?.isValid) {
    dropContents(chest);
    chest.remove();
  }
  if (ship?.isValid) ship.remove();
  ships.delete(shipId);
  dim.spawnItem(new ItemStack(ITEM, 1), at);
}

world.afterEvents.entityDie.subscribe(
  (ev) => {
    const helm = ev.deadEntity;
    let shipId;
    try {
      shipId = helm.getDynamicProperty("pirate:ship");
    } catch {}
    if (!shipId) {
      for (const [id, st] of ships) if (st.helmId === helm.id) shipId = id;
    }
    const dim = helm.dimension;
    const at = helm.location;
    system.run(() => breakShip(shipId, dim, at));
  },
  { entityTypes: [HELM_TYPE] }
);

world.afterEvents.dataDrivenEntityTrigger.subscribe(
  (ev) => {
    const m = /^pirate:dye_(\d+)$/.exec(ev.eventId);
    if (!m) return;
    const ship = world.getEntity(ev.entity.getDynamicProperty("pirate:ship") ?? "");
    if (ship?.isValid) {
      ship.setProperty("pirate:sail_color", Number(m[1]));
      ship.dimension.playSound("dye.use", ev.entity.location);
    }
  },
  { entityTypes: [HELM_TYPE] }
);

world.afterEvents.entitySpawn.subscribe((ev) => {
  if (ev.entity.typeId === SHIP) system.run(() => setupShip(ev.entity));
});

// Helms and chests whose ship is gone for good (e.g. removed with /kill).
const orphanTicks = new Map();
function cleanOrphans(dim) {
  for (const type of [HELM_TYPE, CHEST_TYPE]) {
    for (const e of dim.getEntities({ type })) {
      const ship = world.getEntity(e.getDynamicProperty("pirate:ship") ?? "");
      if (ship?.isValid) {
        orphanTicks.delete(e.id);
        continue;
      }
      const n = (orphanTicks.get(e.id) ?? 0) + 20;
      orphanTicks.set(e.id, n);
      if (n >= 200) {
        orphanTicks.delete(e.id);
        // Never throw away loot: a chest with items in it stays until emptied.
        const inv = e.getComponent("minecraft:inventory")?.container;
        if (type === CHEST_TYPE && inv && inv.emptySlotsCount < inv.size) continue;
        e.remove();
      }
    }
  }
}

// ------------------------------------------------------------------ main loop

system.runInterval(() => {
  tickCount++;
  restoreLeftovers();
  const desired = new Map();
  for (const id of DIMENSIONS) {
    let dim;
    let list;
    try {
      dim = world.getDimension(id);
      list = dim.getEntities({ type: SHIP });
    } catch {
      continue;
    }
    for (const ship of list) {
      try {
        if (ship.getDynamicProperty("pirate:surface") === undefined) setupShip(ship);
        tickShip(ship, dim, desired);
      } catch (e) {
        if (tickCount % 100 === 0) console.warn(`[pirate ship] ${e}`);
      }
    }
    if (tickCount % 20 === 0) {
      try {
        cleanOrphans(dim);
      } catch {}
    }
  }
  try {
    syncBarriers(desired);
  } catch (e) {
    if (tickCount % 100 === 0) console.warn(`[pirate ship] ${e}`);
  }
}, 1);

console.log(`[pirate ship] loaded (${DYES.length} sail colours)`);
