export interface Node {
  x: number;
  y: number;
  r: number;
  /** original x/y are preserved so callers can draw a leader line if they want */
  x0: number;
  y0: number;
}

/**
 * Cheap iterative de-overlap for markers on a scatter plot. Nudges nodes apart
 * along the vector between their centers. Good enough for ~130 logos; not a
 * force simulation.
 */
export function relax(nodes: Node[], iterations = 60, padding = 2): void {
  for (let it = 0; it < iterations; it += 1) {
    let moved = false;
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.01;
        const minDist = a.r + b.r + padding;
        if (dist < minDist) {
          const push = (minDist - dist) / 2;
          dx /= dist;
          dy /= dist;
          a.x -= dx * push;
          a.y -= dy * push;
          b.x += dx * push;
          b.y += dy * push;
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
}

/** pull nodes back toward their anchor so they don't drift far after relax() */
export function tether(nodes: Node[], strength = 0.05): void {
  for (const n of nodes) {
    n.x += (n.x0 - n.x) * strength;
    n.y += (n.y0 - n.y) * strength;
  }
}
