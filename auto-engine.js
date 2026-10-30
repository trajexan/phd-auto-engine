/* phd auto-engine 2020 — pull via GET /api/auto-engine */
"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/data/autoplay/combatEvents.ts
  var AUTOPLAY_TRAITS_DEFAULT = {
    "risk": 0.32,
    "greed": 0.35,
    "foodCaution": 0.72,
    "goldChase": 0.35,
    "aggression": 0.38,
    "patience": 0.68
  };
  var AUTOPLAY_DEATH_CATEGORIES = [
    {
      "id": "unprepared_gold_chase",
      "label": "Chased gold unprepared",
      "when": "Chose chase/engage on gold while food<=2 or hpPct<0.45, then died in that fight or within 1 floor"
    },
    {
      "id": "elite_overreach",
      "label": "Elite overreach",
      "when": "Engaged elite/alpha while hpPct<0.5 or under-tier kit, died in that fight"
    },
    {
      "id": "pack_wipe",
      "label": "Pack wipe",
      "when": "Chose fight_pack (not pull) vs 3+ trash and died"
    },
    {
      "id": "boss_undergeared",
      "label": "Boss undergeared",
      "when": "Entered boss door with kit age behind floor age or food<=1, died to boss"
    },
    {
      "id": "starved",
      "label": "Starved / no food",
      "when": "food==0 and died to chip/trash attrition"
    },
    {
      "id": "trash_attrition",
      "label": "Trash attrition",
      "when": "Died to ordinary trash with food>0, no open special fork"
    },
    {
      "id": "fled_into_ambush",
      "label": "Fled into ambush",
      "when": "Chose flee/ignore and still died same floor (sim: flee fails into pack)"
    },
    {
      "id": "stairs_too_late",
      "label": "Stairs too late",
      "when": "Declined stairs while hp critical, died clearing remainder"
    }
  ];
  var AUTOPLAY_COMBAT_EVENTS = [
    {
      "id": "gold_low_food",
      "kind": "combat",
      "title": "Gold with thin food",
      "prompt": "A gold mob flees across the floor. Food is almost gone. Chase?",
      "trigger": {
        "gold": true,
        "food_lte": 2
      },
      "policy_default": "ask",
      "options": [
        {
          "id": "chase",
          "label": "Chase",
          "weights": {
            "goldChase": 1.2,
            "greed": 0.8,
            "risk": 0.6,
            "foodCaution": -1,
            "patience": -0.4
          },
          "death_if_fatal": "unprepared_gold_chase"
        },
        {
          "id": "ignore",
          "label": "Let it go",
          "weights": {
            "foodCaution": 1,
            "patience": 0.8,
            "goldChase": -0.8,
            "greed": -0.5
          },
          "death_if_fatal": null
        },
        {
          "id": "eat_then_chase",
          "label": "Eat first, then chase",
          "requires_food": 1,
          "weights": {
            "foodCaution": 0.9,
            "goldChase": 0.7,
            "patience": 0.4,
            "risk": 0.2
          },
          "death_if_fatal": "unprepared_gold_chase"
        }
      ]
    },
    {
      "id": "gold_fleeing",
      "kind": "combat",
      "title": "Fleeing gold",
      "prompt": "Gold is kiting. Commit to the chase or cut losses?",
      "trigger": {
        "gold": true,
        "food_gt": 2
      },
      "policy_default": "auto",
      "options": [
        {
          "id": "chase",
          "label": "Chase",
          "weights": {
            "goldChase": 1.4,
            "aggression": 0.6,
            "greed": 0.7,
            "patience": -0.3
          },
          "death_if_fatal": "unprepared_gold_chase"
        },
        {
          "id": "ignore",
          "label": "Ignore",
          "weights": {
            "patience": 0.9,
            "foodCaution": 0.4,
            "goldChase": -1
          },
          "death_if_fatal": null
        }
      ]
    },
    {
      "id": "elite_fov",
      "kind": "combat",
      "title": "Elite in FOV",
      "prompt": "An elite is in sight. HP not full. Engage, kite, or flee?",
      "trigger": {
        "elite": true,
        "hp_pct_lt": 1
      },
      "policy_default": "auto",
      "options": [
        {
          "id": "engage",
          "label": "Engage",
          "weights": {
            "aggression": 1.1,
            "risk": 0.7,
            "patience": -0.5
          },
          "death_if_fatal": "elite_overreach"
        },
        {
          "id": "eat_engage",
          "label": "Eat then engage",
          "requires_food": 1,
          "weights": {
            "foodCaution": 0.8,
            "aggression": 0.6,
            "patience": 0.3
          },
          "death_if_fatal": "elite_overreach"
        },
        {
          "id": "flee",
          "label": "Flee toward stairs",
          "weights": {
            "foodCaution": 0.7,
            "patience": 0.9,
            "risk": -0.8,
            "aggression": -0.6
          },
          "death_if_fatal": "fled_into_ambush"
        }
      ]
    },
    {
      "id": "pack_vs_pull",
      "kind": "combat",
      "title": "Pack in the corridor",
      "prompt": "Three or more trash block the hall. Pull one, or fight the pack?",
      "trigger": {
        "trash_gte": 3
      },
      "policy_default": "auto",
      "options": [
        {
          "id": "pull",
          "label": "Pull one",
          "weights": {
            "patience": 1,
            "foodCaution": 0.5,
            "aggression": -0.4,
            "risk": -0.3
          },
          "death_if_fatal": null
        },
        {
          "id": "fight_pack",
          "label": "Fight the pack",
          "weights": {
            "aggression": 1.2,
            "risk": 0.9,
            "patience": -0.7
          },
          "death_if_fatal": "pack_wipe"
        },
        {
          "id": "flee",
          "label": "Back off",
          "weights": {
            "patience": 0.6,
            "risk": -0.5,
            "foodCaution": 0.4
          },
          "death_if_fatal": "fled_into_ambush"
        }
      ]
    },
    {
      "id": "boss_door",
      "kind": "combat",
      "title": "Boss door",
      "prompt": "Boss gate. Food and kit look thin. Enter, retreat, or eat first?",
      "trigger": {
        "boss_floor": true
      },
      "policy_default": "ask",
      "options": [
        {
          "id": "enter",
          "label": "Enter",
          "weights": {
            "risk": 1,
            "aggression": 0.8,
            "patience": -0.4,
            "foodCaution": -0.5
          },
          "death_if_fatal": "boss_undergeared"
        },
        {
          "id": "eat_enter",
          "label": "Eat then enter",
          "requires_food": 1,
          "weights": {
            "foodCaution": 0.9,
            "risk": 0.4,
            "patience": 0.3
          },
          "death_if_fatal": "boss_undergeared"
        },
        {
          "id": "retreat",
          "label": "Retreat / skip age push",
          "weights": {
            "patience": 1.1,
            "foodCaution": 0.8,
            "risk": -1
          },
          "death_if_fatal": null
        }
      ]
    },
    {
      "id": "hp_critical_stairs",
      "kind": "depth_risk",
      "title": "Stairs while bleeding",
      "prompt": "Stairs are open. HP critical. Take stairs now or clear remaining for XP?",
      "trigger": {
        "hp_pct_lt": 0.35,
        "stairs_open": true,
        "trash_gte": 1
      },
      "policy_default": "ask",
      "options": [
        {
          "id": "stairs",
          "label": "Take stairs",
          "weights": {
            "foodCaution": 0.7,
            "patience": 0.5,
            "risk": -0.6,
            "aggression": -0.4
          },
          "death_if_fatal": null
        },
        {
          "id": "clear",
          "label": "Clear remainder",
          "weights": {
            "greed": 0.8,
            "aggression": 0.7,
            "risk": 0.6,
            "patience": -0.5
          },
          "death_if_fatal": "stairs_too_late"
        },
        {
          "id": "eat_clear",
          "label": "Eat then clear",
          "requires_food": 1,
          "weights": {
            "foodCaution": 0.6,
            "greed": 0.5,
            "patience": 0.2
          },
          "death_if_fatal": "stairs_too_late"
        }
      ]
    },
    {
      "id": "eat_now",
      "kind": "resource",
      "title": "Eat now?",
      "prompt": "HP low. Eat a fish now, or save food for a worse floor?",
      "trigger": {
        "hp_pct_lt": 0.45,
        "food_gte": 1
      },
      "policy_default": "auto",
      "options": [
        {
          "id": "eat",
          "label": "Eat",
          "requires_food": 1,
          "weights": {
            "foodCaution": 1.2,
            "patience": 0.3,
            "greed": -0.2
          },
          "death_if_fatal": null
        },
        {
          "id": "save",
          "label": "Save food",
          "weights": {
            "greed": 0.5,
            "patience": 0.4,
            "foodCaution": -0.9,
            "risk": 0.4
          },
          "death_if_fatal": null
        }
      ]
    }
  ];

  // src/systems/autoplayHierarchy1001.ts
  var UTILITY_WEIGHTS = {
    wV: 1,
    wC: 1,
    wR: 2,
    wT: 0.05,
    wP: 1.5
  };
  var LOCAL_GEAR = {
    bronze_dagger: { id: "bronze_dagger", tier: 1, maxRoom: 6, slot: "weapon", style: "melee", sellPrice: 8 },
    bronze_sword: { id: "bronze_sword", tier: 1, maxRoom: 8, slot: "weapon", style: "melee", sellPrice: 18 },
    bronze_longsword: { id: "bronze_longsword", tier: 1, maxRoom: 10, slot: "weapon", style: "melee", sellPrice: 28 },
    bronze_chainmail: { id: "bronze_chainmail", tier: 1, maxRoom: 4, slot: "armour", style: "melee", sellPrice: 40 },
    bronze_plate: { id: "bronze_plate", tier: 1, maxRoom: 6, slot: "armour", style: "melee", sellPrice: 70 },
    iron_dagger: { id: "iron_dagger", tier: 2, maxRoom: 10, slot: "weapon", style: "melee", sellPrice: 25 },
    iron_sword: { id: "iron_sword", tier: 2, maxRoom: 12, slot: "weapon", style: "melee", sellPrice: 45 },
    iron_chainmail: { id: "iron_chainmail", tier: 2, maxRoom: 6, slot: "armour", style: "melee", sellPrice: 80 },
    iron_plate: { id: "iron_plate", tier: 2, maxRoom: 8, slot: "armour", style: "melee", sellPrice: 120 },
    oak_wand: { id: "oak_wand", tier: 1, maxRoom: 6, slot: "weapon", style: "magic", sellPrice: 12 },
    oak_shortbow: { id: "oak_shortbow", tier: 1, maxRoom: 6, slot: "weapon", style: "ranged", sellPrice: 14 }
  };
  function cheb(ax, ay, bx, by) {
    return Math.max(Math.abs(ax - bx), Math.abs(ay - by));
  }
  function scoreOpt(o, w = UTILITY_WEIGHTS) {
    return w.wV * o.value - w.wC * o.cost - w.wR * o.risk - w.wT * o.travel + w.wP * o.progress;
  }
  function pickUtility(opts) {
    if (!opts.length) return null;
    let best = opts[0];
    let bestS = scoreOpt(best);
    for (let i = 1; i < opts.length; i++) {
      const s = scoreOpt(opts[i]);
      if (s > bestS) {
        best = opts[i];
        bestS = s;
      }
    }
    return best;
  }
  function lookupGear(host, id) {
    var _a;
    if (host.gearStats) {
      const g2 = host.gearStats(id);
      if (g2) return g2;
    }
    return (_a = LOCAL_GEAR[id]) != null ? _a : null;
  }
  function nodeThreat(w, x, y) {
    return w.foes.some(
      (f) => f.alive && f.lit && cheb(f.x, f.y, x, y) <= 2 && (f.danger === "threat" || f.danger === "deadly" || f.elite || f.boss)
    );
  }
  function upsertNode(map, kind, tile, w) {
    if (!tile) return;
    const safe = !nodeThreat(w, tile.x, tile.y);
    const exact = `${w.depth}:${kind}:${tile.x},${tile.y}`;
    map.set(exact, { kind, x: tile.x, y: tile.y, safe, depth: w.depth });
    map.set(`${w.depth}:${kind}`, { kind, x: tile.x, y: tile.y, safe, depth: w.depth });
  }
  function registerSeenNodes(map, w, extra) {
    var _a;
    const s = w.seen;
    if (s) {
      upsertNode(map, "rock", s.rock, w);
      upsertNode(map, "tree", s.tree, w);
      upsertNode(map, "pond", s.pond, w);
      upsertNode(map, "shop", s.shop, w);
      upsertNode(map, "anvil", s.anvil, w);
      upsertNode(map, "altar", s.altar, w);
      upsertNode(map, "chest", (_a = s.chestAdj) != null ? _a : s.chest, w);
    }
    if (w.hub) upsertNode(map, "hub", w.hub, w);
    const farm = extra == null ? void 0 : extra.lastFoodFarm;
    if (farm && farm.depth === w.depth) upsertNode(map, "pond", farm, w);
  }
  function memNode(map, kind, w) {
    var _a, _b, _c;
    const hit = map.get(`${w.depth}:${kind}`);
    if (hit) return { x: hit.x, y: hit.y };
    const s = w.seen;
    if (kind === "hub") return (_a = w.hub) != null ? _a : null;
    if (!s) return null;
    if (kind === "rock") return s.rock;
    if (kind === "tree") return s.tree;
    if (kind === "pond") return (_b = s.pond) != null ? _b : w.pondKnown && w.gather ? w.gather : null;
    if (kind === "shop") return s.shop;
    if (kind === "anvil") return s.anvil;
    if (kind === "altar") return s.altar;
    if (kind === "chest") return (_c = s.chestAdj) != null ? _c : s.chest;
    return null;
  }
  function buildRoundTrip(map, w, farmRange = 40) {
    const seen = /* @__PURE__ */ new Set();
    const nodes = [];
    for (const n of map.values()) {
      if (n.depth !== w.depth || !n.safe || n.kind === "hub") continue;
      const k = `${n.kind}:${n.x},${n.y}`;
      if (seen.has(k)) continue;
      seen.add(k);
      if (cheb(w.tile.x, w.tile.y, n.x, n.y) > farmRange) continue;
      nodes.push(n);
    }
    if (nodes.length < 2) return nodes;
    const path = [];
    const left = nodes.slice();
    let cx = w.tile.x;
    let cy = w.tile.y;
    while (left.length) {
      let bi = 0;
      let bd = Infinity;
      for (let i = 0; i < left.length; i++) {
        const d = cheb(cx, cy, left[i].x, left[i].y);
        if (d < bd) {
          bd = d;
          bi = i;
        }
      }
      const n = left.splice(bi, 1)[0];
      path.push(n);
      cx = n.x;
      cy = n.y;
    }
    let improved = true;
    while (improved && path.length >= 4) {
      improved = false;
      for (let i = 0; i < path.length - 2; i++) {
        for (let k = i + 2; k < path.length; k++) {
          const ax = i === 0 ? w.tile.x : path[i - 1].x;
          const ay = i === 0 ? w.tile.y : path[i - 1].y;
          const d0 = cheb(ax, ay, path[i].x, path[i].y) + cheb(path[k - 1].x, path[k - 1].y, path[k].x, path[k].y);
          const d1 = cheb(ax, ay, path[k - 1].x, path[k - 1].y) + cheb(path[i].x, path[i].y, path[k].x, path[k].y);
          if (d1 + 0.01 < d0) {
            const rev = path.slice(i, k).reverse();
            path.splice(i, k - i, ...rev);
            improved = true;
          }
        }
      }
    }
    return path.slice(0, 4);
  }
  function freshHierarchyState() {
    return {
      phase: "BOOT",
      phaseResume: null,
      topEvent: "none",
      utilityPick: "",
      queue: [],
      lockedMats: false,
      nodes: /* @__PURE__ */ new Map(),
      forgeMissStreak: 0,
      progressDelta: 0
    };
  }
  function statusTag(h) {
    const u = h.utilityPick ? `~${h.utilityPick}` : "";
    return `${h.phase}/${h.topEvent}${u}`;
  }
  function bootstrapTool(host, w, map) {
    const s = w.seen;
    const has = (kind) => !!(map && map.get(`${w.depth}:${kind}`));
    const R = !!(s == null ? void 0 : s.rock) || has("rock");
    const T = !!(s == null ? void 0 : s.tree) || has("tree");
    const P = !!(s == null ? void 0 : s.pond) || w.pondKnown || has("pond");
    const A = !!(s == null ? void 0 : s.anvil) || w.anvilNearby || has("anvil");
    const S = !!(s == null ? void 0 : s.shop) || has("shop");
    if (!R && !T && !P && !A) return null;
    if (A && R && S && !host.hasTool("pickaxe")) return "pickaxe";
    if (A && R && !host.hasTool("pickaxe")) return "pickaxe";
    if (P && !host.hasTool("rod")) return "rod";
    if (T && !host.hasTool("hatchet")) return "hatchet";
    if (R && !host.hasTool("pickaxe")) return "pickaxe";
    return null;
  }
  function canEarlyPush(w, stance) {
    if (!stance.stocked && w.food < stance.minFood) return false;
    const kit = w.kitReady || w.hasMetalWeapon && w.hasArmour || w.hasStyleWeapon;
    if (!kit && !w.descendSafe) return false;
    return !!(w.stairsLit || w.stairs) && (w.descendSafe || kit);
  }
  function advancePhase(h, w, stance) {
    const s = w.seen;
    const has = (kind) => !!h.nodes.get(`${w.depth}:${kind}`);
    if (h.phase === "BOOT") h.phase = "MAP_HUB";
    if (h.phase === "PUSH") h.phase = "GEAR_FARM";
    if (!stance.hungry && h.phaseResume && h.phase === "FOOD_BUFFER") {
      h.phase = h.phaseResume;
      h.phaseResume = null;
    }
    if (h.phase === "MAP_HUB" && (w.hub || (s == null ? void 0 : s.anvil) || (s == null ? void 0 : s.shop) || (s == null ? void 0 : s.rock) || (s == null ? void 0 : s.pond) || (s == null ? void 0 : s.tree) || has("anvil") || has("shop") || has("rock") || has("pond") || has("tree"))) {
      const needTools = !!((s == null ? void 0 : s.rock) || has("rock")) || !!((s == null ? void 0 : s.tree) || has("tree")) || !!((s == null ? void 0 : s.pond) || w.pondKnown || has("pond"));
      if (needTools) h.phase = "TOOLS";
      else if (!w.hasMetalWeapon && !w.hasStyleWeapon) h.phase = "FIRST_WEP";
      else h.phase = "GEAR_FARM";
    }
    if (h.phase === "TOOLS") {
    }
    if ((w.hasMetalWeapon || w.hasStyleWeapon) && h.phase === "FIRST_WEP") {
      h.phase = "GEAR_FARM";
    }
  }
  function calmUtilOptions(w, stance, map) {
    const opts = [];
    const t = w.tile;
    const empty = /* @__PURE__ */ new Map();
    const nodes = map != null ? map : empty;
    const rock = memNode(nodes, "rock", w);
    const tree = memNode(nodes, "tree", w);
    const pond = memNode(nodes, "pond", w);
    const anvil = memNode(nodes, "anvil", w);
    const shop = memNode(nodes, "shop", w);
    if (rock) {
      const d = cheb(t.x, t.y, rock.x, rock.y);
      opts.push({
        id: "mine",
        label: "mine",
        value: 6 + w.oreCount,
        cost: 1,
        risk: nodeThreat(w, rock.x, rock.y) ? 2 : 0,
        travel: d,
        progress: !w.hasMetalWeapon ? 2 : 1
      });
    }
    if (tree) {
      const d = cheb(t.x, t.y, tree.x, tree.y);
      opts.push({
        id: "chop",
        label: "chop",
        value: 4 + w.logCount,
        cost: 1,
        risk: nodeThreat(w, tree.x, tree.y) ? 2 : 0,
        travel: d,
        progress: w.hasStyleWeapon ? 0.5 : 1.2
      });
    }
    if (pond) {
      const d = cheb(t.x, t.y, pond.x, pond.y);
      opts.push({
        id: "fish",
        label: "fish",
        value: stance.hungry ? 10 : 3,
        cost: 1,
        risk: nodeThreat(w, pond.x, pond.y) ? 2 : 0,
        travel: d,
        progress: stance.stocked ? 0.3 : 1.5
      });
    }
    if (anvil) {
      const d = cheb(t.x, t.y, anvil.x, anvil.y);
      opts.push({
        id: "anvil",
        label: "anvil forge",
        value: 8,
        cost: w.oreCount < 1 ? 3 : 0,
        risk: nodeThreat(w, anvil.x, anvil.y) ? 2 : 0,
        travel: d,
        progress: 2
      });
    }
    if (shop && (w.bagFree <= 2 || w.oreCount > 5)) {
      const d = cheb(t.x, t.y, shop.x, shop.y);
      opts.push({
        id: "shop",
        label: "shop trim",
        value: 5,
        cost: 0,
        risk: 0,
        travel: d,
        progress: 0.5
      });
    }
    if (w.logCount >= 2) {
      opts.push({
        id: "fletch",
        label: "fletch value",
        value: 4,
        cost: 0,
        risk: 0,
        travel: 0,
        progress: 0.8
      });
    }
    return opts;
  }

  // src/systems/autoplayScan2001.ts
  var SCAN_PERIOD = 8;
  var ENROUTE_STOPS_MAX = 8;
  var ON_WAY_CHEB = 4;
  var NEAR_FORGE_CHEB = 6;
  var SHRIMP_ENROUTE_CHEB = 6;
  var SCAN_FLIP = {
    none: 0,
    chest_safe: 1,
    loot_hv: 2,
    soft_exp: 3,
    depleted: 4,
    stairs_open: 5,
    fire: 6,
    pond_safe: 7,
    door: 8,
    pit: 9,
    station: 10,
    corpse: 11,
    bag_pressure: 12
  };
  function freshScanState() {
    return {
      lastScanTick: -9999,
      lastFlip: SCAN_FLIP.none,
      prevStatus: /* @__PURE__ */ new Map(),
      enrouteStops: [],
      wantLootQueue: [],
      pendingHighFlip: null,
      atTileLoot: null,
      layer2UsedTick: -9999
    };
  }
  function scanAge(scan, runTicks) {
    if (scan.lastScanTick < 0) return 255;
    return Math.min(255, Math.max(0, runTicks - scan.lastScanTick));
  }
  function pathOnWay(target, desire, hero, k = ON_WAY_CHEB) {
    if (cheb(target.x, target.y, hero.x, hero.y) <= 1) return true;
    if (!desire) return cheb(target.x, target.y, hero.x, hero.y) <= k;
    const ax = hero.x;
    const ay = hero.y;
    const bx = desire.x;
    const by = desire.y;
    const steps = Math.max(1, cheb(ax, ay, bx, by));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const sx = Math.round(ax + (bx - ax) * t);
      const sy = Math.round(ay + (by - ay) * t);
      if (cheb(target.x, target.y, sx, sy) <= k) return true;
    }
    return false;
  }
  function nearForgeOrShop(target, nodes, depth, k = NEAR_FORGE_CHEB) {
    for (const kind of ["anvil", "shop"]) {
      const n = nodes.get(`${depth}:${kind}`);
      if (n && cheb(target.x, target.y, n.x, n.y) <= k) return true;
    }
    return false;
  }
  function softBlockBypass(chestAdj, softActive, desire, hero, nodes, depth) {
    if (!softActive) return true;
    if (pathOnWay(chestAdj, desire, hero)) return true;
    if (nearForgeOrShop(chestAdj, nodes, depth)) return true;
    return false;
  }
  function phaseAllowsChestEvent(phase, onWay) {
    if (phase === "TOOLS" || phase === "FIRST_WEP") return "event";
    if (phase === "GEAR_FARM" || phase === "MAP_HUB" || phase === "PUSH") {
      return onWay ? "event" : "queue";
    }
    if (phase === "FOOD_BUFFER" || phase === "CEILING" || phase === "SELL_TRIM" || phase === "GATHER_FUND") {
      return onWay ? "event" : "suppress";
    }
    return onWay ? "event" : "queue";
  }
  function wantPickItem(opts) {
    if (opts.markedSpecial) return true;
    const { bagFree, kindBand, value, bestBagJunkValue, foodNeeded, shopAhead } = opts;
    if (bagFree > 0) {
      if (kindBand === 3) return true;
      if (kindBand === 1 && foodNeeded) return true;
      if (kindBand === 2) return true;
      if (kindBand === 4 && shopAhead && value > 0) return true;
      if (value > 0) return true;
      return false;
    }
    if (kindBand === 2 && value > bestBagJunkValue) return true;
    if (kindBand === 3 && value > bestBagJunkValue) return true;
    if (value > bestBagJunkValue && value > 0) return true;
    return false;
  }
  function enroutePri(stop) {
    if (stop.pri != null) return stop.pri;
    if (stop.hv) return stop.kind === "chest" || stop.kind === "loot" ? 70 : 60;
    switch (stop.kind) {
      case "pond":
        return 80;
      // food high-pri calm — next, not emerg (t1648/t1650)
      case "chest":
        return 50;
      case "loot":
        return 30;
      case "tree":
      case "rock":
        return 25;
      case "shop":
      case "anvil":
        return 40;
      case "altar":
        return 15;
      case "stairs":
        return 20;
      default:
        return 10;
    }
  }
  function pushEnrouteStop(scan, stop) {
    if (scan.enrouteStops.some((s) => s.id === stop.id)) return;
    const pri = enroutePri(stop);
    stop = { ...stop, pri };
    if (scan.enrouteStops.length >= ENROUTE_STOPS_MAX) {
      let dropIdx = -1;
      let dropScore = Infinity;
      for (let i = 0; i < scan.enrouteStops.length; i++) {
        const s = scan.enrouteStops[i];
        const sp = enroutePri(s) + (s.hv ? 0.1 : 0);
        if (sp < dropScore) {
          dropScore = sp;
          dropIdx = i;
        }
      }
      if (dropIdx < 0) return;
      const weakest = scan.enrouteStops[dropIdx];
      if (pri < enroutePri(weakest) && (stop.hv || weakest.hv)) return;
      scan.enrouteStops.splice(dropIdx, 1);
    }
    let at = scan.enrouteStops.findIndex((s) => enroutePri(s) < pri);
    if (at < 0) at = scan.enrouteStops.length;
    scan.enrouteStops.splice(at, 0, stop);
  }
  function pushWantLoot(scan, loot) {
    if (scan.wantLootQueue.some((s) => s.id === loot.id)) return;
    scan.wantLootQueue.push(loot);
    scan.wantLootQueue.sort((a, b) => b.value - a.value);
    if (scan.wantLootQueue.length > ENROUTE_STOPS_MAX) {
      scan.wantLootQueue.length = ENROUTE_STOPS_MAX;
    }
  }
  function dropChestRegister(nodes, depth, x, y) {
    nodes.delete(`${depth}:chest:${x},${y}`);
    const soft = nodes.get(`${depth}:chest`);
    if (soft && soft.x === x && soft.y === y) nodes.delete(`${depth}:chest`);
  }
  function runScanPass(opts) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    const { scan, w, nodes, runTicks, chestBlockUntil, desire, bestBagJunkValue, skipHeavy } = opts;
    scan.lastScanTick = runTicks;
    scan.lastFlip = SCAN_FLIP.none;
    scan.pendingHighFlip = null;
    if (skipHeavy) return;
    const softActive = runTicks < chestBlockUntil;
    const foodNeeded = w.food <= 0 && w.healReserve <= 0 && w.rawFish <= 0 || w.hp < w.maxHp * 0.85;
    const shopAhead = !!nodes.get(`${w.depth}:shop`) || !!((_a = w.seen) == null ? void 0 : _a.shop);
    const hero = w.tile;
    const seenExact = /* @__PURE__ */ new Set();
    for (const [key, n] of nodes) {
      if (n.depth !== w.depth) continue;
      if (!key.includes(":")) continue;
      const parts = key.split(":");
      if (parts.length < 3) continue;
      if (n.kind !== "chest") continue;
      const id = key;
      if (seenExact.has(id)) continue;
      seenExact.add(id);
      const safe = !nodeThreat(w, n.x, n.y);
      const openable = !!(((_b = w.seen) == null ? void 0 : _b.chestOpenable) && w.seen.chest && cheb(w.seen.chest.x, w.seen.chest.y, n.x, n.y) <= 2);
      const liveChest = (_e = (_c = w.seen) == null ? void 0 : _c.chestAdj) != null ? _e : (_d = w.seen) == null ? void 0 : _d.chest;
      const liveMatch = liveChest && cheb(liveChest.x, liveChest.y, n.x, n.y) <= 2;
      const canOpen = openable || !!(liveMatch && ((_f = w.seen) == null ? void 0 : _f.chestOpenable));
      const bypass = softBlockBypass(n, softActive, desire, hero, nodes, w.depth);
      const softBlocked = softActive && !bypass;
      const blob = { safe, softBlocked, openable: canOpen, present: true };
      const prev = scan.prevStatus.get(id);
      scan.prevStatus.set(id, blob);
      const flippedSafe = (!prev || !prev.safe) && safe && canOpen && !softBlocked;
      const softExpired = (prev == null ? void 0 : prev.softBlocked) && !softBlocked && safe && canOpen;
      if (flippedSafe || softExpired) {
        const onWay = pathOnWay(n, desire, hero);
        const gate = phaseAllowsChestEvent(
          // phase passed via desire proxy — caller sets pending with phase check
          "GEAR_FARM",
          onWay
        );
        if (!scan.pendingHighFlip) {
          scan.pendingHighFlip = {
            kind: softExpired && !flippedSafe ? "softblock_chest_exp" : "chest_safe",
            id,
            x: n.x,
            y: n.y
          };
          scan.lastFlip = softExpired && !flippedSafe ? SCAN_FLIP.soft_exp : SCAN_FLIP.chest_safe;
        } else if (gate === "queue" || onWay) {
          pushEnrouteStop(scan, { id, kind: "chest", x: n.x, y: n.y, want: true, hv: true });
        }
        void gate;
      }
    }
    const liveAdj = (_i = (_g = w.seen) == null ? void 0 : _g.chestAdj) != null ? _i : (_h = w.seen) == null ? void 0 : _h.chest;
    if (liveAdj && ((_j = w.seen) == null ? void 0 : _j.chestOpenable)) {
      const id = `${w.depth}:chest:${liveAdj.x},${liveAdj.y}`;
      if (!scan.prevStatus.has(id) || !nodes.has(id)) {
        const safe = !nodeThreat(w, liveAdj.x, liveAdj.y);
        const bypass = softBlockBypass(liveAdj, softActive, desire, hero, nodes, w.depth);
        const softBlocked = softActive && !bypass;
        const prev = scan.prevStatus.get(id);
        const blob = {
          safe,
          softBlocked,
          openable: true,
          present: true
        };
        scan.prevStatus.set(id, blob);
        const flippedSafe = (!prev || !prev.safe) && safe && !softBlocked;
        if (flippedSafe && !scan.pendingHighFlip) {
          scan.pendingHighFlip = { kind: "chest_safe", id, x: liveAdj.x, y: liveAdj.y };
          scan.lastFlip = SCAN_FLIP.chest_safe;
        }
      }
    }
    if (w.loot) {
      const id = `${w.depth}:loot:${w.loot.x},${w.loot.y}`;
      const value = 10;
      const kindBand = 2;
      const want = wantPickItem({
        bagFree: w.bagFree,
        kindBand,
        value,
        bestBagJunkValue,
        foodNeeded,
        shopAhead
      });
      const hv = want && (value > bestBagJunkValue || w.bagFree <= 0);
      const prev = scan.prevStatus.get(id);
      scan.prevStatus.set(id, {
        safe: !nodeThreat(w, w.loot.x, w.loot.y),
        softBlocked: false,
        openable: false,
        present: true,
        wantPick: want,
        hv,
        value,
        kindBand
      });
      const pathClear = !nodeThreat(w, w.loot.x, w.loot.y);
      const newlyClear = pathClear && (!prev || !prev.safe || !prev.wantPick);
      if (want && pathClear) {
        if (hv && newlyClear && !scan.pendingHighFlip) {
          scan.pendingHighFlip = {
            kind: "loot_hv",
            id,
            x: w.loot.x,
            y: w.loot.y,
            hv: true
          };
          scan.lastFlip = SCAN_FLIP.loot_hv;
        } else if (w.bagFree > 0) {
          pushEnrouteStop(scan, {
            id,
            kind: "loot",
            x: w.loot.x,
            y: w.loot.y,
            want: true,
            hv: !!hv
          });
        } else if (hv) {
          pushWantLoot(scan, { id, x: w.loot.x, y: w.loot.y, value, kindBand });
        }
      }
    }
    const pond = nodes.get(`${w.depth}:pond`);
    if (pond && w.rawFish <= 0) {
      const id = `${w.depth}:pond:${pond.x},${pond.y}`;
      const safe = !nodeThreat(w, pond.x, pond.y);
      const prev = scan.prevStatus.get(id);
      scan.prevStatus.set(id, { safe, softBlocked: false, openable: false, present: true });
      if (safe && prev && !prev.safe) {
        if (scan.lastFlip === SCAN_FLIP.none) scan.lastFlip = SCAN_FLIP.pond_safe;
        pushEnrouteStop(scan, {
          id,
          kind: "pond",
          x: pond.x,
          y: pond.y,
          want: true,
          hv: false
        });
      }
    }
    if (w.loot && foodNeeded && cheb(hero.x, hero.y, w.loot.x, w.loot.y) <= SHRIMP_ENROUTE_CHEB && w.bagFree > 0) {
      pushEnrouteStop(scan, {
        id: `${w.depth}:loot:${w.loot.x},${w.loot.y}`,
        kind: "loot",
        x: w.loot.x,
        y: w.loot.y,
        want: true,
        hv: false
      });
    }
    if (w.bagFree <= 0 && scan.lastFlip === SCAN_FLIP.none) {
      scan.lastFlip = SCAN_FLIP.bag_pressure;
    }
    if (scan.enrouteStops.length > ENROUTE_STOPS_MAX) {
      scan.enrouteStops.length = ENROUTE_STOPS_MAX;
    }
  }
  function exportScanSit(scan, runTicks) {
    return {
      scanAge: scanAge(scan, runTicks),
      scanFlip: scan.lastFlip | 0,
      enrouteStops: Math.min(8, scan.enrouteStops.length),
      lootQueued: scan.wantLootQueue.length > 0 ? 1 : 0,
      wantPickPending: scan.atTileLoot || scan.wantLootQueue.length > 0 ? 1 : 0
    };
  }

  // src/systems/AutoplayDriver.ts
  var AUTO_ENGINE_VERSION = "2020";
  function clamp01(n) {
    return Math.max(0, Math.min(1, n));
  }
  var HANG_SAME_TILE_TICKS = 400;
  var HANG_SKILLS_FLAT_TICKS = 900;
  var HANG_SAME_FLOOR_TICKS = 3600;
  function foodStance(healReserve, floorHealNeed, traits, foodCount = 0) {
    const need = Math.max(8, floorHealNeed);
    const mult = 0.65 + traits.foodCaution * 0.7 + traits.patience * 0.3 - traits.risk * 0.25;
    const safetyLevel = Math.max(need * 0.55, Math.min(need * 1.8, need * mult));
    const minFood = Math.max(
      2,
      Math.min(
        8,
        Math.round(2 + traits.foodCaution * 3.5 + traits.patience * 1.5 - traits.risk * 1.2)
      )
    );
    const ratio = healReserve / need;
    const healHungry = healReserve < safetyLevel;
    const piecesHungry = foodCount < minFood;
    const healRich = healReserve >= safetyLevel * 1.5;
    const hungry = healHungry || piecesHungry && !healRich;
    const stocked = !hungry && healReserve >= safetyLevel && (foodCount >= minFood || healRich);
    let caution = traits.foodCaution;
    let bravery = (traits.risk + traits.aggression + traits.greed) / 3;
    const n = Math.round(healReserve);
    const nd = Math.round(need);
    const sf = Math.round(safetyLevel);
    let label = `heal ${n}/${nd} (safe ${sf} food ${foodCount}/${minFood})`;
    if (hungry) {
      caution = clamp01(caution + 0.35);
      bravery = clamp01(bravery * 0.45);
      label = piecesHungry && !healHungry ? `low food ${foodCount}/${minFood} (heal ${n}/${nd} safe ${sf})` : `low heal ${n}/${nd} (safe ${sf} food ${foodCount}/${minFood})`;
    } else if (stocked && ratio >= 1.2) {
      caution = clamp01(caution * 0.55);
      bravery = clamp01(bravery + 0.25);
      label = `heal rich ${n}/${nd} (safe ${sf} food ${foodCount}/${minFood})`;
    } else if (stocked) {
      caution = clamp01(caution * 0.7);
      bravery = clamp01(bravery + 0.1);
    }
    return { hungry, stocked, caution, bravery, label, ratio, safetyLevel, minFood };
  }
  var SAME_TARGET_MAX = 3;
  var TILE_BLOCK_TICKS = 200;
  var IDLE_STUCK_TICKS = 48;
  var STUCK_METER_SCAN = 4;
  var STUCK_WATCHDOG_FIRES = 3;
  var STUCK_WATCHDOG_WINDOW = 400;
  var STUCK_TILE_RING = 12;
  var TOOL_BLOCK_TICKS = 400;
  var PROGRESS_STALL_TICKS = 60;
  function scoreOption(opt, traits, food, stance, ev, w) {
    var _a;
    if (opt.requires_food && food < opt.requires_food) return null;
    if (stance.hungry && opt.requires_food && opt.requires_food > food) return null;
    let s = 0.15;
    const eff = {
      ...traits,
      foodCaution: stance.caution,
      risk: clamp01(traits.risk * (stance.hungry ? 0.5 : stance.stocked ? 1.25 : 1)),
      aggression: clamp01(traits.aggression * (stance.hungry ? 0.5 : stance.stocked ? 1.2 : 1)),
      greed: clamp01(traits.greed * (stance.hungry ? 0.4 : stance.stocked ? 1.3 : 1)),
      goldChase: clamp01(traits.goldChase * (stance.hungry ? 0.35 : stance.stocked ? 1.25 : 1))
    };
    for (const [k, wt] of Object.entries(opt.weights)) {
      s += ((_a = eff[k]) != null ? _a : 0.5) * wt;
    }
    const id = opt.id;
    const hpPct = w.maxHp > 0 ? w.hp / w.maxHp : 1;
    if (ev.id === "boss_door") {
      if (id === "retreat") s += w.descendSafe && stance.stocked ? 1.2 : 4;
      if (id === "enter" || id === "eat_enter") s *= w.descendSafe && stance.stocked && hpPct > 0.7 ? 0.7 : 0.12;
    }
    if (ev.id === "pack_vs_pull") {
      const chased = w.foes.some(
        (f) => f.alive && f.lit && (f.watch === 3 || f.dist <= 2)
      );
      if (id === "pull") s += 2;
      if (id === "fight_pack") s *= stance.hungry || hpPct < 0.6 ? 0.15 : 0.4;
      if (id === "flee" && !chased) s *= 0.05;
      if (id === "flee" && chased && (stance.hungry || hpPct < 0.35)) s += 1.2;
    }
    if (ev.id === "gold_low_food" || ev.id === "gold_fleeing" && (stance.hungry || food <= 2)) {
      if (id === "ignore") s += 2.5;
      if (id === "chase" || id === "eat_then_chase") s *= 0.12;
    }
    if (ev.id === "hp_critical_stairs") {
      const meleePress = w.foes.some((f) => f.alive && f.lit && f.dist <= 2);
      const stairsOk = w.descendSafe && !meleePress;
      if (stairsOk) {
        if (id === "stairs") s += 3;
        if (id === "clear" || id === "eat_clear") s *= 0.2;
      } else {
        if (id === "stairs") s *= 0.08;
        if (id === "eat_clear") s += 3.5;
        if (id === "clear") s += food > 0 ? 1.2 : 3;
      }
    }
    if (ev.id === "elite_fov") {
      const meleePress = w.foes.some((f) => f.alive && f.lit && f.dist <= 2);
      const unreadyKit = !w.kitReady || w.healReserve <= 0;
      if (unreadyKit) {
        if (id === "flee") s += 4;
        if (id === "engage" || id === "eat_engage") s *= 0.08;
      } else if (meleePress) {
        if (id === "flee") s *= 0.05;
        if (id === "engage") s += 3;
        if (id === "eat_engage") s += food > 0 ? 3.5 : 0;
      } else if (stance.hungry || hpPct < 0.5) {
        if (id === "flee") s += 3;
        if (id === "engage" || id === "eat_engage") s *= 0.1;
      }
    }
    if (stance.hungry && /chase|fight_pack|enter|engage/.test(id) && !/eat|flee|ignore|retreat|save|stairs|pull/.test(id)) {
      s *= 0.55;
    }
    if (stance.stocked && /chase|fight_pack|engage|gold/.test(id) && ev.id !== "boss_door") s *= 1.1;
    return s;
  }
  function pickOption(ev, traits, food, rnd, stance, w) {
    const scored = ev.options.map((o) => ({ o, s: scoreOption(o, traits, food, stance, ev, w) })).filter((x) => x.s != null);
    if (!scored.length) return ev.options[0];
    const weights = scored.map((x) => Math.max(0.05, x.s) ** 2);
    const sum = weights.reduce((a, b) => a + b, 0);
    let r = rnd() * sum;
    for (let i = 0; i < scored.length; i++) {
      r -= weights[i];
      if (r <= 0) return scored[i].o;
    }
    return scored[scored.length - 1].o;
  }
  function matches(ev, w, stance) {
    const t = ev.trigger;
    const hpPct = w.maxHp > 0 ? w.hp / w.maxHp : 1;
    if (ev.id === "elite_fov" && w.depth <= 5 && w.healReserve <= 0) return false;
    if (t.gold && !w.foes.some((f) => f.alive && f.gold && f.lit)) return false;
    if (t.elite && !w.foes.some((f) => f.alive && (f.elite || f.alpha) && f.lit && !f.gold)) return false;
    if (t.trash_gte != null) {
      const trash = w.foes.filter(
        (f) => f.alive && f.lit && !f.gold && !f.elite && !f.alpha && !f.gateBoss && !f.boss && (f.dist <= 4 || f.watch === 3 || f.reach != null && f.reach >= 0 && f.reach <= 5)
      ).length;
      if (trash < t.trash_gte) return false;
      if (ev.id === "pack_vs_pull") {
        const chased = w.foes.some(
          (f) => f.alive && f.lit && (f.watch === 3 || f.dist <= 2)
        );
        if (!chased) return false;
      }
    }
    if (t.food_lte != null && !(w.food <= t.food_lte)) return false;
    if (t.food_gt != null && !(w.food > t.food_gt)) return false;
    if (t.food_gte != null && !(w.food >= t.food_gte)) return false;
    if (t.hp_pct_lt != null && !(hpPct < t.hp_pct_lt)) return false;
    if (t.boss_floor && !w.bossFloor) return false;
    if (t.stairs_open && !(w.stairsOpen && w.stairsLit)) return false;
    if (stance.hungry && t.gold && !t.food_lte && !t.food_gte && hpPct > 0.5) return false;
    return true;
  }
  var _AutoplayDriver = class _AutoplayDriver {
    constructor(traits = {}, rnd = Math.random) {
      __publicField(this, "traits");
      __publicField(this, "open", null);
      __publicField(this, "fired", /* @__PURE__ */ new Set());
      __publicField(this, "lastDepth", -1);
      __publicField(this, "rnd");
      __publicField(this, "cool", 0);
      __publicField(this, "deathId", null);
      __publicField(this, "deathLabel", null);
      /** Compact upload: counts of `eventId:optionId` chosen this run. */
      __publicField(this, "forkCounts", {});
      /** Last status pushed to HUD. */
      __publicField(this, "lastStatus", "");
      /** Idle / drive hang detected this run (upload once then stop). */
      __publicField(this, "hang", null);
      __publicField(this, "hangReported", false);
      __publicField(this, "runTicks", 0);
      /**
       * Active (foreground) run time — advances only while the clock is not held.
       * Wall-clock Date.now()-start was wrong: backgrounding the app added minutes
       * with dungeon progress frozen (browser throttle).
       */
      __publicField(this, "activeMs", 0);
      /** Date.now() when the active segment started; 0 while held/paused. */
      __publicField(this, "activeStartedAt", 0);
      /** Explicit hold (PAUSE ALL / visibility hidden) — timer + must not auto-start. */
      __publicField(this, "clockHeld", false);
      __publicField(this, "hangFloor", -1);
      __publicField(this, "hangFloorTicks", 0);
      __publicField(this, "hangTileX", -1e9);
      __publicField(this, "hangTileY", -1e9);
      __publicField(this, "hangTileTicks", 0);
      __publicField(this, "hangXpFp", "");
      __publicField(this, "hangXpTicks", 0);
      /** Fail memory: gather tile key → until runTicks. */
      __publicField(this, "tileBlock", /* @__PURE__ */ new Map());
      /** Missing-tool soft block → until runTicks (cleared when hasTool). */
      __publicField(this, "toolBlock", /* @__PURE__ */ new Map());
      /** Consecutive Auto gather attempts on the same target tile. */
      __publicField(this, "sameTargetKey", "");
      __publicField(this, "sameTargetHits", 0);
      /** Loot-walk stuck: same loot tile / same hero tile without progress. */
      __publicField(this, "lootWalkKey", "");
      __publicField(this, "lootWalkHits", 0);
      __publicField(this, "lootStandX", -1e9);
      __publicField(this, "lootStandY", -1e9);
      __publicField(this, "lootStandHits", 0);
      /** Mine-for-rod-coins loop counter — force hub/shop after N gathers without rod. */
      __publicField(this, "rodCoinMines", 0);
      /**
       * Gather failed "too full" recently — prefer sell/shop over mine/chop until cleared.
       * Cleared when bagFree > 0 and sell path not needed.
       * e36: too-full sets +600 (was TILE_BLOCK_TICKS=200) + force-sell; farm-food gated while active.
       */
      __publicField(this, "bagFullUntil", 0);
      /** forgeWieldedOnce failed (need ore / mats) — soft-block forge+ until runTicks. */
      __publicField(this, "forgeBlockUntil", 0);
      /** Coins and ore at the moment forge refused. A rise clears the block. */
      __publicField(this, "forgeBlockCoins", 0);
      __publicField(this, "forgeBlockOre", 0);
      /**
       * e23: persist walk-to-anvil (forge hatchet / smith kit) until adj+smith or soft-block.
       * Prevents mid-path divert to mine/farm food / door thrash desire flicker.
       */
      __publicField(this, "anvilStrive", null);
      /**
       * e33: persist mine on a rock until ore gained / soft-block / threat —
       * do not flip to farm-food mid-swing when already on the vein (Darren peek).
       */
      __publicField(this, "mineStrive", null);
      /**
       * e41 (amvmtvh85ykc): consecutive mineStrive soft-blocks with no ore gain —
       * ≥3 → mineBlockUntil cool-down so rock ping-pong cannot starve for hours.
       */
      __publicField(this, "mineFailStreak", 0);
      /** e41: runTicks until new mine gather allowed after thrash soft-block. */
      __publicField(this, "mineBlockUntil", 0);
      /** e41: last seen oreCount — reset fail streak on ore gain. */
      __publicField(this, "lastOreCount", -1);
      /**
       * e42 (amvmuuuou8tg): openChestOnce keeps returning true while kite interrupts —
       * ≥4 no coin/bag gain → chestBlockUntil so chest↔kite orbit cannot starve.
       */
      __publicField(this, "chestFailStreak", 0);
      /** e42: runTicks until new chest open allowed after thrash soft-block. */
      __publicField(this, "chestBlockUntil", 0);
      /** Eng 2001 Layer 0 ScanState — status-diff + enroute / wantLoot queues. */
      __publicField(this, "scan", freshScanState());
      /** Desire tile for on-way Cheb sample (updated when walk issued). */
      __publicField(this, "desireXY", null);
      __publicField(this, "doorSeenUntil", 0);
      /** e42: last coins+bag fingerprint — reset fail streak on loot gain. */
      __publicField(this, "chestProgKey", "");
      /**
       * e24: persist walk-to-stairs (food fat / farm ceiling / kit stairs) until depth change
       * or soft-block. Prevents standing forever with stale "food fat → advance" after a
       * failed walkTo / door thrash / F2→F1 bounce.
       */
      __publicField(this, "stairsStrive", null);
      /**
       * e25: stuck monitor — gear / food / exp / useful approach toward desire.
       * Raw tile thrash (door loop, anvil orbit) does NOT reset. Combat resets.
       */
      __publicField(this, "stuckTile", "");
      __publicField(this, "stuckGearFp", "");
      __publicField(this, "stuckFoodFp", "");
      __publicField(this, "stuckXpFp", "");
      __publicField(this, "stuckTicks", 0);
      /** Desire key + best Chebyshev approach dist (lower = closer). */
      __publicField(this, "stuckDesireKey", "");
      __publicField(this, "stuckApproachBest", 9999);
      /** Recent tiles while approaching (revisit → thrash fingerprint). */
      __publicField(this, "stuckRecentTiles", []);
      /**
       * Eng 2020: progress-stuck fire times (runTicks) for TERM watchdog.
       * Cleared on gear/food/xp progress; kill when ≥3 in window.
       */
      __publicField(this, "stuckFireTicks", []);
      __publicField(this, "stuckWatchdogFired", false);
      /** Eng 2020/t1668: last meter-scan tick + fingerprints (exp/gear/hp/mp). */
      __publicField(this, "stuckMeterAt", 0);
      __publicField(this, "stuckMeterXp", "");
      __publicField(this, "stuckMeterGear", "");
      __publicField(this, "stuckMeterHp", -1);
      __publicField(this, "stuckMeterMp", -1);
      /** Recent status lines for repeated-action thrash (≥2 same in ring). */
      __publicField(this, "stuckRecentStatus", []);
      /**
       * Eng 2020 / t1669: observational marks — set whenever detection trips,
       * even if eng does not SNAP / rethink / watchdog. Exposed on FHD + SIT.
       */
      __publicField(this, "markThrash", false);
      __publicField(this, "markClash", false);
      __publicField(this, "markStuck", false);
      /** Last progressFp (heal+gear+ore); reset stall when it changes. */
      __publicField(this, "progressFp", "");
      /** runTicks when progressFp last changed (heal up / equip / forge+). */
      __publicField(this, "progressTick", 0);
      /** Explicit improve mark (forge success) — also bumps progressTick. */
      __publicField(this, "lastImproveTick", 0);
      /** Last successful food-farm tile (depth + xy) — food fell → walk back (e18). */
      __publicField(this, "lastFoodFarm", null);
      /** Eng 2017: sellUnusedOnce walk thrash — no coin/bag progress → cool-down. */
      __publicField(this, "sellUnusedFailStreak", 0);
      __publicField(this, "sellUnusedBlockUntil", 0);
      __publicField(this, "sellUnusedProgKey", "");
      /**
       * e44: last tree chop tile (cook-fuel fallback when raw waits and bag has no logs).
       * Remembered across floors like lastFoodFarm; not cleared on every stuck rethink.
       */
      __publicField(this, "lastTree", null);
      /** e35: consecutive failed pickaxe buys while melee-pressed. */
      __publicField(this, "shopFireFails", 0);
      /**
       * e36/e47: consecutive stuck-rethinks while find-pond / farm-food / enroute pond / regen
       * (empty food+heal → ≥3; fed → ≥4) → soft-block gather + fight/XP break + cool gate.
       */
      __publicField(this, "pondRethinks", 0);
      /** e47: runTicks until find-pond/farm-food desire allowed again after pond thrash break. */
      __publicField(this, "pondBreakUntil", 0);
      /** e48: runTicks until chop-for-fire/lastTree allowed again after bag-stuck thrash. */
      __publicField(this, "chopBreakUntil", 0);
      /** e56: runTicks when the dry-ground walk started. 0 = not in it. */
      __publicField(this, "drySince", 0);
      /**
       * e49: consecutive stuck-rethinks while farm-ceiling explore/mob (kitReady + healOk).
       * ≥4 → force stairs / find stairs (R6 floor-advance stall).
       */
      __publicField(this, "ceilingRethinks", 0);
      /**
       * e46: consecutive stuck-rethink soft-blocks of lastFoodFarm (R2/R3 hang sameTile /
       * soft-block food farm → farm food again). ≥2 → drop register + explore/fight break.
       */
      __publicField(this, "foodFarmSoftBlocks", 0);
      /**
       * e37/e43: consecutive stuck-rethinks while hub/forge/shop/wait/explore hatchet
       * without hatchet — ≥3 → soft-block hatchet strive + clear stylePivot + mine/food.
       */
      __publicField(this, "hatchetRethinks", 0);
      /**
       * e37: consecutive bagFull relief ticks where sell/fletch returned false while bag still tight —
       * ≥3 → clear bagFullUntil and move on (sell-hang when bag is raw-fish/seeds only).
       */
      __publicField(this, "bagFullFails", 0);
      /** Peak healReserve this floor — detect food fall from fat stock. */
      __publicField(this, "peakHealThisFloor", 0);
      /** Elite/threat kite↔anvil thrash counter; patience → fight past / explore. */
      __publicField(this, "eliteThrash", 0);
      __publicField(this, "eliteThrashKey", "");
      /** Temporary lane nudge after a tool fail (cleared on depth change / success). */
      __publicField(this, "laneBias", null);
      /** Walking up for food this tick — set hoarding on next ascend. */
      __publicField(this, "pendingFoodRetreat", false);
      /** On prior floor stocking food; block descend until stocked (safety level). */
      __publicField(this, "hoarding", false);
      /** Anti-bounce: no food-retreat until runTicks >= this after a descend. */
      __publicField(this, "foodRetreatCoolUntil", 0);
      /**
       * Soft F1 style pivot (Darren t1134): null undecided; true = chop→fletch bow/wand
       * when anvil not nearby; false = keep hunting melee smith / anvil.
       */
      __publicField(this, "stylePivot", null);
      /** Eng 1001 hierarchy state (events / phase / utility). */
      __publicField(this, "h1001", freshHierarchyState());
      /** Detail-upload action history (last ≤100 short lines). */
      __publicField(this, "actions", []);
      /**
       * FHD delta journal — always recorded (cheap); attached only when UPLOAD=FHD.
       * Entry: [dTick, op, x, y] — dTick = ticks since previous entry.
       * Op enum (fixed): 0 status, 1 fork, 2 engage, 3 floor, 4 stuck, 5 gather, 6 forge, 7 loot, 8 other.
       */
      __publicField(this, "journal", []);
      __publicField(this, "journalLastTick", 0);
      __publicField(this, "journalTruncFlag", false);
      /** Last hero tile seen in tick() — stamped onto journal rows. */
      __publicField(this, "lastTileX", 0);
      __publicField(this, "lastTileY", 0);
      this.traits = { ...AUTOPLAY_TRAITS_DEFAULT, ...traits };
      for (const k of Object.keys(this.traits)) this.traits[k] = clamp01(this.traits[k]);
      this.rnd = rnd;
    }
    tick(host) {
      var _a, _b, _c, _d, _e, _f;
      const w = host.world();
      if (w.blocked) return;
      this.ensureActiveClock();
      this.runTicks++;
      this.lastTileX = (_b = (_a = w.tile) == null ? void 0 : _a.x) != null ? _b : this.lastTileX;
      this.lastTileY = (_d = (_c = w.tile) == null ? void 0 : _c.y) != null ? _d : this.lastTileY;
      this.watchHang(host, w);
      if (this.hangReported) return;
      const stance = foodStance(w.healReserve, w.floorHealNeed, this.traits, w.food);
      if (w.bagFree >= 3 || w.bagFree > 0 && this.runTicks >= this.bagFullUntil) {
        this.bagFullUntil = 0;
        this.bagFullFails = 0;
      }
      this.trackProgress(w);
      this.maybeRethinkIdle(host, w, stance);
      if (w.depth !== this.lastDepth) {
        const prev = this.lastDepth;
        this.fired.clear();
        this.lastDepth = w.depth;
        this.cool = 0;
        this.tileBlock.clear();
        this.toolBlock.clear();
        this.sameTargetKey = "";
        this.sameTargetHits = 0;
        this.lootWalkKey = "";
        this.lootWalkHits = 0;
        this.lootStandHits = 0;
        this.rodCoinMines = 0;
        this.bagFullUntil = 0;
        this.shopFireFails = 0;
        this.pondRethinks = 0;
        this.pondBreakUntil = 0;
        this.chopBreakUntil = 0;
        this.drySince = 0;
        this.ceilingRethinks = 0;
        this.foodFarmSoftBlocks = 0;
        this.hatchetRethinks = 0;
        this.bagFullFails = 0;
        this.forgeBlockUntil = 0;
        this.forgeBlockCoins = 0;
        this.forgeBlockOre = 0;
        this.mineFailStreak = 0;
        this.mineBlockUntil = 0;
        this.lastOreCount = -1;
        this.chestFailStreak = 0;
        this.chestBlockUntil = 0;
        this.scan = freshScanState();
        this.desireXY = null;
        this.doorSeenUntil = 0;
        this.chestProgKey = "";
        this.anvilStrive = null;
        this.mineStrive = null;
        this.stairsStrive = null;
        this.stuckTile = "";
        this.stuckGearFp = "";
        this.stuckFoodFp = "";
        this.stuckXpFp = "";
        this.stuckTicks = 0;
        this.stuckDesireKey = "";
        this.stuckApproachBest = 9999;
        this.stuckRecentTiles = [];
        this.stuckFireTicks = [];
        this.stuckWatchdogFired = false;
        this.stuckMeterAt = 0;
        this.stuckMeterXp = "";
        this.stuckMeterGear = "";
        this.stuckMeterHp = -1;
        this.stuckMeterMp = -1;
        this.stuckRecentStatus = [];
        this.markThrash = false;
        this.markClash = false;
        this.markStuck = false;
        this.eliteThrash = 0;
        this.eliteThrashKey = "";
        this.laneBias = null;
        this.stylePivot = null;
        this.progressFp = "";
        this.progressTick = this.runTicks;
        this.lastImproveTick = this.runTicks;
        this.peakHealThisFloor = 0;
        if (prev < 0) {
          this.noteAction(`start F${w.depth}`);
        } else if (w.depth < prev) {
          this.noteAction(`ascend F${w.depth}`);
          if (this.pendingFoodRetreat) {
            this.hoarding = true;
            this.pendingFoodRetreat = false;
            this.laneBias = "food";
          }
        } else {
          this.noteAction(`descend F${w.depth}`);
          this.hoarding = false;
          this.pendingFoodRetreat = false;
          this.foodRetreatCoolUntil = this.runTicks + 200;
        }
        host.equipUp();
        host.spendPoints();
      }
      if (this.hoarding && stance.stocked) {
        this.hoarding = false;
        if (this.laneBias === "food") this.laneBias = null;
        this.noteAction("hoard done");
      }
      for (const tool of [...this.toolBlock.keys()]) {
        if (host.hasTool(tool)) this.toolBlock.delete(tool);
      }
      host.preferSpell();
      {
        const hpPctEarly = w.maxHp > 0 ? w.hp / w.maxHp : 1;
        const meleePress = w.foes.some((f) => f.alive && f.lit && f.dist <= 2);
        const eatBelowEarly = meleePress ? 0.75 : stance.hungry ? 0.5 : stance.stocked ? 0.35 : 0.45;
        if (hpPctEarly < 0.95 && hpPctEarly < eatBelowEarly) {
          if ((_e = host.drinkOnce) == null ? void 0 : _e.call(host, "hurt")) {
            this.setStatus(host, w, stance, "drink potion");
            this.cool = 2;
            return;
          }
          if (w.food > 0) {
            host.eat();
            this.setStatus(host, w, stance, "eating");
            this.cool = 2;
            return;
          }
        }
      }
      {
        const noFood = w.food <= 0 && w.healReserve <= 0;
        if (!noFood && this.tryFunnel1v1(host, w, stance)) return;
      }
      for (const ev of AUTOPLAY_COMBAT_EVENTS) {
        if (this.fired.has(ev.id)) continue;
        if (!matches(ev, w, stance)) continue;
        this.fired.add(ev.id);
        const opt = pickOption(ev, this.traits, w.food, this.rnd, stance, w);
        this.open = {
          eventId: ev.id,
          optionId: opt.id,
          deathIfFatal: opt.death_if_fatal,
          floor: w.depth,
          at: Date.now()
        };
        host.noteDecision(ev.id, opt.id, ev.title);
        {
          const key = `${ev.id}:${opt.id}`;
          this.forkCounts[key] = ((_f = this.forkCounts[key]) != null ? _f : 0) + 1;
        }
        this.noteAction(`fork ${ev.id}\u2192${opt.id}`);
        host.log(`AUTO: ${ev.title} \u2192 ${opt.label}`);
        this.setStatus(host, w, stance, `fork \u2014 ${ev.title}`);
        this.applyOption(host, w, ev, opt, stance);
        this.cool = 3;
        return;
      }
      if (this.cool > 0) {
        this.cool--;
        if (w.bagFree > 0 && host.pickupLoot()) {
          this.setStatus(host, w, stance, "looting");
          return;
        }
        if (this.stairsStrive && this.resumeStairsStrive(host, w, stance)) return;
        return;
      }
      registerSeenNodes(this.h1001.nodes, w, { lastFoodFarm: this.lastFoodFarm });
      this.trackProgress(w);
      if (w.progressFp && w.progressFp !== this.progressFp) {
        this.h1001.progressDelta = 1;
      } else {
        this.h1001.progressDelta = 0;
      }
      advancePhase(this.h1001, w, stance);
      if (this.tick1001Hierarchy(host, w, stance)) return;
    }
    /**
     * Eng 1001 main play loop after survival / forks / cool.
     * Hard event locks first; then phase skills; then soft utility / round-trip.
     */
    tick1001Hierarchy(host, w, stance) {
      const h = this.h1001;
      h.topEvent = "none";
      h.utilityPick = "";
      this.maybeScan(host, w);
      if (this.drainAtTileLoot(host, w, stance)) return true;
      if (this.trySwapMeleeFromBag(host, w, stance)) return true;
      if (!this.foodUrgency(w) && this.heroAtkRange(w) > 1) {
        const press = w.foes.filter((f) => f.alive && f.lit && f.dist <= this.heroAtkRange(w) + 1).sort((a, b) => a.dist - b.dist)[0];
        if (press && this.heroAtkRange(w) > this.foeAtkRange(press) && press.dist <= this.foeAtkRange(press)) {
          if (this.tryMaintainKiteBand(host, w, stance, press, "safe kite")) return true;
        }
      }
      if (this.evLethal(host, w, stance)) return true;
      if (this.sevenBChestEligible(w) && this.evScanChestSafe(host, w, stance)) return true;
      if (this.evEmergFood(host, w, stance)) return true;
      if (this.evMobSudden(host, w, stance)) return true;
      if (this.evScanChestSafe(host, w, stance)) return true;
      if (this.evScanLootHv(host, w, stance)) return true;
      if (this.drainWantLootQueue(host, w, stance)) return true;
      if (this.evBagFull(host, w, stance)) return true;
      if (this.evHighCeiling(host, w, stance)) return true;
      if (this.evFloorLoot(host, w, stance)) return true;
      if (this.evForgeMiss(host, w, stance)) return true;
      if (this.evAltar(host, w, stance)) return true;
      if (this.tryCookBagCookables(host, w, stance, "cook")) return true;
      host.equipUp();
      if (this.drainEnrouteStop(host, w, stance)) return true;
      if (this.evCalmFoodHighPri(host, w, stance)) return true;
      if (this.runPhase1001(host, w, stance)) return true;
      if (this.runCalm1001(host, w, stance)) return true;
      this.setStatus1001(host, w, stance, "explore");
      if (w.explore) host.walkTo(w.explore.x, w.explore.y);
      else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
      else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
      return true;
    }
    setStatus1001(host, w, stance, desire) {
      const tag = statusTag(this.h1001);
      this.setStatus(host, w, stance, `${desire} | ${tag}`);
    }
    /**
     * Soft engage gate via host.fightOutlook (1006).
     * Favorable → engage. Low winRate or hpLoss > heal/HP buffer → skip/kite.
     * No host API → fall back to danger prey/even (or allowThreat for sudden melee).
     */
    outlookOk(host, w, foe, opts = {}) {
      var _a, _b, _c;
      const o = (_b = (_a = host.fightOutlook) == null ? void 0 : _a.call(host, foe)) != null ? _b : null;
      if (!o) {
        if (foe.danger === "prey" || foe.danger === "even") return true;
        return !!opts.allowThreat && (foe.danger === "threat" || foe.danger === "deadly");
      }
      const minRate = (_c = opts.minWinRate) != null ? _c : 0.42;
      const healBuf = Math.max(0, w.healReserve) + Math.max(0, w.hp - w.maxHp * 0.35);
      if (o.winRate < minRate) return false;
      if (o.danger === "deadly" && o.winRate < 0.55) return false;
      if (o.hpLossExpected > healBuf && o.winRate < 0.7) return false;
      if (!o.win && !opts.allowThreat) return false;
      return true;
    }
    /** Prefer engage when outlook favorable; else false (caller kites / skips). */
    preferEngage(host, w, foe) {
      return this.outlookOk(host, w, foe, { minWinRate: 0.48 });
    }
    // --- Eng 2001 Layer 0 / 2 helpers -------------------------------------------------
    maybeScan(host, w) {
      if (this.runTicks - this.scan.lastScanTick < SCAN_PERIOD) return;
      const lethalPress = w.foes.some(
        (f) => f.alive && f.lit && (f.danger === "deadly" || f.danger === "threat" && f.dist <= 2 || f.dist <= 1 && f.danger !== "prey")
      );
      const junk = this.bestBagJunkValue(w);
      runScanPass({
        scan: this.scan,
        w,
        nodes: this.h1001.nodes,
        runTicks: this.runTicks,
        chestBlockUntil: this.chestBlockUntil,
        desire: this.desireXY,
        bestBagJunkValue: junk,
        skipHeavy: lethalPress && w.hp * 2 < w.maxHp
      });
      const flip = this.scan.pendingHighFlip;
      if (flip && (flip.kind === "chest_safe" || flip.kind === "softblock_chest_exp")) {
        const onWay = pathOnWay(flip, this.desireXY, w.tile);
        const gate = phaseAllowsChestEvent(this.h1001.phase, onWay);
        if (gate === "suppress") {
          this.scan.pendingHighFlip = null;
        } else if (gate === "queue") {
          pushEnrouteStop(this.scan, {
            id: flip.id,
            kind: "chest",
            x: flip.x,
            y: flip.y,
            want: true,
            hv: true
          });
          this.scan.pendingHighFlip = null;
          if (this.scan.lastFlip === SCAN_FLIP.chest_safe) this.scan.lastFlip = SCAN_FLIP.none;
        }
      }
      void host;
    }
    bestBagJunkValue(w) {
      var _a, _b;
      const spare = (_b = (_a = w.seen) == null ? void 0 : _a.spareRoom) != null ? _b : -1;
      if (spare >= 0) return Math.max(0, spare);
      return 5;
    }
    afterChestOpened(host, w, stance) {
      var _a, _b, _c;
      const adj = (_c = (_a = w.seen) == null ? void 0 : _a.chestAdj) != null ? _c : (_b = w.seen) == null ? void 0 : _b.chest;
      if (adj) dropChestRegister(this.h1001.nodes, w.depth, adj.x, adj.y);
      const soft = this.h1001.nodes.get(`${w.depth}:chest`);
      if (soft) dropChestRegister(this.h1001.nodes, w.depth, soft.x, soft.y);
      this.scan.layer2UsedTick = this.runTicks;
      this.scan.pendingHighFlip = null;
      if (w.bagFree <= 0) {
        this.bagFullUntil = this.runTicks + 600;
      } else if (this.h1001.phaseResume) {
      }
      void stance;
      void host;
    }
    drainAtTileLoot(host, w, stance) {
      const at = this.scan.atTileLoot;
      if (!at) return false;
      if (this.runTicks > at.untilTick) {
        this.scan.atTileLoot = null;
        return false;
      }
      if (cheb(w.tile.x, w.tile.y, at.x, at.y) > 1) {
        this.scan.atTileLoot = null;
        return false;
      }
      if (host.pickupLoot()) {
        this.h1001.topEvent = "floor_loot";
        this.setStatus1001(host, w, stance, "at-tile loot");
        host.equipUp();
        return true;
      }
      if (w.bagFree <= 0 && w.loot) {
        const value = 10;
        const kindBand = 2;
        const want = wantPickItem({
          bagFree: 0,
          kindBand,
          value,
          bestBagJunkValue: this.bestBagJunkValue(w),
          foodNeeded: w.food <= 0 || w.hp < w.maxHp * 0.85,
          shopAhead: !!this.mem(w, "shop")
        });
        if (want) {
          pushWantLoot(this.scan, {
            id: `${w.depth}:loot:${w.loot.x},${w.loot.y}`,
            x: w.loot.x,
            y: w.loot.y,
            value,
            kindBand
          });
          this.bagFullUntil = this.runTicks + 600;
        }
        this.scan.atTileLoot = null;
        return false;
      }
      this.scan.atTileLoot = null;
      return false;
    }
    drainWantLootQueue(host, w, stance) {
      if (!this.scan.wantLootQueue.length) return false;
      if (w.bagFree <= 0) return false;
      const next = this.scan.wantLootQueue[0];
      if (nodeThreat(w, next.x, next.y)) {
        this.scan.wantLootQueue.shift();
        return false;
      }
      if (cheb(w.tile.x, w.tile.y, next.x, next.y) <= 1) {
        if (host.pickupLoot()) {
          this.scan.wantLootQueue.shift();
          this.h1001.topEvent = "loot_hv";
          this.setStatus1001(host, w, stance, "queued loot");
          host.equipUp();
          return true;
        }
        this.scan.wantLootQueue.shift();
        return false;
      }
      this.desireXY = { x: next.x, y: next.y };
      host.walkTo(next.x, next.y);
      this.h1001.topEvent = "loot_hv";
      this.setStatus1001(host, w, stance, "walk queued loot");
      return true;
    }
    evScanChestSafe(host, w, stance) {
      var _a;
      const flip = this.scan.pendingHighFlip;
      if (!flip || flip.kind !== "chest_safe" && flip.kind !== "softblock_chest_exp") return false;
      if (this.runTicks - this.scan.layer2UsedTick < SCAN_PERIOD && this.scan.layer2UsedTick >= 0) {
        return false;
      }
      if (this.chestExposed(w)) return false;
      const softActive = this.runTicks < this.chestBlockUntil;
      const bypass = softBlockBypass(flip, softActive, this.desireXY, w.tile, this.h1001.nodes, w.depth);
      if (!bypass) {
        pushEnrouteStop(this.scan, {
          id: flip.id,
          kind: "chest",
          x: flip.x,
          y: flip.y,
          want: true,
          hv: true
        });
        this.scan.pendingHighFlip = null;
        return false;
      }
      const onWay = pathOnWay(flip, this.desireXY, w.tile);
      const gate = phaseAllowsChestEvent(this.h1001.phase, onWay);
      if (gate !== "event") {
        if (gate === "queue") {
          pushEnrouteStop(this.scan, {
            id: flip.id,
            kind: "chest",
            x: flip.x,
            y: flip.y,
            want: true,
            hv: true
          });
        }
        this.scan.pendingHighFlip = null;
        return false;
      }
      const d = cheb(w.tile.x, w.tile.y, flip.x, flip.y);
      this.h1001.topEvent = "chest_safe";
      if (this.h1001.phase !== "TOOLS" && this.h1001.phase !== "FIRST_WEP" && this.h1001.phase !== "BOOT") {
        this.h1001.phaseResume = (_a = this.h1001.phaseResume) != null ? _a : this.h1001.phase;
      }
      if (d > 1) {
        this.desireXY = { x: flip.x, y: flip.y };
        host.walkTo(flip.x, flip.y);
        this.setStatus1001(host, w, stance, "scan chest");
        return true;
      }
      if (this.tryOpenChestOnce(host, w, stance, { needBag: false, cool: 2, bypassSoft: true })) {
        this.afterChestOpened(host, w, stance);
        if (host.world().bagFree > 0 && this.h1001.phaseResume) {
          this.h1001.phase = this.h1001.phaseResume;
          this.h1001.phaseResume = null;
        }
        return true;
      }
      return false;
    }
    evScanLootHv(host, w, stance) {
      const flip = this.scan.pendingHighFlip;
      if (!flip || flip.kind !== "loot_hv") return false;
      if (this.runTicks - this.scan.layer2UsedTick < SCAN_PERIOD && this.scan.layer2UsedTick >= 0) {
        return false;
      }
      if (nodeThreat(w, flip.x, flip.y)) {
        this.scan.pendingHighFlip = null;
        return false;
      }
      const onWay = pathOnWay(flip, this.desireXY, w.tile);
      const gate = phaseAllowsChestEvent(this.h1001.phase, onWay);
      if (gate === "suppress") {
        this.scan.pendingHighFlip = null;
        return false;
      }
      if (gate === "queue") {
        pushEnrouteStop(this.scan, {
          id: flip.id,
          kind: "loot",
          x: flip.x,
          y: flip.y,
          want: true,
          hv: true
        });
        this.scan.pendingHighFlip = null;
        return false;
      }
      this.h1001.topEvent = "loot_hv";
      if (w.bagFree <= 0) {
        pushWantLoot(this.scan, {
          id: flip.id,
          x: flip.x,
          y: flip.y,
          value: 20,
          kindBand: 2
        });
        this.scan.pendingHighFlip = null;
        this.bagFullUntil = this.runTicks + 600;
        return false;
      }
      const d = cheb(w.tile.x, w.tile.y, flip.x, flip.y);
      if (d <= 1) {
        if (host.pickupLoot()) {
          this.scan.pendingHighFlip = null;
          this.scan.layer2UsedTick = this.runTicks;
          this.setStatus1001(host, w, stance, "scan HV loot");
          host.equipUp();
          if (this.h1001.phaseResume) {
            this.h1001.phase = this.h1001.phaseResume;
            this.h1001.phaseResume = null;
          }
          return true;
        }
        this.scan.pendingHighFlip = null;
        return false;
      }
      this.desireXY = { x: flip.x, y: flip.y };
      host.walkTo(flip.x, flip.y);
      this.setStatus1001(host, w, stance, "walk HV loot");
      return true;
    }
    /** Calm / phase consume: take next enroute stop if free. */
    drainEnrouteStop(host, w, stance) {
      if (!this.scan.enrouteStops.length) return false;
      if (this.h1001.topEvent === "lethal" || this.h1001.topEvent === "emerg_food") return false;
      const stop = this.scan.enrouteStops[0];
      if (nodeThreat(w, stop.x, stop.y) && stop.kind !== "chest") {
        this.scan.enrouteStops.shift();
        return false;
      }
      const d = cheb(w.tile.x, w.tile.y, stop.x, stop.y);
      if (stop.kind === "chest") {
        if (d <= 1) {
          this.scan.enrouteStops.shift();
          if (this.tryOpenChestOnce(host, w, stance, { needBag: false, cool: 2, bypassSoft: true })) {
            this.afterChestOpened(host, w, stance);
            return true;
          }
          return false;
        }
        this.desireXY = { x: stop.x, y: stop.y };
        host.walkTo(stop.x, stop.y);
        this.setStatus1001(host, w, stance, "enroute chest");
        return true;
      }
      if (stop.kind === "loot") {
        if (w.bagFree <= 0) {
          pushWantLoot(this.scan, {
            id: stop.id,
            x: stop.x,
            y: stop.y,
            value: stop.hv ? 20 : 1,
            kindBand: stop.hv ? 2 : 4
          });
          this.scan.enrouteStops.shift();
          return false;
        }
        if (d <= 1) {
          this.scan.enrouteStops.shift();
          if (host.pickupLoot()) {
            this.setStatus1001(host, w, stance, "enroute loot");
            return true;
          }
          return false;
        }
        if (!stop.hv && d > SHRIMP_ENROUTE_CHEB) {
          this.scan.enrouteStops.shift();
          return false;
        }
        this.desireXY = { x: stop.x, y: stop.y };
        host.walkTo(stop.x, stop.y);
        this.setStatus1001(host, w, stance, "enroute loot");
        return true;
      }
      if (stop.kind === "pond") {
        if (this.hasBagCookables(w)) return false;
        this.scan.enrouteStops.shift();
        if (!host.hasTool("rod")) return false;
        this.desireXY = { x: stop.x, y: stop.y };
        host.walkTo(stop.x, stop.y);
        this.setStatus1001(host, w, stance, "enroute pond");
        return true;
      }
      this.scan.enrouteStops.shift();
      this.desireXY = { x: stop.x, y: stop.y };
      host.walkTo(stop.x, stop.y);
      this.setStatus1001(host, w, stance, `enroute ${stop.kind}`);
      return true;
    }
    evLethal(host, w, stance) {
      var _a, _b;
      const hpPct = w.maxHp > 0 ? w.hp / w.maxHp : 1;
      const pressing = w.foes.some(
        (f) => f.alive && f.lit && (f.danger === "deadly" || f.danger === "threat" && f.dist <= 3 || f.dist <= 1 && f.danger !== "prey")
      );
      if (!pressing) return false;
      const pressFoe = w.foes.filter(
        (f) => f.alive && f.lit && (f.danger === "deadly" || f.danger === "threat" && f.dist <= 3 || f.dist <= 1 && f.danger !== "prey")
      ).sort((a, b) => a.dist - b.dist)[0];
      if (pressFoe) {
        const o = (_a = host.fightOutlook) == null ? void 0 : _a.call(host, pressFoe);
        if (o && o.win && o.winRate >= 0.7 && o.hpLossExpected < w.hp * 0.5) {
          return false;
        }
      }
      if (hpPct > 0.35 && !(hpPct < 0.55 && w.food > 0)) return false;
      this.h1001.topEvent = "lethal";
      host.clearEngage();
      if (w.food > 0 || w.healReserve > 0) {
        if (!((_b = host.drinkOnce) == null ? void 0 : _b.call(host, "hurt"))) host.eat();
        this.setStatus1001(host, w, stance, "lethal run+eat");
        if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        this.cool = 2;
        return true;
      }
      if (w.hasStyleWeapon && pressFoe) {
        this.engageSmart(host, w, stance, pressFoe, "lethal kite");
        this.cool = 1;
        return true;
      }
      if (!w.hasStyleWeapon && (pressFoe == null ? void 0 : pressFoe.ranged)) {
        if (this.tryCoverBreakLos(host, w, stance, pressFoe, "lethal cover")) return true;
        host.engage(pressFoe);
        this.setStatus1001(host, w, stance, "lethal close");
        this.cool = 1;
        return true;
      }
      this.setStatus1001(host, w, stance, "lethal kite");
      if (w.hub) host.walkTo(w.hub.x, w.hub.y);
      else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
      this.cool = 2;
      return true;
    }
    /**
     * Darren t1540/t1541 food urgency gate.
     * Urgency ONLY when:
     *   (1) low HP (~<72%) AND no food/heal, OR
     *   (2) chased by lit threat/deadly (or melee non-prey) with empty food.
     * t1648: Layer-1 emerg ONLY chased+empty. Unchased empty/hungry → calm high-pri
     * (evCalmFoodHighPri), not emerg find-pond interrupt.
     * Calm healthy start → kit/TOOLS as normal. stance.hungry / food=0 alone ≠ emerg.
     */
    foodUrgency(w) {
      const emptyFood = w.food <= 0 && w.healReserve <= 0;
      const chased = w.foes.some(
        (f) => f.alive && f.lit && (f.danger === "deadly" || f.danger === "threat" && f.dist <= 3 || f.dist <= 1 && f.danger !== "prey" || f.watch === 3)
      );
      if (chased && emptyFood) return true;
      return false;
    }
    /** Unchased empty heal / hungry — calm high-pri food, not Layer-1 emerg (t1648).
     *  2019: bag cookables ≠ empty for SEEK; still high-pri when hungry so cook runs. */
    calmFoodHighPri(w, stance) {
      if (this.foodUrgency(w)) return false;
      if (this.foodPathEmpty(w)) return true;
      if (this.hasBagCookables(w) && (stance.hungry || w.food < stance.minFood || w.healReserve <= 0)) {
        return true;
      }
      if (stance.hungry && w.food < stance.minFood) return true;
      return false;
    }
    /** True when ~30% empty unchased and a Layer-2 chest candidate is outlook-safe (7B). */
    sevenBChestEligible(w) {
      const hpPct = w.maxHp > 0 ? w.hp / w.maxHp : 1;
      const emptyFood = w.food <= 0 && w.healReserve <= 0;
      if (!emptyFood) return false;
      if (hpPct >= 0.45 || hpPct < 0.25) return false;
      const chased = w.foes.some(
        (f) => f.alive && f.lit && (f.danger === "deadly" || f.danger === "threat" && f.dist <= 3 || f.dist <= 1 && f.danger !== "prey")
      );
      if (chased) return false;
      const flip = this.scan.pendingHighFlip;
      if (!flip || flip.kind !== "chest_safe" && flip.kind !== "softblock_chest_exp") return false;
      if (this.chestExposed(w)) return false;
      return true;
    }
    evEmergFood(host, w, stance) {
      if (!this.foodUrgency(w)) return false;
      if (!stance.hungry && w.food > 0 && w.healReserve > 0) return false;
      this.h1001.topEvent = "emerg_food";
      if (this.h1001.phase !== "FOOD_BUFFER" && this.h1001.phase !== "BOOT" && this.h1001.phase !== "TOOLS") {
        this.h1001.phaseResume = this.h1001.phase;
      }
      return this.runFoodSeek(host, w, stance, "emerg");
    }
    /**
     * Shared food-seek body for true emerg (chased) and calm high-pri (unchased).
     * t1645/t1648: never fish / find-pond without rod — fund chop·sell·buy or yield.
     * labelPrefix 'emerg' | 'food' for status (unchased never says emerg find pond).
     */
    runFoodSeek(host, w, stance, labelPrefix) {
      if (w.food > 0 && w.hp < w.maxHp * 0.85) host.eat();
      if (w.food <= 0 && w.coins > 0) host.buyFoodIfCritical();
      if (this.tryCookBagCookables(host, w, stance, `${labelPrefix} cook`)) return true;
      const pond = this.resolvePond(w);
      const tree = this.mem(w, "tree");
      const hasRod = host.hasTool("rod");
      if (!hasRod) {
        if ((w.pondKnown || pond) && this.canFundRodNow(w)) {
          this.setStatus1001(host, w, stance, `${labelPrefix} rod`);
          if (host.acquireTool("rod")) return true;
        }
        if (this.tryFundBeginnerToolFarm(host, w, stance, tree, pond)) return true;
        if (labelPrefix === "emerg" && w.hub) {
          this.desireXY = { x: w.hub.x, y: w.hub.y };
          host.walkTo(w.hub.x, w.hub.y);
          this.setStatus1001(host, w, stance, "emerg hub fund");
          return true;
        }
        if (labelPrefix === "food") {
          this.h1001.phase = this.beginnerToolsIncomplete(host) ? "TOOLS" : "FOOD_BUFFER";
          return false;
        }
        this.h1001.topEvent = "none";
        return false;
      }
      if (pond || w.gather && w.pondKnown) {
        const t = pond != null ? pond : w.gather;
        this.setStatus1001(host, w, stance, `${labelPrefix} fish`);
        this.lastFoodFarm = { depth: w.depth, x: t.x, y: t.y };
        this.desireXY = { x: t.x, y: t.y };
        if (this.walkToTile(host, t.x, t.y)) return true;
        if (this.tryGather(host, w, stance, `${labelPrefix} fish`)) return true;
        const attempt = host.gatherAt(t.x, t.y);
        if (attempt.ok || /^enroute$/i.test(attempt.reason || "")) return true;
        return true;
      }
      if (this.lastFoodFarm && this.lastFoodFarm.depth === w.depth) {
        this.setStatus1001(host, w, stance, `${labelPrefix} last farm`);
        this.desireXY = { x: this.lastFoodFarm.x, y: this.lastFoodFarm.y };
        host.walkTo(this.lastFoodFarm.x, this.lastFoodFarm.y);
        return true;
      }
      this.h1001.phase = "FOOD_BUFFER";
      this.setStatus1001(host, w, stance, `${labelPrefix} find pond`);
      const spot = this.pickFindPondSpot(w);
      if (spot) {
        this.desireXY = { x: spot.x, y: spot.y };
        host.walkTo(spot.x, spot.y);
      }
      return true;
    }
    /**
     * 2018 t1653: pick explore target for unknown pond.
     * Prefer unvisited ways / explore frontier away from hub+shop; never prefer
     * wander that sits on hub/shop (ujvnep walk_hub thrash while find pond).
     */
    pickFindPondSpot(w) {
      var _a;
      const hub = w.hub;
      const shop = this.mem(w, "shop");
      const nearMagnet = (x, y) => {
        if (hub && cheb(x, y, hub.x, hub.y) <= 2) return true;
        if (shop && cheb(x, y, shop.x, shop.y) <= 2) return true;
        return false;
      };
      const ways = ((_a = w.seen) == null ? void 0 : _a.ways) || [];
      let bestWay = null;
      for (const wy of ways) {
        if (wy.dx === -1 && wy.dy === -1) continue;
        if (wy.been || wy.back) continue;
        if (wy.mobs >= 3) continue;
        const x = w.tile.x + wy.dx;
        const y = w.tile.y + wy.dy;
        if (nearMagnet(x, y)) continue;
        const score = Math.abs(wy.dx) + Math.abs(wy.dy) - wy.mobs * 2;
        if (!bestWay || score > bestWay.score) bestWay = { x, y, score };
      }
      if (bestWay) return { x: bestWay.x, y: bestWay.y };
      const cands = [];
      if (w.explore) cands.push(w.explore);
      if (w.wander) cands.push(w.wander);
      const away = cands.filter((c) => !nearMagnet(c.x, c.y));
      if (away.length) return away[0];
      if (w.explore) return w.explore;
      if (w.wander) return w.wander;
      return null;
    }
    /**
     * t1648: unchased food-seek as calm high-priority (before phase skills, after
     * enrouteStops) — not Layer-1 emerg. Lets calm queue drain first.
     */
    evCalmFoodHighPri(host, w, stance) {
      var _a;
      if (!this.calmFoodHighPri(w, stance)) return false;
      if (this.h1001.phase !== "FOOD_BUFFER" && this.h1001.phase !== "BOOT" && this.h1001.phase !== "TOOLS") {
        this.h1001.phaseResume = (_a = this.h1001.phaseResume) != null ? _a : this.h1001.phase;
      }
      this.h1001.phase = "FOOD_BUFFER";
      this.h1001.topEvent = "none";
      const pond = this.resolvePond(w);
      if (host.hasTool("rod") && pond && !this.hasBagCookables(w)) {
        pushEnrouteStop(this.scan, {
          id: `${w.depth}:pond:${pond.x},${pond.y}`,
          kind: "pond",
          x: pond.x,
          y: pond.y,
          want: true,
          hv: false,
          pri: 90
        });
      }
      return this.runFoodSeek(host, w, stance, "food");
    }
    evMobSudden(host, w, stance) {
      const melee = w.foes.filter((f) => f.alive && f.lit && f.dist <= 1).sort((a, b) => a.dist - b.dist)[0];
      if (!melee) return false;
      this.h1001.topEvent = "mob_sudden";
      const worn = w.hasMetalWeapon || w.hasStyleWeapon || w.hasArmour;
      const ok = this.outlookOk(host, w, melee, {
        allowThreat: worn,
        minWinRate: worn ? 0.4 : 0.5
      });
      if (!ok) {
        host.clearEngage();
        if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        this.setStatus1001(host, w, stance, host.fightOutlook ? "mob kite outlook" : "mob kite");
        return true;
      }
      this.engageSmart(host, w, stance, melee, "melee");
      this.setStatus1001(host, w, stance, "mob engage");
      return true;
    }
    evBagFull(host, w, stance) {
      if (w.bagFree > 0) return false;
      this.h1001.topEvent = "bag_full";
      this.bagFullUntil = this.runTicks + 600;
      this.setStatus1001(host, w, stance, "bag forge\u2192trim");
      if (host.forgeWieldedOnce()) return true;
      const flooded = this.bagFloodedWeps(host, w);
      if (!flooded && this.wantSmithKit(w) && host.smithKitOnce()) return true;
      if (host.craftGemRingOnce()) return true;
      if (!flooded && host.craftWoodForValueOnce()) return true;
      if (!flooded && host.fletchStyleOnce()) return true;
      if (this.trySellUnusedOnce(host, w)) return true;
      if (host.sellOreKeep(this.h1001.lockedMats ? 2 : 0)) return true;
      if (this.hasSellableMats(w) && host.sellMatsForCoins(1)) return true;
      this.bagFullFails++;
      if (this.bagFullFails >= 3) {
        this.bagFullUntil = 0;
        this.bagFullFails = 0;
        if (host.freeCookSlot()) return true;
      }
      const shop = this.mem(w, "shop");
      if (shop) {
        host.walkTo(shop.x, shop.y);
        return true;
      }
      return true;
    }
    evHighCeiling(host, w, stance) {
      if (!w.loot) return false;
      const d = cheb(w.tile.x, w.tile.y, w.loot.x, w.loot.y);
      if (d > 6) return false;
      if (d > 2 && w.bagFree > 1) return false;
      this.h1001.topEvent = "high_ceiling";
      if (w.bagFree <= 0) {
        if (!host.freeCookSlot() && !this.trySellUnusedOnce(host, w)) {
          this.setStatus1001(host, w, stance, "ceiling need slot");
          return false;
        }
      }
      this.setStatus1001(host, w, stance, "high-ceiling loot");
      if (d <= 1) {
        host.pickupLoot();
        host.equipUp();
        return true;
      }
      host.walkTo(w.loot.x, w.loot.y);
      return true;
    }
    evFloorLoot(host, w, stance) {
      var _a, _b;
      if (host.pickupLoot()) {
        this.h1001.topEvent = "floor_loot";
        this.setStatus1001(host, w, stance, "pickup");
        return true;
      }
      if (w.loot && w.bagFree > 0 && cheb(w.tile.x, w.tile.y, w.loot.x, w.loot.y) <= 4) {
        this.h1001.topEvent = "floor_loot";
        this.setStatus1001(host, w, stance, "walk loot");
        host.walkTo(w.loot.x, w.loot.y);
        return true;
      }
      if (((_a = w.seen) == null ? void 0 : _a.chest) && w.seen.chestOpenable && !w.seen.chestBlocked) {
        const adj = (_b = w.seen.chestAdj) != null ? _b : w.seen.chest;
        const softActive = this.runTicks < this.chestBlockUntil;
        const bypass = adj ? softBlockBypass(adj, softActive, this.desireXY, w.tile, this.h1001.nodes, w.depth) : !softActive;
        if (bypass) {
          const threat = w.foes.some(
            (f) => f.alive && f.lit && f.dist <= 2 && (f.danger === "threat" || f.danger === "deadly")
          );
          if (!threat && this.tryOpenChestOnce(host, w, stance, { needBag: false, cool: 2, bypassSoft: true })) {
            this.h1001.topEvent = "floor_loot";
            this.afterChestOpened(host, w, stance);
            return true;
          }
        }
      }
      return false;
    }
    evForgeMiss(host, w, stance) {
      if (this.runTicks >= this.forgeBlockUntil) return false;
      if (this.h1001.phase === "GEAR_FARM" || this.h1001.phase === "CEILING" || this.h1001.phase === "RESCHED_FORGE") {
        this.h1001.topEvent = "forge_miss";
        this.h1001.phase = w.coins < 30 && w.oreCount < 2 ? "GATHER_FUND" : "SELL_TRIM";
        this.setStatus1001(host, w, stance, "forge miss \u2192 fund/trim");
        return this.runPhase1001(host, w, stance);
      }
      return false;
    }
    /**
     * t1622/t1624: altar act only when essence>0 (craft) or imbueable worn piece.
     * `false` = host says no; `null` = older host omitted fields → probe via runecraftOnce.
     */
    altarActReady(w) {
      if (typeof w.essenceCount !== "number") return null;
      if (w.essenceCount > 0) return true;
      return w.canImbueWorn === true;
    }
    /** True while pick/hatchet/rod kit still incomplete — tool bootstrap beats altar. */
    beginnerToolsIncomplete(host) {
      return !host.hasTool("pickaxe") || !host.hasTool("hatchet") || !host.hasTool("rod");
    }
    evAltar(host, w, stance) {
      const altar = this.mem(w, "altar");
      if (!altar) return false;
      const d = cheb(w.tile.x, w.tile.y, altar.x, altar.y);
      if (d > 3) return false;
      if (this.beginnerToolsIncomplete(host) || this.h1001.phase === "TOOLS") return false;
      const ready = this.altarActReady(w);
      if (ready === false) return false;
      const anvil = this.mem(w, "anvil");
      const opts = [
        { id: "runecraft", label: "altar rune", value: 8, cost: 0, risk: 0, travel: d, progress: 1 }
      ];
      if (anvil && w.oreCount > 0) {
        opts.push({
          id: "forge",
          label: "forge instead",
          value: 7,
          cost: 1,
          risk: 0,
          travel: cheb(w.tile.x, w.tile.y, anvil.x, anvil.y),
          progress: 1.2
        });
      }
      if (!opts.length) return false;
      const best = pickUtility(opts);
      if (!best) return false;
      if (best.id === "runecraft") {
        if (!host.runecraftOnce()) return false;
        this.h1001.topEvent = "altar";
        this.h1001.utilityPick = "runecraft";
        this.setStatus1001(host, w, stance, "altar runecraft");
        return true;
      }
      if (host.forgeWieldedOnce() || this.wantSmithKit(w) && host.smithKitOnce()) {
        this.h1001.topEvent = "altar";
        this.h1001.utilityPick = "forge";
        this.setStatus1001(host, w, stance, "altar\u2192forge");
        return true;
      }
      if (anvil && w.oreCount > 0) {
        this.h1001.topEvent = "altar";
        this.h1001.utilityPick = "forge";
        this.setStatus1001(host, w, stance, "altar\u2192forge");
        host.walkTo(anvil.x, anvil.y);
        return true;
      }
      return false;
    }
    runPhase1001(host, w, stance) {
      var _a;
      switch (this.h1001.phase) {
        case "BOOT":
        case "MAP_HUB":
          return this.phaseMapHub1001(host, w, stance);
        case "TOOLS":
          return this.phaseTools1001(host, w, stance);
        case "FIRST_WEP":
          return this.phaseFirstWep1001(host, w, stance);
        case "GATHER_FUND":
          return this.phaseGatherFund1001(host, w, stance);
        case "SELL_TRIM":
          return this.phaseSellTrim1001(host, w, stance);
        case "FOOD_BUFFER":
          return this.phaseFood1001(host, w, stance);
        case "CULTIVATE":
          if ((_a = host.brewOnce) == null ? void 0 : _a.call(host)) {
            this.setStatus1001(host, w, stance, "cultivate brew");
            return true;
          }
          this.h1001.phase = "GEAR_FARM";
          return false;
        case "PUSH":
        case "CEILING":
        case "RESCHED_FORGE":
        case "GEAR_FARM":
        default:
          return this.phaseGear1001(host, w, stance);
      }
    }
    phaseMapHub1001(host, w, stance) {
      this.setStatus1001(host, w, stance, "map hub");
      if (w.hub && cheb(w.tile.x, w.tile.y, w.hub.x, w.hub.y) > 2) {
        host.walkTo(w.hub.x, w.hub.y);
        return true;
      }
      if (this.mem(w, "shop") || this.mem(w, "anvil") || this.mem(w, "rock") || this.mem(w, "pond") || this.mem(w, "tree")) {
        this.h1001.phase = "TOOLS";
        return false;
      }
      if (w.explore) {
        host.walkTo(w.explore.x, w.explore.y);
        return true;
      }
      return false;
    }
    /** Rod shop is 30c; fletch needs ≥1 spare log. Else acquireTool only walks shop (t1612). */
    canFundRodNow(w) {
      return w.coins >= 30 || w.logCount >= 1;
    }
    /** Plain pick/hatchet shop is BEGINNER_TOOL_PRICE 30c; forge needs anvil+ore (t1628 nncz96). */
    canFundPlainToolNow(tool, w, anvil) {
      if (w.coins >= 30) return true;
      return !!(anvil || w.anvilNearby) && w.oreCount > 0;
    }
    canFundToolNow(tool, w, anvil) {
      if (tool === "rod") return this.canFundRodNow(w);
      return this.canFundPlainToolNow(tool, w, anvil);
    }
    /** Bag has ore/logs sellMatsForCoins can cash (proxy; host also gates walk in 0.5.721+). */
    hasSellableMats(w) {
      return w.oreCount > 0 || w.logCount > 0 || w.hasLogs;
    }
    /** Eng 2017: pond tile from mem register or live FOV seen.pond. */
    resolvePond(w) {
      var _a, _b, _c;
      return (_c = (_b = this.mem(w, "pond")) != null ? _b : (_a = w.seen) == null ? void 0 : _a.pond) != null ? _c : null;
    }
    /**
     * Eng 2019: bag cookable raw (host `rawFish` = cookable count — any raw_* food
     * the host reports). Counts toward the food path; not "empty buffer".
     */
    hasBagCookables(w) {
      return w.rawFish > 0;
    }
    /**
     * Eng 2019: truly empty for SEEK more gather (fish/pond/buy). Cooked pieces,
     * heal reserve, OR bag cookables all count — cookables → cook first, don't seek.
     * Combat emerg (foodUrgency) still uses cooked-only empty (raw can't be eaten mid-fight).
     */
    foodPathEmpty(w) {
      return w.food <= 0 && w.healReserve <= 0 && !this.hasBagCookables(w);
    }
    /**
     * Eng 2019: cook / light / chop-fuel when bag has cookables.
     * Shared by maintain layer, food-seek, FOOD_BUFFER, fund farm — one rule.
     */
    tryCookBagCookables(host, w, stance, statusLabel) {
      var _a, _b, _c;
      if (!this.hasBagCookables(w)) return false;
      if (!w.hasFire && w.hasLogs) host.lightFireOnce();
      else if (!w.hasFire && !w.hasLogs) {
        const tree = (_c = (_b = this.mem(w, "tree")) != null ? _b : (_a = w.seen) == null ? void 0 : _a.tree) != null ? _c : null;
        if (tree && host.hasTool("hatchet") && !this.isGatherTileBlocked(tree.x, tree.y)) {
          if (this.walkToTile(host, tree.x, tree.y)) {
            this.setStatus1001(host, w, stance, statusLabel);
            return true;
          }
          if (this.tryGather(host, w, stance, "chop for fire")) {
            this.setStatus1001(host, w, stance, statusLabel);
            return true;
          }
        }
      }
      if (w.bagFree <= 0) host.freeCookSlot();
      host.cookOnce();
      this.setStatus1001(host, w, stance, statusLabel);
      return true;
    }
    /**
     * Eng 2017 (t1652 ujvnep): gate host.sellUnusedOnce.
     * Host walks shop when hasPlain (e.g. bag Sword) even with 0 mats — door thrash if
     * path stalls; returns true every walk tick with no sell. Stall after no progress;
     * skip entirely when empty-food + rod + known pond/farm (fish first).
     */
    trySellUnusedOnce(host, w) {
      if (this.runTicks < this.sellUnusedBlockUntil) return false;
      const needFoodPath = this.foodPathEmpty(w) || this.hasBagCookables(w);
      const pond = this.resolvePond(w);
      const farmOk = !!pond || w.pondKnown || !!this.lastFoodFarm && this.lastFoodFarm.depth === w.depth;
      if (needFoodPath && this.hasBagCookables(w)) return false;
      if (needFoodPath && host.hasTool("rod") && farmOk) return false;
      if (this.foodPathEmpty(w) && host.hasTool("rod") && !this.hasSellableMats(w)) return false;
      const before = `${w.coins}|${w.bagFree}|${w.logCount}|${w.oreCount}|${w.progressFp || ""}`;
      const acted = host.sellUnusedOnce();
      if (!acted) {
        this.sellUnusedFailStreak = 0;
        this.sellUnusedProgKey = before;
        return false;
      }
      const afterW = host.world();
      const after = `${afterW.coins}|${afterW.bagFree}|${afterW.logCount}|${afterW.oreCount}|${afterW.progressFp || ""}`;
      if (after !== before) {
        this.sellUnusedFailStreak = 0;
        this.sellUnusedProgKey = after;
        return true;
      }
      if (before === this.sellUnusedProgKey) this.sellUnusedFailStreak++;
      else {
        this.sellUnusedProgKey = before;
        this.sellUnusedFailStreak = 1;
      }
      if (this.sellUnusedFailStreak >= 6) {
        this.sellUnusedBlockUntil = this.runTicks + 48;
        this.sellUnusedFailStreak = 0;
        return false;
      }
      return true;
    }
    /**
     * 2014: host smithKitOnce smiths dagger whenever !hasMetalWeapon — even with wand/bow worn
     * and a bag full of bronze daggers. Only call when ore can pay and style kit is not worn.
     */
    wantSmithKit(w) {
      if (w.oreCount <= 0) return false;
      if (w.hasStyleWeapon) return false;
      if (w.hasMetalWeapon && w.hasArmour) return false;
      return true;
    }
    /** Worn kit + bag still holding weapon pieces → trim/sell, don't remake. */
    bagFloodedWeps(host, w) {
      var _a, _b;
      if (!w.hasStyleWeapon && !w.hasMetalWeapon) return false;
      const bag = (_b = (_a = host.listBagCombatGear) == null ? void 0 : _a.call(host)) != null ? _b : [];
      return bag.some((b) => b.slot === "weapon");
    }
    /**
     * t1630–t1633 nncz96: fund beginner shop tool (30c) with owned hatchet/rod on
     * registered mem tree/pond — cook → sell → gather. Prefer farm over explore loot.
     */
    tryFundBeginnerToolFarm(host, w, stance, tree, pond) {
      if (this.tryCookBagCookables(host, w, stance, "tools fund cook")) return true;
      const pondTile = pond != null ? pond : this.resolvePond(w);
      if (pondTile && host.hasTool("rod") && !this.isGatherTileBlocked(pondTile.x, pondTile.y)) {
        this.setStatus1001(host, w, stance, "tools fund fish");
        this.lastFoodFarm = { depth: w.depth, x: pondTile.x, y: pondTile.y };
        if (this.walkToTile(host, pondTile.x, pondTile.y)) return true;
        if (this.tryGather(host, w, stance, "tools fund fish")) return true;
        const attempt = host.gatherAt(pondTile.x, pondTile.y);
        if (attempt.ok || /^enroute$/i.test(attempt.reason || "")) return true;
      }
      if (tree && host.hasTool("hatchet") && !this.isGatherTileBlocked(tree.x, tree.y)) {
        this.setStatus1001(host, w, stance, "tools fund chop");
        this.desireXY = { x: tree.x, y: tree.y };
        const attempt = host.gatherAt(tree.x, tree.y);
        if (attempt.ok || /^enroute$/i.test(attempt.reason || "")) {
          this.setStatus1001(host, w, stance, `tools fund chop (${tree.x},${tree.y})`);
          this.cool = attempt.ok ? 2 : 1;
          return true;
        }
        this.noteGatherFail(tree.x, tree.y, attempt.tool);
        this.noteAction(`fund chop fail \u2014 ${attempt.reason || "x"}`);
        host.log(`AUTO: fund chop fail \u2014 ${attempt.reason || "x"}`);
      }
      const need = Math.max(1, 30 - w.coins);
      if (this.trySellUnusedOnce(host, w)) {
        this.setStatus1001(host, w, stance, "tools fund sell");
        return true;
      }
      if (this.hasSellableMats(w) && host.sellMatsForCoins(need)) {
        this.setStatus1001(host, w, stance, "tools fund sell mats");
        return true;
      }
      return false;
    }
    /** True when owned farm tools + registered/visible nodes (or bag mats) can raise 30c. */
    canFarmFundBeginnerTool(host, w, tree, pond) {
      if (this.hasBagCookables(w) || w.logCount > 0) return true;
      if (pond && host.hasTool("rod") && !this.isGatherTileBlocked(pond.x, pond.y)) return true;
      if (tree && host.hasTool("hatchet") && !this.isGatherTileBlocked(tree.x, tree.y)) return true;
      if (host.hasTool("rod") && w.pondKnown) return true;
      return false;
    }
    phaseTools1001(host, w, stance) {
      var _a, _b;
      const rock = this.mem(w, "rock");
      const tree = this.mem(w, "tree");
      const pond = this.mem(w, "pond");
      const anvil = this.mem(w, "anvil");
      const tool = bootstrapTool(host, w, this.h1001.nodes);
      if (tool === null && !rock && !tree && !pond && !w.anvilNearby && !anvil) {
        this.setStatus1001(host, w, stance, "tools wait node");
        if (w.explore) {
          host.walkTo(w.explore.x, w.explore.y);
          return true;
        }
        return false;
      }
      const fundingTool = !!tool && !host.hasTool(tool) && !this.canFundToolNow(tool, w, anvil);
      if (tool) {
        const tryAcquire = host.hasTool(tool) || this.canFundToolNow(tool, w, anvil);
        if (tryAcquire) {
          this.setStatus1001(host, w, stance, `tools ${tool}`);
          if (host.acquireTool(tool)) {
            if (tool === "rod" && host.hasTool("rod") && (pond || w.pondKnown)) {
              const t = pond != null ? pond : w.gather;
              if (t) {
                this.lastFoodFarm = { depth: w.depth, x: t.x, y: t.y };
                this.setStatus1001(host, w, stance, "tools fish");
                if (this.walkToTile(host, t.x, t.y)) return true;
              }
            }
            return true;
          }
          if (tool === "pickaxe" && (anvil || w.anvilNearby) && this.wantSmithKit(w) && host.smithKitOnce()) return true;
        } else {
          this.setStatus1001(host, w, stance, `tools fund ${tool}`);
          if (this.tryFundBeginnerToolFarm(host, w, stance, tree, pond)) return true;
        }
      }
      const liveRock = (_b = (_a = w.seen) == null ? void 0 : _a.rock) != null ? _b : null;
      if (liveRock && host.hasTool("pickaxe") && !this.isGatherTileBlocked(liveRock.x, liveRock.y)) {
        this.setStatus1001(host, w, stance, "tools mine");
        if (this.walkToTile(host, liveRock.x, liveRock.y)) return true;
        if (this.tryGather(host, w, stance, "tools mine")) return true;
        this.blockGatherTile(liveRock.x, liveRock.y);
      }
      if (!fundingTool && pond && host.hasTool("rod") && !this.isGatherTileBlocked(pond.x, pond.y)) {
        this.setStatus1001(host, w, stance, "tools fish");
        this.lastFoodFarm = { depth: w.depth, x: pond.x, y: pond.y };
        if (this.walkToTile(host, pond.x, pond.y)) return true;
        return this.tryGather(host, w, stance, "tools fish");
      }
      if (host.hasTool("hatchet") && (!host.hasTool("rod") || !fundingTool)) {
        if (w.logCount >= 1) {
          if (host.fletchStyleOnce()) {
            this.setStatus1001(host, w, stance, "tools fletch");
            return true;
          }
          if (host.craftWoodForValueOnce()) {
            this.setStatus1001(host, w, stance, "tools craft wood");
            return true;
          }
        }
        if (tree && !this.isGatherTileBlocked(tree.x, tree.y)) {
          this.setStatus1001(host, w, stance, "tools chop");
          this.desireXY = { x: tree.x, y: tree.y };
          const attempt = host.gatherAt(tree.x, tree.y);
          if (attempt.ok || /^enroute$/i.test(attempt.reason || "")) {
            this.setStatus1001(host, w, stance, `tools chop (${tree.x},${tree.y})`);
            this.cool = attempt.ok ? 2 : 1;
            return true;
          }
          this.noteGatherFail(tree.x, tree.y, attempt.tool);
        }
        if (host.hasTool("rod")) {
          const p = this.resolvePond(w);
          if (p && !this.isGatherTileBlocked(p.x, p.y)) {
            this.setStatus1001(host, w, stance, "tools fish");
            this.lastFoodFarm = { depth: w.depth, x: p.x, y: p.y };
            if (this.walkToTile(host, p.x, p.y)) return true;
            if (this.tryGather(host, w, stance, "tools fish")) return true;
          }
        }
        if (this.trySellUnusedOnce(host, w)) {
          this.setStatus1001(host, w, stance, "tools sell wood");
          return true;
        }
        if (this.hasSellableMats(w) && host.sellMatsForCoins(1)) {
          this.setStatus1001(host, w, stance, "tools sell mats");
          return true;
        }
      }
      const canFarmFund = this.canFarmFundBeginnerTool(host, w, tree, pond);
      if (host.hasTool("pickaxe") && !liveRock && w.explore) {
        this.setStatus1001(host, w, stance, "tools find rock");
        host.walkTo(w.explore.x, w.explore.y);
        return true;
      }
      if (!rock && !host.hasTool("pickaxe") && w.explore && !canFarmFund) {
        this.setStatus1001(host, w, stance, "tools find rock");
        host.walkTo(w.explore.x, w.explore.y);
        return true;
      }
      if (!tool) {
        if ((host.hasTool("pickaxe") || host.hasTool("hatchet") || host.hasTool("rod")) && w.explore) {
          this.setStatus1001(host, w, stance, "tools explore");
          host.walkTo(w.explore.x, w.explore.y);
          return true;
        }
        if (!w.hasMetalWeapon && !w.hasStyleWeapon) {
          this.h1001.phase = "FIRST_WEP";
          return false;
        }
        this.h1001.phase = "GEAR_FARM";
        return false;
      }
      if (fundingTool && canFarmFund) {
        if (this.tryFundBeginnerToolFarm(host, w, stance, tree, pond)) return true;
        this.setStatus1001(host, w, stance, `tools fund ${tool}`);
        return true;
      }
      if (w.explore) {
        this.setStatus1001(host, w, stance, "tools explore");
        host.walkTo(w.explore.x, w.explore.y);
        return true;
      }
      return false;
    }
    /**
     * 2003 / t1591–t1597: score bag + smithable by offense → equip or smith+equip.
     * No piece-name hardcode. Falls through when host APIs missing (<0.5.716) or worn wins.
     */
    tryScoreSmithEquip(host, w, stance, label) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      if (!host.offenseScore || !host.listSmithable || !host.equipIfBetterOffense) return false;
      const wornW = (_b = (_a = host.wornOffense) == null ? void 0 : _a.call(host, "weapon")) != null ? _b : 0;
      const wornA = (_d = (_c = host.wornOffense) == null ? void 0 : _c.call(host, "armour")) != null ? _d : 0;
      const bag = (_f = (_e = host.listBagCombatGear) == null ? void 0 : _e.call(host)) != null ? _f : [];
      const smith = host.listSmithable();
      const bestOf = (slot, worn) => {
        let best = null;
        for (const b of bag) {
          if (b.slot !== slot) continue;
          if (b.offense <= worn) continue;
          if (!best || b.offense > best.offense) {
            best = { src: "bag", id: b.id, offense: b.offense, slotIndex: b.slotIndex };
          }
        }
        for (const s of smith) {
          if (s.slot !== slot || !s.canMakeNow) continue;
          if (s.offense <= worn) continue;
          if (!best || s.offense > best.offense) {
            best = { src: "smith", id: s.id, offense: s.offense };
          }
        }
        return best;
      };
      const wep = bestOf("weapon", wornW);
      if (wep) {
        this.setStatus1001(host, w, stance, `${label} score wep`);
        if (wep.src === "bag") {
          if (host.equipIfBetterOffense(wep.id)) return true;
          if (wep.slotIndex != null && ((_g = host.equipBagItem) == null ? void 0 : _g.call(host, wep.slotIndex))) return true;
        } else if ((_h = host.smithItemOnce) == null ? void 0 : _h.call(host, wep.id)) {
          host.equipIfBetterOffense(wep.id);
          return true;
        }
      }
      const arm = bestOf("armour", wornA);
      if (arm) {
        this.setStatus1001(host, w, stance, `${label} score armour`);
        if (arm.src === "bag") {
          if (host.equipIfBetterOffense(arm.id)) return true;
          if (arm.slotIndex != null && ((_i = host.equipBagItem) == null ? void 0 : _i.call(host, arm.slotIndex))) return true;
        } else if ((_j = host.smithItemOnce) == null ? void 0 : _j.call(host, arm.id)) {
          host.equipIfBetterOffense(arm.id);
          return true;
        }
      }
      return false;
    }
    phaseFirstWep1001(host, w, stance) {
      if (w.hasMetalWeapon || w.hasStyleWeapon) {
        this.h1001.phase = "GEAR_FARM";
        return false;
      }
      this.setStatus1001(host, w, stance, "first wep");
      const anvil = this.mem(w, "anvil");
      const rock = this.mem(w, "rock");
      const tree = this.mem(w, "tree");
      if (this.tryScoreSmithEquip(host, w, stance, "first wep")) return true;
      if ((anvil || w.anvilNearby) && this.wantSmithKit(w) && host.smithKitOnce()) return true;
      if (rock && host.hasTool("pickaxe")) {
        this.h1001.lockedMats = true;
        if (this.walkToTile(host, rock.x, rock.y)) return true;
        return this.tryGather(host, w, stance, "mine first wep");
      }
      if (w.logCount > 0 && host.fletchStyleOnce()) {
        this.tryScoreSmithEquip(host, w, stance, "first wep fletch");
        return true;
      }
      if (tree && host.hasTool("hatchet") && !this.isGatherTileBlocked(tree.x, tree.y)) {
        if (this.walkToTile(host, tree.x, tree.y)) return true;
        if (this.tryGather(host, w, stance, "chop first wep")) return true;
        const attempt = host.gatherAt(tree.x, tree.y);
        if (attempt.ok || /^enroute$/i.test(attempt.reason || "")) return true;
      }
      if (host.acquireTool("pickaxe")) return true;
      if (this.trySellUnusedOnce(host, w) || this.hasSellableMats(w) && host.sellMatsForCoins(1)) return true;
      if (anvil && w.oreCount > 0) {
        host.walkTo(anvil.x, anvil.y);
        return true;
      }
      if (w.explore) {
        host.walkTo(w.explore.x, w.explore.y);
        return true;
      }
      return false;
    }
    phaseGear1001(host, w, stance) {
      var _a, _b, _c, _d;
      this.h1001.phase = "GEAR_FARM";
      const foodLow = w.food <= Math.max(2, Math.floor(stance.minFood * 0.5));
      const matsFull = w.bagFree <= 1 && (w.oreCount >= 2 || w.logCount >= 2);
      const anvil = this.mem(w, "anvil");
      const rock = this.mem(w, "rock");
      if (anvil) {
        const nearElite = w.foes.some(
          (f) => f.alive && f.lit && (f.elite || f.danger === "threat" || f.danger === "deadly") && cheb(f.x, f.y, anvil.x, anvil.y) <= 6
        );
        const outlookHungry = w.foes.some((f) => {
          var _a2;
          if (!f.alive || !f.lit || cheb(f.x, f.y, anvil.x, anvil.y) > 6) return false;
          const o = (_a2 = host.fightOutlook) == null ? void 0 : _a2.call(host, f);
          return !!(o && o.hpLossExpected > Math.max(8, w.healReserve) && o.winRate < 0.75);
        });
        if ((nearElite || outlookHungry) && !stance.stocked) {
          this.setStatus1001(host, w, stance, outlookHungry && !nearElite ? "outlook food buffer" : "prepare before anvil");
          this.h1001.phaseResume = "GEAR_FARM";
          this.h1001.phase = "FOOD_BUFFER";
          return false;
        }
      }
      if (anvil || w.anvilNearby || ((_b = (_a = host.listBagCombatGear) == null ? void 0 : _a.call(host)) != null ? _b : []).some((b) => b.slot === "weapon" || b.slot === "armour")) {
        if (this.tryScoreSmithEquip(host, w, stance, "gear score")) return true;
      }
      if ((foodLow || matsFull) && (anvil || w.hub)) {
        this.setStatus1001(host, w, stance, "hub forge/clean");
        if (this.tryScoreSmithEquip(host, w, stance, "hub score")) return true;
        if (host.forgeWieldedOnce()) {
          this.lastImproveTick = this.runTicks;
          return true;
        }
        if (this.wantSmithKit(w) && host.smithKitOnce()) return true;
        if (host.craftGemRingOnce()) return true;
        if ((_c = host.craftClothesOnce) == null ? void 0 : _c.call(host)) return true;
        if ((_d = host.craftShieldOnce) == null ? void 0 : _d.call(host)) return true;
        this.h1001.phase = "SELL_TRIM";
        return this.phaseSellTrim1001(host, w, stance);
      }
      if (w.anvilNearby || anvil && cheb(w.tile.x, w.tile.y, anvil.x, anvil.y) <= 2) {
        if (this.tryScoreSmithEquip(host, w, stance, "anvil score")) return true;
        if (host.forgeWieldedOnce()) {
          this.h1001.forgeMissStreak = 0;
          this.lastImproveTick = this.runTicks;
          this.setStatus1001(host, w, stance, "forge+");
          return true;
        }
        this.h1001.forgeMissStreak++;
        this.forgeBlockCoins = w.coins;
        this.forgeBlockOre = w.oreCount;
        this.forgeBlockUntil = this.runTicks + 80;
        this.h1001.phase = "GATHER_FUND";
        this.setStatus1001(host, w, stance, "forge miss \u2192 fund");
        return false;
      }
      if (!w.hasArmour || !w.hasMetalWeapon) {
        if (w.oreCount >= 3 && (anvil || w.anvilNearby)) {
          this.setStatus1001(host, w, stance, "smith kit");
          if (this.tryScoreSmithEquip(host, w, stance, "kit score")) return true;
          if (this.wantSmithKit(w) && host.smithKitOnce()) return true;
          if (anvil && w.oreCount > 0) {
            host.walkTo(anvil.x, anvil.y);
            return true;
          }
        }
        if (rock && host.hasTool("pickaxe") && this.runTicks >= this.mineBlockUntil) {
          this.h1001.lockedMats = true;
          this.setStatus1001(host, w, stance, "mine gear");
          if (this.walkToTile(host, rock.x, rock.y)) return true;
          return this.tryGather(host, w, stance, "mine gear");
        }
        if (anvil) {
          host.walkTo(anvil.x, anvil.y);
          this.setStatus1001(host, w, stance, "walk anvil");
          return true;
        }
      }
      if (canEarlyPush(w, stance) && w.stairs && w.stairsLit) {
        this.setStatus1001(host, w, stance, "push stairs");
        host.walkTo(w.stairs.x, w.stairs.y);
        return true;
      }
      return false;
    }
    phaseGatherFund1001(host, w, stance) {
      this.setStatus1001(host, w, stance, "gather fund");
      if (w.oreCount >= 3 || w.coins >= 40) {
        this.forgeBlockUntil = 0;
        this.h1001.phase = "GEAR_FARM";
        this.h1001.lockedMats = true;
        return false;
      }
      const rock = this.mem(w, "rock");
      const tree = this.mem(w, "tree");
      if (rock && host.hasTool("pickaxe")) {
        if (this.walkToTile(host, rock.x, rock.y)) return true;
        return this.tryGather(host, w, stance, "fund mine");
      }
      if (tree && host.hasTool("hatchet")) {
        if (this.walkToTile(host, tree.x, tree.y)) return true;
        return this.tryGather(host, w, stance, "fund chop");
      }
      const prey = w.foes.filter(
        (f) => f.alive && f.lit && f.dist <= 8 && (f.danger === "prey" || f.danger === "even") && this.preferEngage(host, w, f)
      ).sort((a, b) => a.dist - b.dist)[0];
      if (prey && (w.hasMetalWeapon || w.hasStyleWeapon || w.hasArmour)) {
        this.engageSmart(host, w, stance, prey, "prey");
        this.setStatus1001(host, w, stance, "fund mobs");
        return true;
      }
      if (this.trySellUnusedOnce(host, w)) return true;
      if (w.explore) {
        host.walkTo(w.explore.x, w.explore.y);
        return true;
      }
      return false;
    }
    phaseSellTrim1001(host, w, stance) {
      this.setStatus1001(host, w, stance, "sell trim");
      if (host.craftGemRingOnce()) return true;
      if (this.trySellUnusedOnce(host, w)) return true;
      if (host.sellOreKeep(this.h1001.lockedMats && !w.hasArmour ? 2 : 0)) return true;
      if (this.hasSellableMats(w) && host.sellMatsForCoins(1)) return true;
      const shop = this.mem(w, "shop");
      if (shop && cheb(w.tile.x, w.tile.y, shop.x, shop.y) > 1) {
        host.walkTo(shop.x, shop.y);
        return true;
      }
      if (this.foodUrgency(w)) this.h1001.phase = "FOOD_BUFFER";
      else if (stance.hungry || w.food < stance.minFood) {
        const tool = bootstrapTool(host, w, this.h1001.nodes);
        this.h1001.phase = tool ? "TOOLS" : "GEAR_FARM";
      } else {
        this.h1001.phase = "GEAR_FARM";
      }
      return false;
    }
    phaseFood1001(host, w, stance) {
      var _a;
      if (!this.foodUrgency(w)) {
        const tool = bootstrapTool(host, w, this.h1001.nodes);
        if (tool || !w.hasMetalWeapon && !w.hasStyleWeapon && !w.kitReady && (this.mem(w, "tree") || this.mem(w, "rock") || this.mem(w, "shop") || this.mem(w, "pond"))) {
          this.h1001.phase = "TOOLS";
          this.h1001.phaseResume = null;
          return false;
        }
      }
      if (stance.stocked && w.food >= stance.minFood) {
        this.h1001.phase = (_a = this.h1001.phaseResume) != null ? _a : "GEAR_FARM";
        this.h1001.phaseResume = null;
        return false;
      }
      this.setStatus1001(host, w, stance, "food buffer");
      if (this.tryCookBagCookables(host, w, stance, "food cook")) return true;
      return this.runFoodSeek(host, w, stance, "food");
    }
    runCalm1001(host, w, stance) {
      var _a, _b;
      const chain = buildRoundTrip(this.h1001.nodes, w).filter((n) => {
        if (n.kind === "altar") {
          if (this.beginnerToolsIncomplete(host) || this.h1001.phase === "TOOLS") return false;
          return this.altarActReady(w) !== false;
        }
        if (n.kind === "anvil") return w.oreCount > 0;
        return true;
      });
      if (chain.length >= 2) {
        const next = chain[0];
        const ok2 = this.visitNode1001(host, w, stance, next.kind, next.x, next.y);
        if (!ok2) return false;
        this.h1001.topEvent = "camp_chain";
        this.h1001.utilityPick = `chain:${next.kind}`;
        this.setStatus1001(host, w, stance, `round-trip ${next.kind}`);
        return true;
      }
      const opts = calmUtilOptions(w, stance, this.h1001.nodes).filter((o) => {
        if (o.id === "mine") return host.hasTool("pickaxe");
        if (o.id === "chop") return host.hasTool("hatchet");
        if (o.id === "fish") return host.hasTool("rod");
        if (o.id === "anvil") return w.oreCount > 0;
        if (o.id === "altar" || o.id === "runecraft") {
          if (this.beginnerToolsIncomplete(host) || this.h1001.phase === "TOOLS") return false;
        }
        return true;
      });
      const best = pickUtility(opts);
      if (!best) return false;
      void UTILITY_WEIGHTS;
      void lookupGear;
      const kind = best.id === "anvil" ? "anvil" : best.id === "shop" ? "shop" : best.id === "fletch" ? "fletch" : best.id === "mine" ? "rock" : best.id === "chop" ? "tree" : best.id === "fish" ? "pond" : best.id;
      const tile = best.id === "mine" ? this.mem(w, "rock") : best.id === "chop" ? this.mem(w, "tree") : best.id === "fish" ? this.mem(w, "pond") : best.id === "anvil" ? this.mem(w, "anvil") : best.id === "shop" ? this.mem(w, "shop") : null;
      const ok = this.visitNode1001(
        host,
        w,
        stance,
        kind,
        (_a = tile == null ? void 0 : tile.x) != null ? _a : w.tile.x,
        (_b = tile == null ? void 0 : tile.y) != null ? _b : w.tile.y
      );
      if (!ok) return false;
      this.h1001.utilityPick = best.id;
      this.setStatus1001(host, w, stance, best.label);
      return true;
    }
    visitNode1001(host, w, stance, kind, x, y) {
      if (kind === "fletch") return host.craftWoodForValueOnce() || host.fletchStyleOnce();
      if (kind === "anvil") {
        if (this.walkToTile(host, x, y, 2)) return true;
        return host.forgeWieldedOnce() || this.wantSmithKit(w) && host.smithKitOnce() || host.craftGemRingOnce();
      }
      if (kind === "shop") {
        if (this.walkToTile(host, x, y, 1)) return true;
        return this.trySellUnusedOnce(host, w) || host.sellOreKeep(2);
      }
      if (kind === "altar") {
        if (this.beginnerToolsIncomplete(host) || this.h1001.phase === "TOOLS") return false;
        if (this.altarActReady(w) === false) return false;
        return host.runecraftOnce();
      }
      if (kind === "chest") {
        host.walkTo(x, y);
        return this.tryOpenChestOnce(host, w, stance, { needBag: false, cool: 2 });
      }
      if (kind === "mine" || kind === "rock") {
        if (this.walkToTile(host, x, y)) return true;
        return this.tryGather(host, w, stance, "util mine");
      }
      if (kind === "chop" || kind === "tree") {
        if (this.walkToTile(host, x, y)) return true;
        return this.tryGather(host, w, stance, "util chop");
      }
      if (kind === "fish" || kind === "pond") {
        if (!host.hasTool("rod")) return false;
        if (this.tryCookBagCookables(host, w, stance, "util cook")) return true;
        if (this.walkToTile(host, x, y)) return true;
        return this.tryGather(host, w, stance, "util fish");
      }
      host.walkTo(x, y);
      return true;
    }
    /**
     * Remembered farm-node coords for this depth (h1001.nodes), else live w.seen.
     * Only nodes previously registered from tileSeen/lit — never invents uncleared fog.
     * Host enroute walks cleared fog / compass toward the room; does not omniscient-A* unseen.
     */
    mem(w, kind) {
      return memNode(this.h1001.nodes, kind, w);
    }
    /** True if a walk was issued (not yet adjacent). */
    walkToTile(host, x, y, adj = 1) {
      const w = host.world();
      if (cheb(w.tile.x, w.tile.y, x, y) > adj) {
        host.walkTo(x, y);
        return true;
      }
      return false;
    }
    /** Host uses these to skip blacklisted gather targets / tool kinds. */
    /** Soft-block a gather tile (Auto host → fishApproach can't-reach etc.). */
    blockGatherTile(x, y) {
      this.noteGatherFail(x, y);
    }
    isGatherTileBlocked(x, y) {
      const until = this.tileBlock.get(`${x},${y}`);
      return until != null && this.runTicks < until;
    }
    isToolBlocked(tool) {
      const until = this.toolBlock.get(tool);
      return until != null && this.runTicks < until;
    }
    noteGatherFail(x, y, tool) {
      this.tileBlock.set(`${x},${y}`, this.runTicks + TILE_BLOCK_TICKS);
      if (tool) this.toolBlock.set(tool, this.runTicks + TOOL_BLOCK_TICKS);
    }
    /**
     * Walk to loot with stuck escape (same-tile / N failed attempts).
     * False = blacklist loot tile and fall through (never idle-stand on loot-for-food).
     */
    /**
     * Patience popped on elite thrash: dash into progress (explore / wander / hub beyond)
     * accepting hit risk, else engage briefly to push past (t1114–t1117).
     */
    /** e18: heal/food/gear/ore fingerprint changed → reset farm-ceiling timer. */
    trackProgress(w) {
      if (w.healReserve > this.peakHealThisFloor) {
        this.peakHealThisFloor = w.healReserve;
        this.pondRethinks = 0;
        this.foodFarmSoftBlocks = 0;
      }
      if (this.lastOreCount >= 0 && w.oreCount > this.lastOreCount) {
        this.mineFailStreak = 0;
      }
      this.lastOreCount = w.oreCount;
      const fp = w.progressFp || "";
      if (!fp) return;
      if (fp !== this.progressFp) {
        this.progressFp = fp;
        this.progressTick = this.runTicks;
      }
    }
    /** Remember gather tile when farming food successfully (for food-fell fallback). */
    rememberFoodFarm(w) {
      if (!w.gather || !w.pondKnown) return;
      const next = { depth: w.depth, x: w.gather.x, y: w.gather.y };
      const prev = this.lastFoodFarm;
      const moved = !prev || prev.depth !== next.depth || prev.x !== next.x || prev.y !== next.y;
      this.lastFoodFarm = next;
      this.pondRethinks = 0;
      this.foodFarmSoftBlocks = 0;
      if (moved) this.noteAction(`food farm @F${next.depth} (${next.x},${next.y})`);
    }
    /** e51: empty heal — a kite off a rock must not walk straight back onto that same tile. */
    leaveGatherIfStarving(w) {
      if (w.food > 0 || w.healReserve > 0 || !w.gather) return;
      this.tileBlock.set(`${w.gather.x},${w.gather.y}`, this.runTicks + 40);
    }
    /** e44: remember tree tile when chopping cook fuel (fallback if gather drifts to pond). */
    rememberTree(w) {
      if (!w.gather) return;
      this.lastTree = { depth: w.depth, x: w.gather.x, y: w.gather.y };
    }
    /**
     * e57: one raw fish from a stack does not free a slot (9ufsdp, 23 raw, logs 0).
     * Drop until a slot exists, or nothing left will go. True if anything was dropped.
     */
    dropUntilCookSlot(host) {
      let dropped = false;
      for (let n = 0; n < 24; n++) {
        if (host.world().bagFree > 0) return dropped;
        if (!host.freeCookSlot()) return dropped;
        dropped = true;
      }
      return dropped;
    }
    /**
     * e44: chop for cook fuel. Prefer current gather (host prefers tree when raw+no logs);
     * else walk lastTree on this floor.
     */
    tryChopForCookFuel(host, w, stance) {
      if (this.chopBreakActive()) return false;
      if (w.gather && this.tryGather(host, w, stance, "chop for fire")) {
        this.rememberTree(w);
        return true;
      }
      const tree = this.lastTree;
      if (tree && tree.depth === w.depth) {
        const here = w.tile.x === tree.x && w.tile.y === tree.y;
        if (!here) {
          host.clearEngage();
          host.walkTo(tree.x, tree.y);
          this.setStatus(host, w, stance, "chop for fire \u2192 last tree");
          this.cool = 3;
          return true;
        }
        this.noteAction(`chop fail \u2014 drop last tree F${tree.depth} (${tree.x},${tree.y})`);
        this.noteGatherFail(tree.x, tree.y);
        this.lastTree = null;
        return false;
      }
      return this.walkLastTree(host, w, stance, "chop for fire \u2192 last floor");
    }
    /** Last tree on this floor is handled by the caller. A tree one or more floors up is a climb. */
    walkLastTree(host, w, stance, label) {
      const tree = this.lastTree;
      if (!tree || tree.depth >= w.depth || !w.upStairs) return false;
      host.clearEngage();
      host.walkTo(w.upStairs.x, w.upStairs.y);
      this.setStatus(host, w, stance, label);
      this.cool = 3;
      return true;
    }
    /** Explicit improve (forge+ / equip drop) — also resets farm ceiling. */
    noteImprove() {
      this.lastImproveTick = this.runTicks;
      this.progressTick = this.runTicks;
    }
    /**
     * e19 / Darren t1159–60: post-kit gear strive blocked by low coins (~TOOL stall)
     * or missing mats → farm money via (1) mobs room-to-room or (2) resource→craft→sell.
     * Soft persona + local setup (anvil/mats → craft-sell; combat open → mobs).
     * Never emptyHealNoRod / hungry-empty (caller gates). Keeps cape/ring via sellUnused.
     */
    tryFarmCoinsForGear(host, w, stance, opts) {
      const TOOL = 30;
      if (!opts.kitArmed) return false;
      if (w.coins >= TOOL + 25) return false;
      const seeking = opts.forgeSoft || w.oreCount <= 0 || this.farmCeiling();
      if (!seeking) return false;
      if (stance.hungry && w.healReserve <= 0 && w.food <= 0) return false;
      const foodFat = w.healReserve >= stance.safetyLevel * 1.5 && stance.stocked;
      if (foodFat && this.stairsUsable(w) && w.descendSafe && (w.kitReady || w.hasMetalWeapon)) return false;
      const hpPct = w.maxHp > 0 ? w.hp / w.maxHp : 1;
      const hasPick = host.hasTool("pickaxe");
      const hasHatchet = host.hasTool("hatchet");
      const mats = w.oreCount > 0 || w.hasLogs || w.logCount > 0;
      const trash = w.foes.filter(
        (f) => f.alive && f.lit && !f.gold && !f.elite && !f.alpha && !f.gateBoss && !f.boss && (f.danger === "prey" || f.danger === "even") && f.dist <= 7 && !(w.healReserve <= 0 && w.food <= 0 && f.danger === "even" && f.dist > 2)
      ).sort((a, b) => a.dist - b.dist)[0];
      const combatOpen = !!trash && hpPct >= 0.45;
      let craftUrge = (w.anvilNearby ? 0.35 : 0.05) + this.traits.patience * 0.3 + this.traits.greed * 0.2 + (1 - this.traits.aggression) * 0.15 + (mats ? 0.3 : 0) + ((hasPick || hasHatchet) && !!w.gather ? 0.15 : 0) + this.rnd() * 0.2;
      let mobUrge = (combatOpen ? 0.4 : 0.05) + this.traits.aggression * 0.3 + this.traits.risk * 0.2 + this.traits.goldChase * 0.25 + this.rnd() * 0.2;
      if (w.anvilNearby && (mats || !!w.gather)) craftUrge += 0.2;
      if (combatOpen && !w.anvilNearby) mobUrge += 0.2;
      const preferMobs = this.wornEnough(w) && mobUrge >= craftUrge && combatOpen;
      if (preferMobs) {
        this.engageSmart(host, w, stance, trash, "trash");
        this.setStatus(host, w, stance, "farm coins \u2192 mobs");
        this.cool = 1;
        return true;
      }
      const need = Math.max(TOOL * 2, w.coins + 40);
      if (mats) {
        if (this.tryCraftWoodForValue(host, w, stance, "farm coins \u2192 craft sell")) return true;
        if (this.sellJunk(host, w)) {
          this.setStatus(host, w, stance, "farm coins \u2192 craft sell");
          this.cool = 3;
          return true;
        }
        const oreKeep = w.anvilNearby || opts.forgeSoft ? 2 : 0;
        if (w.oreCount > oreKeep) {
          if (host.sellMatsForCoins(need) || host.sellOreKeep(oreKeep)) {
            this.setStatus(host, w, stance, "farm coins \u2192 craft sell");
            this.cool = 3;
            return true;
          }
        }
        if (this.walkHub(host, w, stance, "farm coins \u2192 craft sell")) return true;
      }
      if (w.gather && (hasPick || hasHatchet) && w.bagFree > 0 && this.runTicks >= this.bagFullUntil) {
        if (this.tryGather(host, w, stance, "farm coins \u2192 craft sell")) return true;
      }
      if (combatOpen && this.wornEnough(w)) {
        this.engageSmart(host, w, stance, trash, "trash");
        this.setStatus(host, w, stance, "farm coins \u2192 mobs");
        this.cool = 1;
        return true;
      }
      if (this.tryWalkLoot(host, w, stance, "farm coins for gear")) return true;
      if (w.explore) {
        host.clearEngage();
        host.walkTo(w.explore.x, w.explore.y);
        this.setStatus(host, w, stance, "farm coins for gear");
        this.cool = 3;
        return true;
      }
      if (w.wander) {
        host.clearEngage();
        host.walkTo(w.wander.x, w.wander.y);
        this.setStatus(host, w, stance, "farm coins for gear");
        this.cool = 4;
        return true;
      }
      return false;
    }
    /** e76: armour worn — style/kitReady alone is still naked (SIT ~2k). */
    bodyOn(w) {
      return !!w.hasArmour;
    }
    /** e76: descend/ceiling kit = body + weapon. Not heal/descendSafe kitReady loophole. */
    descendKit(w) {
      return this.bodyOn(w) && (!!w.hasMetalWeapon || !!w.hasStyleWeapon);
    }
    /**
     * Darren t1154–57: ceiling of same-floor farming — heal stock and gear unchanged
     * for PROGRESS_STALL_TICKS while postKit → stop gather thrash and move on.
     */
    farmCeiling() {
      if (this.runTicks - this.progressTick < PROGRESS_STALL_TICKS) return false;
      if (this.runTicks - this.lastImproveTick < PROGRESS_STALL_TICKS) return false;
      return true;
    }
    /**
     * Farm-ceiling move-on (persona-weighted):
     *   conservative / high caution / low risk → same-floor mob XP (cape/ring)
     *   aggressive / high risk / low patience → stairs when descendSafe
     * Soft blend + rnd. Never empty-heal into deadly stairs.
     */
    tryFarmCeilingMoveOn(host, w, stance) {
      const hpPct = w.maxHp > 0 ? w.hp / w.maxHp : 1;
      const emptyHeal = w.healReserve <= 0 && w.food <= 0;
      const stairsOk = this.stairsUsable(w) && w.descendSafe && !emptyHeal && this.descendKit(w) && w.food >= stance.minFood && hpPct >= 0.45;
      if (this.ceilingRethinks >= 3 && stairsOk) {
        return this.walkStairsStrive(host, w, stance, "ceiling thrash \u2014 stairs");
      }
      const foodFat = w.healReserve >= stance.safetyLevel * 1.5 && stance.stocked;
      if (foodFat && stairsOk) {
        const fatUrge = 0.45 + this.traits.risk * 0.2 + this.traits.aggression * 0.15 + (1 - this.traits.patience) * 0.1 + this.rnd() * 0.2;
        if (fatUrge > 0.5) {
          return this.walkStairsStrive(host, w, stance, "food fat \u2192 advance");
        }
      }
      const nextFloorUrge = this.traits.risk * 0.4 + this.traits.aggression * 0.3 + (1 - this.traits.patience) * 0.2 + (1 - stance.caution) * 0.2 + (foodFat ? 0.25 : 0) + this.rnd() * 0.25;
      const mobUrge = stance.caution * 0.35 + this.traits.foodCaution * 0.15 + (1 - this.traits.risk) * 0.3 + this.traits.patience * 0.2 + this.rnd() * 0.25;
      if (stairsOk && nextFloorUrge > mobUrge && nextFloorUrge > 0.55) {
        return this.walkStairsStrive(
          host,
          w,
          stance,
          foodFat ? "food fat \u2192 advance" : "farm ceiling \u2192 next floor"
        );
      }
      const trash = w.foes.filter(
        (f) => f.alive && f.lit && !f.gold && !f.elite && !f.alpha && !f.gateBoss && !f.boss && (f.danger === "prey" || f.danger === "even") && f.dist <= 7 && !(emptyHeal && f.danger === "even" && f.dist > 2)
      ).sort((a, b) => a.dist - b.dist)[0];
      if (trash && this.wornEnough(w) && hpPct >= 0.5) {
        this.engageSmart(host, w, stance, trash, "trash");
        this.setStatus(host, w, stance, "farm ceiling \u2192 mob XP");
        this.cool = 1;
        return true;
      }
      if (w.explore && this.walkSaferWay(host, w, stance)) return true;
      if (w.explore) {
        host.clearEngage();
        host.walkTo(w.explore.x, w.explore.y);
        this.setStatus(host, w, stance, "farm ceiling \u2192 explore");
        this.cool = 3;
        return true;
      }
      if (w.wander) {
        host.clearEngage();
        host.walkTo(w.wander.x, w.wander.y);
        this.setStatus(host, w, stance, "farm ceiling \u2192 explore");
        this.cool = 4;
        return true;
      }
      if (stairsOk) {
        return this.walkStairsStrive(host, w, stance, "farm ceiling \u2192 next floor");
      }
      return false;
    }
    /**
     * e18/t1158: heal fell from a fat peak → walk last food-farm tile, else prior-floor retreat.
     * Soft persona; keeps t1113 (empty heal + no rod still shops rod first elsewhere).
     */
    tryFoodFellFallback(host, w, stance) {
      const emptyHealNoRod = w.healReserve <= 0 && w.food <= 0 && !host.hasTool("rod");
      if (emptyHealNoRod) return false;
      if (w.bagFree <= 0 || this.runTicks < this.bagFullUntil) return false;
      const spot = this.lastFoodFarm;
      if (!spot) return false;
      if (spot.depth === w.depth && this.isGatherTileBlocked(spot.x, spot.y)) {
        this.noteAction("food fell \u2014 drop soft-blocked farm");
        this.lastFoodFarm = null;
        return false;
      }
      if (spot.depth === w.depth) {
        const here = w.tile.x === spot.x && w.tile.y === spot.y;
        if (!here) {
          host.clearEngage();
          host.walkTo(spot.x, spot.y);
          this.setStatus(host, w, stance, "food fell \u2192 last farm");
          this.cool = 3;
          return true;
        }
        if (w.pondKnown && w.gather && this.tryGather(host, w, stance, "food fell \u2192 last farm")) {
          this.rememberFoodFarm(w);
          return true;
        }
        this.noteAction("food fell \u2014 drop dead farm");
        this.lastFoodFarm = null;
        return false;
      }
      if (spot.depth < w.depth && w.upStairs && this.runTicks >= this.foodRetreatCoolUntil) {
        const urge = 0.35 + this.traits.foodCaution * 0.35 + stance.caution * 0.2 + (1 - this.traits.risk) * 0.15 + this.rnd() * 0.2;
        if (urge > 0.45) {
          this.pendingFoodRetreat = true;
          host.clearEngage();
          host.walkTo(w.upStairs.x, w.upStairs.y);
          this.setStatus(host, w, stance, "food fell \u2192 last farm");
          this.cool = 4;
          return true;
        }
      }
      return false;
    }
    dashPastElite(host, w, stance) {
      const dest = w.explore || w.wander || w.hub;
      if (dest) {
        host.clearEngage();
        host.walkTo(dest.x, dest.y);
        this.setStatus(host, w, stance, "dash past elite");
        this.cool = 2;
        this.eliteThrash = Math.max(0, this.eliteThrash - 3);
        return true;
      }
      const push = w.foes.filter((f) => f.alive && f.lit && f.dist <= 6).sort((a, b) => {
        const da = a.danger === "prey" ? 0 : a.danger === "even" ? 1 : 2;
        const db = b.danger === "prey" ? 0 : b.danger === "even" ? 1 : 2;
        return da - db || a.dist - b.dist;
      })[0];
      if (push && this.wornEnough(w)) {
        this.engageSmart(host, w, stance, push, "push");
        this.setStatus(host, w, stance, push.danger === "prey" ? "fight past elite" : "push elite");
        this.cool = 2;
        this.eliteThrash = 0;
        return true;
      }
      return false;
    }
    tryWalkLoot(host, w, stance, label) {
      if (!w.loot) {
        this.lootWalkKey = "";
        this.lootWalkHits = 0;
        this.lootStandHits = 0;
        return false;
      }
      const lx = w.loot.x;
      const ly = w.loot.y;
      if (this.isGatherTileBlocked(lx, ly)) return false;
      const key = `loot:${lx},${ly}`;
      if (key === this.lootWalkKey) this.lootWalkHits++;
      else {
        this.lootWalkKey = key;
        this.lootWalkHits = 1;
        this.lootStandX = w.tile.x;
        this.lootStandY = w.tile.y;
        this.lootStandHits = 0;
      }
      if (w.tile.x === this.lootStandX && w.tile.y === this.lootStandY) this.lootStandHits++;
      else {
        this.lootStandX = w.tile.x;
        this.lootStandY = w.tile.y;
        this.lootStandHits = 0;
      }
      if (this.lootWalkHits >= SAME_TARGET_MAX || this.lootStandHits >= SAME_TARGET_MAX) {
        this.noteGatherFail(lx, ly);
        this.lootWalkKey = "";
        this.lootWalkHits = 0;
        this.lootStandHits = 0;
        this.noteAction("loot stuck \u2014 skip");
        host.log(`AUTO: loot walk stuck (${lx},${ly}) \u2014 switching`);
        return false;
      }
      host.clearEngage();
      host.walkTo(lx, ly);
      this.setStatus(host, w, stance, label);
      this.cool = 2;
      return true;
    }
    /**
     * e36: while bagFullUntil active, sell/fletch before farm-food / find-pond.
     * True = action issued. When bagFull and false, caller must skip explore-for-pond / food gather this tick.
     */
    tryBagFullRelief(host, w, stance) {
      host.equipUp();
      w = host.world();
      if (w.bagFree > 0) return true;
      if (this.runTicks >= this.bagFullUntil) return false;
      if (this.tryCraftWoodForValue(host, w, stance, "fletch sell")) {
        this.bagFullFails = 0;
        return true;
      }
      if (this.sellJunk(host, w) || host.sellOreKeep(0) || this.hasSellableMats(w) && host.sellMatsForCoins(30)) {
        this.bagFullFails = 0;
        this.setStatus(host, w, stance, "sell for loot space");
        this.cool = 3;
        return true;
      }
      this.bagFullFails++;
      if (this.bagFullFails >= 3) {
        this.bagFullFails = 0;
        this.bagFullUntil = 0;
        this.lastFoodFarm = null;
        if (this.lastTree) {
          const t = this.lastTree;
          this.noteGatherFail(t.x, t.y);
          this.noteAction(`bag stuck \u2014 drop last tree F${t.depth} (${t.x},${t.y})`);
          this.lastTree = null;
        }
        this.chopBreakUntil = this.runTicks + 48;
        this.noteAction("bag stuck \u2014 move on");
        this.noteAction("chop thrash \u2014 bag cool");
        host.log("AUTO: bag full relief failed \u2014 move on (chop cool)");
        if (w.kitReady && w.stairs && w.stairsLit && w.stairsOpen && !this.isGatherTileBlocked(w.stairs.x, w.stairs.y)) {
          this.markStairsStrive("bag stuck \u2192 stairs", w);
          host.clearEngage();
          host.walkTo(w.stairs.x, w.stairs.y);
          this.setStatus(host, w, stance, "bag stuck \u2192 stairs");
          this.cool = 3;
          return true;
        }
        if (w.explore) {
          host.walkTo(w.explore.x, w.explore.y);
          this.setStatus(host, w, stance, "bag stuck \u2014 explore");
          this.cool = 3;
          return true;
        }
        if (w.wander) {
          host.walkTo(w.wander.x, w.wander.y);
          this.setStatus(host, w, stance, "bag stuck \u2014 wander");
          this.cool = 3;
          return true;
        }
      }
      return false;
    }
    bagFullActive() {
      return this.runTicks < this.bagFullUntil;
    }
    /** e47: cool window after pond thrash — block find-pond/farm-food desire re-entry. */
    pondBreakActive() {
      return this.runTicks < this.pondBreakUntil;
    }
    /** e48: cool window after bag-stuck chop thrash — block chop-for-fire/lastTree. */
    chopBreakActive() {
      return this.runTicks < this.chopBreakUntil;
    }
    /**
     * Gather with fail-adapt + same-target stuck (earlier than floor hang).
     * False = fall through to explore / wander / other lane.
     */
    tryGather(host, w, stance, label) {
      if (!w.gather) {
        this.sameTargetKey = "";
        this.sameTargetHits = 0;
        return false;
      }
      if (/farm food|fish for food|hoard food|food fell/i.test(label) && !w.pondKnown) {
        return false;
      }
      const gx = w.gather.x;
      const gy = w.gather.y;
      const key = `${gx},${gy}`;
      if (this.isGatherTileBlocked(gx, gy)) return false;
      if (key === this.sameTargetKey) this.sameTargetHits++;
      else {
        this.sameTargetKey = key;
        this.sameTargetHits = 1;
      }
      if (this.sameTargetHits >= SAME_TARGET_MAX) {
        this.noteGatherFail(gx, gy);
        this.sameTargetKey = "";
        this.sameTargetHits = 0;
        this.noteAction("stuck same-tile");
        host.log("AUTO: same-tile gather stuck \u2014 switching");
        const healOkStuck = w.healReserve > 0 || w.food > 0;
        const tools = healOkStuck ? ["hatchet", "pickaxe", "rod"] : ["rod"];
        for (const tool of tools) {
          if (!this.isToolBlocked(tool) || host.hasTool(tool)) continue;
          if (host.acquireTool(tool)) {
            if (tool !== "rod") this.markAnvilStrive(`forge ${tool}`, w);
            this.setStatus(host, w, stance, tool === "rod" ? "shop for rod" : `forge ${tool}`);
            this.cool = 4;
            return true;
          }
        }
        return false;
      }
      host.clearEngage();
      const attempt = host.gatherAt(gx, gy);
      if (!attempt.ok) {
        const reason = attempt.reason || "";
        const tooFull = /too full/i.test(reason);
        const needRodMsg = /fishing rod/i.test(reason);
        const enroute = /^enroute$/i.test(reason);
        const unreachable = /can't reach that fishing spot|can't reach that\.?$/i.test(reason);
        if (enroute) {
          this.noteAction("enroute toward gather");
          if (/mine/i.test(label)) this.markMineStrive(gx, gy, w.oreCount);
          this.setStatus(host, w, stance, /fish|food/i.test(label) ? "enroute pond" : "enroute gather");
          this.cool = 1;
          if (this.sameTargetHits > 0) this.sameTargetHits--;
          return true;
        }
        this.noteGatherFail(gx, gy, attempt.tool);
        this.noteAction(`gather fail \u2014 ${reason}`);
        host.log(`AUTO: gather fail \u2014 ${reason}`);
        if (tooFull) {
          if (/log/i.test(reason) && this.dropUntilCookSlot(host)) {
            this.tileBlock.delete(`${gx},${gy}`);
            this.sameTargetHits = 0;
            this.setStatus(host, w, stance, "drop for a log");
            this.cool = 2;
            return true;
          }
          this.bagFullUntil = this.runTicks + 600;
          this.sameTargetHits = SAME_TARGET_MAX;
          if (this.sellJunk(host, w) || host.sellOreKeep(0) || this.hasSellableMats(w) && host.sellMatsForCoins(30)) {
            this.setStatus(host, w, stance, "sell for loot space");
            this.cool = 3;
            return true;
          }
          return false;
        }
        if (unreachable) {
          this.sameTargetKey = "";
          this.sameTargetHits = 0;
          return false;
        }
        if (needRodMsg || attempt.tool === "rod") {
          if (!host.hasTool("rod")) {
            if (w.bagFree <= 0 || w.coins < 30) {
              this.bagFullUntil = this.runTicks + TILE_BLOCK_TICKS;
              this.sameTargetHits = SAME_TARGET_MAX;
              return false;
            }
            if (host.acquireTool("rod")) {
              this.setStatus(host, w, stance, "shop for rod");
              this.cool = 4;
              return true;
            }
          }
          this.laneBias = "gear";
          this.sameTargetHits = SAME_TARGET_MAX;
          return false;
        }
        if (attempt.tool && !host.hasTool(attempt.tool)) {
          if (host.acquireTool(attempt.tool)) {
            this.setStatus(host, w, stance, `forge ${attempt.tool}`);
            this.cool = 4;
            return true;
          }
          if (attempt.tool === "hatchet" || attempt.tool === "pickaxe") this.laneBias = "food";
          else this.laneBias = "gear";
        }
        this.sameTargetHits = SAME_TARGET_MAX;
        return false;
      }
      this.sameTargetHits = 0;
      this.sameTargetKey = "";
      if (this.laneBias && !this.toolBlock.size) this.laneBias = null;
      if (/mine/i.test(label)) this.markMineStrive(gx, gy, w.oreCount);
      this.setStatus(host, w, stance, `${label} (${gx},${gy})`);
      this.cool = 5;
      return true;
    }
    /**
     * Soft craft surplus logs into wood gear before dumping raw for 1c (e15 / Darren t1139).
     * Persona greed/patience/goldChase; falls through to sell when craft fails.
     */
    tryCraftWoodForValue(host, w, stance, label) {
      if (w.logCount <= 0) return false;
      const urge = this.traits.greed * 0.4 + this.traits.patience * 0.25 + this.traits.goldChase * 0.2 + 0.35;
      if (urge + this.rnd() * 0.25 < 0.55) return false;
      if (!host.craftWoodForValueOnce()) return false;
      this.setStatus(host, w, stance, label);
      this.cool = 3;
      return true;
    }
    setStatus(host, w, stance, action) {
      const bits = [stance.label];
      if (!w.descendSafe) bits.push(w.farmReason === "CBT behind floor" || !w.farmReason ? "CBT behind" : w.farmReason);
      let line = `AUTO \u2014 ${action} (${bits.join("; ")})`;
      if (line.length > 42) line = line.slice(0, 41) + "\u2026";
      if (line === this.lastStatus) return;
      this.lastStatus = line;
      this.noteAction(action);
      host.setStatus(line);
    }
    /** Map a short action line to FHD op code (fixed enum — see journal field). */
    journalOpFor(line) {
      const s = line.toLowerCase();
      if (s.startsWith("fork ")) return 1;
      if (s.startsWith("start ") || s.startsWith("ascend ") || s.startsWith("descend ")) return 3;
      if (s.includes("stuck") || s.includes("soft-block stairs") || s.includes("rethink")) return 4;
      if (s.includes("gather") || s.includes("enroute") || s.includes("pond") || s.includes("fish")) return 5;
      if (s.includes("forge") || s.includes("anvil")) return 6;
      if (s.includes("loot")) return 7;
      if (s.includes("engage") || s.includes("fight") || s.includes("chase") || s.startsWith("kill")) return 2;
      return 0;
    }
    /** Append one FHD journal row (always; cheap). Stops at JOURNAL_MAX. */
    noteJournal(op) {
      if (this.journalTruncFlag) return;
      if (this.journal.length >= _AutoplayDriver.JOURNAL_MAX) {
        this.journalTruncFlag = true;
        return;
      }
      const dTick = Math.max(0, this.runTicks - this.journalLastTick);
      this.journalLastTick = this.runTicks;
      const x = Math.max(0, Math.min(255, this.lastTileX | 0));
      const y = Math.max(0, Math.min(255, this.lastTileY | 0));
      this.journal.push([dTick, op & 31, x, y]);
    }
    /** Push one short action line into the detail-upload ring (≤100 × ≤72). Also journals. */
    noteAction(line) {
      let s = String(line || "").replace(/[\x00-\x1f\x7f]/g, "").trim();
      if (!s) return;
      if (s.length > 72) s = s.slice(0, 72);
      if (this.actions.length && this.actions[this.actions.length - 1] === s) return;
      this.actions.push(s);
      if (this.actions.length > 100) this.actions.splice(0, this.actions.length - 100);
      this.noteJournal(this.journalOpFor(s));
    }
    /** Chronological action history for detail death packs. */
    actionLog() {
      return this.actions.slice();
    }
    /** FHD delta journal (always recorded; attach only when report=fhd). */
    fhdJournal() {
      return { entries: this.journal.slice(), trunc: this.journalTruncFlag };
    }
    applyOption(host, w, ev, opt, stance) {
      var _a;
      const id = opt.id;
      if ((id === "eat" || id.startsWith("eat_")) && (w.maxHp <= 0 || w.hp / w.maxHp < 0.95)) {
        if (!((_a = host.drinkOnce) == null ? void 0 : _a.call(host, "hurt"))) host.eat();
      }
      if (id === "chase" || id === "engage" || id === "eat_engage" || id === "eat_then_chase" || id === "fight_pack" || id === "enter" || id === "eat_enter" || id === "clear" || id === "eat_clear") {
        const foe = this.pickForEvent(w, ev, stance);
        if (foe && foe.dist > 1 && !this.wornEnough(w)) {
          host.clearEngage();
        } else if (foe) this.engageSmart(host, w, stance, foe, "fight");
        else if (id.includes("enter") || id === "clear" || id === "eat_clear") {
          const t = this.pickThreat(w, w.descendSafe && !stance.hungry, !stance.hungry);
          if (t && (t.dist <= 1 || this.wornEnough(w))) this.engageSmart(host, w, stance, t, "fork");
        }
      }
      if (id === "ignore" || id === "flee" || id === "retreat" || id === "save") {
        const melee = w.foes.filter((f) => f.alive && f.lit && f.dist <= 2).sort((a, b) => a.dist - b.dist)[0];
        if (melee && (id === "flee" || id === "retreat" || id === "ignore") && (melee.dist <= 1 || this.wornEnough(w))) {
          this.engageSmart(host, w, stance, melee, "melee");
        } else {
          host.clearEngage();
          const hpPctF = w.maxHp > 0 ? w.hp / w.maxHp : 1;
          const escape = w.healReserve <= 0 && hpPctF < 0.85;
          const canStairs = !!w.stairs && w.stairsLit && this.descendKit(w) && (w.descendSafe || escape) && (!stance.hungry || w.healReserve <= 0);
          if ((id === "flee" || id === "retreat") && w.hub) {
            host.walkTo(w.hub.x, w.hub.y);
          } else if ((id === "flee" || id === "retreat") && canStairs) {
            if (!this.walkStairsStrive(host, w, stance, "flee stairs") && w.explore) {
              host.walkTo(w.explore.x, w.explore.y);
            }
          } else if ((id === "flee" || id === "retreat") && w.explore) {
            host.walkTo(w.explore.x, w.explore.y);
          }
        }
      }
      if (id === "stairs") {
        const hpPctA = w.maxHp > 0 ? w.hp / w.maxHp : 1;
        const escape = w.healReserve <= 0 && hpPctA < 0.85;
        const canStairs = !!w.stairs && w.stairsLit && this.descendKit(w) && (w.descendSafe || escape) && (!stance.hungry || w.healReserve <= 0);
        const meleeReach = this.wornEnough(w) ? 2 : 1;
        const melee = w.foes.filter((f) => f.alive && f.lit && f.dist <= meleeReach).sort((a, b) => a.dist - b.dist)[0];
        if (melee && (!canStairs || melee.danger === "deadly" || melee.danger === "threat")) {
          this.engageSmart(host, w, stance, melee, "melee");
        } else if (canStairs) {
          if (!this.walkStairsStrive(host, w, stance, "fork stairs")) {
            if (melee) this.engageSmart(host, w, stance, melee, "melee");
            else if (w.explore) {
              host.clearEngage();
              host.walkTo(w.explore.x, w.explore.y);
            }
          }
        } else if (melee) {
          this.engageSmart(host, w, stance, melee, "melee");
        } else if (w.explore) {
          host.clearEngage();
          host.walkTo(w.explore.x, w.explore.y);
        }
      }
      if (id === "pull") {
        const trash = w.foes.filter((f) => f.alive && f.lit && !f.gold && !f.elite && !f.alpha && !f.gateBoss && !f.boss && f.danger !== "deadly").sort((a, b) => a.dist - b.dist);
        if (trash[0] && (trash[0].dist <= 1 || this.wornEnough(w))) this.engageSmart(host, w, stance, trash[0], "trash");
        else if (w.explore) {
          host.clearEngage();
          host.walkTo(w.explore.x, w.explore.y);
        }
      }
    }
    pickForEvent(w, ev, stance) {
      var _a;
      const t = ev.trigger;
      let list = w.foes.filter((f) => f.alive && f.lit && (f.danger !== "deadly" || f.dist <= 2));
      if (t.gold) list = list.filter((f) => f.gold);
      else if (t.elite) list = list.filter((f) => f.elite || f.alpha);
      else if (t.boss_floor) {
        if (!w.descendSafe || stance.hungry) return null;
        list = list.filter((f) => f.gateBoss || f.boss);
      }
      if (stance.hungry) list = list.filter((f) => !f.gold && !f.elite && !f.alpha && !f.gateBoss && !f.boss);
      list.sort((a, b) => a.dist - b.dist);
      return (_a = list[0]) != null ? _a : null;
    }
    pickThreat(w, mayBoss, mayElite) {
      var _a;
      const list = w.foes.filter((f) => {
        if (!f.alive || !f.lit) return false;
        if (f.danger === "deadly" && f.dist > 2) return false;
        if ((f.gateBoss || f.boss) && !mayBoss) return false;
        if ((f.elite || f.alpha || f.gold) && !mayElite && f.danger !== "prey") {
          if (f.dist > 1) return false;
          const trashMelee = w.foes.some(
            (o) => o !== f && o.alive && o.lit && o.dist <= 2 && !o.gold && !o.elite && !o.alpha && !o.gateBoss && !o.boss
          );
          if (trashMelee) return false;
        }
        return true;
      }).sort((a, b) => {
        const pri = (f) => {
          if (f.gateBoss || f.boss) return mayBoss ? 0 : 9;
          if (f.gold) return mayElite ? 1 : 7;
          if (f.elite || f.alpha) return mayElite ? 2 : 7;
          return 3;
        };
        const d = pri(a) - pri(b);
        return d !== 0 ? d : a.dist - b.dist;
      });
      return (_a = list[0]) != null ? _a : null;
    }
    /** Active (non-held) run duration for hub + compact upload. */
    runStats() {
      return { ticks: this.runTicks, ms: this.activeElapsedMs() };
    }
    /** Last successful food-farm tile (depth + xy) — for LIVE STATS / SNAP. */
    lastFoodFarmSpot() {
      return this.lastFoodFarm ? { ...this.lastFoodFarm } : null;
    }
    /**
     * Soft F1 style pivot: null undecided; true = chop→fletch bow/wand;
     * false = keep melee smith / anvil hunt.
     */
    stylePivotState() {
      return this.stylePivot;
    }
    /** Compact stuck / soft-block flags for LIVE STATS (read-only). */
    liveDiag() {
      return {
        stuckTicks: this.stuckTicks,
        stuckDesire: this.stuckDesireKey || this.h1001.phase,
        pondRethinks: this.pondRethinks,
        pondBreakUntil: this.pondBreakUntil,
        chopBreakUntil: this.chopBreakUntil,
        ceilingRethinks: this.ceilingRethinks,
        hatchetRethinks: this.hatchetRethinks,
        bagFull: this.runTicks < this.bagFullUntil,
        mineBlocked: this.runTicks < this.mineBlockUntil,
        chestBlocked: this.runTicks < this.chestBlockUntil,
        thrash: !!this.markThrash,
        clash: !!this.markClash,
        stuck: !!this.markStuck,
        phase: this.h1001.phase,
        topEvent: this.h1001.topEvent,
        utilityPick: this.h1001.utilityPick,
        progressDelta: this.h1001.progressDelta
      };
    }
    /** Format-7 SIT: ticks standing on the same tile (hang precursor). */
    sameTileTicks() {
      return this.hangTileTicks | 0;
    }
    /** Format-7 SIT: remaining chest soft-block ticks (0 if clear). */
    chestBlockRemaining() {
      return Math.max(0, this.chestBlockUntil - this.runTicks);
    }
    /** Format-8 SIT: remaining forge/anvil soft-block ticks (0 if clear). */
    forgeBlockRemaining() {
      return Math.max(0, this.forgeBlockUntil - this.runTicks);
    }
    /** Format-8 SIT: ScanState-backed cadence / queue ints (eng 2001). */
    scanSit() {
      return exportScanSit(this.scan, this.runTicks);
    }
    /** Format-7 SIT: remaining tile soft-block ticks for (x,y). */
    tileBlockRemaining(x, y) {
      const until = this.tileBlock.get(`${x},${y}`);
      if (until == null) return 0;
      return Math.max(0, until - this.runTicks);
    }
    /** Freeze active timer (PAUSE ALL / page hidden). Safe to call repeatedly. */
    pauseClock() {
      if (this.activeStartedAt) {
        this.activeMs += Math.max(0, Date.now() - this.activeStartedAt);
        this.activeStartedAt = 0;
      }
      this.clockHeld = true;
    }
    /** Resume active timer after pauseClock. No-op while still held by caller mistake — clears hold. */
    resumeClock() {
      this.clockHeld = false;
      if (!this.activeStartedAt && (this.runTicks > 0 || this.activeMs > 0)) {
        this.activeStartedAt = Date.now();
      }
    }
    isClockPaused() {
      return this.clockHeld;
    }
    /** Snapshot active ms (includes current open segment). */
    exportActiveMs() {
      return this.activeElapsedMs();
    }
    /**
     * Restore active time after hot-swap (adoptPulledEngine). Preserves hub timer
     * across PULL ENG so the card does not reset to 0s.
     */
    importActiveMs(ms, held = false) {
      this.activeMs = Math.max(0, Math.floor(ms || 0));
      this.activeStartedAt = 0;
      this.clockHeld = !!held;
      if (!this.clockHeld && this.activeMs > 0) this.activeStartedAt = Date.now();
    }
    activeElapsedMs() {
      const extra = this.activeStartedAt ? Math.max(0, Date.now() - this.activeStartedAt) : 0;
      return this.activeMs + extra;
    }
    ensureActiveClock() {
      if (this.clockHeld) return;
      if (!this.activeStartedAt) this.activeStartedAt = Date.now();
    }
    /** Walk toward farm hub (anvil/spawn). True if a walk was issued. */
    /**
     * e26 / Darren t1203–09: can this foe hit the hero standing at (hx,hy) right now?
     * Universal — melee reach OR any ranged/spell with range + LOS. No species branches.
     */
    /**
     * Melee cover-kite vs ranged/mage (t1617): one step that breaks LOS so they chase around
     * tree/door/wall. Prefer tighter choke. False = no cover step available.
     */
    tryCoverBreakLos(host, w, stance, foe, label) {
      var _a, _b;
      if (!foe.ranged) return false;
      if (typeof host.hasLos !== "function") return false;
      const hx = w.tile.x;
      const hy = w.tile.y;
      if (!this.foeCanHitAt(foe, hx, hy, host)) return false;
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      let best = null;
      for (const [dx, dy] of dirs) {
        const nx = hx + dx;
        const ny = hy + dy;
        if (!host.isWalkable(nx, ny)) continue;
        if (w.foes.some((f) => f.alive && f.x === nx && f.y === ny)) continue;
        if (this.foeCanHitAt(foe, nx, ny, host)) continue;
        const dist = Math.max(Math.abs(nx - foe.x), Math.abs(ny - foe.y));
        if (dist > ((_a = foe.atkRange) != null ? _a : 4) + 3) continue;
        let score = this.chokeScore(host, nx, ny) * 10;
        score -= dist;
        if (dist <= ((_b = foe.atkRange) != null ? _b : 4) + 1) score += 8;
        if (!best || score > best.score) best = { x: nx, y: ny, score };
      }
      if (!best) return false;
      host.clearEngage();
      host.walkTo(best.x, best.y);
      this.setStatus1001(host, w, stance, label);
      this.cool = 1;
      return true;
    }
    foeCanHitAt(foe, hx, hy, host) {
      var _a;
      const range = Math.max(1, (_a = foe.atkRange) != null ? _a : 1);
      const dist = Math.max(Math.abs(hx - foe.x), Math.abs(hy - foe.y));
      if (dist <= 0 || dist > range) return false;
      if (foe.ranged) {
        if (typeof host.hasLos === "function") return host.hasLos(hx, hy, foe.x, foe.y);
        return true;
      }
      return true;
    }
    /** Lit foes that can currently hit (hx,hy). */
    attackersAt(w, hx, hy, host) {
      return w.foes.filter(
        (f) => f.alive && f.lit && this.foeCanHitAt(f, hx, hy, host)
      );
    }
    /** Walkable ortho/diag neighbors count — tunnels/doors score low (choke). */
    chokeScore(host, x, y) {
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      let n = 0;
      for (const [dx, dy] of dirs) {
        if (host.isWalkable(x + dx, y + dy)) n++;
      }
      return 4 - n;
    }
    /**
     * e26 / Darren t1203–09: if N≥2 foes can hit now, take one step that minimizes
     * attackers-next-tick (break ranged LOS / leave second melee out / enter choke)
     * while preferring still engage the nearest. Doors, corners, tunnels, walls —
     * all via the same attacker-count rule. Short fallback only; never flee forever.
     * Status: fallback 1v1 (cut to ≤1) or funnel (reduced but still >1).
     */
    tryFunnel1v1(host, w, stance) {
      const hx = w.tile.x;
      const hy = w.tile.y;
      const cur = this.attackersAt(w, hx, hy, host);
      if (cur.length < 2) return false;
      const nearest = [...cur].sort((a, b) => {
        const da = Math.max(Math.abs(hx - a.x), Math.abs(hy - a.y));
        const db = Math.max(Math.abs(hx - b.x), Math.abs(hy - b.y));
        return da - db || a.dist - b.dist;
      })[0];
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      let best = null;
      for (const [dx, dy] of dirs) {
        const nx = hx + dx;
        const ny = hy + dy;
        if (!host.isWalkable(nx, ny)) continue;
        if (w.foes.some((f) => f.alive && f.x === nx && f.y === ny)) continue;
        const next = this.attackersAt(w, nx, ny, host);
        if (next.length >= cur.length) continue;
        let score = (cur.length - next.length) * 100;
        score -= next.length * 35;
        if (next.length <= 1) score += 50;
        const nearDist = Math.max(Math.abs(nx - nearest.x), Math.abs(ny - nearest.y));
        const nearStillHits = this.foeCanHitAt(nearest, nx, ny, host);
        if (nearStillHits && nearDist <= 1) score += 30;
        else if (nearStillHits) score += 12;
        else if (nearDist <= 1) score += 8;
        else score -= nearDist * 3;
        const canMelee = next.some(
          (f) => Math.max(Math.abs(nx - f.x), Math.abs(ny - f.y)) <= 1 && !f.ranged
        ) || next.some((f) => Math.max(Math.abs(nx - f.x), Math.abs(ny - f.y)) <= 1);
        if (canMelee) score += 10;
        score += this.chokeScore(host, nx, ny) * 6;
        if (!best || score > best.score) best = { x: nx, y: ny, score, n: next.length };
      }
      if (!best) return false;
      host.clearEngage();
      host.walkTo(best.x, best.y);
      this.setStatus(host, w, stance, best.n <= 1 ? "fallback 1v1" : "funnel");
      this.cool = 1;
      return true;
    }
    /** Hero vs foe reach. Missing atkRange (pre-0.5.719 host): style→4, else 1. */
    heroAtkRange(w) {
      if (w.atkRange != null && w.atkRange >= 1) return w.atkRange;
      return w.hasStyleWeapon ? 4 : 1;
    }
    foeAtkRange(foe) {
      var _a;
      return Math.max(1, (_a = foe.atkRange) != null ? _a : 1);
    }
    /**
     * t1619: if myRange > foeRange, safe band is foeRange+1 .. myRange.
     * Both 1 → melee kite (no safe band). Returns true when a walk was issued.
     */
    tryMaintainKiteBand(host, w, stance, foe, label) {
      const myR = this.heroAtkRange(w);
      const foeR = this.foeAtkRange(foe);
      if (myR <= foeR) return false;
      const ideal = foeR + 1;
      const hx = w.tile.x;
      const hy = w.tile.y;
      const dist = Math.max(Math.abs(hx - foe.x), Math.abs(hy - foe.y));
      if (dist >= ideal && dist <= myR) {
        if (foe.ranged && typeof host.hasLos === "function" && !host.hasLos(hx, hy, foe.x, foe.y)) {
        } else {
          return false;
        }
      }
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      let best = null;
      for (const [dx, dy] of dirs) {
        const nx = hx + dx;
        const ny = hy + dy;
        if (!host.isWalkable(nx, ny)) continue;
        if (w.foes.some((f) => f.alive && f.x === nx && f.y === ny)) continue;
        const nd = Math.max(Math.abs(nx - foe.x), Math.abs(ny - foe.y));
        if (nd > myR && dist <= myR) continue;
        let score = 0;
        if (dist < ideal) {
          if (nd <= dist) continue;
          score += (nd - dist) * 40;
          score -= Math.abs(nd - ideal) * 15;
          if (nd >= ideal) score += 30;
          if (nd <= foeR) score -= 50;
        } else if (dist > myR) {
          if (nd >= dist) continue;
          score += (dist - nd) * 40;
          score -= Math.abs(nd - ideal) * 15;
          if (nd >= ideal && nd <= myR) score += 30;
          if (nd <= foeR) score -= 40;
        } else {
          if (nd < ideal || nd > myR) continue;
          score += 20;
        }
        if (typeof host.hasLos === "function") {
          if (host.hasLos(nx, ny, foe.x, foe.y)) score += 25;
          else score -= 20;
        }
        score += this.chokeScore(host, nx, ny);
        if (!best || score > best.score) best = { x: nx, y: ny, score };
      }
      if (!best) return false;
      host.engage(foe);
      host.walkTo(best.x, best.y);
      this.setStatus1001(host, w, stance, label);
      this.cool = 1;
      return true;
    }
    /**
     * t1645/t1649: style wand/bow + adjacent foe → equip bag melee so MM doesn't
     * fizzle / refuse to fight (sword in bag). Uses gearStats.style when present.
     */
    trySwapMeleeFromBag(host, w, stance) {
      var _a, _b, _c, _d;
      if (!w.hasStyleWeapon) return false;
      const adj = w.foes.some((f) => f.alive && f.lit && f.dist <= 1);
      if (!adj) return false;
      const bag = (_b = (_a = host.listBagCombatGear) == null ? void 0 : _a.call(host)) != null ? _b : [];
      const weps = bag.filter((b) => b.slot === "weapon");
      if (!weps.length) return false;
      let best = null;
      for (const b of weps) {
        const g2 = lookupGear(host, b.id);
        const style = (_c = g2 == null ? void 0 : g2.style) != null ? _c : "none";
        if (style === "ranged" || style === "magic") continue;
        if (style === "melee" || style === "none" || !g2) {
          if (!best || b.offense > best.offense) best = { slotIndex: b.slotIndex, offense: b.offense };
        }
      }
      if (!best) return false;
      if ((_d = host.equipBagItem) == null ? void 0 : _d.call(host, best.slotIndex)) {
        this.setStatus1001(host, w, stance, "swap melee");
        this.cool = 1;
        return true;
      }
      return false;
    }
    /** Engage, but first open safe kite band when we out-range them (t1619). */
    engageSmart(host, w, stance, foe, label = "safe kite") {
      if (this.tryMaintainKiteBand(host, w, stance, foe, label)) return;
      host.engage(foe);
    }
    /**
     * One walkable step that increases Chebyshev distance from nearby press foes,
     * biased toward hub. Style with range advantage uses safe band (t1619).
     * Returns true if a walk was issued.
     */
    stepAway(host, w, stance, label) {
      const press = w.foes.filter((f) => f.alive && f.lit && f.dist <= 2);
      if (!press.length) return false;
      const keep = press.slice().sort((a, b) => a.dist - b.dist)[0];
      if (this.heroAtkRange(w) > this.foeAtkRange(keep)) {
        if (this.tryMaintainKiteBand(host, w, stance, keep, label)) return true;
      }
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      let best = null;
      const curMin = Math.min(...press.map((f) => f.dist));
      for (const [dx, dy] of dirs) {
        const nx = w.tile.x + dx;
        const ny = w.tile.y + dy;
        if (!host.isWalkable(nx, ny)) continue;
        if (press.some((f) => f.x === nx && f.y === ny)) continue;
        const minAway = Math.min(
          ...press.map((f) => Math.max(Math.abs(nx - f.x), Math.abs(ny - f.y)))
        );
        if (minAway < curMin) continue;
        let score = minAway * 20;
        if (minAway > curMin) score += 50;
        score += press.reduce(
          (s, f) => s + Math.max(Math.abs(nx - f.x), Math.abs(ny - f.y)),
          0
        );
        if (w.hub) {
          const hubDist = Math.abs(nx - w.hub.x) + Math.abs(ny - w.hub.y);
          const curHub = Math.abs(w.tile.x - w.hub.x) + Math.abs(w.tile.y - w.hub.y);
          if (hubDist < curHub) score += 8;
        }
        if (!best || score > best.score) best = { x: nx, y: ny, score };
      }
      if (!best) return false;
      if (w.hasStyleWeapon) {
        host.engage(keep);
      } else {
        host.clearEngage();
      }
      host.walkTo(best.x, best.y);
      this.setStatus(host, w, stance, label);
      this.cool = 1;
      return true;
    }
    /**
     * e25 / Darren t1196–98: stuck when gear + food + exp + useful approach are
     * all quiet for IDLE_STUCK_TICKS (~7.2s @ e34). Useful approach = Chebyshev to the
     * current desire target decreases (or adj). Door open/close thrash and
     * anvil-orbit walks change tiles but not approach → still stuck.
     * Combat (foe dist≤2) and active mineStrive/anvilStrive reset (e34).
     * e35: food-fell desire + clear lastFoodFarm on rethink. Then soft-block + rethink.
     */
    stuckGearFpOf(w) {
      const parts = (w.progressFp || "").split("|");
      return parts.length > 3 ? parts.slice(3).join("|") : parts.join("|");
    }
    stuckFoodFpOf(w) {
      return `h${w.healReserve}|f${w.food}|r${w.rawFish}`;
    }
    /** Eng 2020 / t1668: exp/gear/hp/mp fingerprint for meter-scan stuck. */
    stuckMetersOf(w) {
      return {
        xp: w.xpFp || "",
        gear: this.stuckGearFpOf(w),
        hp: w.hp | 0,
        mp: (typeof w.mp === "number" ? w.mp : 0) | 0
      };
    }
    /**
     * Eng 2020 / t1669: thrash | clash | stuck observational marks.
     * Always available for FHD / SIT / LIVE STATS even when eng does not intervene.
     */
    detectMarks() {
      return {
        thrash: !!this.markThrash,
        clash: !!this.markClash,
        stuck: !!this.markStuck
      };
    }
    /** A meal owns the hero. Shop and chest wait until the catch is cooked. */
    mealOwns(w, stance) {
      return w.bagFree > 1 && this.cookOwed(w, stance) && (w.rawFish > 0 || this.catchingMeal(w, stance));
    }
    /**
     * Heal-rich ignores the piece floor (same exception as foodStance).
     * Do not start a new chop just because a few raw fish are still in the bag.
     */
    cookOwed(w, stance) {
      if (w.healReserve >= stance.safetyLevel * 1.5 && w.food > 0) return false;
      return w.healReserve <= 0 || w.food < stance.minFood;
    }
    /**
     * How many raw fish to land before lighting. A normal log only burns 24 ticks,
     * which is not enough to fish and cook in the same fire.
     */
    mealBatch(w, stance) {
      const room = Math.max(1, w.rawFish + Math.max(0, w.bagFree - 1));
      const want = Math.max(4, Math.min(8, stance.minFood));
      if (w.healReserve <= 0 && w.food <= 0) return 1;
      return Math.max(1, Math.min(want, room));
    }
    /** The catch is not full yet. Keep the log. Do not light. */
    catchingMeal(w, stance) {
      if (!this.cookOwed(w, stance)) return false;
      if (w.hasFire) return false;
      if (w.healReserve > 0 && w.food >= stance.minFood) return false;
      if (w.bagFree <= 1) return false;
      return w.rawFish < this.mealBatch(w, stance);
    }
    /**
     * One job: a log in the bag, fish until the batch, then one fire and cook.
     * A fire that is already burning is used immediately so it is not wasted.
     */
    tryMeal(host, w, stance) {
      if (w.foes.some((f) => f.alive && f.lit && f.dist <= 2)) return false;
      if (w.hasFire && w.rawFish > 0) {
        host.cookOnce();
        host.pickupLoot();
        this.setStatus(host, w, stance, "cooking");
        this.cool = 2;
        return true;
      }
      const needs = this.cookOwed(w, stance);
      if (!needs) return false;
      const catching = this.catchingMeal(w, stance) && host.hasTool("rod") && w.pondKnown;
      if (catching && !w.hasLogs && !w.hasFire && host.hasTool("hatchet") && this.tryChopForCookFuel(host, w, stance)) {
        return true;
      }
      if (catching && w.gather && !this.bagFullActive() && this.tryGather(host, w, stance, "fish for food")) {
        this.rememberFoodFarm(w);
        return true;
      }
      if (!this.catchingMeal(w, stance) && w.rawFish > 0 && !w.hasFire && host.lightFireOnce()) {
        this.setStatus(host, w, stance, "cook fuel");
        this.cool = 3;
        return true;
      }
      if (w.hasLogs && w.rawFish > 0 && !w.hasFire) {
        if (this.drySince === 0) this.drySince = this.runTicks;
        if (this.runTicks - this.drySince > 36) {
          this.drySince = 0;
          if (this.walkLastTree(host, w, stance, "dry ground \u2192 last tree")) return true;
          if (w.healReserve > 0) return false;
        }
        const spot = w.explore || w.wander;
        if (spot) {
          host.clearEngage();
          host.walkTo(spot.x, spot.y);
          this.setStatus(host, w, stance, "dry ground for fire");
          this.cool = 2;
          return true;
        }
      } else {
        this.drySince = 0;
      }
      return false;
    }
    /** Current desire tile (stairs / anvil hub / gather / loot / explore from status). */
    stuckDesireTarget(w) {
      var _a;
      if (this.stairsStrive) {
        return { key: `stairs:${this.stairsStrive.sx},${this.stairsStrive.sy}`, x: this.stairsStrive.sx, y: this.stairsStrive.sy };
      }
      if (this.anvilStrive && w.hub) {
        return { key: `anvil:${w.hub.x},${w.hub.y}`, x: w.hub.x, y: w.hub.y };
      }
      const st = (this.lastStatus || "").toLowerCase();
      if (/stairs|advance|next floor|food fat|pushing stairs|kit ready|flee stairs|fork stairs|kiting stairs|emergency stairs/i.test(st) && w.stairs) {
        return { key: `stairs:${w.stairs.x},${w.stairs.y}`, x: w.stairs.x, y: w.stairs.y };
      }
      if (/anvil|forge|smith|hatchet|craft gem/i.test(st) && w.hub) {
        return { key: `anvil:${w.hub.x},${w.hub.y}`, x: w.hub.x, y: w.hub.y };
      }
      if (/sell\b|fletch sell|bag stuck/i.test(st) && w.hub) {
        return { key: `hub:${w.hub.x},${w.hub.y}`, x: w.hub.x, y: w.hub.y };
      }
      if (/last floor|last tree/i.test(st) && w.upStairs && this.lastTree && this.lastTree.depth < w.depth) {
        return { key: `uptree:${w.upStairs.x},${w.upStairs.y}`, x: w.upStairs.x, y: w.upStairs.y };
      }
      if (/dry ground/i.test(st)) {
        const spot = w.explore || w.wander;
        if (spot) return { key: `dry:${spot.x},${spot.y}`, x: spot.x, y: spot.y };
      }
      if (/explore for a tree/i.test(st) && w.explore) {
        return { key: `tree:${w.explore.x},${w.explore.y}`, x: w.explore.x, y: w.explore.y };
      }
      if (/food fell/i.test(st) && this.lastFoodFarm && this.lastFoodFarm.depth === w.depth) {
        const s = this.lastFoodFarm;
        return { key: `foodfell:${s.x},${s.y}`, x: s.x, y: s.y };
      }
      const fundGather = /tools fund chop|tools fund fish|tools chop|tools mine|tools fish|fund chop|fund mine|util chop|util mine|util fish/i.test(st);
      if (fundGather && this.desireXY) {
        return { key: `fund:${this.desireXY.x},${this.desireXY.y}`, x: this.desireXY.x, y: this.desireXY.y };
      }
      if (/tools fund chop|tools chop|fund chop|util chop|chop for/i.test(st) && w.gather) {
        return { key: `gather:${w.gather.x},${w.gather.y}`, x: w.gather.x, y: w.gather.y };
      }
      if (/pond|fish|farm food|hoard food|enroute pond|tools fund fish|tools fish/i.test(st) && w.gather) {
        return { key: `gather:${w.gather.x},${w.gather.y}`, x: w.gather.x, y: w.gather.y };
      }
      if (/find pond/i.test(st) && !w.gather && this.desireXY && w.explore) {
        return { key: `explore:${this.desireXY.x},${this.desireXY.y}`, x: this.desireXY.x, y: this.desireXY.y };
      }
      if (/remembered chest|open chest/i.test(st) && ((_a = w.seen) == null ? void 0 : _a.chest)) {
        const adj = w.seen.chestAdj;
        const t = adj || w.seen.chest;
        return { key: `chest:${w.seen.chest.x},${w.seen.chest.y}`, x: t.x, y: t.y };
      }
      if (/loot|chest/i.test(st) && w.loot) {
        return { key: `loot:${w.loot.x},${w.loot.y}`, x: w.loot.x, y: w.loot.y };
      }
      if (w.gather && this.sameTargetHits > 0) {
        return { key: `gather:${w.gather.x},${w.gather.y}`, x: w.gather.x, y: w.gather.y };
      }
      return null;
    }
    maybeRethinkIdle(host, w, stance) {
      var _a, _b, _c;
      const combatBusy = w.foes.some((f) => f.alive && f.lit && f.dist <= 2);
      const gatherBusy = this.sameTargetHits > 0 && this.cool > 0 && !!w.gather;
      const striveBusy = !!this.mineStrive || !!this.anvilStrive;
      const tile = `${w.tile.x},${w.tile.y}`;
      const gearFp = this.stuckGearFpOf(w);
      const foodFp = this.stuckFoodFpOf(w);
      const xpFp = w.xpFp || "";
      const meters = this.stuckMetersOf(w);
      let meterProg = false;
      let metersFlat = true;
      if (this.stuckMeterAt === 0) {
        this.stuckMeterAt = this.runTicks;
        this.stuckMeterXp = meters.xp;
        this.stuckMeterGear = meters.gear;
        this.stuckMeterHp = meters.hp;
        this.stuckMeterMp = meters.mp;
        metersFlat = false;
      } else if (this.runTicks - this.stuckMeterAt >= STUCK_METER_SCAN) {
        meterProg = meters.xp !== this.stuckMeterXp || meters.gear !== this.stuckMeterGear || meters.hp !== this.stuckMeterHp || meters.mp !== this.stuckMeterMp;
        metersFlat = !meterProg;
        this.stuckMeterAt = this.runTicks;
        this.stuckMeterXp = meters.xp;
        this.stuckMeterGear = meters.gear;
        this.stuckMeterHp = meters.hp;
        this.stuckMeterMp = meters.mp;
      } else {
        metersFlat = meters.xp === this.stuckMeterXp && meters.gear === this.stuckMeterGear && meters.hp === this.stuckMeterHp && meters.mp === this.stuckMeterMp;
        meterProg = !metersFlat;
      }
      const gearProg = gearFp !== this.stuckGearFp && this.stuckGearFp !== "";
      const foodProg = foodFp !== this.stuckFoodFp && this.stuckFoodFp !== "";
      const expProg = xpFp !== this.stuckXpFp && this.stuckXpFp !== "";
      const realProg = gearProg || foodProg || expProg || meterProg;
      const stNow = (this.lastStatus || "").trim();
      if (stNow) {
        const last = this.stuckRecentStatus[this.stuckRecentStatus.length - 1] || "";
        if (stNow !== last) {
          this.stuckRecentStatus.push(stNow);
          if (this.stuckRecentStatus.length > 8) this.stuckRecentStatus.shift();
        }
      }
      const statusCounts = /* @__PURE__ */ new Map();
      for (const s of this.stuckRecentStatus) statusCounts.set(s, (statusCounts.get(s) || 0) + 1);
      let topStatusHits = 0;
      for (const n of statusCounts.values()) if (n > topStatusHits) topStatusHits = n;
      const uniqueStatuses = statusCounts.size;
      const repeatedAction = topStatusHits >= 2 && this.stuckRecentStatus.length >= 2;
      let usefulApproach = false;
      let walkOsc = false;
      const desire = this.stuckDesireTarget(w);
      if (desire) {
        const dist = Math.max(Math.abs(w.tile.x - desire.x), Math.abs(w.tile.y - desire.y));
        if (desire.key !== this.stuckDesireKey) {
          this.stuckDesireKey = desire.key;
          this.stuckApproachBest = dist;
          this.stuckRecentTiles = [];
          usefulApproach = true;
        } else if (dist < this.stuckApproachBest) {
          this.stuckApproachBest = dist;
          this.stuckRecentTiles = [];
          usefulApproach = true;
        } else if (dist <= 1) {
          const stPark = (this.lastStatus || "").toLowerCase();
          const parked = /food fell|sell for loot|fletch sell|bag stuck|wait anvil|hub for hatchet|cook fuel|dry ground|food fat|farm ceiling → next floor|stairs soft-block|hoard food|hoard fire|hoard loot|hoard explore|enroute pond|enroute gather|enroute toward gather|fish for food|open chest|remembered chest|tools fund chop|tools fund fish|tools chop|tools mine|tools fish/i.test(stPark);
          if (desire.key.startsWith("gather:") && !gatherBusy) {
            usefulApproach = false;
          } else {
            usefulApproach = !parked;
          }
        } else if (tile !== this.stuckTile) {
          this.stuckRecentTiles.push(tile);
          if (this.stuckRecentTiles.length > STUCK_TILE_RING) this.stuckRecentTiles.shift();
          const uniq = new Set(this.stuckRecentTiles);
          if (this.stuckRecentTiles.length >= 6 && uniq.size <= Math.ceil(this.stuckRecentTiles.length * 0.5)) {
            walkOsc = true;
          }
        }
      }
      {
        const stG = (this.lastStatus || "").toLowerCase();
        const gatherIntent = /tools fund chop|tools fund fish|tools chop|tools mine|tools fish|enroute gather|enroute pond|chop for|fund chop|fund mine|fish for food|farm food|mine ore|mine gear|util chop|util mine|util fish|open chest|remembered chest/i.test(stG);
        if (gatherIntent && !gatherBusy && !realProg) {
          if (usefulApproach) walkOsc = true;
          usefulApproach = false;
        }
      }
      const thrashNow = metersFlat && repeatedAction && walkOsc && !combatBusy && !gatherBusy && !striveBusy;
      const clashNow = metersFlat && uniqueStatuses >= 2 && this.stuckRecentStatus.length >= 4 && !combatBusy && !gatherBusy && !striveBusy;
      if (realProg || combatBusy || gatherBusy || striveBusy) {
        this.markThrash = false;
        this.markClash = false;
        this.markStuck = false;
      } else {
        if (thrashNow) this.markThrash = true;
        if (clashNow) this.markClash = true;
        if (metersFlat && this.stuckTicks >= Math.floor(IDLE_STUCK_TICKS / 2)) {
          this.markStuck = true;
        }
      }
      const thrashing = this.markThrash || walkOsc;
      if (!this.stuckTile && !this.stuckXpFp && !this.stuckGearFp && !this.stuckFoodFp) {
        this.stuckTile = tile;
        this.stuckGearFp = gearFp;
        this.stuckFoodFp = foodFp;
        this.stuckXpFp = xpFp;
        this.stuckTicks = 0;
        return;
      }
      if (combatBusy || gatherBusy || striveBusy || usefulApproach || realProg) {
        this.stuckTile = tile;
        this.stuckGearFp = gearFp;
        this.stuckFoodFp = foodFp;
        this.stuckXpFp = xpFp;
        this.stuckTicks = 0;
        if (foodProg) this.pondRethinks = 0;
        if (realProg) {
          this.stuckFireTicks = [];
          this.stuckWatchdogFired = false;
        }
        if (usefulApproach || realProg || combatBusy || striveBusy) {
          this.stuckRecentTiles = [];
        }
        return;
      }
      this.stuckTile = tile;
      this.stuckTicks += thrashing ? 2 : 1;
      if (metersFlat && this.stuckTicks >= Math.floor(IDLE_STUCK_TICKS / 2)) {
        this.markStuck = true;
      }
      if (this.stuckTicks < IDLE_STUCK_TICKS) return;
      const keepStairs = this.stairsStrive && /ceiling thrash|farm ceiling|food fat/i.test(this.stairsStrive.label) && (w.healReserve > 0 || w.food > 0) && w.kitReady && w.descendSafe;
      if (keepStairs) {
        this.stuckTicks = 0;
        this.noteAction("stuck rethink \u2014 keep ceiling stairs");
        return;
      }
      this.markStuck = true;
      if (thrashing) this.markThrash = true;
      const stuckReason = this.markThrash ? "stuck thrash (no approach / meters flat)" : this.markClash ? "stuck clash (status osc / meters flat)" : "stuck (no gear/food/exp/meters/approach)";
      try {
        (_a = host.onStuckProgress) == null ? void 0 : _a.call(host, {
          status: this.lastStatus || "stuck rethink",
          ticks: this.runTicks,
          thrashing: this.markThrash,
          reason: stuckReason
        });
      } catch {
      }
      if (!this.stuckWatchdogFired) {
        this.stuckFireTicks.push(this.runTicks);
        this.stuckFireTicks = this.stuckFireTicks.filter(
          (t) => this.runTicks - t <= STUCK_WATCHDOG_WINDOW
        );
        if (this.stuckFireTicks.length >= STUCK_WATCHDOG_FIRES) {
          this.stuckWatchdogFired = true;
          this.noteAction(
            `stuck watchdog \u2014 ${this.stuckFireTicks.length} fires / ${STUCK_WATCHDOG_WINDOW}t`
          );
          host.log(
            `AUTO: stuck watchdog kill \u2014 ${this.stuckFireTicks.length} rethinks without progress`
          );
          try {
            (_b = host.onStuckWatchdogKill) == null ? void 0 : _b.call(host, {
              status: this.lastStatus || "stuck watchdog",
              ticks: this.runTicks,
              stuckFires: this.stuckFireTicks.length,
              windowTicks: STUCK_WATCHDOG_WINDOW
            });
          } catch {
          }
          this.stuckTicks = 0;
          return;
        }
      }
      this.stuckTicks = 0;
      this.stuckApproachBest = 9999;
      this.stuckDesireKey = "";
      this.stuckRecentTiles = [];
      this.cool = 0;
      host.clearEngage();
      host.clearWalk();
      if (this.stairsStrive) {
        this.noteGatherFail(this.stairsStrive.sx, this.stairsStrive.sy);
        this.noteAction(`stuck rethink \u2014 soft-block stairs (${this.stairsStrive.label})`);
        this.clearStairsStrive();
      } else if (w.stairs && w.stairsLit && w.stairsOpen) {
        this.noteGatherFail(w.stairs.x, w.stairs.y);
        this.noteAction("stuck rethink \u2014 soft-block stairs");
      }
      if (this.anvilStrive) {
        this.noteAction(`stuck rethink \u2014 drop anvil (${this.anvilStrive.label})`);
        this.clearAnvilStrive();
      }
      if (this.mineStrive) {
        this.noteAction("stuck rethink \u2014 drop mine");
        this.clearMineStrive();
      }
      if (this.lastFoodFarm) {
        const s = this.lastFoodFarm;
        this.noteGatherFail(s.x, s.y);
        this.noteAction(`stuck rethink \u2014 soft-block food farm F${s.depth} (${s.x},${s.y})`);
        this.foodFarmSoftBlocks++;
        if (this.foodFarmSoftBlocks >= 2) {
          this.foodFarmSoftBlocks = 0;
          this.lastFoodFarm = null;
          this.laneBias = "gear";
          this.noteAction("food farm thrash \u2014 drop last farm");
          host.log("AUTO: food farm thrash \u2014 break to explore/fight");
          if (w.explore) host.walkTo(w.explore.x, w.explore.y);
          else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
          this.setStatus(host, w, stance, "food farm thrash \u2014 explore");
          this.cool = 3;
          if (this.lastTree) {
            const t = this.lastTree;
            this.noteGatherFail(t.x, t.y);
            this.noteAction(`stuck rethink \u2014 drop last tree F${t.depth} (${t.x},${t.y})`);
            this.lastTree = null;
          }
          return;
        }
      }
      if (this.lastTree) {
        const t = this.lastTree;
        this.noteGatherFail(t.x, t.y);
        this.noteAction(`stuck rethink \u2014 drop last tree F${t.depth} (${t.x},${t.y})`);
        this.lastTree = null;
      }
      if (w.gather) this.noteGatherFail(w.gather.x, w.gather.y);
      if (w.loot) this.noteGatherFail(w.loot.x, w.loot.y);
      {
        const stChest = (this.lastStatus || "").toLowerCase();
        if (/remembered chest|open chest/i.test(stChest) && ((_c = w.seen) == null ? void 0 : _c.chest)) {
          this.softBlockChest(host, w, w.seen.chest.x, w.seen.chest.y, "stuck rethink");
        }
      }
      this.open = null;
      this.laneBias = null;
      this.sameTargetKey = "";
      this.sameTargetHits = 0;
      this.lootWalkKey = "";
      this.lootWalkHits = 0;
      this.lootStandHits = 0;
      const stRethink = (this.lastStatus || "").toLowerCase();
      const pondSpin = /find pond|farm food|enroute pond|regen to hub/i.test(stRethink);
      if (pondSpin) this.pondRethinks++;
      const pondThresh = w.food === 0 && w.healReserve === 0 ? 3 : 4;
      if (this.pondRethinks >= pondThresh) {
        this.pondRethinks = 0;
        this.laneBias = "gear";
        if (this.lastFoodFarm) {
          this.noteAction("pond thrash \u2014 drop last food farm");
          this.lastFoodFarm = null;
          this.foodFarmSoftBlocks = 0;
        }
        this.pondBreakUntil = this.runTicks + 48;
        this.noteAction("pond thrash \u2014 fight/XP");
        host.log("AUTO: pond thrash \u2014 break to fight/XP");
        if (w.explore) {
          host.walkTo(w.explore.x, w.explore.y);
        } else if (w.wander) {
          host.walkTo(w.wander.x, w.wander.y);
        }
        this.setStatus(host, w, stance, "pond thrash \u2014 fight/XP");
        this.cool = 5;
        return;
      }
      const hatchetSpin = /hub for hatchet|forge hatchet|shop for hatchet|wait anvil hatchet|explore for hatchet/i.test(stRethink) && !host.hasTool("hatchet");
      if (hatchetSpin) this.hatchetRethinks++;
      else this.hatchetRethinks = 0;
      if (this.hatchetRethinks >= 3) {
        this.hatchetRethinks = 0;
        this.clearAnvilStrive();
        this.stylePivot = false;
        this.toolBlock.set("hatchet", this.runTicks + TOOL_BLOCK_TICKS);
        this.laneBias = "gear";
        this.noteAction("hatchet thrash \u2014 explore/mine");
        host.log("AUTO: hatchet thrash \u2014 break to explore/mine");
        if (w.gather && host.hasTool("pickaxe") && w.bagFree > 0 && this.tryGather(host, w, stance, "mine ore")) {
          return;
        }
        if (w.food === 0 && w.healReserve === 0 && host.hasTool("rod") && w.pondKnown && w.gather && this.tryGather(host, w, stance, "farm food")) {
          this.rememberFoodFarm(w);
          return;
        }
        if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        this.setStatus(host, w, stance, "hatchet thrash \u2014 explore");
        this.cool = 3;
        return;
      }
      const ceilingSpin = /farm ceiling|ceiling thrash/i.test(stRethink) && w.kitReady && w.food >= stance.minFood;
      if (ceilingSpin) this.ceilingRethinks = Math.min(8, this.ceilingRethinks + 1);
      else this.ceilingRethinks = 0;
      if (this.ceilingRethinks >= 4) {
        this.noteAction("ceiling thrash \u2014 stairs");
        host.log("AUTO: farm ceiling thrash \u2014 break to stairs");
        if (this.stairsUsable(w) && w.descendSafe) {
          if (this.walkStairsStrive(host, w, stance, "ceiling thrash \u2014 stairs")) return;
        }
        if (w.explore) {
          host.walkTo(w.explore.x, w.explore.y);
          this.setStatus(host, w, stance, "ceiling thrash \u2014 find stairs");
          this.cool = 3;
          return;
        }
        if (w.wander) {
          host.walkTo(w.wander.x, w.wander.y);
          this.setStatus(host, w, stance, "ceiling thrash \u2014 find stairs");
          this.cool = 3;
          return;
        }
        this.setStatus(host, w, stance, "ceiling thrash \u2014 stairs");
        this.cool = 3;
        return;
      }
      this.noteAction(thrashing ? "stuck rethink (thrash)" : "stuck rethink (gear+food+exp+approach flat)");
      host.log(thrashing ? "AUTO: stuck thrash (no approach) \u2014 rethink" : "AUTO: stuck (no gear/food/exp/approach) \u2014 rethink");
      this.setStatus(host, w, stance, "stuck rethink");
    }
    /** Lit open down-stairs not soft-blocked (e24). */
    stairsUsable(w) {
      return !!w.stairs && w.stairsOpen && w.stairsLit && !this.isGatherTileBlocked(w.stairs.x, w.stairs.y);
    }
    /** e24: clear mid-path stairs advance persist. */
    clearStairsStrive() {
      this.stairsStrive = null;
    }
    /** e24: remember we are walking to down-stairs for this desire. */
    markStairsStrive(label, w) {
      const st = w.stairs;
      if (!st) {
        this.clearStairsStrive();
        return;
      }
      const prev = this.stairsStrive;
      if (prev && prev.sx === st.x && prev.sy === st.y) {
        prev.label = label;
        if (w.tile.x === prev.standX && w.tile.y === prev.standY) prev.standHits++;
        else {
          const dist = Math.max(Math.abs(w.tile.x - st.x), Math.abs(w.tile.y - st.y));
          const was = Math.max(Math.abs(prev.standX - st.x), Math.abs(prev.standY - st.y));
          prev.standHits = dist < was ? 0 : prev.standHits + 1;
          prev.standX = w.tile.x;
          prev.standY = w.tile.y;
        }
        return;
      }
      this.stairsStrive = {
        label,
        started: this.runTicks,
        standHits: 0,
        standX: w.tile.x,
        standY: w.tile.y,
        sx: st.x,
        sy: st.y
      };
    }
    /**
     * e24: walk to down-stairs and persist until depth change or soft-block.
     * Short cool so cool-path resume keeps steering (never stand with stale advance).
     */
    walkStairsStrive(host, w, stance, label) {
      if (!this.stairsUsable(w)) {
        this.clearStairsStrive();
        return false;
      }
      this.markStairsStrive(label, w);
      host.clearEngage();
      host.walkTo(w.stairs.x, w.stairs.y);
      this.setStatus(host, w, stance, label);
      this.cool = 1;
      return true;
    }
    /**
     * e24: keep walking stairs desire; soft-block on no tile progress / door thrash / unreachable.
     * True if an action was issued this tick.
     */
    resumeStairsStrive(host, w, stance) {
      const s = this.stairsStrive;
      if (!s) return false;
      if (!w.stairs || w.stairs.x !== s.sx || w.stairs.y !== s.sy || !w.stairsOpen) {
        this.clearStairsStrive();
        return false;
      }
      if (this.isGatherTileBlocked(s.sx, s.sy)) {
        this.clearStairsStrive();
        return false;
      }
      if (w.tile.x === s.sx && w.tile.y === s.sy) {
        s.standHits++;
        if (s.standHits >= 10) {
          this.noteGatherFail(s.sx, s.sy);
          this.noteAction(`stairs no-descend soft-block (${s.label})`);
          host.log(`AUTO: on stairs but no descend (${s.label}) \u2014 soft-block`);
          host.clearWalk();
          this.clearStairsStrive();
          this.setStatus(host, w, stance, "stairs soft-block");
          this.cool = 1;
          return false;
        }
        this.cool = 1;
        return true;
      }
      if (w.tile.x === s.standX && w.tile.y === s.standY) s.standHits++;
      else {
        const dist = Math.max(Math.abs(w.tile.x - s.sx), Math.abs(w.tile.y - s.sy));
        const prev = Math.max(Math.abs(s.standX - s.sx), Math.abs(s.standY - s.sy));
        s.standHits = dist < prev ? 0 : s.standHits + 1;
        s.standX = w.tile.x;
        s.standY = w.tile.y;
      }
      const aged = this.runTicks - s.started;
      if (s.standHits >= 12 || aged >= 100) {
        this.noteGatherFail(s.sx, s.sy);
        this.noteAction(`stairs soft-block (${s.label})`);
        host.log(`AUTO: stairs unreachable (${s.label}) \u2014 soft-block, explore`);
        host.clearWalk();
        this.clearStairsStrive();
        this.setStatus(host, w, stance, "stairs soft-block");
        this.cool = 1;
        return false;
      }
      host.clearEngage();
      host.walkTo(s.sx, s.sy);
      this.setStatus(host, w, stance, s.label);
      this.cool = 1;
      return true;
    }
    /** e33: remember we started mining this rock. */
    markMineStrive(x, y, oreAtStart) {
      const prev = this.mineStrive;
      if (prev && prev.x === x && prev.y === y) return;
      this.mineStrive = { x, y, started: this.runTicks, oreAtStart };
    }
    clearMineStrive() {
      this.mineStrive = null;
    }
    /**
     * e33: keep mining the sticky rock until ore lands, soft-block, or melee threat.
     * Beats farm-food divert while standing on bronze with heal 0.
     */
    resumeMineStrive(host, w, stance) {
      const s = this.mineStrive;
      if (!s) return false;
      if (!host.hasTool("pickaxe")) {
        this.clearMineStrive();
        return false;
      }
      if (w.oreCount > s.oreAtStart) {
        this.mineFailStreak = 0;
        this.clearMineStrive();
        return false;
      }
      if (this.isGatherTileBlocked(s.x, s.y)) {
        this.clearMineStrive();
        return false;
      }
      const aged = this.runTicks - s.started;
      if (aged >= 160) {
        this.mineFailStreak++;
        this.noteAction("mine strive soft-block");
        this.clearMineStrive();
        if (this.mineFailStreak >= 3) {
          this.mineFailStreak = 0;
          this.mineBlockUntil = this.runTicks + 280;
          this.noteAction("mine thrash soft-block");
        }
        return false;
      }
      const press = w.foes.some(
        (f) => f.alive && f.lit && f.dist <= 1 && (f.danger === "deadly" || f.danger === "threat")
      );
      if (press) {
        this.clearMineStrive();
        return false;
      }
      host.clearEngage();
      const attempt = host.gatherAt(s.x, s.y);
      if (attempt.ok) {
        this.setStatus(host, w, stance, `mine ore (${s.x},${s.y})`);
        this.cool = 5;
        return true;
      }
      const reason = attempt.reason || "";
      if (/^enroute$/i.test(reason)) {
        this.setStatus(host, w, stance, `mine ore (${s.x},${s.y})`);
        this.cool = 1;
        return true;
      }
      this.noteAction(`mine strive fail \u2014 ${reason}`);
      this.clearMineStrive();
      return false;
    }
    /** e23: clear mid-path anvil forge/smith persist. */
    clearAnvilStrive() {
      this.anvilStrive = null;
    }
    /** e23: remember we are walking to anvil for this desire (hatchet/smith). */
    markAnvilStrive(label, w) {
      const prev = this.anvilStrive;
      if (prev && prev.label === label) {
        if (w.tile.x === prev.standX && w.tile.y === prev.standY) prev.standHits++;
        else {
          prev.standX = w.tile.x;
          prev.standY = w.tile.y;
          prev.standHits = 0;
        }
        return;
      }
      this.anvilStrive = {
        label,
        started: this.runTicks,
        standHits: 0,
        standX: w.tile.x,
        standY: w.tile.y
      };
    }
    /**
     * e67: SIT memory from the previous tick. Only fills a hole the current target does not.
     * A fight already on you, or a stairs walk, is left alone.
     */
    actOnSeen(host, w, stance) {
      var _a;
      const s = w.seen;
      if (!s || this.stairsStrive) return false;
      const pressed = w.foes.some((f) => {
        var _a2;
        return f.alive && f.lit && (f.dist <= 2 || f.watch === 3 && ((_a2 = f.reach) != null ? _a2 : 99) <= 4);
      });
      if (pressed) return false;
      if (s.pit && w.explore && w.explore.x === s.pit.x && w.explore.y === s.pit.y && w.wander) {
        return this.walkSeen(host, w, stance, w.wander, "avoid pit");
      }
      const starving = w.food <= 0 && w.healReserve <= 0 && w.rawFish <= 0;
      if (starving && host.hasTool("rod") && s.pond && !w.gather) {
        return this.walkSeen(host, w, stance, s.pond, "remembered pond");
      }
      if (w.rawFish > 0 && !w.hasLogs && !w.hasFire && host.hasTool("hatchet") && s.tree && s.treeDrag >= 0 && s.treeDrag < 100 && !w.gather) {
        return this.walkSeen(host, w, stance, s.tree, "remembered tree");
      }
      if (s.camp && !w.kitReady && w.depth <= 4 && s.anvil && w.oreCount > 0 && !w.anvilNearby) {
        return this.walkSeen(host, w, stance, s.anvil, "remembered camp");
      }
      if (!starving && s.chest && !this.chestExposed(w) && !s.chestBlocked) {
        const reach = typeof s.chestReach === "number" ? s.chestReach : -1;
        const path = (_a = s.chestPath) != null ? _a : -1;
        const openable = !!s.chestOpenable;
        const adj = s.chestAdj;
        const dChest = Math.max(Math.abs(s.chest.x - w.tile.x), Math.abs(s.chest.y - w.tile.y));
        if (w.bagFree <= 0 && !(openable || dChest <= 1)) {
          host.equipUp();
          const w2 = host.world();
          if (w2.bagFree <= 0 && this.tryBagFullRelief(host, w2, stance)) return true;
          if (host.world().bagFree <= 0 && this.dropUntilCookSlot(host)) {
            this.setStatus(host, w, stance, "drop for chest slot");
            this.cool = 2;
            return true;
          }
        }
        const softActive = this.runTicks < this.chestBlockUntil;
        const bypass = adj ? softBlockBypass(adj, softActive, this.desireXY, w.tile, this.h1001.nodes, w.depth) : this.runTicks >= this.chestBlockUntil;
        if (!bypass && softActive) {
        } else if (openable || dChest <= 1) {
        } else if (reach < 0 && path < 0) {
          this.softBlockChest(host, w, s.chest.x, s.chest.y, "chest unreachable");
        } else if (reach < 0 && (!adj || path >= 0 && path > 16)) {
          this.softBlockChest(host, w, s.chest.x, s.chest.y, "chest no adj");
        } else if (reach >= 0 && reach <= 16 || path >= 0 && path <= 16) {
          const target = adj || s.chest;
          if (adj && (w.tile.x !== adj.x || w.tile.y !== adj.y)) {
            return this.walkSeen(host, w, stance, adj, "remembered chest");
          }
          if (!adj && dChest > 1) {
            if (target.x !== w.tile.x || target.y !== w.tile.y) {
              return this.walkSeen(host, w, stance, target, "remembered chest");
            }
          }
        }
      }
      if (!starving && s.ironKey && s.door && this.runTicks >= this.doorSeenUntil) {
        const d = Math.max(Math.abs(s.door.x - w.tile.x), Math.abs(s.door.y - w.tile.y));
        if (d <= 1) this.doorSeenUntil = this.runTicks + 80;
        else if (d <= 8) return this.walkSeen(host, w, stance, s.door, "remembered door");
      }
      return false;
    }
    canPayForge(w) {
      var _a, _b;
      const cost = (_b = (_a = w.seen) == null ? void 0 : _a.forgeCost) != null ? _b : -1;
      if (cost < 0) return true;
      return w.coins >= cost || w.oreCount > 0;
    }
    /** Metal weapon and armour, or a bow or wand. A plain sword is not enough to go looking. */
    wornEnough(w) {
      return w.hasMetalWeapon && w.hasArmour || w.hasStyleWeapon;
    }
    /**
     * A frontier step. If this is already a camp, fight the one mob here or
     * go back to the shop / the node. Do not walk into a way that is packed.
     */
    exploreOut(host, w, stance, label) {
      var _a;
      if (((_a = w.seen) == null ? void 0 : _a.camp) && this.stayInCamp(host, w, stance)) return true;
      if (w.explore && this.walkSaferWay(host, w, stance)) return true;
      const spot = w.explore || w.wander;
      if (!spot) return false;
      host.clearEngage();
      host.walkTo(spot.x, spot.y);
      this.setStatus(host, w, stance, label);
      this.cool = 3;
      return true;
    }
    /** Forge refused. Wait, but a new coin or a new ore opens it again. */
    noteForgeMiss(w, ticks = 280) {
      this.forgeBlockUntil = this.runTicks + ticks;
      this.forgeBlockCoins = w.coins;
      this.forgeBlockOre = w.oreCount;
    }
    /** True when the worn kit can take another forge and the anvil is in this camp. */
    forgeReady(w) {
      var _a;
      if (w.oreCount <= 0 || !this.wornEnough(w)) return false;
      if (!w.anvilNearby && !((_a = w.seen) == null ? void 0 : _a.anvil)) return false;
      if (!this.canPayForge(w)) return false;
      if (this.runTicks < this.forgeBlockUntil && w.coins <= this.forgeBlockCoins && w.oreCount <= this.forgeBlockOre) return false;
      this.forgeBlockUntil = 0;
      return true;
    }
    /** Camp: one lit foe, the node you can already work, or the shop. Not the frontier. */
    stayInCamp(host, w, stance) {
      var _a;
      const s = w.seen;
      if (!(s == null ? void 0 : s.camp)) return false;
      if (this.forgeReady(w) && host.forgeWieldedOnce()) {
        this.noteImprove();
        this.setStatus(host, w, stance, "forge kit +");
        this.cool = 4;
        return true;
      }
      const missing = !host.hasTool("pickaxe") || !host.hasTool("hatchet") || !host.hasTool("rod");
      const hungry = w.food <= 0 && w.healReserve <= 0;
      if (!missing && !hungry) return false;
      const foe = w.foes.filter((f) => f.alive && f.lit && !f.boss && !f.gateBoss && f.dist <= 5).sort((a, b) => a.dist - b.dist)[0];
      const packed = foe ? (s.ways || []).some((wy) => wy.mobs >= 3 && wy.dx === Math.sign(foe.x - w.tile.x) && wy.dy === Math.sign(foe.y - w.tile.y)) : false;
      if (foe && !packed && ((_a = s.drag) != null ? _a : 0) < 100 && this.wornEnough(w)) {
        this.engageSmart(host, w, stance, foe, "fight");
        this.setStatus(host, w, stance, "camp fight");
        this.cool = 2;
        return true;
      }
      const owned = this.nearestOwnedNearby(host, w);
      if (owned && host.hasTool(owned.tool) && !this.bagFullActive()) {
        host.clearEngage();
        const attempt = host.gatherAt(owned.tile.x, owned.tile.y);
        const enroute = !attempt.ok && /^enroute$/i.test(attempt.reason || "");
        if (attempt.ok || enroute) {
          this.setStatus(host, w, stance, "camp node");
          this.cool = attempt.ok ? 2 : 1;
          return true;
        }
      }
      if (s.shop && this.walkSeen(host, w, stance, s.shop, "camp shop")) return true;
      if (s.anvil && w.oreCount > 0 && !w.anvilNearby && this.walkSeen(host, w, stance, s.anvil, "camp anvil")) return true;
      return false;
    }
    /** Bag piece has more room than what is worn. Equip it. Do not sell it. */
    spareBeatsWorn(w) {
      const s = w.seen;
      if (!s || s.spareRoom < 0) return false;
      const worn = [s.wepRoom, s.armRoom, s.offRoom].filter((n) => n >= 0);
      if (!worn.length) return true;
      return s.spareRoom > Math.max(...worn);
    }
    sellJunk(host, w) {
      if (this.spareBeatsWorn(w)) {
        host.equipUp();
        return false;
      }
      return this.trySellUnusedOnce(host, w);
    }
    /**
     * Gather nodes already close to the hero. 12 tiles is the camp around the shop.
     * A node remembered across the floor is not a reason to buy that tool yet.
     */
    nearbyGather(w) {
      var _a, _b, _c;
      const nodes = [
        { tool: "pickaxe", tile: (_a = w.seen) == null ? void 0 : _a.rock, name: "rock" },
        { tool: "hatchet", tile: (_b = w.seen) == null ? void 0 : _b.tree, name: "tree" },
        { tool: "rod", tile: (_c = w.seen) == null ? void 0 : _c.pond, name: "pond" }
      ];
      const out = [];
      for (const n of nodes) {
        if (!n.tile) continue;
        const dist = Math.max(Math.abs(n.tile.x - w.tile.x), Math.abs(n.tile.y - w.tile.y));
        if (dist > 12) continue;
        out.push({ tool: n.tool, tile: n.tile, name: n.name, dist });
      }
      out.sort((a, b) => a.dist - b.dist);
      return out;
    }
    nearestMissingNearby(host, w) {
      var _a;
      return (_a = this.nearbyGather(w).find((n) => !host.hasTool(n.tool))) != null ? _a : null;
    }
    nearestOwnedNearby(host, w) {
      var _a;
      return (_a = this.nearbyGather(w).find((n) => host.hasTool(n.tool))) != null ? _a : null;
    }
    /** e77: soft-block a remembered chest (unreachable / stuck rethink) like pond. */
    softBlockChest(host, _w, x, y, why) {
      this.noteGatherFail(x, y);
      this.chestBlockUntil = this.runTicks + 160;
      this.noteAction(`chest soft-block \u2014 ${why} (${x},${y})`);
      host.log(`AUTO: chest soft-block \u2014 ${why}`);
    }
    walkSeen(host, w, stance, tile, label) {
      if (!tile) return false;
      if (w.tile.x === tile.x && w.tile.y === tile.y) return false;
      host.clearEngage();
      host.walkTo(tile.x, tile.y);
      this.setStatus(host, w, stance, label);
      this.cool = 2;
      return true;
    }
    /** A step into a room remembered as full, when a cleaned way is still there. */
    walkSaferWay(host, w, stance) {
      var _a;
      const ways = ((_a = w.seen) == null ? void 0 : _a.ways) || [];
      if (!w.explore || ways.length < 2) return false;
      const stepx = Math.sign(w.explore.x - w.tile.x);
      const stepy = Math.sign(w.explore.y - w.tile.y);
      const hot = ways.find((wy) => wy.mobs >= 3 && wy.dx === stepx && wy.dy === stepy);
      if (!hot) return false;
      const safe = ways.find((wy) => wy.back && wy.mobs >= 0 && wy.mobs < 3) || ways.find((wy) => wy.been && wy.mobs >= 0 && wy.mobs < 3);
      if (!safe || safe.dx === hot.dx && safe.dy === hot.dy) return false;
      return this.walkSeen(host, w, stance, { x: w.tile.x + safe.dx, y: w.tile.y + safe.dy }, "remembered way");
    }
    /**
     * Don't open when a mob is already coming, or the job is expected to wake a fight you should not take.
     * Expected notices of 1.00 or more is a sure wake. A pond makes the walk long, so a sure wake may still be late.
     * A single glance through a door stays under 1 and does not hold the chest.
     */
    chestExposed(w) {
      var _a, _b, _c, _d, _e, _f;
      const hurt = w.hp * 2 < w.maxHp;
      for (const f of w.foes) {
        if (!f.alive || !f.lit || f.gold) continue;
        const steps = typeof f.reach === "number" ? f.reach : -1;
        const chasing = f.watch === 3;
        const expect = (_a = f.expect) != null ? _a : 0;
        const hard = f.danger === "deadly" || f.danger === "threat";
        const arrives = steps >= 0 && steps <= 8;
        if (chasing && arrives) return true;
        if (expect >= 100 && arrives && (hard || hurt)) return true;
        const drag = (_c = (_b = w.seen) == null ? void 0 : _b.drag) != null ? _c : 0;
        const chestPath = (_e = (_d = w.seen) == null ? void 0 : _d.chestPath) != null ? _e : -1;
        const toChest = typeof f.reachChest === "number" ? f.reachChest : -1;
        if (toChest >= 0 && chestPath >= 0 && toChest <= chestPath + 2 && (chasing || expect >= 100 || hard)) return true;
        if (drag >= 100 && chestPath >= 0 && chestPath <= 8 && (hard || hurt)) return true;
        if (steps >= 0 && steps <= 3 && hard && (hurt || f.danger === "deadly") && expect >= 20) return true;
        if (chasing && f.ranged && f.los && f.dist <= ((_f = f.atkRange) != null ? _f : 1)) return true;
      }
      return false;
    }
    /**
     * e42 (amvmuuuou8tg): open chest with thrash soft-block.
     * openChestOnce returns true on walk OR open; kite interrupts so status stays
     * "open chest" forever with no coin/bag gain. Count streak; ≥4 → cool-down.
     * Soft-block falls through (false) — do NOT keep status open chest.
     */
    tryOpenChestOnce(host, w, stance, opts) {
      if (this.runTicks < this.chestBlockUntil && !opts.bypassSoft) return false;
      if (opts.needBag && w.bagFree <= 0) return false;
      if (!host.openChestOnce()) return false;
      const fp = `c${w.coins}|bf${w.bagFree}|f${w.food}|h${w.healReserve}`;
      if (this.chestProgKey !== "" && fp === this.chestProgKey) {
        this.chestFailStreak++;
        if (this.chestFailStreak >= 4) {
          this.chestFailStreak = 0;
          this.chestBlockUntil = this.runTicks + 160;
          this.noteAction("chest thrash soft-block");
          host.log("AUTO: chest thrash soft-block \u2014 skip open");
          return false;
        }
      } else {
        this.chestFailStreak = 0;
        this.chestProgKey = fp;
      }
      this.setStatus(host, w, stance, "open chest");
      this.cool = opts.cool;
      this.scan.atTileLoot = { x: w.tile.x, y: w.tile.y, untilTick: this.runTicks + 6 };
      return true;
    }
    /**
     * e23: keep forging/smithing at anvil until done or soft-block (no progress / too long).
     * True if an action was issued this tick.
     */
    resumeAnvilStrive(host, w, stance) {
      const s = this.anvilStrive;
      if (!s) return false;
      if (/hatchet/i.test(s.label) && host.hasTool("hatchet")) {
        this.clearAnvilStrive();
        return false;
      }
      if (/smith wep/i.test(s.label) && w.hasMetalWeapon) {
        this.clearAnvilStrive();
        return false;
      }
      if (/smith armour/i.test(s.label) && w.hasArmour) {
        this.clearAnvilStrive();
        return false;
      }
      if (w.tile.x === s.standX && w.tile.y === s.standY) s.standHits++;
      else {
        s.standX = w.tile.x;
        s.standY = w.tile.y;
        s.standHits = 0;
      }
      const aged = this.runTicks - s.started;
      const emptyHeal = w.food <= 0 && w.healReserve <= 0;
      const standLim = emptyHeal ? 12 : 18;
      const ageLim = emptyHeal ? 120 : 220;
      if (s.standHits >= standLim || aged >= ageLim) {
        this.noteAction(`anvil strive soft-block (${s.label})`);
        host.log(`AUTO: anvil unreachable (${s.label}) \u2014 soft-block`);
        this.noteForgeMiss(w, 200);
        this.clearAnvilStrive();
        return false;
      }
      if (/hatchet/i.test(s.label)) {
        if (host.acquireTool("hatchet")) {
          this.setStatus(host, w, stance, s.label);
          this.cool = 2;
          return true;
        }
        if (this.walkHub(host, w, stance, "hub for hatchet")) return true;
        this.setStatus(host, w, stance, s.label);
        this.cool = 2;
        return true;
      }
      if (/smith/i.test(s.label)) {
        if (this.wantSmithKit(w) && host.smithKitOnce()) {
          this.setStatus(host, w, stance, s.label);
          this.cool = 3;
          return true;
        }
        if (w.oreCount <= 0 || w.hasStyleWeapon) {
          this.clearAnvilStrive();
          return false;
        }
        if (this.walkHub(host, w, stance, "hub to smith")) return true;
        this.setStatus(host, w, stance, s.label);
        this.cool = 2;
        return true;
      }
      if (/forge /i.test(s.label)) {
        if (host.acquireTool("hatchet") || host.acquireTool("pickaxe")) {
          this.setStatus(host, w, stance, s.label);
          this.cool = 2;
          return true;
        }
      }
      this.clearAnvilStrive();
      return false;
    }
    walkHub(host, w, stance, label) {
      if (!w.hub) return false;
      host.clearEngage();
      host.walkTo(w.hub.x, w.hub.y);
      this.setStatus(host, w, stance, label);
      this.cool = 3;
      return true;
    }
    watchHang(host, w) {
      if (this.hangReported) return;
      if (w.foes.some((f) => f.alive && f.lit && f.dist <= 2)) {
        this.hangTileTicks = 0;
        return;
      }
      if (w.depth !== this.hangFloor) {
        this.hangFloor = w.depth;
        this.hangFloorTicks = 0;
      } else {
        this.hangFloorTicks++;
      }
      if (w.tile.x !== this.hangTileX || w.tile.y !== this.hangTileY) {
        this.hangTileX = w.tile.x;
        this.hangTileY = w.tile.y;
        this.hangTileTicks = 0;
      } else {
        this.hangTileTicks++;
      }
      if (w.xpFp !== this.hangXpFp) {
        this.hangXpFp = w.xpFp;
        this.hangXpTicks = 0;
      } else {
        this.hangXpTicks++;
      }
      const ts = Math.max(1, w.timeScale || 1);
      const sameFloorN = HANG_SAME_FLOOR_TICKS * ts;
      const sameTileN = HANG_SAME_TILE_TICKS * ts;
      const skillsFlatN = HANG_SKILLS_FLAT_TICKS * ts;
      const sameFloor = this.hangFloorTicks >= sameFloorN;
      const sameTile = this.hangTileTicks >= sameTileN;
      const skillsFlat = this.hangXpTicks >= skillsFlatN;
      if (!(sameTile || skillsFlat && this.hangTileTicks >= sameTileN / 2)) return;
      const mark = {
        sameFloor: sameFloor || this.hangFloorTicks >= sameFloorN / 2,
        sameTile,
        skillsFlat,
        ticks: this.runTicks,
        ms: this.activeElapsedMs()
      };
      this.hang = mark;
      this.hangReported = true;
      this.deathId = "hang_idle";
      this.deathLabel = "Auto hang / idle";
      this.noteAction(
        `hang ${[
          sameTile ? "sameTile" : "",
          skillsFlat ? "skillsFlat" : "",
          mark.sameFloor ? "sameFloor" : ""
        ].filter(Boolean).join("+") || "idle"}`
      );
      host.setStatus(
        `AUTO \u2014 HANG (${[
          sameTile ? "same tile" : "",
          skillsFlat ? "skills flat" : "",
          mark.sameFloor ? "same floor" : ""
        ].filter(Boolean).join(", ")})`
      );
      host.onHang(mark);
    }
    classifyDeath(w) {
      var _a, _b;
      if (this.hang) {
        this.deathId = "hang_idle";
        this.deathLabel = "Auto hang / idle";
        return { id: this.deathId, label: this.deathLabel };
      }
      if ((_a = this.open) == null ? void 0 : _a.deathIfFatal) {
        const id = this.open.deathIfFatal;
        const cat = AUTOPLAY_DEATH_CATEGORIES.find((c) => c.id === id);
        this.deathId = id;
        this.deathLabel = (_b = cat == null ? void 0 : cat.label) != null ? _b : id;
        return { id, label: this.deathLabel };
      }
      if (w.food <= 0) {
        this.deathId = "starved";
        this.deathLabel = "Starved / no food";
        return { id: this.deathId, label: this.deathLabel };
      }
      if (w.bossFloor && w.foes.some((f) => f.alive && (f.gateBoss || f.boss))) {
        this.deathId = "boss_undergeared";
        this.deathLabel = "Boss undergeared";
        return { id: this.deathId, label: this.deathLabel };
      }
      this.deathId = "trash_attrition";
      this.deathLabel = "Trash attrition";
      return { id: this.deathId, label: this.deathLabel };
    }
  };
  __publicField(_AutoplayDriver, "JOURNAL_MAX", 3e4);
  var AutoplayDriver = _AutoplayDriver;

  // src/systems/autoEngineEntry.ts
  var g = globalThis;
  g.PHD_AUTO_ENGINE = {
    version: AUTO_ENGINE_VERSION,
    AUTO_ENGINE_VERSION,
    AutoplayDriver
  };
})();
