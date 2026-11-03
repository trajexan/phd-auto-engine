/* phd auto-engine 3019 — pull via GET /api/auto-engine */
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
    if (!R && !T && !P && !A && !S) return null;
    if ((A || R || S) && !host.hasTool("pickaxe")) return "pickaxe";
    if ((T || A || S || P || R) && !host.hasTool("hatchet")) return "hatchet";
    if ((P || S) && !host.hasTool("rod")) return "rod";
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
    if (h.phase === "MAP_HUB" && (w.hub || (s == null ? void 0 : s.anvil) || (s == null ? void 0 : s.shop) || (s == null ? void 0 : s.rock) || (s == null ? void 0 : s.pond) || (s == null ? void 0 : s.tree) || has("anvil") || has("shop") || has("rock") || has("pond") || has("tree") || w.anvilNearby)) {
      const needTools = !!((s == null ? void 0 : s.rock) || has("rock")) || !!((s == null ? void 0 : s.tree) || has("tree")) || !!((s == null ? void 0 : s.pond) || w.pondKnown || has("pond")) || !!((s == null ? void 0 : s.anvil) || has("anvil") || w.anvilNearby) || !!((s == null ? void 0 : s.shop) || has("shop"));
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
  var AUTO_ENGINE_VERSION = "3019";
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
    return { hungry, stocked, caution, bravery, label, ratio, safetyLevel, minFood, healRich };
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
      /**
       * Eng 2039 / t1760+t1761: sticky desire while crossing a door so open is
       * followed by step-through (host slam-closes the tile we leave).
       */
      __publicField(this, "doorCrossStickyUntil", 0);
      __publicField(this, "doorCrossDesire", null);
      /** Open then retreat / open-close with no approach — abandon at ≥3. */
      __publicField(this, "doorOscStreak", 0);
      /** True last tick while standing on remembered door tile. */
      __publicField(this, "doorOnDoorLast", false);
      __publicField(this, "doorLastTile", "");
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
      /**
       * Eng 2027 / t1722: nearest lit foe dist last tick — closing-over-ticks instinct.
       * Snapshot chase already exists; this catches dist decreasing before adj.
       */
      __publicField(this, "nearFoePrevDist", 999);
      __publicField(this, "nearFoeClosing", false);
      /** Recent status lines for repeated-action thrash (≥2 same in ring). */
      __publicField(this, "stuckRecentStatus", []);
      /**
       * Eng 2020 / t1669: observational marks — set whenever detection trips,
       * even if eng does not SNAP / rethink / watchdog. Exposed on FHD + SIT.
       */
      __publicField(this, "markThrash", false);
      __publicField(this, "markClash", false);
      __publicField(this, "markStuck", false);
      /**
       * Eng 2060 / t1789: life-latched incident bits — once set this life, NEVER clear
       * on combat/progress/realProg. Death FHD/SIT always export via detectMarks().
       * Floor change keeps latch; only brand-new life (prev < 0) resets.
       */
      __publicField(this, "lifeThrash", false);
      __publicField(this, "lifeClash", false);
      __publicField(this, "lifeStuck", false);
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
      /** Eng 2028 / t1732: sellOreKeep walk thrash — same cool-down (was infinite shop walk). */
      __publicField(this, "sellOreKeepFailStreak", 0);
      __publicField(this, "sellOreKeepBlockUntil", 0);
      __publicField(this, "sellOreKeepProgKey", "");
      /**
       * Eng 2023 (t1703): shared fund-intent lock — TOOLS acquireTool/fund farm vs calm
       * food-seek. Opposite kind yields while lock held; emerg food breaks it.
       */
      __publicField(this, "fundIntent", null);
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
      /**
       * Eng 2085 / R54: count fresh pondBreak arms this life (pondOsc / food-fish mono /
       * stuck-rethink). ≥2 → escalate quiet leave instead of soft wander prison.
       */
      __publicField(this, "pondBreakArms", 0);
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
      /** Eng 2033: sticky bag find-shop after escalation — no sell/forge label osc. */
      __publicField(this, "bagFindShopUntil", 0);
      __publicField(this, "bagFindShopTile", "");
      /** Eng 2034: sticky SELL_TRIM while bag tight with sellables/raws — no GEAR_FARM ping-pong. */
      __publicField(this, "sellTrimStickyUntil", 0);
      /** Eng 2059: cool-block SELL_TRIM re-entry after empty/keep-only trim (foodLow thrash). */
      __publicField(this, "sellTrimEmptyUntil", 0);
      /** Eng 2059: consecutive SELL_TRIM ticks with no sell/mats progress. */
      __publicField(this, "sellTrimNoSellStreak", 0);
      /** Eng 2059: consecutive FOOD_BUFFER find-pond ticks with no pond/food progress. */
      __publicField(this, "findPondMonoStreak", 0);
      /**
       * Eng 2034 / 752huv: raw-sell-fund sameTile streak + cool-block.
       * Never perpetual sameTile return true when shop walk/sell stalls.
       */
      __publicField(this, "rawSellSameTile", 0);
      __publicField(this, "rawSellTile", "");
      __publicField(this, "rawSellBlockUntil", 0);
      /** Eng 2033: ore-liquidate sameTile streak → abandon after shop-path attempts. */
      __publicField(this, "oreLiqSameTile", 0);
      __publicField(this, "oreLiqTile", "");
      /**
       * Eng 2035 / R4: tools find rock thrash (m54rep/r7juze) — after rethink fires
       * with no live rock, cool-block find-rock label and force explore/wander/hub.
       */
      __publicField(this, "rockFindRethinks", 0);
      __publicField(this, "rockFindBreakUntil", 0);
      /** Eng 2044 / R14: sticky explore↔kite break — cool+label skip was not enough. */
      __publicField(this, "exploreKiteBreakUntil", 0);
      /** Eng 2044 / R14: sticky tools↔emerg hub break (same re-entry class). */
      __publicField(this, "emergToolsBreakUntil", 0);
      /** Eng 2045 / R15: sticky hatchet↔chest / hatchet thrash — cool alone self-looped. */
      __publicField(this, "hatchetChestBreakUntil", 0);
      /** Eng 2045 / R15: sticky sell-ore↔find-shop — ring re-armed after cool. */
      __publicField(this, "sellOreBreakUntil", 0);
      /** Eng 2046 / R16: sticky food mine break ↔ altar/enroute / mono hang. */
      __publicField(this, "foodMineBreakUntil", 0);
      /** Eng 2047 / R17: sticky stuck-rethink ↔ tools wander/explore (WD thrash class). */
      __publicField(this, "stuckWanderBreakUntil", 0);
      /**
       * Eng 2076 / R45: durable quiet tools-bootstrap break — ring hits≥6 unreachable
       * for pure mono (8-deep + identical-status dedupe). Emit counter → latch.
       */
      __publicField(this, "quietBootstrapBreakUntil", 0);
      __publicField(this, "quietBootstrapEmitHits", 0);
      /**
       * Eng 2077 / R46: durable bootstrap-break emit count — break path refreshed
       * BreakUntil forever (111/138 break↔grace). Escalate at ≥3.
       */
      __publicField(this, "quietBreakEmitHits", 0);
      /**
       * Eng 2078 / R47: durable escalate latch — 2077 reset EmitHits + filtered ring
       * so next tick re-entered tools bootstrap (sukdr2/3qj9mc escalate↔bootstrap).
       * While live, finishQuietHoldProgress never bootstrap/break; escalate leave only.
       */
      __publicField(this, "quietBreakEscalateUntil", 0);
      __publicField(this, "quietBreakEscalateHits", 0);
      /**
       * Eng 2079 / R48: escalate-leave emit count — leave↔grace theater (8f2a8t 66×).
       * ≥3 → sticky progress leave + keep quiet window soft-ended.
       * Eng 2080 / R49: under latch, sticky must not re-arm cool stickies / park must not
       * re-open quiet window (7ewd83 leave-sticky↔sticky-explore↔kite-cool-wander).
       */
      __publicField(this, "quietEscalateLeaveHits", 0);
      /**
       * Eng 2081 / R50: durable leave emit count + settle ban. First durable leave arms
       * settle; further wander-hub/park/sticky under latch must settle (not durable loop).
       */
      __publicField(this, "durableEscalateLeaveHits", 0);
      __publicField(this, "durableLeaveSettleUntil", 0);
      /** Eng 2082 / R51: soft-continue settle without re-latch thrash every tick. */
      __publicField(this, "durableLeaveSettleEmitUntil", 0);
      /**
       * Eng 2083 / R52: settle window closed for this life — never finishDurableLeaveSettle
       * again (post-expire latch sink was the R52 prison).
       */
      __publicField(this, "durableLeaveSettleDone", false);
      /** Eng 2083 / R52: non-soft settle finish emits; ≥6 → force done. */
      __publicField(this, "durableLeaveSettleHits", 0);
      /** Eng 2084 / R53: non-soft finishDurableLeaveDone emits; ≥2 → release hierarchy. */
      __publicField(this, "durableLeaveDoneHits", 0);
      /** Eng 2084 / R53: after release, never re-enter finishDurableLeaveDone sink. */
      __publicField(this, "durableLeaveHierarchyReleased", false);
      /**
       * Eng 2088 / R57: post-RELEASE quiet emit hits. Cap → escape wander (5366ma/6d6r8k
       * same-tile post-RELEASE mine / sticky TOOLS theater forever → WD).
       */
      __publicField(this, "postHierarchyReleaseHits", 0);
      /** Eng 2088: last post-RELEASE mine tile key + consecutive hits on that tile. */
      __publicField(this, "postHierarchyReleaseMineKey", "");
      __publicField(this, "postHierarchyReleaseMineHits", 0);
      /**
       * Eng 2089 / R58: after post-RELEASE escape, ban re-entry to quiet sink while cool
       * (6pajs5/wbx74t/k7ehgt escape↔quiet forever — 2088 reset hits + expire cleared breaks).
       */
      __publicField(this, "postHierarchyReleaseEscapeUntil", 0);
      /** Eng 2089: escape fires this life; ≥2 → permanent quiet ban.
       *  Eng 2090 / R59: ≥1 bans quiet (single escape was still re-quiet theater). */
      __publicField(this, "postHierarchyReleaseEscapeCount", 0);
      /**
       * Eng 2090 / R59: food sell ↔ pond break prison latched this life.
       * Soft wander (2089) re-fueled sell/mine under pondBreak → WD (avsnmu/jmg85x).
       * Once set: escalate prison only; never soft sell/wander under break.
       */
      __publicField(this, "pondSellPrisonLatched", false);
      /**
       * Eng 3000 / t1800 cool|leave|release: after insta A↔B / ABCABC fire, one leave armed
       * this cool window — do not invent settle2; reuse wander/hub leave once.
       */
      __publicField(this, "instaOscLeaveArmed", false);
      /** Eng 3000: last insta-osc pair key (famA|famB) while cool live — forbid re-arm. */
      __publicField(this, "instaOscPairKey", "");
      /** Eng 3001 / R61: insta leave fires this cool window — ≥2 → release (not re-leave). */
      __publicField(this, "instaOscLeaveHits", 0);
      /** Eng 3001 / R61: pond-break-cap escalate emits this cool — ≥2 → release pondBreak. */
      __publicField(this, "pondBreakCapHits", 0);
      /**
       * Eng 3008 / R68: after post-release cool exhaust yield, never re-enter
       * coolHoldPostReleaseWalk theater this life (exhaust note was matching
       * /post-release cool/ → forever exhaust). Still cool|leave|release (t1800).
       */
      __publicField(this, "postReleaseCoolExhausted", false);
      /** Eng 3008: coolHoldPostReleaseWalk entries this life — ≥3 → exhaust even if notes gated. */
      __publicField(this, "postReleaseCoolWalkHits", 0);
      /**
       * Eng 3010 / t1806: one leave→RELEASE / hierarchy RELEASE / post-RELEASE escape
       * spent for the whole life (not a cool timer). While set: durable divert only —
       * ban coolHold* re-arm, leave→release re-fire, post-release walk theater.
       * Clears only on death/new life. Sets postReleaseCoolExhausted so 3008/3009 gates apply.
       */
      __publicField(this, "lifeEscapeSpent", false);
      /**
       * Eng 3011 / t1808 #1: early A↔B / ABCABC durable divert fires this life
       * before leave/cool theater. ≥1 → next insta may leave (escape stack second).
       */
      __publicField(this, "earlyOscDivertHits", 0);
      /**
       * Eng 3011 / t1808 #2: productive phase intent (TOOLS / FIRST_WEP / GEAR_FARM).
       * While set: ban wander / fund-sell / pond re-entry until goal done or bag/HP exit.
       */
      __publicField(this, "phaseIntentGoal", "");
      __publicField(this, "phaseIntentPhase", "");
      /**
       * Eng 3011 / t1808 #3: one productive quiet after RELEASE / life-spent issued.
       * Not a cool timer — after done, free brain (cool=0).
       */
      __publicField(this, "postReleaseQuietDone", false);
      /**
       * Eng 3011 / t1808 #4: WD / near-stuck first-class divert already issued this climb.
       * Clears on real progress so a later stuck climb can divert again.
       */
      __publicField(this, "wdFirstClassDiverted", false);
      /**
       * Eng 3012 / R72: postExhaustDurableDivert / life-spent divert fires this life.
       * ≥2 → no re-status flap; productive phase/explore only. Not a timer (t1800).
       */
      __publicField(this, "lifeSpentDivertHits", 0);
      /**
       * Eng 3016 / R76: trw-prison-clear fires this life. ≥2 → ban TRW prison re-enter
       * (clear↔phase-intent mine flap). Not a timer (t1800).
       */
      __publicField(this, "trwPrisonClearHits", 0);
      /** Eng 3016: after ≥2 clears (or wander↔prison ABA), ban tools-rock-wander prison re-entry. */
      __publicField(this, "trwReenterBan", false);
      /**
       * Eng 3016: consecutive phase-intent — mine hold ticks without productive mine.
       * ≥6 → clear intent + explore/hub (phase-intent-mine-cap).
       */
      __publicField(this, "phaseIntentMineMonoHits", 0);
      /**
       * Eng 3017 / R77: consecutive explore/gear-farm — after life escape emits.
       * ≥6 → after-life-escape-cap (hunt/hub). Not a timer (t1800).
       */
      __publicField(this, "afterLifeEscapeMonoHits", 0);
      /**
       * Eng 3018 / R78: after-life-escape-cap already fired this life.
       * Leave spent → durable divert only (yield free brain; no BAN/ALE/CAP theater).
       * Not a timer (t1800).
       */
      __publicField(this, "afterLifeEscapeCapped", false);
      /** Eng 2049 / R19: rethinks while sticky leave already active → escalate to progress. */
      __publicField(this, "stickyLeaveRethinks", 0);
      /**
       * Eng 2053 / R23: after TOOLS/sticky hard-leave, block re-arm of sticky progress explore
       * (byqjbw/jkpw4q/e79x46/7ab9rh/wrfxwf status-osc sticky→progress re-entry clash).
       */
      __publicField(this, "stickyExploreBlockUntil", 0);
      /**
       * Eng 2054 / R24: one-shot arm after sticky/TOOLS/wanderSpin hard leave — while
       * stickyExploreBlock live, skip leave theater / wanderSpin re-fire (v6rzkb/5wjycq
       * hard leave#25–45; k34wf2 TOOLS mono↔fund-sell; wp5ab8 FIRST_WEP hold).
       */
      __publicField(this, "stickyPhaseLeaveArmed", false);
      /** Eng 2053 / R23: mono divert explore fail streak → hard phase leave (uf5dvs). */
      __publicField(this, "monoDivertFails", 0);
      /** Eng 2050 / R20: cool after GEAR camp_chain round-trip tree/shop/rock osc WD. */
      __publicField(this, "campChainBreakUntil", 0);
      /**
       * Eng 2055 / R25: camp_chain sets round-trip AFTER util gather same tick, so
       * stuckRecentStatus only ever sees round-trip (util chop never enters ring) →
       * osc break never fires (zmqcsc/zrrv6w/qb647p WD). Count same node visits.
       */
      __publicField(this, "campChainSameKey", "");
      __publicField(this, "campChainSameHits", 0);
      /**
       * Eng 2062 / R31: kite cool mine same-tile hang (qnnhhd/wg7gn7/rsfa7s WD) —
       * 2061 banned bare explore then preferred mine forever on one rock.
       * Eng 2063 / R32: after same-tile≥3, ban mine for 768t (no remine while cool live).
       * Eng 2064 / R33: FIRST_WEP hold shares this hit/ban (hold mined outside fallback).
       * Eng 2065 / R34: also armed by camp-tree/camp-rock osc; gates FIRST_WEP camp_chain gather.
       */
      __publicField(this, "kiteCoolMineKey", "");
      __publicField(this, "kiteCoolMineHits", 0);
      __publicField(this, "kiteCoolMineBanUntil", 0);
      /**
       * Eng 2067 / R36: after kite cool wander theater break, ban re-emitting
       * `kite cool wander` while cool stickies still live (hub instead).
       */
      __publicField(this, "kiteCoolWanderBanUntil", 0);
      /**
       * Eng 2068 / R37: consecutive cool-park (hub emit / theater break) hits.
       * Re-entry while ban live → exit cool stickies (hub is not a destination).
       */
      __publicField(this, "kiteCoolParkHits", 0);
      /**
       * Eng 2069 / R38: post-exit grace so TOOLS sticky / phase cool / hub cannot
       * re-park cool (v2tcev/qmq6aa/sp7npv/zynf9j/7k53tg exit→sticky→phase→hub WD).
       */
      __publicField(this, "kiteCoolExitUntil", 0);
      /**
       * Eng 2070 / R39: post-exit reentry ban (~2560t, spans past grace). Blocks cool
       * sticky re-arm / phase cool leave / kite cool wander emit (cnd27s/efz65k/825n5f).
       * Eng 2071 / R40: also armed ON phase-cool leave (before first kite cool wander).
       */
      __publicField(this, "kiteCoolReentryBanUntil", 0);
      /**
       * Eng 2035 / R4 5wavp7: kit hatchet/pickaxe acquire sameTile hang — streak +
       * cool-block so we walk/explore instead of perpetual acquire claim.
       * Eng 2036 / R5: also tick-budget (moving ≠ progress) + kitPickRethinks break.
       */
      __publicField(this, "kitAcquireSameTile", 0);
      __publicField(this, "kitAcquireTile", "");
      __publicField(this, "kitAcquireBlockUntil", 0);
      /** Consecutive kit-acquire ticks without ownership (moving still counts). */
      __publicField(this, "kitAcquireTicks", 0);
      /** kit pickaxe stuck-rethink streak → arm cool + TOOLS. */
      __publicField(this, "kitPickRethinks", 0);
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
        this.pondBreakArms = 0;
        this.chopBreakUntil = 0;
        this.drySince = 0;
        this.ceilingRethinks = 0;
        this.foodFarmSoftBlocks = 0;
        this.hatchetRethinks = 0;
        this.bagFullFails = 0;
        this.bagFindShopUntil = 0;
        this.bagFindShopTile = "";
        this.sellTrimStickyUntil = 0;
        this.sellTrimEmptyUntil = 0;
        this.sellTrimNoSellStreak = 0;
        this.findPondMonoStreak = 0;
        this.rawSellSameTile = 0;
        this.rawSellTile = "";
        this.rawSellBlockUntil = 0;
        this.oreLiqSameTile = 0;
        this.oreLiqTile = "";
        this.rockFindRethinks = 0;
        this.rockFindBreakUntil = 0;
        this.exploreKiteBreakUntil = 0;
        this.emergToolsBreakUntil = 0;
        this.hatchetChestBreakUntil = 0;
        this.sellOreBreakUntil = 0;
        this.foodMineBreakUntil = 0;
        this.stuckWanderBreakUntil = 0;
        this.quietBootstrapBreakUntil = 0;
        this.quietBootstrapEmitHits = 0;
        this.quietBreakEmitHits = 0;
        this.quietBreakEscalateUntil = 0;
        this.quietBreakEscalateHits = 0;
        this.quietEscalateLeaveHits = 0;
        this.durableEscalateLeaveHits = 0;
        this.durableLeaveSettleUntil = 0;
        this.durableLeaveSettleEmitUntil = 0;
        this.durableLeaveSettleDone = false;
        this.durableLeaveSettleHits = 0;
        this.durableLeaveDoneHits = 0;
        this.durableLeaveHierarchyReleased = false;
        this.postHierarchyReleaseHits = 0;
        this.postHierarchyReleaseMineKey = "";
        this.postHierarchyReleaseMineHits = 0;
        this.postHierarchyReleaseEscapeUntil = 0;
        this.postHierarchyReleaseEscapeCount = 0;
        this.pondSellPrisonLatched = false;
        this.instaOscLeaveArmed = false;
        this.instaOscPairKey = "";
        this.instaOscLeaveHits = 0;
        this.pondBreakCapHits = 0;
        this.postReleaseCoolExhausted = false;
        this.postReleaseCoolWalkHits = 0;
        this.lifeEscapeSpent = false;
        this.earlyOscDivertHits = 0;
        this.phaseIntentGoal = "";
        this.phaseIntentPhase = "";
        this.postReleaseQuietDone = false;
        this.wdFirstClassDiverted = false;
        this.lifeSpentDivertHits = 0;
        this.trwPrisonClearHits = 0;
        this.trwReenterBan = false;
        this.phaseIntentMineMonoHits = 0;
        this.afterLifeEscapeMonoHits = 0;
        this.afterLifeEscapeCapped = false;
        this.stickyLeaveRethinks = 0;
        this.stickyExploreBlockUntil = 0;
        this.stickyPhaseLeaveArmed = false;
        this.monoDivertFails = 0;
        this.campChainBreakUntil = 0;
        this.campChainSameKey = "";
        this.campChainSameHits = 0;
        this.kiteCoolMineKey = "";
        this.kiteCoolMineHits = 0;
        this.kiteCoolMineBanUntil = 0;
        this.kiteCoolWanderBanUntil = 0;
        this.kiteCoolParkHits = 0;
        this.kiteCoolExitUntil = 0;
        this.kiteCoolReentryBanUntil = 0;
        this.kitAcquireSameTile = 0;
        this.kitAcquireTile = "";
        this.kitAcquireBlockUntil = 0;
        this.kitAcquireTicks = 0;
        this.kitPickRethinks = 0;
        this.fundIntent = null;
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
        this.doorCrossStickyUntil = 0;
        this.doorCrossDesire = null;
        this.doorOscStreak = 0;
        this.doorOnDoorLast = false;
        this.doorLastTile = "";
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
        this.nearFoePrevDist = 999;
        this.nearFoeClosing = false;
        this.stuckRecentStatus = [];
        this.markThrash = false;
        this.markClash = false;
        this.markStuck = false;
        if (prev < 0) {
          this.lifeThrash = false;
          this.lifeClash = false;
          this.lifeStuck = false;
        } else {
          if (this.lifeThrash) this.latchThrash();
          if (this.lifeClash) this.latchClash();
          if (this.lifeStuck) this.latchStuck();
        }
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
      var _a, _b;
      const h = this.h1001;
      h.topEvent = "none";
      h.utilityPick = "";
      this.maybeScan(host, w);
      if (this.drainAtTileLoot(host, w, stance)) return true;
      if (this.tryDoorCrossCommit(host, w, stance)) return true;
      if (this.trySwapMeleeFromBag(host, w, stance)) return true;
      if (!this.foodUrgency(w) && this.heroAtkRange(w) > 1) {
        const press = w.foes.filter((f) => f.alive && f.lit && f.dist <= this.heroAtkRange(w) + 1).sort((a, b) => a.dist - b.dist)[0];
        if (press && this.heroAtkRange(w) > this.foeAtkRange(press) && press.dist <= this.foeAtkRange(press)) {
          if (this.tryMaintainKiteBand(host, w, stance, press, "safe kite")) return true;
        }
      }
      if (this.evLethal(host, w, stance)) return true;
      if (this.sevenBChestEligible(w) && this.evScanChestSafe(host, w, stance)) return true;
      this.noteFoeApproach(w);
      if (this.evMobSudden(host, w, stance)) return true;
      if (this.evMobApproach(host, w, stance)) return true;
      if (this.evEmergFood(host, w, stance)) return true;
      if (this.evScanChestSafe(host, w, stance)) return true;
      if (this.evScanLootHv(host, w, stance)) return true;
      if (this.drainWantLootQueue(host, w, stance)) return true;
      if (this.evBagFull(host, w, stance)) return true;
      if (this.evRawNoCookFund(host, w, stance)) return true;
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
      if (this.kiteExploreCoolActive()) {
        if (this.durableLeaveSettleActive()) {
          return this.routeDurableLeaveSettleOrEscape(host, w, stance, "cool-active");
        }
        if (this.durableLeaveSettleClosed()) {
          return this.routeDurableLeaveClosed(host, w, stance, "cool-active");
        }
        if (this.quietEscalateLeaveLatchActive()) {
          return this.durableEscalateLeaveExit(host, w, stance, "cool-active");
        }
        if (this.kiteCoolExitQuietActive()) {
          return this.finishKiteCoolExitGrace(host, w, stance, "cool-active");
        }
        if (this.kiteCoolWanderBanActive()) {
          this.kiteCoolParkHits++;
          if (this.kiteCoolParkHits >= 4 || this.kiteCoolWanderTheater()) {
            return this.exitKiteCoolPark(host, w, stance, "ban-cool");
          }
          this.setStatus1001(host, w, stance, "kite cool hub");
          if (w.hub) host.walkTo(w.hub.x, w.hub.y);
          else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
          else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
          this.cool = 12;
          return true;
        }
        if (this.kiteCoolWanderTheater()) {
          return this.breakKiteCoolWanderHub(host, w, stance, "emit");
        }
        if (this.kiteCoolMineBanActive()) {
          this.kiteCoolMineKey = "";
          this.kiteCoolMineHits = 0;
          this.kiteCoolParkHits++;
          if (this.kiteCoolParkHits >= 4 || this.kiteCoolWanderTheater()) {
            return this.exitKiteCoolPark(host, w, stance, "mine-ban-park");
          }
          this.setStatus1001(host, w, stance, "kite cool hub");
          if (w.hub) host.walkTo(w.hub.x, w.hub.y);
          else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
          else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
          this.cool = 10;
          return true;
        }
        if (host.hasTool("pickaxe") && !host.hasTool("hatchet")) {
          const anvil = this.mem(w, "anvil");
          if (this.canFundToolNow("hatchet", w, anvil)) {
            if (this.tryKitAcquireWalk(host, w, stance, "hatchet", anvil)) {
              this.cool = 8;
              return true;
            }
            if (host.acquireTool("hatchet")) {
              this.setStatus1001(host, w, stance, "kite cool hatchet");
              this.cool = 6;
              return true;
            }
          }
          this.kiteCoolMineKey = "";
          this.kiteCoolMineHits = 0;
          if (this.kiteCoolWanderBanActive()) {
            this.kiteCoolParkHits++;
            if (this.kiteCoolParkHits >= 4 || this.kiteCoolWanderTheater()) {
              return this.exitKiteCoolPark(host, w, stance, "ban-no-hatchet");
            }
            this.setStatus1001(host, w, stance, "kite cool hub");
            if (w.hub) host.walkTo(w.hub.x, w.hub.y);
            else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
            else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
            this.cool = 12;
            return true;
          }
          if (this.kiteCoolWanderTheater()) {
            return this.breakKiteCoolWanderHub(host, w, stance, "no-hatchet");
          }
          if (this.phaseCoolNoKiteWander()) {
            return this.finishQuietHoldProgress(host, w, stance, "kite-cool-no-hatchet");
          }
          this.setStatus1001(host, w, stance, "kite cool wander");
          if (w.wander) host.walkTo(w.wander.x, w.wander.y);
          else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
          else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
          this.cool = 10;
          return true;
        }
        const rock = (_b = (_a = w.seen) == null ? void 0 : _a.rock) != null ? _b : this.mem(w, "rock");
        if (rock && host.hasTool("pickaxe") && !this.isGatherTileBlocked(rock.x, rock.y)) {
          const mk = `${rock.x},${rock.y}`;
          if (mk === this.kiteCoolMineKey) this.kiteCoolMineHits++;
          else {
            this.kiteCoolMineKey = mk;
            this.kiteCoolMineHits = 1;
          }
          if (this.kiteCoolMineHits >= 3) {
            this.blockGatherTile(rock.x, rock.y);
            this.kiteCoolMineBanUntil = this.runTicks + 768;
            this.kiteCoolMineKey = "";
            this.kiteCoolMineHits = 0;
            host.log("AUTO: kite cool mine same-tile \u2014 ban mine (2063)");
          } else {
            this.setStatus1001(host, w, stance, "kite cool mine");
            if (this.walkToTile(host, rock.x, rock.y)) {
              this.cool = 8;
              return true;
            }
            if (this.tryGather(host, w, stance, "kite cool mine")) {
              this.cool = 6;
              return true;
            }
            this.blockGatherTile(rock.x, rock.y);
            this.kiteCoolMineKey = "";
            this.kiteCoolMineHits = 0;
          }
        } else {
          this.kiteCoolMineKey = "";
          this.kiteCoolMineHits = 0;
        }
        if (this.kiteCoolWanderBanActive()) {
          this.kiteCoolParkHits++;
          if (this.kiteCoolParkHits >= 4 || this.kiteCoolWanderTheater()) {
            return this.exitKiteCoolPark(host, w, stance, "ban-cool");
          }
          this.setStatus1001(host, w, stance, "kite cool hub");
          if (w.hub) host.walkTo(w.hub.x, w.hub.y);
          else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
          else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
          this.cool = 12;
          return true;
        }
        if (this.kiteCoolWanderTheater()) {
          return this.breakKiteCoolWanderHub(host, w, stance, "fallback");
        }
        if (this.phaseCoolNoKiteWander()) {
          return this.finishQuietHoldProgress(host, w, stance, "kite-cool-fallback");
        }
        this.setStatus1001(host, w, stance, "kite cool wander");
        if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        this.cool = 10;
        return true;
      }
      if (this.kiteCoolExitQuietActive()) {
        if (this.durableLeaveSettleActive()) {
          return this.routeDurableLeaveSettleOrEscape(host, w, stance, "post-exit-quiet");
        }
        if (this.durableLeaveSettleClosed()) {
          return this.routeDurableLeaveClosed(host, w, stance, "post-exit-quiet");
        }
        if (this.quietEscalateLeaveLatchActive()) {
          return this.durableEscalateLeaveExit(host, w, stance, "post-exit-quiet");
        }
        return this.finishQuietHoldProgress(host, w, stance, "post-exit-quiet");
      }
      if (this.h1001.phase === "TOOLS" && this.beginnerToolsIncomplete(host)) {
        this.setStatus1001(
          host,
          w,
          stance,
          host.hasTool("pickaxe") && !this.rockFindBreakActive() ? "tools find rock" : host.hasTool("pickaxe") ? "tools explore" : "tools wait node"
        );
      } else {
        this.setStatus1001(host, w, stance, "explore");
      }
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
        if (this.oreLiquidateBeforeFish(w)) {
          this.dropEnroutePonds();
          return false;
        }
        if (this.pondBreakActive()) {
          this.scan.enrouteStops.shift();
          return false;
        }
        if (!host.hasTool("hatchet") && w.rawFish >= 3) {
          this.scan.enrouteStops.shift();
          return false;
        }
        if (w.bagFree <= 1) {
          this.scan.enrouteStops.shift();
          return false;
        }
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
      this.clearFundIntent();
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
      var _a, _b;
      if (w.food > 0 && w.hp < w.maxHp * 0.85) host.eat();
      if (w.food <= 0 && w.coins > 0) host.buyFoodIfCritical();
      if (this.tryCookBagCookables(host, w, stance, `${labelPrefix} cook`)) return true;
      if (this.hasBagCookables(w) && !this.canCookBagCookables(host, w)) {
        if (this.trySellUnusedOnce(host, w)) {
          this.setStatus1001(host, w, stance, `${labelPrefix} sell raw`);
          return true;
        }
        if (this.rawNoCookOverThresh(w, stance)) {
          this.setStatus1001(host, w, stance, `${labelPrefix} sell raw`);
          const shop = this.mem(w, "shop");
          if (shop) {
            this.desireXY = { x: shop.x, y: shop.y };
            host.walkTo(shop.x, shop.y);
            return true;
          }
          if (w.hub) {
            this.setStatus1001(host, w, stance, `${labelPrefix} find shop`);
            this.desireXY = { x: w.hub.x, y: w.hub.y };
            host.walkTo(w.hub.x, w.hub.y);
            return true;
          }
          if (labelPrefix === "food") return false;
          return true;
        }
      }
      const pond = this.resolvePond(w);
      const tree = this.mem(w, "tree");
      const hasRod = host.hasTool("rod");
      if (!hasRod) {
        const anvilFood = this.mem(w, "anvil");
        if (this.beginnerToolsIncomplete(host) && w.coins >= 30) {
          if (!host.hasTool("pickaxe") && this.canFundToolNow("pickaxe", w, anvilFood)) {
            if (host.acquireTool("pickaxe") && host.hasTool("pickaxe")) {
              this.setStatus1001(host, w, stance, "kit pickaxe");
              return true;
            }
          }
          if (!host.hasTool("hatchet") && this.canFundToolNow("hatchet", w, anvilFood)) {
            if (host.acquireTool("hatchet") && host.hasTool("hatchet")) {
              this.setStatus1001(host, w, stance, "kit hatchet");
              return true;
            }
          }
          this.clearFundIntent("food");
          this.h1001.phase = "TOOLS";
          return false;
        }
        if ((w.pondKnown || pond) && this.canFundRodNow(w)) {
          this.setStatus1001(host, w, stance, `${labelPrefix} rod`);
          if (host.acquireTool("rod")) return true;
          const shopRod = this.mem(w, "shop");
          if (shopRod) {
            this.desireXY = { x: shopRod.x, y: shopRod.y };
            host.walkTo(shopRod.x, shopRod.y);
            return true;
          }
          if (w.hub) {
            this.setStatus1001(host, w, stance, `${labelPrefix} find shop`);
            this.desireXY = { x: w.hub.x, y: w.hub.y };
            host.walkTo(w.hub.x, w.hub.y);
            return true;
          }
        }
        if (this.tryFundBeginnerToolFarm(host, w, stance, tree, pond)) return true;
        if (labelPrefix === "emerg" && w.hub && !this.emergToolsBreakActive() && this.foodUrgency(w) && (host.hasTool("hatchet") || host.hasTool("rod") || host.hasTool("pickaxe")) && (this.hasSellableMats(w) || this.hasBagCookables(w) || w.coins >= 30 || w.logCount > 0 || w.oreCount > 0)) {
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
      if (host.hasTool("rod") && !host.hasTool("pickaxe") && w.coins >= 30) {
        const anvilP = this.mem(w, "anvil");
        if (this.canFundToolNow("pickaxe", w, anvilP)) {
          if (this.tryKitAcquireWalk(host, w, stance, "pickaxe", anvilP)) return true;
        }
      }
      if (!host.hasTool("hatchet")) {
        const anvil = this.mem(w, "anvil");
        if (this.canFundToolNow("hatchet", w, anvil)) {
          if (this.tryKitAcquireWalk(host, w, stance, "hatchet", anvil)) return true;
        }
        if (this.hasBagCookables(w)) {
          if (this.trySellUnusedOnce(host, w)) {
            this.setStatus1001(host, w, stance, `${labelPrefix} sell raw`);
            return true;
          }
          const shop = this.mem(w, "shop");
          if (shop) {
            this.setStatus1001(host, w, stance, `${labelPrefix} sell raw`);
            this.desireXY = { x: shop.x, y: shop.y };
            host.walkTo(shop.x, shop.y);
            return true;
          }
          if (w.hub) {
            this.setStatus1001(host, w, stance, `${labelPrefix} find shop`);
            this.desireXY = { x: w.hub.x, y: w.hub.y };
            host.walkTo(w.hub.x, w.hub.y);
            return true;
          }
          this.setStatus1001(host, w, stance, `${labelPrefix} sell raw`);
          return true;
        }
      }
      if (this.pondBreakActive()) {
        this.dropEnroutePonds();
        if (this.lastFoodFarm) {
          this.noteGatherFail(this.lastFoodFarm.x, this.lastFoodFarm.y);
          this.lastFoodFarm = null;
        }
        if (this.pondSellPrisonLatched) {
          if (this.pondBreakCapHits >= 2 || this.instaOscLeaveHits >= 2 || this.oscCoolDivertActive()) {
            return this.coolHoldOscDivert(host, w, stance, `${labelPrefix}-sell-latch-hold`);
          }
          return this.escalatePondBreakPrison(host, w, stance, `${labelPrefix}-sell-latch`);
        }
        if (this.hasSellableMats(w) && host.sellMatsForCoins(1)) {
          this.setStatus1001(host, w, stance, `${labelPrefix} break liquidate`);
          return true;
        }
        if (this.trySellUnusedOnce(host, w)) {
          this.setStatus1001(host, w, stance, `${labelPrefix} break liquidate`);
          return true;
        }
        if (host.hasTool("pickaxe") && !this.foodMineBreakActive()) {
          const live = (_b = (_a = w.seen) == null ? void 0 : _a.rock) != null ? _b : this.mem(w, "rock");
          if (live && !this.isGatherTileBlocked(live.x, live.y)) {
            this.setStatus1001(host, w, stance, `${labelPrefix} mine break`);
            if (this.walkToTile(host, live.x, live.y)) return true;
            if (this.tryGather(host, w, stance, `${labelPrefix} mine break`)) return true;
            this.noteGatherFail(live.x, live.y);
            this.blockGatherTile(live.x, live.y);
            this.foodMineBreakUntil = Math.max(this.foodMineBreakUntil, this.runTicks + 192);
          }
        }
        if (this.shouldEscalatePondBreakPrison(6) || this.pondBreakArms >= 2) {
          return this.escalatePondBreakPrison(host, w, stance, `${labelPrefix}-wander-cap`);
        }
        this.armBreakerExploreCool(640);
        if (w.wander) {
          this.setStatus1001(host, w, stance, `${labelPrefix} pond break \u2014 wander`);
          host.walkTo(w.wander.x, w.wander.y);
          return true;
        }
        if (w.hub) {
          this.setStatus1001(host, w, stance, `${labelPrefix} pond break \u2014 wander`);
          host.walkTo(w.hub.x, w.hub.y);
          return true;
        }
        if (w.explore) {
          this.setStatus1001(host, w, stance, `${labelPrefix} pond break \u2014 wander`);
          this.desireXY = { x: w.explore.x, y: w.explore.y };
          host.walkTo(w.explore.x, w.explore.y);
          return true;
        }
        this.setStatus1001(host, w, stance, `${labelPrefix} pond break`);
        return true;
      }
      if (this.hasBagCookables(w) && (w.bagFree <= 1 || this.canCookBagCookables(host, w) && !this.cookOwed(w, stance))) {
        if (this.trySellUnusedOnce(host, w)) {
          this.setStatus1001(host, w, stance, `${labelPrefix} sell raw`);
          return true;
        }
        const shop = this.mem(w, "shop");
        if (shop) {
          this.setStatus1001(host, w, stance, `${labelPrefix} sell raw`);
          this.desireXY = { x: shop.x, y: shop.y };
          host.walkTo(shop.x, shop.y);
          return true;
        }
        if (labelPrefix === "food") return false;
        return true;
      }
      if (this.oreLiquidateBeforeFish(w)) {
        this.dropEnroutePonds();
        this.setStatus1001(host, w, stance, `${labelPrefix} sell ore`);
        const tileKey = `${w.tile.x},${w.tile.y}`;
        if (tileKey === this.oreLiqTile) this.oreLiqSameTile++;
        else {
          this.oreLiqTile = tileKey;
          this.oreLiqSameTile = 1;
        }
        if (this.trySellOreKeep(host, w, 0)) {
          const w2 = host.world();
          if (`${w2.tile.x},${w2.tile.y}` !== tileKey || w2.coins !== w.coins || w2.oreCount !== w.oreCount || w2.bagFree !== w.bagFree) {
            this.oreLiqSameTile = 0;
            return true;
          }
        }
        if (this.hasSellableMats(w) && host.sellMatsForCoins(1)) {
          this.setStatus1001(host, w, stance, `${labelPrefix} sell mats`);
          this.oreLiqSameTile = 0;
          return true;
        }
        if (this.trySellUnusedOnce(host, w)) {
          this.oreLiqSameTile = 0;
          return true;
        }
        const shopOre = this.mem(w, "shop");
        if (shopOre && cheb(w.tile.x, w.tile.y, shopOre.x, shopOre.y) > 1) {
          this.desireXY = { x: shopOre.x, y: shopOre.y };
          host.walkTo(shopOre.x, shopOre.y);
          return true;
        }
        if (w.hub && cheb(w.tile.x, w.tile.y, w.hub.x, w.hub.y) > 2) {
          this.setStatus1001(host, w, stance, `${labelPrefix} find shop`);
          this.desireXY = { x: w.hub.x, y: w.hub.y };
          host.walkTo(w.hub.x, w.hub.y);
          return true;
        }
        if (w.explore) {
          this.setStatus1001(host, w, stance, `${labelPrefix} find shop`);
          host.walkTo(w.explore.x, w.explore.y);
          return true;
        }
        if (w.wander) {
          this.setStatus1001(host, w, stance, `${labelPrefix} find shop`);
          host.walkTo(w.wander.x, w.wander.y);
          return true;
        }
        if (this.oreLiqSameTile >= 8) {
          this.oreLiqSameTile = 0;
          this.oreLiqTile = "";
          return false;
        }
        return true;
      }
      if (pond || w.gather && w.pondKnown) {
        const t = pond != null ? pond : w.gather;
        if (this.isGatherTileBlocked(t.x, t.y)) {
        } else {
          this.setStatus1001(host, w, stance, `${labelPrefix} fish`);
          this.lastFoodFarm = { depth: w.depth, x: t.x, y: t.y };
          this.desireXY = { x: t.x, y: t.y };
          if (this.walkToTile(host, t.x, t.y)) return true;
          if (this.tryGather(host, w, stance, `${labelPrefix} fish`)) return true;
          const attempt = host.gatherAt(t.x, t.y);
          if (attempt.ok || /^enroute$/i.test(attempt.reason || "")) return true;
          return true;
        }
      }
      if (this.lastFoodFarm && this.lastFoodFarm.depth === w.depth) {
        const lf = this.lastFoodFarm;
        if (this.isGatherTileBlocked(lf.x, lf.y) || this.pondBreakActive()) {
          this.lastFoodFarm = null;
        } else {
          this.setStatus1001(host, w, stance, `${labelPrefix} last farm`);
          this.desireXY = { x: lf.x, y: lf.y };
          host.walkTo(lf.x, lf.y);
          return true;
        }
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
      if (this.fundIntentBlocks("food")) return false;
      if (!this.claimFundIntent("food")) return false;
      if (this.h1001.phase !== "FOOD_BUFFER" && this.h1001.phase !== "BOOT" && this.h1001.phase !== "TOOLS") {
        this.h1001.phaseResume = (_a = this.h1001.phaseResume) != null ? _a : this.h1001.phase;
      }
      this.h1001.phase = "FOOD_BUFFER";
      this.h1001.topEvent = "none";
      const pond = this.resolvePond(w);
      if (host.hasTool("rod") && pond && !this.hasBagCookables(w) && !this.pondBreakActive() && !this.oreLiquidateBeforeFish(w) && (host.hasTool("hatchet") || w.rawFish < 3) && w.bagFree > 1) {
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
    /**
     * Eng 2027 / t1722: track nearest lit foe dist across ticks.
     * Closing (dist decreasing) arms early act — instinct before adj.
     */
    noteFoeApproach(w) {
      const near = w.foes.filter((f) => f.alive && f.lit).sort((a, b) => a.dist - b.dist)[0];
      if (!near) {
        this.nearFoePrevDist = 999;
        this.nearFoeClosing = false;
        return;
      }
      this.nearFoeClosing = this.nearFoePrevDist < 900 && near.dist < this.nearFoePrevDist && near.dist <= 4;
      this.nearFoePrevDist = near.dist;
    }
    /**
     * Eng 2027 / t1722: foe closing at dist 2–3 (not yet adj) → engage or kite early.
     * evMobSudden still owns dist≤1. Snapshot watch===3 chase remains elsewhere.
     */
    evMobApproach(host, w, stance) {
      if (!this.nearFoeClosing) return false;
      const foe = w.foes.filter((f) => f.alive && f.lit && f.dist >= 2 && f.dist <= 3).sort((a, b) => a.dist - b.dist)[0];
      if (!foe) return false;
      const pressing = foe.watch === 3 || foe.danger === "threat" || foe.danger === "deadly" || this.nearFoeClosing;
      if (!pressing) return false;
      this.h1001.topEvent = "mob_approach";
      const worn = w.hasMetalWeapon || w.hasStyleWeapon || w.hasArmour;
      const ok = this.outlookOk(host, w, foe, {
        allowThreat: worn,
        minWinRate: worn ? 0.4 : 0.5
      });
      if (!ok) {
        host.clearEngage();
        if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        this.setStatus1001(host, w, stance, host.fightOutlook ? "approach kite" : "approach kite");
        return true;
      }
      this.engageSmart(host, w, stance, foe, "approach");
      this.setStatus1001(host, w, stance, "approach engage");
      return true;
    }
    evBagFull(host, w, stance) {
      if (w.bagFree > 0) {
        this.bagFindShopUntil = 0;
        this.bagFindShopTile = "";
        return false;
      }
      this.h1001.topEvent = "bag_full";
      this.bagFullUntil = this.runTicks + 600;
      if (this.runTicks < this.bagFindShopUntil) {
        const tileKey = `${w.tile.x},${w.tile.y}`;
        if (tileKey !== this.bagFindShopTile) {
          this.bagFindShopTile = tileKey;
          this.bagFindShopUntil = this.runTicks + 48;
        }
        this.setStatus1001(host, w, stance, "bag find shop");
        const shopSticky = this.mem(w, "shop");
        if (shopSticky && cheb(w.tile.x, w.tile.y, shopSticky.x, shopSticky.y) > 1) {
          this.desireXY = { x: shopSticky.x, y: shopSticky.y };
          host.walkTo(shopSticky.x, shopSticky.y);
          return true;
        }
        if (w.hub && cheb(w.tile.x, w.tile.y, w.hub.x, w.hub.y) > 2) {
          this.desireXY = { x: w.hub.x, y: w.hub.y };
          host.walkTo(w.hub.x, w.hub.y);
          return true;
        }
        if (w.explore) {
          host.walkTo(w.explore.x, w.explore.y);
          return true;
        }
        if (w.wander) {
          host.walkTo(w.wander.x, w.wander.y);
          return true;
        }
        return false;
      }
      const healRich = stance.healRich;
      const surplusFood = healRich && w.food > Math.max(2, stance.minFood);
      const flooded = this.bagFloodedWeps(host, w);
      const canForge = !surplusFood && w.oreCount > 0 && (this.wantSmithKit(w) || !w.hasMetalWeapon || !w.hasArmour);
      const fishOnly = this.hasBagCookables(w) && w.oreCount <= 0 && !flooded;
      const task = surplusFood ? "bag free food" : fishOnly || flooded ? "bag sell trim" : canForge ? "bag forge\u2192trim" : "bag sell trim";
      this.setStatus1001(host, w, stance, task);
      if (!surplusFood && !fishOnly && host.forgeWieldedOnce()) return true;
      if (!surplusFood && !fishOnly && !flooded && this.wantSmithKit(w) && host.smithKitOnce()) return true;
      if (!surplusFood && !fishOnly && host.craftGemRingOnce()) return true;
      if (!surplusFood && !fishOnly && !flooded && host.craftWoodForValueOnce()) return true;
      if (!surplusFood && !fishOnly && !flooded && host.fletchStyleOnce()) return true;
      if (this.trySellUnusedOnce(host, w)) return true;
      if (this.trySellOreKeep(host, w, this.h1001.lockedMats ? 2 : 0)) return true;
      if (this.hasSellableMats(w) && host.sellMatsForCoins(1)) return true;
      if (surplusFood || healRich) {
        if (host.freeCookSlot()) return true;
      }
      this.bagFullFails++;
      if (this.bagFullFails >= 3) {
        this.bagFullUntil = 0;
        this.bagFullFails = 0;
        if ((surplusFood || healRich) && !fishOnly && host.freeCookSlot()) return true;
        if (!surplusFood) {
          this.bagFindShopUntil = this.runTicks + 96;
          this.bagFindShopTile = `${w.tile.x},${w.tile.y}`;
          this.setStatus1001(host, w, stance, "bag find shop");
          if (w.hub && cheb(w.tile.x, w.tile.y, w.hub.x, w.hub.y) > 2) {
            this.desireXY = { x: w.hub.x, y: w.hub.y };
            host.walkTo(w.hub.x, w.hub.y);
            return true;
          }
          if (w.explore) {
            host.walkTo(w.explore.x, w.explore.y);
            return true;
          }
          if (w.wander) {
            host.walkTo(w.wander.x, w.wander.y);
            return true;
          }
          return false;
        }
        return false;
      }
      const shop = this.mem(w, "shop");
      const sellCool = this.runTicks < this.sellUnusedBlockUntil && this.runTicks < this.sellOreKeepBlockUntil;
      if (shop && !sellCool && !surplusFood) {
        host.walkTo(shop.x, shop.y);
        return true;
      }
      if (!shop && !surplusFood) {
        this.bagFindShopUntil = this.runTicks + 96;
        this.bagFindShopTile = `${w.tile.x},${w.tile.y}`;
        this.setStatus1001(host, w, stance, "bag find shop");
        if (w.hub && cheb(w.tile.x, w.tile.y, w.hub.x, w.hub.y) > 2) {
          this.desireXY = { x: w.hub.x, y: w.hub.y };
          host.walkTo(w.hub.x, w.hub.y);
          return true;
        }
        if (w.explore) {
          host.walkTo(w.explore.x, w.explore.y);
          return true;
        }
        if (w.wander) {
          host.walkTo(w.wander.x, w.wander.y);
          return true;
        }
      }
      return false;
    }
    /**
     * Eng 2023: soft-block threshold for raw with no cook path (~8–12 / mealBatch).
     * Below this, keep fishing a little; at/above → force sell/yield even if bagFree>0.
     */
    rawNoCookSellN(w, stance) {
      const batch = this.mealBatch(w, stance);
      return Math.max(8, Math.min(12, Math.max(batch, 8)));
    }
    rawNoCookOverThresh(w, stance) {
      return w.rawFish >= this.rawNoCookSellN(w, stance);
    }
    needsRawNoCookSell(host, w, stance) {
      if (!this.hasBagCookables(w)) return false;
      if (this.canCookBagCookables(host, w)) return false;
      return this.rawNoCookOverThresh(w, stance);
    }
    /** Eng 2023: claim fund-intent; false if opposite kind still holds. */
    claimFundIntent(kind, hold = 12) {
      if (this.fundIntent && this.runTicks < this.fundIntent.until && this.fundIntent.kind !== kind) {
        return false;
      }
      this.fundIntent = { kind, until: this.runTicks + hold };
      return true;
    }
    fundIntentBlocks(kind) {
      return !!(this.fundIntent && this.runTicks < this.fundIntent.until && this.fundIntent.kind !== kind);
    }
    clearFundIntent(kind) {
      if (!this.fundIntent) return;
      if (!kind || this.fundIntent.kind === kind) this.fundIntent = null;
    }
    /**
     * Eng 2023 (t1703): raw≥N + !canCook + bag still has free slots → sell/yield
     * before calm fish / TOOLS fish stalls into a mountain of unsellable-by-path raw.
     * Eng 2034 / 752huv: sameTile streak + find-shop escalate; cool-block ~40t —
     * never perpetual sameTile return true.
     */
    evRawNoCookFund(host, w, stance) {
      if (w.bagFree <= 0) return false;
      if (this.runTicks < this.rawSellBlockUntil) return false;
      if (!this.needsRawNoCookSell(host, w, stance)) return false;
      this.h1001.topEvent = "bag_full";
      this.setStatus1001(host, w, stance, "raw sell fund");
      this.claimFundIntent("food", 16);
      const tileKey = `${w.tile.x},${w.tile.y}`;
      if (tileKey === this.rawSellTile) this.rawSellSameTile++;
      else {
        this.rawSellTile = tileKey;
        this.rawSellSameTile = 1;
      }
      if (this.trySellUnusedOnce(host, w)) {
        this.rawSellSameTile = 0;
        return true;
      }
      if (this.hasSellableMats(w) && host.sellMatsForCoins(1)) {
        this.rawSellSameTile = 0;
        return true;
      }
      const shop = this.mem(w, "shop");
      if (shop && cheb(w.tile.x, w.tile.y, shop.x, shop.y) > 1) {
        this.desireXY = { x: shop.x, y: shop.y };
        host.walkTo(shop.x, shop.y);
        return true;
      }
      const escalate = !shop || this.rawSellSameTile >= 14;
      if (escalate) {
        if (w.bagFree <= 2) this.armSellTrimSticky(host, w);
        if (this.rawSellSameTile >= 40) {
          this.rawSellBlockUntil = this.runTicks + 48;
          this.rawSellSameTile = 0;
          this.rawSellTile = "";
          return false;
        }
        if (w.hub && cheb(w.tile.x, w.tile.y, w.hub.x, w.hub.y) > 2) {
          this.setStatus1001(host, w, stance, "raw sell find shop");
          this.desireXY = { x: w.hub.x, y: w.hub.y };
          host.walkTo(w.hub.x, w.hub.y);
          return true;
        }
        if (w.explore) {
          this.setStatus1001(host, w, stance, "raw sell find shop");
          this.desireXY = { x: w.explore.x, y: w.explore.y };
          host.walkTo(w.explore.x, w.explore.y);
          return true;
        }
        if (w.wander) {
          this.setStatus1001(host, w, stance, "raw sell find shop");
          host.walkTo(w.wander.x, w.wander.y);
          return true;
        }
        return false;
      }
      return false;
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
    /**
     * t1708 s5djrb: shop round-trip / util only when a sell can actually fund.
     * Mirrors trySellUnusedOnce gates so calm does not claim shop with a no-op.
     */
    shopVisitWorth(host, w) {
      if (this.runTicks < this.sellUnusedBlockUntil) {
        return w.oreCount > 2;
      }
      if (this.hasBagCookables(w) && this.canCookBagCookables(host, w)) return false;
      const pond = this.resolvePond(w);
      const farmOk = !!pond || w.pondKnown || !!this.lastFoodFarm && this.lastFoodFarm.depth === w.depth;
      if (this.foodPathEmpty(w) && host.hasTool("rod") && farmOk && !this.oreLiquidateBeforeFish(w)) {
        return false;
      }
      if (this.foodPathEmpty(w) && host.hasTool("rod") && !this.hasSellableMats(w) && !this.hasBagCookables(w) && !this.oreLiquidateBeforeFish(w)) {
        return false;
      }
      return this.hasSellableMats(w) || this.hasBagCookables(w) || w.logCount > 1 || w.oreCount > 2;
    }
    evAltar(host, w, stance) {
      const altar = this.mem(w, "altar");
      if (!altar) return false;
      if (this.foodMineBreakActive()) return false;
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
    /** Plain pick/hatchet shop is BEGINNER_TOOL_PRICE 30c; bronze forge needs 2 ore (HATCHET/PICK_SMITH). */
    canFundPlainToolNow(tool, w, anvil) {
      if (w.coins >= 30) return true;
      return !!(anvil || w.anvilNearby) && w.oreCount >= 2;
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
     * Eng 2021 (t1671): cook / light / chop-fuel / fund-hatchet when bag has cookables.
     * Shared by maintain layer, food-seek, FOOD_BUFFER, fund farm — one rule.
     * No forever-claim without a fuel path: if no fire/logs and cannot chop or fund
     * hatchet, return false so fish/explore/fund farm can run.
     */
    tryCookBagCookables(host, w, stance, statusLabel) {
      var _a, _b, _c;
      if (!this.hasBagCookables(w)) return false;
      if (!this.cookOwed(w, stance)) return false;
      if (!w.hasFire && w.hasLogs) {
        host.lightFireOnce();
      } else if (!w.hasFire && !w.hasLogs) {
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
          return false;
        }
        if (!host.hasTool("hatchet")) {
          const anvil = this.mem(w, "anvil");
          if (this.canFundToolNow("hatchet", w, anvil) && host.acquireTool("hatchet")) {
            this.setStatus1001(host, w, stance, statusLabel);
            return true;
          }
          return false;
        }
        return false;
      }
      if (w.bagFree <= 0) host.freeCookSlot();
      host.cookOnce();
      this.setStatus1001(host, w, stance, statusLabel);
      return true;
    }
    /**
     * Eng 2022: true when bag cookables still have a live fuel/cook path (no side effects).
     * Mirrors tryCookBagCookables gates — if false, raw is sellable fund (t1683/t1695).
     */
    canCookBagCookables(host, w) {
      var _a, _b, _c;
      if (!this.hasBagCookables(w)) return false;
      if (w.hasFire || w.hasLogs) return true;
      const tree = (_c = (_b = this.mem(w, "tree")) != null ? _b : (_a = w.seen) == null ? void 0 : _a.tree) != null ? _c : null;
      if (tree && host.hasTool("hatchet") && !this.isGatherTileBlocked(tree.x, tree.y)) return true;
      return false;
    }
    /**
     * Eng 2017 (t1652 ujvnep): gate host.sellUnusedOnce.
     * Host walks shop when hasPlain (e.g. bag Sword) even with 0 mats — door thrash if
     * path stalls; returns true every walk tick with no sell. Stall after no progress;
     * skip entirely when empty-food + rod + known pond/farm (fish first).
     * Eng 2022: cookables block sell ONLY while cook path is live; else sell raw for fund.
     */
    trySellUnusedOnce(host, w) {
      if (this.runTicks < this.sellUnusedBlockUntil) return false;
      const pond = this.resolvePond(w);
      const farmOk = !!pond || w.pondKnown || !!this.lastFoodFarm && this.lastFoodFarm.depth === w.depth;
      const stanceSell = foodStance(w.healReserve, w.floorHealNeed, this.traits, w.food);
      if (this.hasBagCookables(w) && this.canCookBagCookables(host, w) && this.cookOwed(w, stanceSell)) return false;
      if (this.foodPathEmpty(w) && host.hasTool("rod") && farmOk && !this.oreLiquidateBeforeFish(w)) return false;
      if (this.foodPathEmpty(w) && host.hasTool("rod") && !this.hasSellableMats(w) && !this.hasBagCookables(w) && !this.oreLiquidateBeforeFish(w)) return false;
      if (this.beginnerToolsIncomplete(host) && !this.hasSellableMats(w) && !this.hasBagCookables(w) && w.logCount <= 0 && !w.hasLogs) return false;
      const before = `${w.coins}|${w.bagFree}|${w.logCount}|${w.oreCount}|${w.food}|${w.progressFp || ""}`;
      const acted = host.sellUnusedOnce();
      if (!acted) {
        this.sellUnusedFailStreak = 0;
        this.sellUnusedProgKey = before;
        return false;
      }
      const afterW = host.world();
      const after = `${afterW.coins}|${afterW.bagFree}|${afterW.logCount}|${afterW.oreCount}|${afterW.food}|${afterW.progressFp || ""}`;
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
      if (this.sellUnusedFailStreak >= 3) {
        this.sellUnusedBlockUntil = this.runTicks + 48;
        this.sellUnusedFailStreak = 0;
        return false;
      }
      return true;
    }
    /**
     * Eng 2028 / t1732: gate host.sellOreKeep like trySellUnusedOnce.
     * Walk-to-shop returned true every tick with flat coins/bag/ore → infinite
     * "walk to shop to free bag" while sellUnused was cool-blocked (w5te7f).
     */
    trySellOreKeep(host, w, keep) {
      if (this.runTicks < this.sellOreKeepBlockUntil) return false;
      const tileBefore = `${w.tile.x},${w.tile.y}`;
      const before = `${w.coins}|${w.bagFree}|${w.logCount}|${w.oreCount}|${w.food}|${w.progressFp || ""}`;
      const acted = host.sellOreKeep(keep);
      if (!acted) {
        this.sellOreKeepFailStreak = 0;
        this.sellOreKeepProgKey = before;
        return false;
      }
      const afterW = host.world();
      const after = `${afterW.coins}|${afterW.bagFree}|${afterW.logCount}|${afterW.oreCount}|${afterW.food}|${afterW.progressFp || ""}`;
      const tileAfter = `${afterW.tile.x},${afterW.tile.y}`;
      if (after !== before || tileAfter !== tileBefore) {
        this.sellOreKeepFailStreak = 0;
        this.sellOreKeepProgKey = after;
        return true;
      }
      if (before === this.sellOreKeepProgKey) this.sellOreKeepFailStreak++;
      else {
        this.sellOreKeepProgKey = before;
        this.sellOreKeepFailStreak = 1;
      }
      if (this.sellOreKeepFailStreak >= 2) {
        this.sellOreKeepBlockUntil = this.runTicks + 48;
        this.sellOreKeepFailStreak = 0;
        return false;
      }
      return false;
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
      this.refreshPhaseIntent(host, w, stance);
      if (this.phaseIntentLocked()) {
        if (this.tryPhaseIntentHold(host, w, stance)) return true;
        return false;
      }
      if (this.tryCookBagCookables(host, w, stance, "tools fund cook")) return true;
      if (this.needsRawNoCookSell(host, w, stance)) {
        if (this.trySellUnusedOnce(host, w)) {
          this.setStatus1001(host, w, stance, "tools fund sell raw");
          return true;
        }
        const shop = this.mem(w, "shop");
        if (shop) {
          this.setStatus1001(host, w, stance, "tools fund sell raw");
          this.desireXY = { x: shop.x, y: shop.y };
          host.walkTo(shop.x, shop.y);
          return true;
        }
      }
      const pondTile = pond != null ? pond : this.resolvePond(w);
      if (!this.pondBreakActive() && !this.needsRawNoCookSell(host, w, stance) && pondTile && host.hasTool("rod") && !this.isGatherTileBlocked(pondTile.x, pondTile.y)) {
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
        if (this.oreLiquidateBeforeFish(w) || this.hasSellableMats(w) || this.hasBagCookables(w)) {
          if (this.trySellUnusedOnce(host, w)) {
            this.setStatus1001(host, w, stance, "tools fund sell");
            return true;
          }
          const needChop = Math.max(1, 30 - w.coins);
          if (w.coins < 30 && this.hasSellableMats(w) && host.sellMatsForCoins(needChop)) {
            this.setStatus1001(host, w, stance, "tools fund sell mats");
            return true;
          }
          const shopF = this.mem(w, "shop");
          if (shopF && cheb(w.tile.x, w.tile.y, shopF.x, shopF.y) > 1) {
            this.setStatus1001(host, w, stance, "tools find shop");
            this.desireXY = { x: shopF.x, y: shopF.y };
            host.walkTo(shopF.x, shopF.y);
            return true;
          }
          if (w.hub && cheb(w.tile.x, w.tile.y, w.hub.x, w.hub.y) > 2) {
            this.setStatus1001(host, w, stance, "tools find shop");
            this.desireXY = { x: w.hub.x, y: w.hub.y };
            host.walkTo(w.hub.x, w.hub.y);
            return true;
          }
          if (w.explore) {
            this.setStatus1001(host, w, stance, "tools find shop");
            host.walkTo(w.explore.x, w.explore.y);
            return true;
          }
        }
      }
      const need = Math.max(1, 30 - w.coins);
      if (w.coins < 30 && this.hasSellableMats(w) && host.sellMatsForCoins(need)) {
        this.setStatus1001(host, w, stance, "tools fund sell mats");
        return true;
      }
      if (this.trySellUnusedOnce(host, w)) {
        this.setStatus1001(host, w, stance, "tools fund sell");
        return true;
      }
      return false;
    }
    /** True when owned farm tools + registered/visible nodes (or bag mats) can raise 30c. */
    canFarmFundBeginnerTool(host, w, tree, pond) {
      var _a;
      if (this.hasBagCookables(w) || w.logCount > 0) return true;
      if (pond && host.hasTool("rod") && !this.isGatherTileBlocked(pond.x, pond.y)) return true;
      if (tree && host.hasTool("hatchet") && !this.isGatherTileBlocked(tree.x, tree.y)) return true;
      if (host.hasTool("rod") && w.pondKnown) return true;
      if (host.hasTool("pickaxe") && (((_a = w.seen) == null ? void 0 : _a.rock) || this.mem(w, "rock") || w.oreCount > 0)) return true;
      return false;
    }
    phaseTools1001(host, w, stance) {
      var _a, _b, _c, _d, _e, _f;
      this.refreshPhaseIntent(host, w, stance);
      if (this.phaseIntentLocked() && this.tryPhaseIntentHold(host, w, stance)) return true;
      if (this.trwReenterBanned()) {
        if (this.durableTrwBanWalk(host, w, stance, "trw-reenter-ban")) return true;
        this.clearFundIntent("tool");
        if (host.hasTool("pickaxe")) {
          this.h1001.phase = w.hasMetalWeapon || w.hasStyleWeapon ? "GEAR_FARM" : "FIRST_WEP";
        }
        return false;
      }
      if (!this.beginnerToolsIncomplete(host)) {
        this.clearFundIntent("tool");
        this.clearPhaseIntent();
        this.h1001.phase = !w.hasMetalWeapon && !w.hasStyleWeapon ? "FIRST_WEP" : "GEAR_FARM";
        return false;
      }
      if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
        this.clearFundIntent("tool");
        this.kitAcquireBlockUntil = Math.max(this.kitAcquireBlockUntil, this.runTicks + 64);
        this.h1001.phase = "GEAR_FARM";
        return false;
      }
      if (host.hasTool("pickaxe") && (this.hatchetChestBreakActive() || this.stuckWanderBreakActive() || this.exploreKiteBreakActive() || this.emergToolsBreakActive())) {
        this.clearFundIntent("tool");
        this.kitAcquireBlockUntil = Math.max(this.kitAcquireBlockUntil, this.runTicks + 192);
        const stickyExploreHits = this.statusFamilyHits(/sticky progress — explore|sticky progress explore/);
        const stickyLethalPair = this.statusOscPair(
          /sticky progress — explore|sticky progress explore|TOOLS sticky/,
          /lethal kite|lethal close|stuck watchdog/
        );
        const stickyWatchdog = this.statusFamilyHits(/stuck watchdog/) >= 1 && stickyExploreHits >= 1;
        if (stickyExploreHits >= 3 || stickyLethalPair || stickyWatchdog || stickyExploreHits >= 2 && this.exploreKiteBreakActive() || this.stickyExploreBlockActive() || this.stickyLeaveRethinks >= 3 || this.stickyPhaseLeaveArmed) {
          if (w.hasMetalWeapon || w.hasStyleWeapon) this.h1001.phase = "GEAR_FARM";
          else this.h1001.phase = "FIRST_WEP";
          if (this.kiteCoolExitQuietActive()) {
            this.stickyPhaseLeaveArmed = true;
            this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
            host.log("AUTO: TOOLS sticky explore mono \u2014 quiet yield cool-exit ban (2070)");
            this.cool = 8;
            return false;
          }
          if (this.durableLeaveHierarchyReleased) {
            this.stickyPhaseLeaveArmed = true;
            this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
            if (this.postHierarchyReleaseEscapeActive() || this.postHierarchyReleaseEscapeCount >= 1) {
              host.log("AUTO: TOOLS sticky explore mono \u2014 post RELEASE escape cool yield (2090)");
              this.cool = 8;
              return false;
            }
            host.log("AUTO: TOOLS sticky explore mono \u2014 post RELEASE escape path (2089)");
            return this.finishPostHierarchyReleaseQuiet(host, w, stance, "sticky TOOLS sticky explore mono");
          }
          this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 896);
          this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 768);
          this.emergToolsBreakUntil = Math.max(this.emergToolsBreakUntil, this.runTicks + 640);
          this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 1024);
          const wasArmed = this.stickyPhaseLeaveArmed || this.stickyLeaveRethinks >= 1;
          this.stickyPhaseLeaveArmed = true;
          this.stuckRecentStatus = this.stuckRecentStatus.filter(
            (s) => !/sticky progress|sticky leave|wanderSpin|lethal|stuck watchdog|TOOLS sticky|explore-kite|phase cool/i.test(s)
          );
          if (this.oscCoolDivertActive()) {
            return this.coolHoldOscDivert(host, w, stance, "tools-sticky-explore");
          }
          if (wasArmed) {
            host.log("AUTO: TOOLS sticky explore mono \u2014 quiet yield (2054)");
            this.cool = 8;
            return false;
          }
          this.noteAction("TOOLS sticky explore mono \u2014 phase leave");
          host.log("AUTO: TOOLS sticky explore mono \u2014 phase leave (2071)");
          if (w.wander) host.walkTo(w.wander.x, w.wander.y);
          else if (w.explore) {
            this.desireXY = { x: w.explore.x, y: w.explore.y };
            host.walkTo(w.explore.x, w.explore.y);
          } else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
          this.armPhaseCoolNoKiteEmit();
          this.setStatus(host, w, stance, "phase cool");
          this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 1);
          this.cool = 16;
          return true;
        }
        if (this.exploreKiteBreakActive() || this.emergToolsBreakActive() || this.stickyExploreBlockActive()) {
          if (w.hasMetalWeapon || w.hasStyleWeapon) this.h1001.phase = "GEAR_FARM";
          else this.h1001.phase = "FIRST_WEP";
          if (this.kiteCoolExitQuietActive()) {
            this.stickyPhaseLeaveArmed = true;
            this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
            host.log("AUTO: TOOLS sticky \u2014 quiet hold phase yield cool-exit ban (2070)");
            this.cool = 8;
            return false;
          }
          if (this.durableLeaveHierarchyReleased) {
            this.stickyPhaseLeaveArmed = true;
            this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
            if (this.postHierarchyReleaseEscapeActive() || this.postHierarchyReleaseEscapeCount >= 1) {
              host.log("AUTO: TOOLS sticky \u2014 post RELEASE escape cool yield (2090)");
              this.cool = 8;
              return false;
            }
            host.log("AUTO: TOOLS sticky \u2014 post RELEASE escape path (2089)");
            return this.finishPostHierarchyReleaseQuiet(host, w, stance, "sticky TOOLS sticky");
          }
          this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 768);
          const holdWasArmed = this.stickyPhaseLeaveArmed || this.stickyLeaveRethinks >= 1;
          this.stickyPhaseLeaveArmed = true;
          if (this.oscCoolDivertActive()) {
            return this.coolHoldOscDivert(host, w, stance, "tools-sticky-hold");
          }
          if (holdWasArmed) {
            host.log("AUTO: TOOLS sticky \u2014 quiet hold phase yield (2054)");
            this.cool = 8;
            return false;
          }
          this.noteAction("TOOLS sticky \u2014 break hold phase");
          host.log("AUTO: TOOLS sticky \u2014 exploreKite/emerg hold phase leave (2071)");
          if (w.wander) host.walkTo(w.wander.x, w.wander.y);
          else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
          else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
          this.armPhaseCoolNoKiteEmit();
          this.setStatus(host, w, stance, "phase cool");
          this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 1);
          this.cool = 12;
          return true;
        }
        return this.tryStickyProgressLeave(host, w, stance, "TOOLS sticky");
      }
      if (((_a = this.fundIntent) == null ? void 0 : _a.kind) === "food") this.clearFundIntent("food");
      if (!this.claimFundIntent("tool")) {
        if (host.hasTool("pickaxe") && this.tryToolsFindRockOrBreak(host, w, stance)) return true;
        this.setStatus1001(
          host,
          w,
          stance,
          host.hasTool("pickaxe") ? "tools explore" : "tools wait node"
        );
        if (w.explore) {
          host.walkTo(w.explore.x, w.explore.y);
          return true;
        }
        if (w.wander) {
          host.walkTo(w.wander.x, w.wander.y);
          return true;
        }
        if (w.hub) {
          this.desireXY = { x: w.hub.x, y: w.hub.y };
          host.walkTo(w.hub.x, w.hub.y);
          return true;
        }
        return true;
      }
      const rock = this.mem(w, "rock");
      const tree = this.mem(w, "tree");
      const pond = this.mem(w, "pond");
      const anvil = this.mem(w, "anvil");
      const tool = bootstrapTool(host, w, this.h1001.nodes);
      const shop = this.mem(w, "shop");
      if (this.beginnerToolsIncomplete(host) && (shop || anvil || w.anvilNearby) && tool && !host.hasTool(tool) && this.canFundToolNow(tool, w, anvil) && !(tool === "hatchet" && this.hatchetChestBreakActive())) {
        if (host.hasTool("pickaxe") && tool !== "pickaxe") {
          if (this.tryKitAcquireWalk(host, w, stance, tool, anvil)) return true;
        } else {
          this.setStatus1001(host, w, stance, `tools ${tool}`);
          if (host.acquireTool(tool)) return true;
        }
      }
      if (this.beginnerToolsIncomplete(host) && w.coins >= 30 && !shop && !(anvil && w.oreCount >= 2) && !(w.anvilNearby && w.oreCount >= 2)) {
        this.setStatus1001(host, w, stance, "tools find shop");
        if (host.acquireTool(tool || "pickaxe")) return true;
        if (w.hub) {
          this.desireXY = { x: w.hub.x, y: w.hub.y };
          host.walkTo(w.hub.x, w.hub.y);
          return true;
        }
        if (w.explore) {
          host.walkTo(w.explore.x, w.explore.y);
          return true;
        }
      }
      if (tool === null && !rock && !tree && !pond && !w.anvilNearby && !anvil && !shop) {
        this.setStatus1001(host, w, stance, "tools wait node");
        if (w.explore) {
          host.walkTo(w.explore.x, w.explore.y);
          return true;
        }
        if (w.wander) {
          host.walkTo(w.wander.x, w.wander.y);
          return true;
        }
        return true;
      }
      const fundingTool = !!tool && !host.hasTool(tool) && !this.canFundToolNow(tool, w, anvil);
      if (tool) {
        const tryAcquire = host.hasTool(tool) || this.canFundToolNow(tool, w, anvil);
        if (tryAcquire) {
          if (host.hasTool("pickaxe") && tool !== "pickaxe" && !host.hasTool(tool)) {
            if (this.tryKitAcquireWalk(host, w, stance, tool, anvil)) return true;
          }
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
          if (w.coins >= 30) {
            if (shop) {
              this.desireXY = { x: shop.x, y: shop.y };
              host.walkTo(shop.x, shop.y);
              return true;
            }
            if (host.acquireTool(tool)) return true;
            if (w.hub) {
              this.setStatus1001(host, w, stance, "tools find shop");
              this.desireXY = { x: w.hub.x, y: w.hub.y };
              host.walkTo(w.hub.x, w.hub.y);
              return true;
            }
            return true;
          }
          if (tool !== "rod" && w.oreCount >= 2 && (anvil || w.anvilNearby)) {
            const a = anvil || ((_b = w.seen) == null ? void 0 : _b.anvil) || null;
            if (a) {
              this.desireXY = { x: a.x, y: a.y };
              host.walkTo(a.x, a.y);
              return true;
            }
            return true;
          }
        } else {
          if (this.tryFundBeginnerToolFarm(host, w, stance, tree, pond)) return true;
        }
      }
      const liveRock = (_d = (_c = w.seen) == null ? void 0 : _c.rock) != null ? _d : null;
      if (liveRock && host.hasTool("pickaxe") && !this.rockFindBreakActive() && !this.isGatherTileBlocked(liveRock.x, liveRock.y)) {
        if (this.trwReenterBanned()) {
          return this.durableTrwBanWalk(host, w, stance, "trw-reenter-ban");
        }
        if (this.oscCoolDivertActive() && this.statusFamilyHits(/tools mine|tools find rock/) >= 3) {
          return this.coolHoldOscDivert(host, w, stance, "tools-mine-cool-hold");
        }
        this.setStatus1001(host, w, stance, "tools mine");
        this.armPhaseIntent(this.h1001.phase === "FIRST_WEP" || this.h1001.phase === "GEAR_FARM" ? this.h1001.phase : "TOOLS", "mine");
        if (this.walkToTile(host, liveRock.x, liveRock.y)) return true;
        if (this.tryGather(host, w, stance, "tools mine")) return true;
        this.blockGatherTile(liveRock.x, liveRock.y);
      }
      if (!fundingTool && !this.pondBreakActive() && this.cookOwed(w, stance) && !this.needsRawNoCookSell(host, w, stance) && pond && host.hasTool("rod") && !this.isGatherTileBlocked(pond.x, pond.y)) {
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
        if (host.hasTool("rod") && !this.pondBreakActive() && this.cookOwed(w, stance) && !this.needsRawNoCookSell(host, w, stance)) {
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
      if (fundingTool && canFarmFund && tool !== "pickaxe") {
        if (this.tryFundBeginnerToolFarm(host, w, stance, tree, pond)) return true;
      }
      if (host.hasTool("pickaxe") && !liveRock && !(fundingTool && tool !== "pickaxe" && canFarmFund)) {
        if (this.tryToolsFindRockOrBreak(host, w, stance)) return true;
      }
      if (!rock && !host.hasTool("pickaxe") && !canFarmFund) {
        if (this.tryToolsFindRockOrBreak(host, w, stance)) return true;
      }
      if (!tool) {
        if ((host.hasTool("pickaxe") || host.hasTool("hatchet") || host.hasTool("rod")) && w.explore) {
          this.setStatus1001(host, w, stance, "tools explore");
          host.walkTo(w.explore.x, w.explore.y);
          return true;
        }
        if (!w.hasMetalWeapon && !w.hasStyleWeapon) {
          this.clearFundIntent("tool");
          this.h1001.phase = "FIRST_WEP";
          return false;
        }
        this.clearFundIntent("tool");
        this.h1001.phase = "GEAR_FARM";
        return false;
      }
      if (fundingTool && canFarmFund && !(tool === "hatchet" && this.hatchetChestBreakActive())) {
        if (this.tryFundBeginnerToolFarm(host, w, stance, tree, pond)) return true;
        const live = (_f = (_e = w.seen) == null ? void 0 : _e.rock) != null ? _f : null;
        if (live && host.hasTool("pickaxe") && !this.rockFindBreakActive() && !this.isGatherTileBlocked(live.x, live.y)) {
          this.setStatus1001(host, w, stance, "tools mine");
          this.armPhaseIntent(this.h1001.phase === "FIRST_WEP" || this.h1001.phase === "GEAR_FARM" ? this.h1001.phase : "TOOLS", "mine");
          if (this.walkToTile(host, live.x, live.y)) return true;
          if (this.tryGather(host, w, stance, "tools mine")) return true;
        }
        if (host.hasTool("pickaxe")) {
          if (this.tryToolsFindRockOrBreak(host, w, stance)) return true;
        }
        if (this.emergToolsBreakActive() || this.exploreKiteBreakActive() || this.stuckWanderBreakActive()) {
          return this.tryStickyProgressLeave(host, w, stance, "fund hold sticky");
        }
        if (this.isLifeEscapeSpent() && this.lifeSpentDivertHits >= 2 && this.rockFindBreakActive()) {
          return this.tryStickyProgressLeave(host, w, stance, "fund hold life-spent");
        }
        this.setStatus1001(host, w, stance, `tools fund ${tool}`);
        return true;
      }
      if (tool && !host.hasTool(tool) && this.canFundToolNow(tool, w, anvil) && !(tool === "hatchet" && this.hatchetChestBreakActive())) {
        this.setStatus1001(host, w, stance, `tools ${tool}`);
        if (host.acquireTool(tool)) return true;
        return true;
      }
      if (host.hasTool("pickaxe")) {
        if (this.tryToolsFindRockOrBreak(host, w, stance)) return true;
      } else if (w.explore) {
        this.setStatus1001(host, w, stance, "tools explore");
        host.walkTo(w.explore.x, w.explore.y);
        return true;
      }
      if (w.wander) {
        this.setStatus1001(
          host,
          w,
          stance,
          host.hasTool("pickaxe") && !this.rockFindBreakActive() ? "tools find rock" : "tools explore"
        );
        host.walkTo(w.wander.x, w.wander.y);
        return true;
      }
      if (w.hub) {
        this.setStatus1001(host, w, stance, "tools find shop");
        this.desireXY = { x: w.hub.x, y: w.hub.y };
        host.walkTo(w.hub.x, w.hub.y);
        return true;
      }
      this.setStatus1001(host, w, stance, "tools wait node");
      return true;
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
      var _a, _b, _c, _d;
      if (w.hasMetalWeapon || w.hasStyleWeapon) {
        this.h1001.phase = "GEAR_FARM";
        return false;
      }
      if (this.beginnerToolsIncomplete(host)) {
        if (host.hasTool("pickaxe") && (this.stuckWanderBreakActive() || this.exploreKiteBreakActive() || this.emergToolsBreakActive() || this.hatchetChestBreakActive() || this.stickyExploreBlockActive())) {
          if (this.stickyExploreBlockActive() || this.stickyPhaseLeaveArmed) {
            if (!this.kiteCoolExitQuietActive()) {
              this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 640);
              this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 640);
            }
            this.stickyPhaseLeaveArmed = true;
            const rock2 = (_b = (_a = w.seen) == null ? void 0 : _a.rock) != null ? _b : this.mem(w, "rock");
            const canHoldMine = !!rock2 && host.hasTool("pickaxe") && host.hasTool("hatchet") && !this.isGatherTileBlocked(rock2.x, rock2.y) && !this.kiteCoolMineBanActive();
            if (canHoldMine && rock2) {
              const mk = `${rock2.x},${rock2.y}`;
              if (mk === this.kiteCoolMineKey) this.kiteCoolMineHits++;
              else {
                this.kiteCoolMineKey = mk;
                this.kiteCoolMineHits = 1;
              }
              if (this.kiteCoolMineHits >= 3) {
                this.blockGatherTile(rock2.x, rock2.y);
                this.kiteCoolMineBanUntil = this.runTicks + 768;
                this.kiteCoolMineKey = "";
                this.kiteCoolMineHits = 0;
                host.log("AUTO: FIRST_WEP hold mine same-tile \u2014 ban mine (2064)");
              } else {
                this.noteAction("FIRST_WEP hold \u2014 mine");
                host.log("AUTO: FIRST_WEP hold \u2014 productive mine (2064)");
                this.setStatus1001(host, w, stance, "first wep mine");
                this.armPhaseIntent(this.h1001.phase === "GEAR_FARM" ? "GEAR_FARM" : "FIRST_WEP", "mine");
                if (this.walkToTile(host, rock2.x, rock2.y)) {
                  this.cool = 8;
                  return true;
                }
                if (this.tryGather(host, w, stance, "mine first wep")) {
                  this.cool = 6;
                  return true;
                }
                this.blockGatherTile(rock2.x, rock2.y);
                this.kiteCoolMineKey = "";
                this.kiteCoolMineHits = 0;
              }
            }
            if (this.kiteCoolExitGraceActive()) {
              return this.finishKiteCoolExitGrace(host, w, stance, "first-wep-hold");
            }
            if (this.phaseCoolNoKiteWander()) {
              return this.finishQuietHoldProgress(host, w, stance, "first-wep-hold");
            }
            if (this.kiteCoolWanderBanActive()) {
              this.kiteCoolParkHits++;
              if (this.kiteCoolParkHits >= 4 || this.kiteCoolWanderTheater()) {
                return this.exitKiteCoolPark(host, w, stance, "ban-hold");
              }
              this.setStatus1001(host, w, stance, "kite cool hub");
              if (w.hub) host.walkTo(w.hub.x, w.hub.y);
              else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
              else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
              this.cool = 12;
              return true;
            }
            if (this.kiteCoolWanderTheater()) {
              return this.breakKiteCoolWanderHub(host, w, stance, "first-wep-hold");
            }
            this.noteAction("FIRST_WEP hold \u2014 wander");
            host.log("AUTO: FIRST_WEP hold \u2014 kite cool wander (2061)");
            this.setStatus1001(host, w, stance, "kite cool wander");
            if (w.wander) host.walkTo(w.wander.x, w.wander.y);
            else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
            else if (w.explore) {
              this.desireXY = { x: w.explore.x, y: w.explore.y };
              host.walkTo(w.explore.x, w.explore.y);
            }
            this.cool = 12;
            return true;
          }
          return this.tryStickyProgressLeave(host, w, stance, "FIRST_WEP hold");
        }
        if (this.stickyExploreBlockActive() && host.hasTool("pickaxe")) {
          this.stickyPhaseLeaveArmed = true;
          const rock2 = (_d = (_c = w.seen) == null ? void 0 : _c.rock) != null ? _d : this.mem(w, "rock");
          if (rock2 && host.hasTool("hatchet") && !this.isGatherTileBlocked(rock2.x, rock2.y) && !this.kiteCoolMineBanActive()) {
            const mk = `${rock2.x},${rock2.y}`;
            if (mk === this.kiteCoolMineKey) this.kiteCoolMineHits++;
            else {
              this.kiteCoolMineKey = mk;
              this.kiteCoolMineHits = 1;
            }
            if (this.kiteCoolMineHits >= 3) {
              this.blockGatherTile(rock2.x, rock2.y);
              this.kiteCoolMineBanUntil = this.runTicks + 768;
              this.kiteCoolMineKey = "";
              this.kiteCoolMineHits = 0;
              host.log("AUTO: FIRST_WEP sticky mine same-tile \u2014 ban mine (2064)");
            } else {
              this.setStatus1001(host, w, stance, "first wep mine");
              this.armPhaseIntent(this.h1001.phase === "GEAR_FARM" ? "GEAR_FARM" : "FIRST_WEP", "mine");
              if (this.walkToTile(host, rock2.x, rock2.y)) return true;
              if (this.tryGather(host, w, stance, "mine first wep")) return true;
              this.blockGatherTile(rock2.x, rock2.y);
              this.kiteCoolMineKey = "";
              this.kiteCoolMineHits = 0;
            }
          }
          if (this.kiteCoolExitGraceActive()) {
            return this.finishKiteCoolExitGrace(host, w, stance, "first-wep-sticky");
          }
          if (this.phaseCoolNoKiteWander()) {
            return this.finishQuietHoldProgress(host, w, stance, "first-wep-sticky");
          }
          if (this.kiteCoolWanderBanActive()) {
            this.kiteCoolParkHits++;
            if (this.kiteCoolParkHits >= 4 || this.kiteCoolWanderTheater()) {
              return this.exitKiteCoolPark(host, w, stance, "ban-sticky");
            }
            this.setStatus1001(host, w, stance, "kite cool hub");
            if (w.hub) host.walkTo(w.hub.x, w.hub.y);
            else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
            else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
            this.cool = 12;
            return true;
          }
          if (this.kiteCoolWanderTheater()) {
            return this.breakKiteCoolWanderHub(host, w, stance, "first-wep-sticky");
          }
          this.setStatus1001(host, w, stance, "kite cool wander");
          if (w.wander) host.walkTo(w.wander.x, w.wander.y);
          else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
          else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
          this.cool = 10;
          return true;
        }
        this.h1001.phase = "TOOLS";
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
      var _a, _b, _c, _d, _e, _f;
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
      if (!this.sellTrimEmptyBlocked() && this.runTicks < this.sellTrimStickyUntil && this.sellTrimStillNeeded(host, w)) {
        this.h1001.phase = "SELL_TRIM";
        return this.phaseSellTrim1001(host, w, stance);
      }
      if ((foodLow || matsFull) && (anvil || w.hub)) {
        const hasForgeWork = w.oreCount > 0 || this.wantSmithKit(w);
        if (foodLow && this.hasBagCookables(w) && !hasForgeWork) {
          if (this.tryCookBagCookables(host, w, stance, "gear cook")) return true;
          if (this.cookOwed(w, stance)) {
            this.h1001.phaseResume = "GEAR_FARM";
            this.h1001.phase = "FOOD_BUFFER";
            this.setStatus1001(host, w, stance, "food buffer");
            return false;
          }
          if (!this.sellTrimEmptyBlocked() && this.sellTrimHasWork(host, w)) {
            this.armSellTrimSticky(host, w);
            this.h1001.phase = "SELL_TRIM";
            return this.phaseSellTrim1001(host, w, stance);
          }
        }
        if (hasForgeWork) {
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
        } else if (matsFull || foodLow) {
          if (host.craftGemRingOnce()) return true;
          if ((_e = host.craftClothesOnce) == null ? void 0 : _e.call(host)) return true;
          if ((_f = host.craftShieldOnce) == null ? void 0 : _f.call(host)) return true;
        }
        if (!this.sellTrimEmptyBlocked() && (matsFull || this.sellTrimHasWork(host, w))) {
          this.armSellTrimSticky(host, w);
          this.h1001.phase = "SELL_TRIM";
          return this.phaseSellTrim1001(host, w, stance);
        }
        if (foodLow && !stance.healRich && !stance.stocked && !this.hasBagCookables(w)) {
          this.h1001.phaseResume = "GEAR_FARM";
          this.h1001.phase = "FOOD_BUFFER";
          this.setStatus1001(host, w, stance, "food buffer");
          return false;
        }
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
      if (this.trySellUnusedOnce(host, w)) return true;
      if (this.hasSellableMats(w) && host.sellMatsForCoins(1)) return true;
      const rock = this.mem(w, "rock");
      const tree = this.mem(w, "tree");
      const anvil = this.mem(w, "anvil");
      if (rock && host.hasTool("pickaxe")) {
        if (this.walkToTile(host, rock.x, rock.y)) return true;
        return this.tryGather(host, w, stance, "fund mine");
      }
      if (!host.hasTool("pickaxe") && rock) {
        if (this.canFundToolNow("pickaxe", w, anvil) && host.acquireTool("pickaxe")) {
          this.setStatus1001(host, w, stance, "fund pickaxe");
          return true;
        }
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
      if (w.explore) {
        host.walkTo(w.explore.x, w.explore.y);
        return true;
      }
      return false;
    }
    /**
     * Eng 2059: real trim work exists (junk weps / mats / raws / bag crush).
     * foodLow alone is NOT work — empty/keep-only bags must not re-enter SELL_TRIM.
     */
    sellTrimHasWork(host, w) {
      return this.bagFloodedWeps(host, w) || this.hasSellableMats(w) || this.hasBagCookables(w) || w.bagFree <= 1;
    }
    sellTrimEmptyBlocked() {
      return this.runTicks < this.sellTrimEmptyUntil;
    }
    /**
     * Eng 2034/2059: stay sticky while junk weps remain OR bag tight with raws/mats.
     * bagFloodedWeps sticky even with bagFree>2 — else sell↔fish/score osc (5bcpjx).
     */
    sellTrimStillNeeded(host, w) {
      if (this.bagFloodedWeps(host, w)) return true;
      if (w.bagFree > 2) return false;
      return this.hasBagCookables(w) || this.hasSellableMats(w);
    }
    armSellTrimSticky(host, w) {
      if (this.sellTrimStillNeeded(host, w)) {
        this.sellTrimStickyUntil = Math.max(this.sellTrimStickyUntil, this.runTicks + 96);
      }
    }
    /** Eng 2059: leave SELL_TRIM after empty/keep-only — cool-block + thrash mark. */
    leaveSellTrimEmpty(host, w, stance, why) {
      const firstLeave = this.runTicks >= this.sellTrimEmptyUntil;
      this.sellTrimStickyUntil = 0;
      this.sellTrimNoSellStreak = 0;
      this.sellTrimEmptyUntil = this.runTicks + 128;
      if (firstLeave || why !== "cool") {
        this.latchThrash();
        host.equipUp();
        host.log(`AUTO: sell trim empty \u2014 leave (${why}) (2059)`);
        this.noteAction(`sell trim empty \u2014 ${why}`);
      }
      if (this.foodUrgency(w)) this.h1001.phase = "FOOD_BUFFER";
      else if (stance.hungry && !stance.healRich && !stance.stocked) {
        this.h1001.phaseResume = "GEAR_FARM";
        this.h1001.phase = "FOOD_BUFFER";
      } else {
        const tool = bootstrapTool(host, w, this.h1001.nodes);
        this.h1001.phase = tool ? "TOOLS" : "GEAR_FARM";
      }
      return false;
    }
    phaseSellTrim1001(host, w, stance) {
      this.setStatus1001(host, w, stance, "sell trim");
      if (this.sellTrimEmptyBlocked() && !this.sellTrimHasWork(host, w)) {
        this.sellTrimStickyUntil = 0;
        this.h1001.phase = "GEAR_FARM";
        return false;
      }
      if (this.hasBagCookables(w) && this.cookOwed(w, stance)) {
        if (this.tryCookBagCookables(host, w, stance, "sell cook")) {
          this.sellTrimNoSellStreak = 0;
          return true;
        }
      }
      if (host.craftGemRingOnce()) {
        this.sellTrimNoSellStreak = 0;
        return true;
      }
      if (this.trySellUnusedOnce(host, w)) {
        this.sellTrimNoSellStreak = 0;
        if (this.sellTrimStillNeeded(host, w)) this.armSellTrimSticky(host, w);
        else this.sellTrimStickyUntil = 0;
        return true;
      }
      if (host.sellOreKeep(this.h1001.lockedMats && !w.hasArmour ? 2 : 0)) {
        this.sellTrimNoSellStreak = 0;
        return true;
      }
      if (this.hasSellableMats(w) && host.sellMatsForCoins(1)) {
        this.sellTrimNoSellStreak = 0;
        return true;
      }
      if (!this.hasSellableMats(w) && !this.hasBagCookables(w)) {
        this.sellTrimNoSellStreak++;
        if (this.sellTrimNoSellStreak >= 2 || !this.sellTrimHasWork(host, w) || this.bagFloodedWeps(host, w) && this.sellTrimNoSellStreak >= 1 && w.bagFree > 2) {
          this.latchThrash();
          return this.leaveSellTrimEmpty(host, w, stance, "no-sell");
        }
      } else {
        this.sellTrimNoSellStreak = 0;
      }
      const shop = this.mem(w, "shop");
      if (shop && cheb(w.tile.x, w.tile.y, shop.x, shop.y) > 1 && this.sellTrimHasWork(host, w)) {
        this.armSellTrimSticky(host, w);
        this.desireXY = { x: shop.x, y: shop.y };
        host.walkTo(shop.x, shop.y);
        return true;
      }
      const stillNeed = this.sellTrimStillNeeded(host, w);
      const sticky = this.runTicks < this.sellTrimStickyUntil;
      if ((stillNeed || sticky) && this.sellTrimHasWork(host, w)) {
        this.h1001.phase = "SELL_TRIM";
        if (!stillNeed) {
          this.sellTrimStickyUntil = 0;
        } else {
          this.armSellTrimSticky(host, w);
          if (w.hub && cheb(w.tile.x, w.tile.y, w.hub.x, w.hub.y) > 2) {
            this.desireXY = { x: w.hub.x, y: w.hub.y };
            host.walkTo(w.hub.x, w.hub.y);
            return true;
          }
          if (shop) {
            this.desireXY = { x: shop.x, y: shop.y };
            host.walkTo(shop.x, shop.y);
            return true;
          }
        }
        return false;
      }
      this.sellTrimStickyUntil = 0;
      if (this.foodUrgency(w)) this.h1001.phase = "FOOD_BUFFER";
      else if (stance.hungry || w.food < stance.minFood) {
        if (this.hasBagCookables(w) && this.cookOwed(w, stance)) {
          this.h1001.phaseResume = "GEAR_FARM";
          this.h1001.phase = "FOOD_BUFFER";
        } else if (!stance.healRich && !stance.stocked) {
          this.h1001.phaseResume = "GEAR_FARM";
          this.h1001.phase = "FOOD_BUFFER";
        } else {
          const tool = bootstrapTool(host, w, this.h1001.nodes);
          this.h1001.phase = tool ? "TOOLS" : "GEAR_FARM";
        }
      } else {
        this.h1001.phase = "GEAR_FARM";
      }
      return false;
    }
    phaseFood1001(host, w, stance) {
      var _a;
      if (!this.foodUrgency(w)) {
        const tool = bootstrapTool(host, w, this.h1001.nodes);
        if (tool || this.beginnerToolsIncomplete(host) || !w.hasMetalWeapon && !w.hasStyleWeapon && !w.kitReady && (this.mem(w, "tree") || this.mem(w, "rock") || this.mem(w, "shop") || this.mem(w, "pond") || this.mem(w, "anvil") || w.anvilNearby)) {
          this.h1001.phase = "TOOLS";
          this.h1001.phaseResume = null;
          return false;
        }
      }
      if (stance.stocked && w.food >= stance.minFood) {
        this.clearFundIntent("food");
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
      const toolsBootstrap = this.h1001.phase === "TOOLS" && this.beginnerToolsIncomplete(host);
      const chain = toolsBootstrap ? [] : buildRoundTrip(this.h1001.nodes, w).filter((n) => {
        if (n.kind === "altar") {
          if (this.beginnerToolsIncomplete(host) || this.h1001.phase === "TOOLS") return false;
          return this.altarActReady(w) !== false;
        }
        if (n.kind === "anvil") {
          if (this.beginnerToolsIncomplete(host)) return false;
          if (this.runTicks < this.forgeBlockUntil) return false;
          return w.oreCount > 0;
        }
        if (n.kind === "shop" && !this.shopVisitWorth(host, w)) return false;
        if (n.kind === "pond") {
          if (this.pondBreakActive()) return false;
          if (this.isGatherTileBlocked(n.x, n.y)) return false;
          if (this.foodPathEmpty(w) && this.pondRethinks > 0) return false;
          if (this.firstWepCampGatherBanActive()) return false;
        }
        if (n.kind === "tree") {
          if (this.chopBreakActive() || this.campChainBreakActive()) return false;
          if (!host.hasTool("hatchet")) return false;
          if (this.firstWepCampGatherBanActive()) return false;
          if (this.isGatherTileBlocked(n.x, n.y)) return false;
        }
        if (n.kind === "rock") {
          if (this.rockFindBreakActive() || this.campChainBreakActive()) return false;
          if (!host.hasTool("pickaxe")) return false;
          if (this.firstWepCampGatherBanActive()) return false;
          if (this.isGatherTileBlocked(n.x, n.y)) return false;
        }
        if (n.kind === "shop") {
          if (this.sellOreBreakActive() || this.campChainBreakActive()) return false;
        }
        if (n.kind === "chest") {
          if (this.campChainBreakActive() || this.hatchetChestBreakActive()) return false;
        }
        return true;
      });
      if (!this.campChainBreakActive() && chain.length >= 2) {
        const next = chain[0];
        const sameKey = `${next.kind}:${next.x},${next.y}`;
        if (sameKey === this.campChainSameKey) this.campChainSameHits++;
        else {
          this.campChainSameKey = sameKey;
          this.campChainSameHits = 1;
        }
        if (this.campChainSameHits >= 3) {
          this.campChainBreakUntil = this.runTicks + 768;
          this.chopBreakUntil = Math.max(this.chopBreakUntil, this.runTicks + 512);
          this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 640);
          this.blockGatherTile(next.x, next.y);
          if (next.kind === "chest") {
            this.softBlockChest(host, w, next.x, next.y, "camp-chain same chest");
            this.hatchetChestBreakUntil = Math.max(this.hatchetChestBreakUntil, this.runTicks + 640);
          }
          this.campChainSameKey = "";
          this.campChainSameHits = 0;
          this.armBreakerExploreCool(640);
          if (next.kind === "tree" || next.kind === "rock") {
            this.kiteCoolMineBanUntil = Math.max(this.kiteCoolMineBanUntil, this.runTicks + 768);
            this.kiteCoolMineKey = "";
            this.kiteCoolMineHits = 0;
          }
          if (next.kind === "pond") {
            this.pondBreakUntil = Math.max(this.pondBreakUntil, this.runTicks + 768);
            this.dropEnroutePonds();
            this.kiteCoolMineBanUntil = Math.max(this.kiteCoolMineBanUntil, this.runTicks + 768);
          }
          this.noteAction(`camp-chain same \u2014 wander (${next.kind})`);
          host.log(`AUTO: camp_chain same-node ${next.kind} @(${next.x},${next.y}) \u2014 wander (2066)`);
          if (w.wander) host.walkTo(w.wander.x, w.wander.y);
          else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
          else if (w.explore) {
            this.desireXY = { x: w.explore.x, y: w.explore.y };
            host.walkTo(w.explore.x, w.explore.y);
          }
          this.setStatus(host, w, stance, `camp-chain osc \u2014 wander`);
          this.cool = 16;
          return true;
        }
        const ok2 = this.visitNode1001(host, w, stance, next.kind, next.x, next.y);
        if (!ok2) return false;
        this.h1001.topEvent = "camp_chain";
        this.h1001.utilityPick = `chain:${next.kind}`;
        this.setStatus1001(host, w, stance, `round-trip ${next.kind}`);
        return true;
      }
      const opts = calmUtilOptions(w, stance, this.h1001.nodes).filter((o) => {
        if (o.id === "mine" || o.id === "chop" || o.id === "fish") {
          if (toolsBootstrap || this.beginnerToolsIncomplete(host)) return false;
        }
        if (o.id === "mine" && (this.rockFindBreakActive() || this.campChainBreakActive())) return false;
        if (o.id === "chop" && (this.chopBreakActive() || this.campChainBreakActive())) return false;
        if ((o.id === "mine" || o.id === "chop") && this.firstWepCampGatherBanActive()) return false;
        if (o.id === "shop" && (this.sellOreBreakActive() || this.campChainBreakActive())) return false;
        if (o.id === "mine") return host.hasTool("pickaxe");
        if (o.id === "chop") return host.hasTool("hatchet");
        if (o.id === "fish") {
          if (this.pondBreakActive()) return false;
          return host.hasTool("rod");
        }
        if (o.id === "anvil") {
          if (toolsBootstrap || this.beginnerToolsIncomplete(host)) return false;
          if (this.runTicks < this.forgeBlockUntil) return false;
          return w.oreCount > 0;
        }
        if (o.id === "altar" || o.id === "runecraft") {
          if (this.beginnerToolsIncomplete(host) || this.h1001.phase === "TOOLS") return false;
        }
        if (o.id === "shop") {
          if (toolsBootstrap) return false;
          if (!this.shopVisitWorth(host, w)) return false;
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
        const forged = host.forgeWieldedOnce() || this.wantSmithKit(w) && host.smithKitOnce() || host.craftGemRingOnce();
        if (forged) return true;
        this.noteForgeMiss(w, 80);
        return false;
      }
      if (kind === "shop") {
        if (!this.shopVisitWorth(host, w)) return false;
        if (this.walkToTile(host, x, y, 1)) return true;
        return this.trySellUnusedOnce(host, w) || host.sellOreKeep(2);
      }
      if (kind === "altar") {
        if (this.beginnerToolsIncomplete(host) || this.h1001.phase === "TOOLS") return false;
        if (this.altarActReady(w) === false) return false;
        return host.runecraftOnce();
      }
      if (kind === "chest") {
        if (this.campChainBreakActive() || this.hatchetChestBreakActive()) return false;
        host.walkTo(x, y);
        return this.tryOpenChestOnce(host, w, stance, { needBag: false, cool: 2 });
      }
      if (kind === "mine" || kind === "rock") {
        if (this.rockFindBreakActive() || this.campChainBreakActive() || this.isGatherTileBlocked(x, y)) return false;
        if (!host.hasTool("pickaxe") || this.firstWepCampGatherBanActive()) {
          if (!host.hasTool("pickaxe")) {
            this.kiteCoolMineBanUntil = Math.max(this.kiteCoolMineBanUntil, this.runTicks + 768);
          }
          return false;
        }
        if (this.walkToTile(host, x, y)) return true;
        return this.tryGather(host, w, stance, "util mine");
      }
      if (kind === "chop" || kind === "tree") {
        if (this.chopBreakActive() || this.campChainBreakActive() || this.isGatherTileBlocked(x, y)) return false;
        if (!host.hasTool("hatchet") || this.firstWepCampGatherBanActive()) {
          if (!host.hasTool("hatchet")) {
            this.kiteCoolMineBanUntil = Math.max(this.kiteCoolMineBanUntil, this.runTicks + 768);
            host.log("AUTO: camp gather skip \u2014 no hatchet (2065)");
          }
          return false;
        }
        if (this.walkToTile(host, x, y)) return true;
        return this.tryGather(host, w, stance, "util chop");
      }
      if (kind === "fish" || kind === "pond") {
        if (!host.hasTool("rod")) return false;
        if (this.pondBreakActive() || this.isGatherTileBlocked(x, y)) return false;
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
    /**
     * Eng 2039 / t1760+t1761: FOOD_BUFFER door open/close thrash.
     * Host opens on step-onto and slam-closes on leave — so open→close without
     * approaching desire means we retreated off the door. Sticky-commit through;
     * after N fails soft-block door + mark thrash/stuck + explore.
     */
    tryDoorCrossCommit(host, w, stance) {
      var _a, _b;
      const door = (_b = (_a = w.seen) == null ? void 0 : _a.door) != null ? _b : null;
      const tileKey = `${w.tile.x},${w.tile.y}`;
      const pinned = this.stuckDesireTarget(w);
      const desire = this.doorCrossDesire || this.desireXY || (pinned ? { x: pinned.x, y: pinned.y } : null);
      if (!door) {
        this.doorOscStreak = 0;
        this.doorOnDoorLast = false;
        this.doorLastTile = tileKey;
        return false;
      }
      const onDoor = w.tile.x === door.x && w.tile.y === door.y;
      const adjDoor = Math.max(Math.abs(w.tile.x - door.x), Math.abs(w.tile.y - door.y)) <= 1;
      const foodDoorStatus = /find pond|find shop|food buffer|enroute pond|food fish|food sell ore|sell ore|sell trim|bag sell trim|bag find shop|remembered door|door through|door open/i.test(this.lastStatus || "");
      if (this.doorOnDoorLast && !onDoor && foodDoorStatus) {
        let retreated = true;
        if (desire) {
          const dist = Math.max(
            Math.abs(w.tile.x - desire.x),
            Math.abs(w.tile.y - desire.y)
          );
          const onDoorDist = Math.max(
            Math.abs(door.x - desire.x),
            Math.abs(door.y - desire.y)
          );
          if (dist < onDoorDist) retreated = false;
        }
        if (retreated) {
          this.doorOscStreak += 1;
          this.latchThrash();
          this.noteAction(`door osc streak ${this.doorOscStreak}`);
        } else {
          this.doorOscStreak = 0;
        }
      }
      if (foodDoorStatus && this.doorLastTile && this.doorLastTile !== tileKey && adjDoor && (this.doorLastTile === `${door.x},${door.y}` || onDoor)) {
        if (onDoor && this.doorLastTile !== `${door.x},${door.y}`) {
          this.doorOscStreak = Math.max(this.doorOscStreak, 1);
          this.latchThrash();
        }
      }
      this.doorOnDoorLast = onDoor;
      this.doorLastTile = tileKey;
      if (this.doorOscStreak >= 3) {
        this.latchThrash();
        this.latchStuck();
        this.noteGatherFail(door.x, door.y);
        this.noteGatherFail(w.tile.x, w.tile.y);
        this.doorSeenUntil = this.runTicks + 160;
        this.doorOscStreak = 0;
        this.doorCrossStickyUntil = 0;
        this.doorCrossDesire = null;
        this.doorOnDoorLast = false;
        if (foodDoorStatus) {
          this.pondBreakUntil = Math.max(this.pondBreakUntil, this.runTicks + 96);
          this.dropEnroutePonds();
          this.clearFundIntent("food");
          this.bagFindShopUntil = 0;
          this.bagFindShopTile = "";
        }
        host.log("AUTO: door open/close thrash \u2014 abandon (2039)");
        this.noteAction("door thrash abandon");
        if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        this.setStatus(host, w, stance, "door thrash \u2014 explore");
        this.cool = 4;
        return true;
      }
      if (this.runTicks < this.doorCrossStickyUntil && this.doorCrossDesire) {
        const d = this.doorCrossDesire;
        const dist = Math.max(Math.abs(w.tile.x - d.x), Math.abs(w.tile.y - d.y));
        if (dist > 1) {
          this.desireXY = { x: d.x, y: d.y };
          host.walkTo(d.x, d.y);
          this.setStatus(host, w, stance, "door through");
          this.cool = 1;
          return true;
        }
        this.doorCrossStickyUntil = 0;
        this.doorCrossDesire = null;
        this.doorOscStreak = 0;
      }
      if (this.runTicks < this.doorSeenUntil) return false;
      if (!desire) return false;
      const desireDist = Math.max(
        Math.abs(w.tile.x - desire.x),
        Math.abs(w.tile.y - desire.y)
      );
      if (desireDist <= 1) return false;
      const doorToDesire = Math.max(
        Math.abs(door.x - desire.x),
        Math.abs(door.y - desire.y)
      );
      const doorHelps = doorToDesire < desireDist || onDoor;
      if (onDoor && doorHelps) {
        this.doorCrossDesire = { x: desire.x, y: desire.y };
        this.doorCrossStickyUntil = this.runTicks + 28;
        this.desireXY = { x: desire.x, y: desire.y };
        host.walkTo(desire.x, desire.y);
        this.setStatus(host, w, stance, "door through");
        this.cool = 1;
        return true;
      }
      if (adjDoor && !onDoor && doorHelps && foodDoorStatus) {
        this.doorCrossDesire = { x: desire.x, y: desire.y };
        this.doorCrossStickyUntil = this.runTicks + 32;
        this.desireXY = { x: desire.x, y: desire.y };
        host.walkTo(door.x, door.y);
        this.setStatus(host, w, stance, "door open");
        this.cool = 1;
        return true;
      }
      return false;
    }
    /**
     * Eng 2038 / R8: known A↔B status oscillation in the recent ring.
     * Counts distinct labels matching either regex; needs ≥2 of each OR ≥4 ring
     * entries with both sides present (fast-farm HP-regen never reached rethink).
     */
    statusOscPair(reA, reB) {
      const ring = this.stuckRecentStatus;
      if (ring.length < 4) return false;
      let a = 0;
      let b = 0;
      for (const s of ring) {
        const low = s.toLowerCase();
        if (reA.test(low)) a++;
        else if (reB.test(low)) b++;
      }
      return a >= 2 && b >= 2;
    }
    /**
     * Eng 2038: thrash statuses where HP/MP regen must NOT count as progress
     * (pond/tools/shop loops otherwise never arm stuck/pondBreak).
     */
    statusIgnoresHpMpProgress(st) {
      return /food fish|enroute pond|find pond|food last farm|food buffer|food mine break|round-trip pond|util fish|tools find rock|tools mine|tools explore|tools wander|tools pickaxe|tools fund|rock osc|food sell ore|food find shop|bag find shop|sell-ore osc|sell trim|round-trip rock|round-trip tree|round-trip shop|util chop|chop for fire|cook\b|first wep|mine first wep|first-wep osc|remembered door|door through|door open|door thrash|tools hatchet|open chest|chest soft-block|mono thrash|mono divert|hatchet osc|hatchet thrash|explore-kite osc|emerg-tools osc|status osc explore\/kite|lethal kite|lethal close|approach kite|mob kite|kite outlook|enroute loot|walk HV loot|walk loot|emerg hub|food-mine osc|food-fish mono|altar runecraft|stuck rethink|stuck-wander osc|wander-mob osc|sticky progress|sticky leave|camp-chain osc|camp-shop osc|camp-tree osc|camp-rock osc|gear-explore-kite|sticky-explore mono|lethal-loot osc|sticky leave — phase|lethal-cover osc|camp-rock osc|mono divert escalate|FIRST_WEP hold|first wep mine|camp-chain osc|camp-chain same|gear-explore-kite osc|first-wep-combat osc|phase cool|camp-chest osc|explore-kite osc — wander|first-wep osc — wander|tools-hatchet hang|camp-trim osc|pond-sell osc|sell trim empty|door thrash|kite cool|FIRST_WEP hold — wander|quiet hold — tools bootstrap|quiet hold — bootstrap break|quiet hold — break escalate|quiet hold — escalate leave|quiet hold — progress mine|quiet hold — post RELEASE|post-RELEASE mine|post-RELEASE escape|pond break — wander|pond osc — wander|camp-tree osc — wander|camp-rock osc — wander|camp-shop osc — wander|camp-chest osc — wander|camp-chain osc — wander|food-mine osc — wander|food-fish mono — wander|altar-fund osc — wander|kite-cool-lethal osc — hub|kite-cool-lethal osc|kite-cool-wander osc — hub|kite-cool-wander osc|kite cool hub|kite cool exit|kite cool exit grace|insta osc — leave|insta osc|pond-break-cap|food-wander-cap|wanderSpin hard leave|pond-cap — release|insta osc — release|insta osc — cool|pond-cap — cool/i.test(st);
    }
    /**
     * Eng 3000 / t1800: normalize status to family key (strip |tag and (x,y)).
     * Eng 3001 / R61: collapse leave-theater synonyms + strip #N so ABCD collapses
     * and noteAction pond-cap pairs with FIRST_WEP hold.
     */
    statusFamKey(s) {
      let k = s.toLowerCase().replace(/\s*\|.*$/, "").replace(/\s*\(\d+,\d+\)\s*/g, " ").replace(/#\d+/g, "").trim();
      if (/pond-break-cap|pond-cap — release|food-wander-cap/.test(k)) return "pond-cap";
      if (/first_wep hold — wander|first wep hold — wander|quiet hold — wander/.test(k)) return "hold-wander";
      if (/wanderspin hard leave/.test(k)) return "leave-spin";
      if (/^phase cool$|phase cool$/.test(k) || k === "phase cool") return "phase-cool";
      if (/tools wander thrash|tools-rock-wander prison|trw-prison|trw-wander-aba|trw-reenter-ban|phase-intent-mine-cap|after-life-escape-cap|after-life-escape-spent|first_wep hold — explore|first wep hold — explore/.test(k)) {
        return "divert-product";
      }
      if (/tools wander/.test(k)) return "tools-wander";
      if (/tools find rock|tools mine|sticky progress — mine|phase cool mine/.test(k)) return "tools-rock-seek";
      if (/rock thrash|rock osc|status osc rock|rock find thrash/.test(k)) return "tools-rock-flee";
      if (/^tools explore$|tools explore/.test(k) && !/explore-kite|kite/.test(k)) return "tools-rock-flee";
      if (/insta osc — cool|pond-cap — cool/.test(k)) return "osc-cool";
      if (/insta osc/.test(k)) return "insta-leave";
      if (/post-release escape|post hierarchy release/.test(k)) return "release-cool";
      if (/after life escape|after cool exhaust|life-spent divert|post-exhaust divert|wd divert|early osc divert|productive quiet|divert-product scrub|gear farm — after|explore — after|gear farm — wd|explore — wd|gear farm — early|explore — early|phase intent|tools-rock-wander prison|trw-prison|trw-wander|trw-reenter|phase-intent-mine-cap|after-life-escape-cap|after-life-escape-spent|first_wep hold — explore|first wep hold — explore/.test(k)) {
        return "divert-product";
      }
      return k;
    }
    /** Eng 3012: true if fam is a divert-product (ignore in insta-osc ABA). */
    isDivertProductFam(k) {
      return k === "divert-product" || /divert-product|after life escape|after cool exhaust|wd divert|early osc divert|life-spent divert|post-exhaust divert|productive quiet|trw-prison|trw-wander|trw-reenter|phase-intent-mine-cap|after-life-escape-cap|after-life-escape-spent|first_wep hold — explore|first wep hold — explore/i.test(k);
    }
    /**
     * Eng 3016 / R76: note trw-prison-clear; ≥2 clears this life → ban TRW re-enter.
     * Also arm ban immediately when already flapping with wander thrash leave.
     */
    markTrwPrisonClear(host, why = "") {
      this.trwPrisonClearHits++;
      this.noteAction("trw-prison-clear");
      const flap = this.actions.slice(-6).some((s) => /tools wander thrash/i.test(s));
      if (this.trwPrisonClearHits >= 2 || flap) {
        if (!this.trwReenterBan) {
          this.trwReenterBan = true;
          this.noteAction("trw-reenter-ban");
          host.log(`AUTO: TRW re-enter BAN hits=${this.trwPrisonClearHits} ${why} (3016)`);
        }
      }
    }
    /** Eng 3016: TRW prison / thrash-leave→prison banned this life. */
    trwReenterBanned() {
      return this.trwReenterBan || this.trwPrisonClearHits >= 2;
    }
    /**
     * Eng 3019 / R79: post-life-escape status. Once ALE-capped, never re-emit
     * explore/gear-farm — after life escape (that re-armed CAP↔ALE prison).
     * Prefer hunt intent / free brain. Returns true if a status walk was issued.
     */
    emitPostLifeEscapeOrFree(host, w, stance, preferWalk) {
      if (this.afterLifeEscapeCapped) {
        if (!this.actions.some((s) => /after-life-escape-spent/i.test(s))) {
          this.noteAction("after-life-escape-spent");
          host.log("AUTO: after-life-escape SPENT \u2014 ban ALE status (3019)");
        }
        if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
          this.armPhaseIntent("GEAR_FARM", "hunt");
        } else if (host.hasTool("pickaxe")) {
          this.armPhaseIntent("FIRST_WEP", "hunt");
        } else {
          this.clearPhaseIntent();
        }
        this.cool = 0;
        return false;
      }
      if (preferWalk) {
        const shop = this.mem(w, "shop");
        if (shop) host.walkTo(shop.x, shop.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        else if (w.explore) {
          this.desireXY = { x: w.explore.x, y: w.explore.y };
          host.walkTo(w.explore.x, w.explore.y);
        } else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
      }
      this.setStatus(
        host,
        w,
        stance,
        host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon) ? "gear farm \u2014 after life escape" : "explore \u2014 after life escape"
      );
      this.cool = 0;
      return true;
    }
    /**
     * Eng 3016–3019: durable non-mine walk after TRW ban / wander↔prison ABA.
     * Prefer shop/hub/explore — do NOT re-arm phase-intent mine or rockFindBreak.
     * Eng 3018: once capped, leave spent → free brain (return false).
     * Eng 3019: first cap also yields free brain; note after-life-escape-spent once
     * (ban after-life-escape-cap spam); callers must not re-emit ALE status when capped.
     */
    durableTrwBanWalk(host, w, stance, mark) {
      this.latchThrash();
      this.latchClash();
      this.rockFindBreakUntil = 0;
      this.phaseIntentMineMonoHits = 0;
      this.stuckRecentStatus = this.stuckRecentStatus.filter(
        (s) => !/tools wander|tools explore|tools find rock|tools mine|tools fund|rock thrash|rock osc|tools-rock-wander|phase intent — mine/i.test(s)
      );
      this.actions = this.actions.filter(
        (s) => !/tools wander thrash|tools-rock-wander prison|trw-prison-clear|tools find rock|tools mine|tools fund/i.test(s)
      );
      if (/after-life-escape-cap|after-life-escape-spent/i.test(mark)) {
        this.afterLifeEscapeCapped = true;
        this.afterLifeEscapeMonoHits = Math.max(this.afterLifeEscapeMonoHits, 6);
      }
      if (this.afterLifeEscapeCapped) {
        if (!this.actions.some((s) => /after-life-escape-spent/i.test(s))) {
          this.noteAction("after-life-escape-spent");
          host.log(`AUTO: after-life-escape SPENT \u2014 free brain (3019)`);
        }
        if (!this.phaseIntentLocked() || this.phaseIntentGoal === "mine") {
          if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
            this.armPhaseIntent("GEAR_FARM", "hunt");
          } else if (host.hasTool("pickaxe")) {
            this.armPhaseIntent("FIRST_WEP", "hunt");
          } else {
            this.clearPhaseIntent();
          }
        }
        this.cool = 0;
        return false;
      }
      this.clearPhaseIntent();
      if (!new RegExp(mark.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(this.actions[this.actions.length - 1] || "")) {
        this.noteAction(mark);
      }
      const shop = this.mem(w, "shop");
      if (shop) host.walkTo(shop.x, shop.y);
      else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
      else if (w.explore) {
        this.desireXY = { x: w.explore.x, y: w.explore.y };
        host.walkTo(w.explore.x, w.explore.y);
      } else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
      this.afterLifeEscapeMonoHits++;
      if (this.afterLifeEscapeMonoHits >= 6) {
        this.afterLifeEscapeCapped = true;
        this.noteAction("after-life-escape-cap");
        this.noteAction("after-life-escape-spent");
        this.latchStuck();
        host.log(`AUTO: after-life-escape CAP\u2192SPENT hits=${this.afterLifeEscapeMonoHits} (3019)`);
        if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
          this.armPhaseIntent("GEAR_FARM", "hunt");
        } else if (host.hasTool("pickaxe")) {
          this.armPhaseIntent("FIRST_WEP", "hunt");
        } else {
          this.clearPhaseIntent();
        }
        this.cool = 0;
        return false;
      }
      if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
        this.armPhaseIntent("GEAR_FARM", "hunt");
        this.setStatus(host, w, stance, "phase intent \u2014 hunt");
      } else {
        this.setStatus(host, w, stance, "explore \u2014 after life escape");
      }
      this.cool = 0;
      return true;
    }
    detectInstaOscFrom(ring) {
      if (ring.length < 3) return null;
      const fams = [];
      for (const s of ring) {
        const k = this.statusFamKey(s);
        if (!k) continue;
        if (this.isDivertProductFam(k)) continue;
        if (fams.length === 0 || fams[fams.length - 1] !== k) fams.push(k);
      }
      const seq = fams.slice(-8);
      if (seq.length >= 8) {
        const a = seq.slice(0, 4);
        const b = seq.slice(4, 8);
        if (a.every((v, i) => v === b[i]) && new Set(a).size === 4) {
          return { fams: a.slice(), kind: "abcdabcd" };
        }
      }
      const seq6 = fams.slice(-6);
      if (seq6.length >= 6) {
        const a = seq6.slice(0, 3);
        const b = seq6.slice(3, 6);
        if (a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[0] !== a[1] && a[1] !== a[2] && a[0] !== a[2]) {
          return { fams: a.slice(), kind: "abcabc" };
        }
      }
      if (seq6.length >= 3) {
        const n = seq6.length;
        if (seq6[n - 1] === seq6[n - 3] && seq6[n - 1] !== seq6[n - 2]) {
          return { fams: [seq6[n - 3], seq6[n - 2]], kind: "aba" };
        }
      }
      return null;
    }
    detectInstaOsc() {
      return this.detectInstaOscFrom(this.stuckRecentStatus) || this.detectInstaOscFrom(this.actions.slice(-8));
    }
    /** Eng 3003/3004: cool divert latched (insta/pond-cap hits OR last cool status). */
    oscCoolDivertActive() {
      if (this.instaOscLeaveHits >= 2 || this.pondBreakCapHits >= 3) return true;
      if (/pond-cap — cool|insta osc — cool/i.test(this.lastStatus || "")) return true;
      if (this.pondSellPrisonLatched && this.pondBreakCapHits >= 2) return true;
      return false;
    }
    /**
     * Eng 3011 / t1808 #1: first insta A↔B / ABCABC → thrash(+clash) + durable
     * divert BEFORE leave/cool theater. Prefer early break over escape stack.
     * Does NOT spend life escape / arm leave. cool=0 so brain resumes.
     */
    earlyOscDurableDivert(host, w, stance, kind, pairKey) {
      this.earlyOscDivertHits = Math.max(this.earlyOscDivertHits, 1);
      this.latchThrash();
      this.latchClash();
      this.armBreakerExploreCool(768);
      this.clearFundIntent("tool");
      this.clearFundIntent("food");
      this.sellOreBreakUntil = Math.max(this.sellOreBreakUntil, this.runTicks + 640);
      this.emergToolsBreakUntil = Math.max(this.emergToolsBreakUntil, this.runTicks + 640);
      this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 512);
      this.foodMineBreakUntil = Math.max(this.foodMineBreakUntil, this.runTicks + 512);
      this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 640);
      this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 640);
      this.stickyPhaseLeaveArmed = true;
      this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
      this.instaOscPairKey = pairKey;
      const ban = new RegExp(pairKey.split("|").map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "i");
      this.stuckRecentStatus = this.stuckRecentStatus.filter((s) => !ban.test(this.statusFamKey(s)));
      this.actions = this.actions.filter((s) => !/insta osc|early osc divert/i.test(s));
      if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
        this.h1001.phase = "GEAR_FARM";
      } else if (host.hasTool("pickaxe")) {
        this.h1001.phase = "FIRST_WEP";
      }
      const shop = this.mem(w, "shop");
      if (shop) host.walkTo(shop.x, shop.y);
      else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
      else if (w.explore) {
        this.desireXY = { x: w.explore.x, y: w.explore.y };
        host.walkTo(w.explore.x, w.explore.y);
      } else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
      if (!/early osc divert/i.test(this.actions[this.actions.length - 1] || "")) {
        this.noteAction(`early osc divert \u2014 ${kind}`);
        host.log(`AUTO: early osc divert [${pairKey}] ${kind} (3012) \u2014 before leave/cool`);
      }
      this.setStatus(
        host,
        w,
        stance,
        host.hasTool("pickaxe") ? "gear farm \u2014 early osc divert" : "explore \u2014 early osc divert"
      );
      this.cool = 0;
      return true;
    }
    /**
     * Eng 3011 / t1808 #2: arm productive phase intent. Clears only on goal done /
     * phase leave / bag|HP force / death — not a cool timer.
     */
    armPhaseIntent(phase, goal) {
      if (phase !== "TOOLS" && phase !== "FIRST_WEP" && phase !== "GEAR_FARM") return;
      this.phaseIntentGoal = goal;
      this.phaseIntentPhase = phase;
    }
    clearPhaseIntent() {
      this.phaseIntentGoal = "";
      this.phaseIntentPhase = "";
      this.phaseIntentMineMonoHits = 0;
    }
    /** True while phase intent bans wander / fund-sell / pond re-entry. */
    phaseIntentLocked() {
      return !!this.phaseIntentGoal;
    }
    /**
     * Eng 3011: refresh / clear phase intent. Bag tight or hungry emerg force exit.
     * Goal done (metal wep / tools complete / forge done) clears.
     */
    refreshPhaseIntent(host, w, stance) {
      if (!this.phaseIntentGoal) return;
      const ph = this.h1001.phase;
      if (ph !== "TOOLS" && ph !== "FIRST_WEP" && ph !== "GEAR_FARM") {
        this.clearPhaseIntent();
        return;
      }
      if (w.bagFree <= 1 || stance.hungry || w.food <= 0 || w.hp / Math.max(1, w.maxHp) < 0.35) {
        this.clearPhaseIntent();
        return;
      }
      if (this.phaseIntentGoal === "mine" || this.phaseIntentGoal === "forge") {
        if (w.hasMetalWeapon || w.hasStyleWeapon) {
          this.clearPhaseIntent();
          return;
        }
      }
      if (this.phaseIntentGoal === "gather" && !this.beginnerToolsIncomplete(host) && host.hasTool("pickaxe")) {
        this.clearPhaseIntent();
        return;
      }
      this.phaseIntentPhase = ph;
    }
    /**
     * Eng 3011 / t1808 #2: while intent locked, divert away from wander/fund-sell/pond
     * back to the productive goal (mine/forge/hunt/gather). Returns true if consumed.
     */
    tryPhaseIntentHold(host, w, stance) {
      var _a, _b, _c, _d;
      this.refreshPhaseIntent(host, w, stance);
      if (!this.phaseIntentLocked()) return false;
      const goal = this.phaseIntentGoal;
      this.latchThrash();
      if (goal === "mine" && this.trwReenterBanned()) {
        this.noteAction("phase-intent-mine-cap");
        return this.durableTrwBanWalk(host, w, stance, "trw-reenter-ban");
      }
      if (goal === "mine" || goal === "forge") {
        if (!host.hasTool("pickaxe")) {
          this.clearPhaseIntent();
          return false;
        }
        const rock = (_b = (_a = w.seen) == null ? void 0 : _a.rock) != null ? _b : this.mem(w, "rock");
        if (rock && !this.isGatherTileBlocked(rock.x, rock.y)) {
          this.setStatus1001(host, w, stance, goal === "forge" ? "first wep mine" : "tools mine");
          this.desireXY = { x: rock.x, y: rock.y };
          if (this.walkToTile(host, rock.x, rock.y) || this.tryGather(host, w, stance, "phase-intent mine")) {
            this.phaseIntentMineMonoHits = 0;
            this.cool = 2;
            return true;
          }
          const attempt = host.gatherAt(rock.x, rock.y);
          if (attempt.ok || /^enroute$/i.test(attempt.reason || "")) {
            this.phaseIntentMineMonoHits = 0;
            this.cool = 2;
            return true;
          }
        }
        if (goal === "forge" && this.wantSmithKit(w) && w.oreCount > 0) {
          this.clearPhaseIntent();
          return false;
        }
        if (goal === "mine") {
          this.phaseIntentMineMonoHits++;
          if (this.phaseIntentMineMonoHits >= 6) {
            this.noteAction("phase-intent-mine-cap");
            host.log(`AUTO: phase-intent mine CAP hits=${this.phaseIntentMineMonoHits} (3016)`);
            this.clearPhaseIntent();
            this.latchStuck();
            if (this.emitPostLifeEscapeOrFree(host, w, stance, true)) return true;
            return false;
          }
        }
      }
      if (goal === "gather") {
        const tree = (_d = (_c = w.seen) == null ? void 0 : _c.tree) != null ? _d : this.mem(w, "tree");
        if (tree && host.hasTool("hatchet") && !this.isGatherTileBlocked(tree.x, tree.y)) {
          this.setStatus1001(host, w, stance, "tools fund chop");
          const attempt = host.gatherAt(tree.x, tree.y);
          if (attempt.ok || /^enroute$/i.test(attempt.reason || "")) {
            this.cool = 2;
            return true;
          }
        }
      }
      if (goal === "hunt") {
        const foe = w.foes.find((f) => f.alive && f.lit);
        if (foe) {
          this.setStatus1001(host, w, stance, "gear farm \u2014 hunt");
          host.walkTo(foe.x, foe.y);
          this.cool = 2;
          return true;
        }
      }
      if (goal === "mine") {
        this.phaseIntentMineMonoHits++;
        if (this.phaseIntentMineMonoHits >= 6 || this.trwReenterBanned()) {
          this.noteAction("phase-intent-mine-cap");
          host.log(`AUTO: phase-intent mine CAP fallthrough hits=${this.phaseIntentMineMonoHits} (3016)`);
          this.clearPhaseIntent();
          if (this.emitPostLifeEscapeOrFree(host, w, stance, true)) return true;
          return false;
        }
      }
      if (w.hub) host.walkTo(w.hub.x, w.hub.y);
      else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
      this.noteAction(`phase intent hold \u2014 ${goal}`);
      this.setStatus(host, w, stance, `phase intent \u2014 ${goal}`);
      this.cool = 0;
      return true;
    }
    /**
     * Eng 3011 / t1808 #3: after RELEASE / life-spent — ONE productive quiet
     * (hub sell / eat / re-kit), then free brain. Not a coolHold timer stack.
     * Honor life-spent: no coolHold* re-arm after spent.
     */
    oneProductiveQuietAfterRelease(host, w, stance, why) {
      this.markLifeEscapeSpent(host, `productive-quiet:${why}`);
      if (this.postReleaseQuietDone) {
        if (this.statusFamilyHits(/stuck rethink|tools fund sell|tools wander|insta osc|post-RELEASE/) >= 3) {
          return this.postExhaustDurableDivert(host, w, stance, `quiet-done:${why}`);
        }
        this.cool = 0;
        return false;
      }
      this.postReleaseQuietDone = true;
      this.latchThrash();
      this.latchClash();
      this.armBreakerExploreCool(640);
      this.clearFundIntent("tool");
      this.stickyPhaseLeaveArmed = true;
      this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
      this.stuckRecentStatus = this.stuckRecentStatus.filter(
        (s) => !/quiet hold — post RELEASE|post-RELEASE|insta osc — cool|post-release cool|osc cool|coolHold/i.test(s)
      );
      let did = "";
      if (w.hp < w.maxHp * 0.7 && w.food > 0) {
        try {
          host.eat();
          did = "eat";
        } catch {
        }
      }
      if (!did && (this.hasSellableMats(w) || this.oreLiquidateBeforeFish(w) || this.hasBagCookables(w))) {
        if (this.trySellUnusedOnce(host, w)) did = "sell";
        else {
          const shop = this.mem(w, "shop");
          if (shop) {
            host.walkTo(shop.x, shop.y);
            did = "walk-shop";
          }
        }
      }
      if (!did && this.beginnerToolsIncomplete(host) && w.coins >= 30) {
        const shop = this.mem(w, "shop");
        if (shop) {
          host.walkTo(shop.x, shop.y);
          did = "re-kit";
        }
      }
      if (!did) {
        const shop = this.mem(w, "shop");
        if (shop) {
          host.walkTo(shop.x, shop.y);
          did = "hub-shop";
        } else if (w.hub) {
          host.walkTo(w.hub.x, w.hub.y);
          did = "hub";
        } else if (w.explore) {
          this.desireXY = { x: w.explore.x, y: w.explore.y };
          host.walkTo(w.explore.x, w.explore.y);
          did = "explore";
        } else if (w.wander) {
          host.walkTo(w.wander.x, w.wander.y);
          did = "wander";
        }
      }
      this.noteAction(`productive quiet \u2014 ${did || "none"} (${why})`);
      host.log(`AUTO: one productive quiet after RELEASE (3012) ${did || "none"} ${why}`);
      this.setStatus(
        host,
        w,
        stance,
        did === "eat" ? "productive quiet \u2014 eat" : did === "sell" || did === "walk-shop" || did === "hub-shop" ? "productive quiet \u2014 sell" : did === "re-kit" ? "productive quiet \u2014 re-kit" : "productive quiet \u2014 hub"
      );
      this.cool = 0;
      return true;
    }
    /**
     * Eng 3011 / t1808 #4: WD / near-stuck first-class — force durable divert + mark
     * immediately (don't wait for clash/thrash life-stain to paint the whole life).
     */
    forceWdFirstClassDivert(host, w, stance, why) {
      this.latchStuck();
      this.latchThrash();
      this.latchClash();
      this.armBreakerExploreCool(1024);
      this.clearFundIntent("tool");
      this.clearFundIntent("food");
      this.stickyPhaseLeaveArmed = true;
      this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
      this.stuckRecentStatus = this.stuckRecentStatus.filter(
        (s) => !/stuck rethink|stuck watchdog|tools fund|tools wander|insta osc|phase cool|FIRST_WEP hold|mob engage|mob kite|lethal|open chest|hatchet|camp-chest|after life escape|wd divert|early osc divert|life-spent divert/i.test(s)
      );
      this.actions = this.actions.filter((s) => !/wd divert|life-spent divert|after life escape/i.test(s));
      const shop = this.mem(w, "shop");
      if (shop) host.walkTo(shop.x, shop.y);
      else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
      else if (w.explore) {
        this.desireXY = { x: w.explore.x, y: w.explore.y };
        host.walkTo(w.explore.x, w.explore.y);
      } else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
      if (!this.wdFirstClassDiverted) {
        this.noteAction(`wd divert \u2014 ${why}`);
        host.log(`AUTO: WD first-class divert (3012) ${why}`);
        this.setStatus(host, w, stance, host.hasTool("pickaxe") ? "gear farm \u2014 wd divert" : "explore \u2014 wd divert");
      } else if (!/wd divert/i.test(this.actions[this.actions.length - 1] || "")) {
        this.noteAction(`wd divert \u2014 ${why}`);
      }
      this.wdFirstClassDiverted = true;
      this.cool = 0;
    }
    /**
    * Eng 3010 / t1806: mark one leave→RELEASE / hierarchy RELEASE / post-RELEASE
    * escape spent for this life. Idempotent. Arms postReleaseCoolExhausted so
    * existing 3008/3009 coolHold gates divert (no new timer — t1800).
    */
    markLifeEscapeSpent(host, why) {
      if (this.lifeEscapeSpent) return;
      this.lifeEscapeSpent = true;
      this.postReleaseCoolExhausted = true;
      this.postReleaseCoolWalkHits = Math.max(this.postReleaseCoolWalkHits, 3);
      host.log(`AUTO: life escape SPENT (3010) ${why}`);
    }
    /** Eng 3010: escape already spent this life (RELEASE/escape or exhaust latch). */
    isLifeEscapeSpent() {
      return this.lifeEscapeSpent || this.postReleaseCoolExhausted;
    }
    /**
     * Eng 3009 / R69 + eng 3010 / t1806: after life escape spent (first RELEASE /
     * post-RELEASE escape) or post-release cool exhaust, cool|leave|release are spent.
     * Do NOT re-arm insta osc — cool / coolHold theater. Early thrash mark + one
     * durable hub/shop divert under existing cool-family bans (t1800 — no new timer).
     * Returns true to consume the tick (walk issued); cool=0 so brain resumes next.
     */
    postExhaustDurableDivert(host, w, stance, why) {
      this.lifeSpentDivertHits++;
      this.latchThrash();
      this.latchClash();
      this.armBreakerExploreCool(1024);
      this.clearFundIntent("tool");
      this.clearFundIntent("food");
      this.sellOreBreakUntil = Math.max(this.sellOreBreakUntil, this.runTicks + 768);
      this.emergToolsBreakUntil = Math.max(this.emergToolsBreakUntil, this.runTicks + 768);
      if (this.trwReenterBanned()) this.rockFindBreakUntil = 0;
      else this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 640);
      this.foodMineBreakUntil = Math.max(this.foodMineBreakUntil, this.runTicks + 640);
      this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 640);
      this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 640);
      this.armPondBreakSticky(1024, true);
      this.stickyPhaseLeaveArmed = true;
      this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
      if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
        this.h1001.phase = "GEAR_FARM";
      } else if (host.hasTool("pickaxe")) {
        this.h1001.phase = "FIRST_WEP";
      }
      this.stuckRecentStatus = this.stuckRecentStatus.filter(
        (s) => !/stuck rethink|insta osc|tools fund sell|tools fund|tools explore|tools wander|tools mine|tools find rock|emerg hub|emerg-tools|FIRST_WEP hold|phase cool|lethal kite|osc cool|post-release cool|post-cool-theater|mono divert|camp-chain|mob engage|mob kite|lethal|open chest|hatchet|camp-chest|after life escape|after cool exhaust|life-spent divert|wd divert|early osc divert|gear farm — after|explore — after/i.test(s)
      );
      this.actions = this.actions.filter(
        (s) => !/stuck rethink|insta osc|tools fund|tools explore|tools wander|emerg hub|FIRST_WEP hold|post-release cool|osc cool|life-spent divert|after life escape|wd divert/i.test(s)
      );
      if (this.lifeSpentDivertHits >= 3) {
        this.noteAction(`divert-product scrub \u2014 ${why}`);
        host.log(`AUTO: life-spent divert armed hits=${this.lifeSpentDivertHits} (3012) free brain ${why}`);
        if (this.trwReenterBanned()) {
          this.clearPhaseIntent();
        } else if (host.hasTool("pickaxe") && !w.hasMetalWeapon && !w.hasStyleWeapon) {
          this.armPhaseIntent(this.h1001.phase === "TOOLS" ? "TOOLS" : "FIRST_WEP", "mine");
        } else if (host.hasTool("pickaxe")) {
          this.armPhaseIntent("GEAR_FARM", "hunt");
        }
        this.cool = 0;
        return false;
      }
      const shop = this.mem(w, "shop");
      if (shop) host.walkTo(shop.x, shop.y);
      else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
      else if (w.explore) {
        this.desireXY = { x: w.explore.x, y: w.explore.y };
        host.walkTo(w.explore.x, w.explore.y);
      } else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
      if (this.lifeSpentDivertHits >= 2) {
        this.noteAction(this.lifeEscapeSpent ? `life-spent divert \u2014 armed (${why})` : `post-exhaust divert \u2014 armed (${why})`);
        host.log(`AUTO: ${this.lifeEscapeSpent ? "life-spent" : "post-exhaust"} divert armed (3012) hits=${this.lifeSpentDivertHits} ${why}`);
        if (this.trwReenterBanned()) {
          this.clearPhaseIntent();
          if (this.afterLifeEscapeCapped) {
            if (!this.actions.some((s) => /after-life-escape-spent/i.test(s))) {
              this.noteAction("after-life-escape-spent");
            }
            this.cool = 0;
            return false;
          }
          this.setStatus(host, w, stance, "explore \u2014 after life escape");
        } else if (host.hasTool("pickaxe") && !w.hasMetalWeapon && !w.hasStyleWeapon) {
          this.armPhaseIntent(this.h1001.phase === "TOOLS" ? "TOOLS" : "FIRST_WEP", "mine");
          this.setStatus(host, w, stance, "phase intent \u2014 mine");
        } else if (host.hasTool("pickaxe")) {
          this.armPhaseIntent("GEAR_FARM", "hunt");
          this.setStatus(host, w, stance, "phase intent \u2014 hunt");
        } else {
          if (this.afterLifeEscapeCapped) {
            if (!this.actions.some((s) => /after-life-escape-spent/i.test(s))) {
              this.noteAction("after-life-escape-spent");
            }
            this.cool = 0;
            return false;
          }
          this.setStatus(host, w, stance, "explore \u2014 after life escape");
        }
        this.cool = 0;
        return true;
      }
      if (!/post-exhaust divert|life-spent divert|after cool exhaust|after life escape|divert-product scrub/i.test(this.actions[this.actions.length - 1] || "")) {
        this.noteAction(this.lifeEscapeSpent ? `life-spent divert \u2014 ${why}` : `post-exhaust divert \u2014 ${why}`);
        host.log(`AUTO: ${this.lifeEscapeSpent ? "life-spent" : "post-exhaust"} durable divert (3012) ${why}`);
      }
      if (this.afterLifeEscapeCapped) {
        if (!this.actions.some((s) => /after-life-escape-spent/i.test(s))) {
          this.noteAction("after-life-escape-spent");
        }
        this.cool = 0;
        return false;
      }
      this.setStatus(
        host,
        w,
        stance,
        host.hasTool("pickaxe") ? this.lifeEscapeSpent ? "gear farm \u2014 after life escape" : "gear farm \u2014 after cool exhaust" : this.lifeEscapeSpent ? "explore \u2014 after life escape" : "explore \u2014 after cool exhaust"
      );
      this.cool = 0;
      return true;
    }
    /**
     * Eng 3003 / R63 + eng 3004 / R64 + eng 3005 / R65: durable cool-hold walk after
     * osc cool divert — no new timer, no re-escalate / no oscillating status spam.
     * Eng 3005: repeated cool-hold OR durable leave already done → one leave/release
     * (t1800 cool→leave→release) so tools-sticky-hold cannot WD-prison after leave.
     */
    coolHoldOscDivert(host, w, stance, why) {
      var _a, _b;
      if (this.isLifeEscapeSpent()) {
        return this.oneProductiveQuietAfterRelease(host, w, stance, why);
      }
      const holdHits = this.statusFamilyHits(
        /osc cool hold|tools-sticky-hold|tools-label-cool-hold|post-cool-theater|pond-sell-latched|sell-latch-hold|tools-sticky-explore/
      );
      if (this.durableLeaveHierarchyReleased || this.postHierarchyReleaseEscapeCount >= 1 || this.statusFamilyHits(/osc cool — leave→release|insta osc — release|pond-cap — release/) >= 1) {
        this.markLifeEscapeSpent(host, `cool-hold-after-release:${why}`);
        return this.oneProductiveQuietAfterRelease(host, w, stance, why);
      }
      if (holdHits >= 3 || this.durableLeaveSettleDone || this.durableLeaveDoneHits >= 1) {
        return this.coolHoldEscalateLeave(host, w, stance, why);
      }
      this.latchThrash();
      this.armBreakerExploreCool(640);
      this.stuckRecentStatus = this.stuckRecentStatus.filter(
        (s) => !/food sell|pond break|food pond|emerg pond|pond-sell|food mine break|phase cool|FIRST_WEP hold|wanderSpin|tools wander|tools fund sell|tools mine|tools find rock|insta osc|pond-cap|pond-break-cap/i.test(s)
      );
      this.actions = this.actions.filter(
        (s) => !/food-sell\/pond-break — prison|pond-cap —|insta osc|wanderSpin hard leave|phase cool|FIRST_WEP hold — wander|tools wander|tools fund sell|tools mine|tools find rock/i.test(s)
      );
      this.stickyPhaseLeaveArmed = true;
      this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
      const shop = this.mem(w, "shop");
      const chest = (_b = (_a = w.seen) == null ? void 0 : _a.chest) != null ? _b : this.mem(w, "chest");
      if (shop) host.walkTo(shop.x, shop.y);
      else if (chest && !this.isGatherTileBlocked(chest.x, chest.y)) host.walkTo(chest.x, chest.y);
      else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
      else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
      else if (w.explore) {
        this.desireXY = { x: w.explore.x, y: w.explore.y };
        host.walkTo(w.explore.x, w.explore.y);
      }
      if (!/pond-cap — cool|insta osc — cool/i.test(this.lastStatus || "")) {
        this.noteAction(`osc cool hold \u2014 ${why}`);
        host.log(`AUTO: osc cool hold divert (3010) ${why}`);
        this.setStatus(host, w, stance, "insta osc \u2014 cool");
      }
      this.cool = 12;
      return true;
    }
    /**
     * Eng 3005 / R65 + eng 3006 / R66: cool-hold prison → one leave (or one
     * leave→release if leave already fired). After release already noted /
     * hierarchyReleased → coolHoldPostReleaseWalk only (no leave→release spam).
     * Reuses cool|leave|release only — no new named timer (t1800).
     */
    coolHoldEscalateLeave(host, w, stance, why) {
      var _a, _b;
      if (this.isLifeEscapeSpent()) {
        return this.oneProductiveQuietAfterRelease(host, w, stance, `leave:${why}`);
      }
      if (this.durableLeaveHierarchyReleased || this.postHierarchyReleaseEscapeCount >= 1 || this.statusFamilyHits(/osc cool — leave→release|insta osc — release|pond-cap — release/) >= 1) {
        this.markLifeEscapeSpent(host, `leave-after-release:${why}`);
        return this.oneProductiveQuietAfterRelease(host, w, stance, `leave:${why}`);
      }
      this.latchThrash();
      this.latchClash();
      this.armBreakerExploreCool(768);
      this.clearFundIntent("tool");
      this.stickyPhaseLeaveArmed = true;
      this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
      this.stuckRecentStatus = this.stuckRecentStatus.filter(
        (s) => !/osc cool hold|tools-sticky|tools-label-cool|post-cool-theater|tools mine|tools find rock|tools wander|phase cool|quiet hold — tools bootstrap|kite cool exit grace|durable leave done|insta osc/i.test(s)
      );
      this.actions = this.actions.filter(
        (s) => !/osc cool hold|tools wander|tools mine|tools find rock|insta osc|phase cool|FIRST_WEP hold — wander/i.test(s)
      );
      if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
        this.h1001.phase = "GEAR_FARM";
      } else if (host.hasTool("pickaxe")) {
        this.h1001.phase = "FIRST_WEP";
      }
      const shop = this.mem(w, "shop");
      const chest = (_b = (_a = w.seen) == null ? void 0 : _a.chest) != null ? _b : this.mem(w, "chest");
      if (shop) host.walkTo(shop.x, shop.y);
      else if (chest && !this.isGatherTileBlocked(chest.x, chest.y)) host.walkTo(chest.x, chest.y);
      else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
      else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
      else if (w.explore) {
        this.desireXY = { x: w.explore.x, y: w.explore.y };
        host.walkTo(w.explore.x, w.explore.y);
      }
      if (this.instaOscLeaveHits >= 1 || this.durableLeaveSettleDone || this.durableLeaveDoneHits >= 1) {
        this.instaOscLeaveArmed = true;
        this.instaOscLeaveHits = Math.max(this.instaOscLeaveHits, 2);
        if (!this.durableLeaveHierarchyReleased) {
          this.markDurableLeaveHierarchyReleased(host, `cool-hold-leave ${why}`);
        }
        this.markLifeEscapeSpent(host, `cool-hold-leave\u2192release:${why}`);
        this.noteAction("osc cool \u2014 leave\u2192release");
        host.log(`AUTO: osc cool hold \u2192 leave/release (3011) ${why}`);
        return this.oneProductiveQuietAfterRelease(host, w, stance, `cool-hold-release:${why}`);
      }
      this.instaOscLeaveArmed = true;
      this.instaOscLeaveHits = Math.max(this.instaOscLeaveHits, 1);
      this.noteAction("osc cool \u2014 leave");
      host.log(`AUTO: osc cool hold \u2192 leave (3010) ${why}`);
      this.setStatus(host, w, stance, "insta osc \u2014 leave");
      this.cool = 12;
      return true;
    }
    /**
     * Eng 3006 / R66 + eng 3007 / R67 + eng 3008 / R68: after release spent —
     * productive cool walk, then exhaust yield once. 3008: life latch so exhaust
     * cannot re-enter; walkHits count every entry (notes were gated by lastStatus).
     * No leave / leave→release / post-RELEASE quiet re-note. Still cool|leave|release (t1800).
     */
    postReleaseCoolPrisonHits() {
      const statusHits = this.statusFamilyHits(
        /tools-label-cool-hold|tools-sticky-hold|insta osc — cool/
      );
      let actionHits = 0;
      for (const s of this.actions) {
        if (/exhaust/i.test(s)) continue;
        if (/post-release cool|tools-label-cool-hold|tools-sticky-hold/i.test(s)) actionHits++;
      }
      return Math.max(statusHits, actionHits);
    }
    coolHoldPostReleaseWalk(host, w, stance, why) {
      var _a, _b, _c, _d;
      if (this.isLifeEscapeSpent()) {
        return this.oneProductiveQuietAfterRelease(host, w, stance, `postrel:${why}`);
      }
      this.postReleaseCoolWalkHits += 1;
      const prisonHits = this.postReleaseCoolPrisonHits();
      if (this.postReleaseCoolWalkHits >= 3 || prisonHits >= 3) {
        this.postReleaseCoolExhausted = true;
        this.lifeEscapeSpent = true;
        this.latchThrash();
        this.latchClash();
        this.clearFundIntent("tool");
        this.clearFundIntent("food");
        this.stickyPhaseLeaveArmed = true;
        this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
        this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 768);
        this.emergToolsBreakUntil = Math.max(this.emergToolsBreakUntil, this.runTicks + 640);
        this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 640);
        this.foodMineBreakUntil = Math.max(this.foodMineBreakUntil, this.runTicks + 640);
        this.sellOreBreakUntil = Math.max(this.sellOreBreakUntil, this.runTicks + 640);
        this.armBreakerExploreCool(1024);
        if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
          this.h1001.phase = "GEAR_FARM";
        } else if (host.hasTool("pickaxe")) {
          this.h1001.phase = "FIRST_WEP";
        }
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/osc cool — leave|osc cool hold|leave→release|quiet hold — post RELEASE|post-RELEASE escape|pond-cap — release|tools-sticky|tools mine|tools find rock|tools wander|insta osc — release|insta osc — cool|post-release cool|FIRST_WEP hold|phase cool|post-cool-theater/i.test(s)
        );
        this.actions = this.actions.filter(
          (s) => !/post-release cool|osc cool — leave|osc cool hold|insta osc —|tools-sticky|tools-label-cool|post-cool-theater|FIRST_WEP hold — wander|phase cool/i.test(s)
        );
        const shop2 = this.mem(w, "shop");
        const chest2 = (_b = (_a = w.seen) == null ? void 0 : _a.chest) != null ? _b : this.mem(w, "chest");
        if (shop2) host.walkTo(shop2.x, shop2.y);
        else if (chest2 && !this.isGatherTileBlocked(chest2.x, chest2.y)) host.walkTo(chest2.x, chest2.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.explore) {
          this.desireXY = { x: w.explore.x, y: w.explore.y };
          host.walkTo(w.explore.x, w.explore.y);
        }
        if (!/post-release cool — exhaust/i.test(this.actions[this.actions.length - 1] || "")) {
          this.noteAction("post-release cool \u2014 exhaust yield");
          host.log(`AUTO: post-release cool exhaust \u2192 yield (3008) ${why}`);
        }
        this.setStatus(host, w, stance, host.hasTool("pickaxe") ? "gear farm \u2014 after cool exhaust" : "explore \u2014 after cool exhaust");
        this.cool = 0;
        return false;
      }
      this.latchThrash();
      this.armBreakerExploreCool(1024);
      this.clearFundIntent("tool");
      this.clearFundIntent("food");
      this.stickyPhaseLeaveArmed = true;
      this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
      this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 768);
      this.emergToolsBreakUntil = Math.max(this.emergToolsBreakUntil, this.runTicks + 640);
      this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 640);
      this.foodMineBreakUntil = Math.max(this.foodMineBreakUntil, this.runTicks + 640);
      this.sellOreBreakUntil = Math.max(this.sellOreBreakUntil, this.runTicks + 640);
      if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
        this.h1001.phase = "GEAR_FARM";
      } else if (host.hasTool("pickaxe")) {
        this.h1001.phase = "FIRST_WEP";
      }
      this.stuckRecentStatus = this.stuckRecentStatus.filter(
        (s) => !/osc cool — leave|osc cool hold|leave→release|quiet hold — post RELEASE|post-RELEASE escape|pond-cap — release|tools-sticky|tools mine|tools find rock|tools wander|insta osc — release/i.test(s)
      );
      this.actions = this.actions.filter(
        (s) => !/osc cool — leave→release|osc cool — leave|quiet hold — post RELEASE|post-RELEASE escape|pond-cap — release|insta osc — release/i.test(s)
      );
      const shop = this.mem(w, "shop");
      const chest = (_d = (_c = w.seen) == null ? void 0 : _c.chest) != null ? _d : this.mem(w, "chest");
      if (shop) host.walkTo(shop.x, shop.y);
      else if (chest && !this.isGatherTileBlocked(chest.x, chest.y)) host.walkTo(chest.x, chest.y);
      else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
      else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
      else if (w.explore) {
        this.desireXY = { x: w.explore.x, y: w.explore.y };
        host.walkTo(w.explore.x, w.explore.y);
      }
      if (!/insta osc — cool|post-release cool/i.test(this.lastStatus || "")) {
        this.noteAction(`post-release cool \u2014 ${why}`);
        host.log(`AUTO: post-release cool walk (3008) ${why}`);
        this.setStatus(host, w, stance, "insta osc \u2014 cool");
      }
      this.cool = 14;
      return true;
    }
    /**
     * Eng 3001 / R61 + eng 3002 / R62: soft-end pondBreak + cool family + hub.
     * 3002: do NOT reset pondBreakCapHits (cc99yu release↔pond forever).
     * No new timer layer (t1800).
     */
    hardenInstaOscCool(host, w, stance, pairKey, label) {
      var _a, _b;
      if (this.isLifeEscapeSpent()) {
        return this.postExhaustDurableDivert(host, w, stance, `insta-${label}:${pairKey}`);
      }
      this.latchThrash();
      this.latchClash();
      this.pondBreakUntil = Math.min(this.pondBreakUntil, this.runTicks);
      if (this.pondBreakCapHits > 0) this.pondBreakCapHits = Math.max(this.pondBreakCapHits, 2);
      this.armBreakerExploreCool(1280);
      this.foodMineBreakUntil = Math.max(this.foodMineBreakUntil, this.runTicks + 1280);
      this.sellOreBreakUntil = Math.max(this.sellOreBreakUntil, this.runTicks + 1280);
      this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 1280);
      this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 1280);
      this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 1280);
      this.emergToolsBreakUntil = Math.max(this.emergToolsBreakUntil, this.runTicks + 1024);
      this.durableLeaveSettleDone = true;
      this.durableLeaveSettleUntil = Math.min(this.durableLeaveSettleUntil, this.runTicks);
      this.quietBreakEscalateUntil = Math.min(this.quietBreakEscalateUntil, this.runTicks);
      this.instaOscLeaveArmed = true;
      this.instaOscPairKey = pairKey;
      this.instaOscLeaveHits = Math.max(this.instaOscLeaveHits, label === "cool" ? 3 : 2);
      this.stuckRecentStatus = this.stuckRecentStatus.filter(
        (s) => !/pond-break-cap|pond-cap|FIRST_WEP hold|phase cool|wanderSpin|tools wander|insta osc|hold-wander|leave-spin|post-RELEASE|quiet hold — post RELEASE/i.test(s)
      );
      this.actions = this.actions.filter((s) => !/insta osc|pond-break-cap|pond-cap —/i.test(s));
      this.stickyPhaseLeaveArmed = true;
      this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
      const shop = this.mem(w, "shop");
      const chest = (_b = (_a = w.seen) == null ? void 0 : _a.chest) != null ? _b : this.mem(w, "chest");
      if (shop) host.walkTo(shop.x, shop.y);
      else if (chest && !this.isGatherTileBlocked(chest.x, chest.y)) host.walkTo(chest.x, chest.y);
      else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
      else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
      else if (w.explore) {
        this.desireXY = { x: w.explore.x, y: w.explore.y };
        host.walkTo(w.explore.x, w.explore.y);
      }
      if (label === "release") {
        this.markLifeEscapeSpent(host, `insta-osc-release:${pairKey}`);
        this.noteAction("insta osc \u2014 release");
        host.log(`AUTO: insta osc \u2014 release [${pairKey}] (3011)`);
        return this.oneProductiveQuietAfterRelease(host, w, stance, `insta-release:${pairKey}`);
      } else {
        this.noteAction("insta osc \u2014 cool");
        host.log(`AUTO: insta osc \u2014 cool divert [${pairKey}] (3002)`);
        this.setStatus(host, w, stance, "insta osc \u2014 cool");
        this.cool = 16;
      }
      return true;
    }
    releaseInstaOscPrison(host, w, stance, pairKey) {
      return this.hardenInstaOscCool(host, w, stance, pairKey, "release");
    }
    /**
     * Eng 3013 / R73: cool the oscillating productive pair via existing cool family
     * (pond/sell/rock/emerg/explore). No new named timer (t1800).
     */
    applyInstaOscPairCool(fams) {
      const joined = fams.join(" ");
      this.latchThrash();
      if (fams.length >= 2) this.latchClash();
      this.armBreakerExploreCool(1024);
      if (/pond|fish|sell|food mine|food sell|enroute pond|find pond|find shop|sell ore|sell trim|pond-cap|food find shop/i.test(joined)) {
        this.armPondBreakSticky(1024, true);
        this.foodMineBreakUntil = Math.max(this.foodMineBreakUntil, this.runTicks + 1024);
        this.sellOreBreakUntil = Math.max(this.sellOreBreakUntil, this.runTicks + 1024);
        if (/sell/.test(joined) && /pond|fish|shop|find shop/.test(joined)) this.pondSellPrisonLatched = true;
        if (/sell|shop|find shop|sell ore/.test(joined)) this.pondBreakCapHits = Math.max(this.pondBreakCapHits, 2);
      }
      if (/tools|explore|kite|lethal|sticky|pickaxe|emerg|wander|phase|quiet hold|first.?wep|kite cool|leave-spin|hold-wander|phase-cool|tools-wander|tools-rock|fund hatchet|fund |mine|find rock|rock osc|rock thrash|rock-flee|rock-seek/i.test(joined)) {
        this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 1024);
        this.emergToolsBreakUntil = Math.max(this.emergToolsBreakUntil, this.runTicks + 1024);
        this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 1024);
        this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 1024);
        if (this.isLifeEscapeSpent() && this.lifeSpentDivertHits >= 2) {
          if (this.lifeSpentDivertHits >= 4) this.rockFindBreakUntil = 0;
          else this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 192);
        } else {
          this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 1280);
        }
      }
      if (/chest|hatchet|camp-chest|camp-chain|camp-tree|kit hatchet|kit cool/i.test(joined)) {
        this.hatchetChestBreakUntil = Math.max(this.hatchetChestBreakUntil, this.runTicks + 1024);
        this.campChainBreakUntil = Math.max(this.campChainBreakUntil, this.runTicks + 1024);
        this.chopBreakUntil = Math.max(this.chopBreakUntil, this.runTicks + 768);
      }
    }
    /**
     * Eng 3000 / t1800 cool|leave|release: insta osc → latch thrash (+clash),
     * cool the pair (forbid re-arm via existing cool family), leave once.
     * Eng 3001 / R61: second fire while cool → release (not re-leave theater).
     * Eng 3002 / R62: once leave fired, next insta → RELEASE even if cool expired
     * (y8mq9b/5msae7 leave↔release after cool window); after one RELEASE → cool
     * divert only (no re-leave / re-release spam). No new timer stack.
     * Eng 3013 / R73: life-spent scrub cools pair + leave (not free-brain ABA).
     */
    tryInstaOscBreak(host, w, stance) {
      var _a, _b, _c, _d;
      const hit = this.detectInstaOsc();
      if (!hit) return false;
      const pairKey = hit.fams.slice(0, 4).join("|");
      if (this.isLifeEscapeSpent()) {
        if (this.lifeSpentDivertHits >= 2) {
          this.applyInstaOscPairCool(hit.fams);
          const ban2 = new RegExp(hit.fams.map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "i");
          this.stuckRecentStatus = this.stuckRecentStatus.filter((s) => !ban2.test(this.statusFamKey(s)) && !this.isDivertProductFam(this.statusFamKey(s)));
          this.actions = this.actions.filter((s) => !ban2.test(this.statusFamKey(s)) && !/divert-product scrub/i.test(s));
          const trwCombat = /tools-rock|tools-wander|tools explore|find rock|rock thrash|rock osc|approach kite|mob kite|mob engage|lethal|emerg hub|camp-chest|hatchet|chest soft|camp-chain|camp-rock|camp-tree/i.test(pairKey);
          if (trwCombat) {
            this.stuckRecentStatus = this.stuckRecentStatus.filter(
              (s) => !/tools wander|tools explore|tools find rock|tools mine|rock thrash|rock osc|approach kite|mob kite|mob engage|lethal|emerg hub|camp-chest|hatchet|chest|camp-chain|camp-rock|camp-tree|tools-rock-wander/i.test(s)
            );
            this.actions = this.actions.filter(
              (s) => !/tools-rock-wander prison|tools wander|tools find rock|rock thrash/i.test(s)
            );
          }
          this.noteAction(trwCombat ? `divert-product scrub \u2014 seals:${pairKey}` : `divert-product scrub \u2014 insta:${pairKey}`);
          if (this.lifeSpentDivertHits >= 5 || trwCombat) {
            if (trwCombat && this.trwReenterBanned()) {
              return this.durableTrwBanWalk(host, w, stance, "trw-reenter-ban");
            }
            if (trwCombat) this.noteAction("tools-rock-wander prison");
            if (trwCombat) {
              this.rockFindBreakUntil = 0;
              this.markTrwPrisonClear(host, pairKey);
              if (this.trwReenterBanned()) {
                return this.durableTrwBanWalk(host, w, stance, "trw-reenter-ban");
              }
            }
            host.log(`AUTO: scrub TRW clear-seal divert hits=${this.lifeSpentDivertHits} [${pairKey}] (3016)`);
            if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
              this.armPhaseIntent("GEAR_FARM", "hunt");
            } else if (host.hasTool("pickaxe") && !this.trwReenterBanned()) {
              this.armPhaseIntent(this.h1001.phase === "TOOLS" ? "TOOLS" : "FIRST_WEP", "mine");
            }
            const shop2 = this.mem(w, "shop");
            const rock = (_b = (_a = w.seen) == null ? void 0 : _a.rock) != null ? _b : this.mem(w, "rock");
            if (trwCombat && rock && host.hasTool("pickaxe") && !this.isGatherTileBlocked(rock.x, rock.y) && this.lifeSpentDivertHits < 4 && this.trwPrisonClearHits < 1) {
              this.desireXY = { x: rock.x, y: rock.y };
              host.walkTo(rock.x, rock.y);
              this.setStatus(host, w, stance, "phase intent \u2014 mine");
            } else if (this.afterLifeEscapeCapped) {
              if (shop2) host.walkTo(shop2.x, shop2.y);
              else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
              else if (w.explore) {
                this.desireXY = { x: w.explore.x, y: w.explore.y };
                host.walkTo(w.explore.x, w.explore.y);
              } else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
              if (this.emitPostLifeEscapeOrFree(host, w, stance, false)) return true;
              this.cool = 0;
              return false;
            } else if (shop2) {
              host.walkTo(shop2.x, shop2.y);
              this.setStatus(
                host,
                w,
                stance,
                host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon) ? "phase intent \u2014 hunt" : host.hasTool("pickaxe") && this.trwPrisonClearHits < 1 ? "phase intent \u2014 mine" : "explore \u2014 after life escape"
              );
            } else if (w.hub) {
              host.walkTo(w.hub.x, w.hub.y);
              this.setStatus(
                host,
                w,
                stance,
                host.hasTool("pickaxe") && this.trwPrisonClearHits < 1 ? "phase intent \u2014 mine" : "explore \u2014 after life escape"
              );
            } else if (w.explore) {
              this.desireXY = { x: w.explore.x, y: w.explore.y };
              host.walkTo(w.explore.x, w.explore.y);
              this.setStatus(host, w, stance, "explore \u2014 after life escape");
            } else if (w.wander) {
              host.walkTo(w.wander.x, w.wander.y);
            }
            this.cool = 0;
            return true;
          }
          return this.postExhaustDurableDivert(host, w, stance, `scrub-leave:${pairKey}`);
        }
        return this.postExhaustDurableDivert(host, w, stance, `insta-osc:${pairKey}`);
      }
      if (this.instaOscLeaveHits >= 2) {
        return this.hardenInstaOscCool(host, w, stance, pairKey, "cool");
      }
      if (this.instaOscLeaveArmed || this.instaOscLeaveHits >= 1) {
        return this.releaseInstaOscPrison(host, w, stance, pairKey);
      }
      if (this.earlyOscDivertHits < 1) {
        const joined0 = hit.fams.join(" ");
        if (/pond|fish|sell|food mine|food sell|enroute pond|find pond|find shop|sell ore|sell trim|pond-cap/i.test(joined0)) {
          this.armPondBreakSticky(768, true);
          this.foodMineBreakUntil = Math.max(this.foodMineBreakUntil, this.runTicks + 768);
          this.sellOreBreakUntil = Math.max(this.sellOreBreakUntil, this.runTicks + 768);
          if (/sell/.test(joined0) && /pond|fish/.test(joined0)) this.pondSellPrisonLatched = true;
        }
        if (/tools|explore|kite|lethal|sticky|pickaxe|emerg|wander|phase|quiet hold|first.?wep|kite cool|leave-spin|hold-wander|phase-cool|tools-wander/i.test(joined0)) {
          this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 768);
          this.emergToolsBreakUntil = Math.max(this.emergToolsBreakUntil, this.runTicks + 640);
          this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 768);
          this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 768);
        }
        return this.earlyOscDurableDivert(host, w, stance, hit.kind, pairKey);
      }
      this.latchThrash();
      if (hit.fams.length >= 2) this.latchClash();
      this.instaOscPairKey = pairKey;
      this.instaOscLeaveArmed = true;
      this.instaOscLeaveHits++;
      this.armBreakerExploreCool(768);
      const joined = hit.fams.join(" ");
      if (/pond|fish|sell|food mine|food sell|enroute pond|find pond|find shop|sell ore|sell trim|pond-cap/i.test(joined)) {
        this.armPondBreakSticky(768, true);
        this.foodMineBreakUntil = Math.max(this.foodMineBreakUntil, this.runTicks + 768);
        this.sellOreBreakUntil = Math.max(this.sellOreBreakUntil, this.runTicks + 768);
        if (/sell/.test(joined) && /pond|fish/.test(joined)) this.pondSellPrisonLatched = true;
      }
      if (/tools|explore|kite|lethal|sticky|pickaxe|emerg|wander|phase|quiet hold|first.?wep|kite cool|leave-spin|hold-wander|phase-cool|tools-wander/i.test(joined)) {
        this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 768);
        this.emergToolsBreakUntil = Math.max(this.emergToolsBreakUntil, this.runTicks + 640);
        this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 768);
        this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 768);
      }
      const ban = new RegExp(hit.fams.map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "i");
      this.stuckRecentStatus = this.stuckRecentStatus.filter((s) => !ban.test(this.statusFamKey(s)));
      this.noteAction(`insta osc ${hit.kind} \u2014 leave`);
      host.log(`AUTO: insta osc ${hit.kind} [${pairKey}] \u2014 cool+leave (3011 after early divert)`);
      this.stickyPhaseLeaveArmed = true;
      this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
      const shop = this.mem(w, "shop");
      const chest = (_d = (_c = w.seen) == null ? void 0 : _c.chest) != null ? _d : this.mem(w, "chest");
      if (shop) host.walkTo(shop.x, shop.y);
      else if (chest && !this.isGatherTileBlocked(chest.x, chest.y)) host.walkTo(chest.x, chest.y);
      else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
      else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
      else if (w.explore) {
        this.desireXY = { x: w.explore.x, y: w.explore.y };
        host.walkTo(w.explore.x, w.explore.y);
      }
      this.setStatus(host, w, stance, `insta osc \u2014 leave`);
      this.cool = 12;
      return true;
    }
    /**
     * Eng 2038 / R8 + t1760: arm breakers from status oscillation alone
     * (before IDLE_STUCK_TICKS). Returns true if a break walk was issued.
     */
    tryStatusOscBreak(host, w, stance) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G;
      if (!this.afterLifeEscapeCapped) {
        const ring = this.actions.slice(-8);
        const leaveN = ring.filter((s) => /tools wander thrash/i.test(s)).length;
        const prisonN = ring.filter((s) => /tools-rock-wander prison/i.test(s)).length;
        if (leaveN >= 2 && prisonN >= 1 || leaveN >= 1 && prisonN >= 2 || this.trwReenterBanned()) {
          if (leaveN + prisonN >= 2 || this.trwReenterBanned()) {
            this.trwReenterBan = true;
            if (leaveN >= 1 && prisonN >= 1) {
              return this.durableTrwBanWalk(host, w, stance, "trw-wander-aba");
            }
            if (this.trwReenterBanned() && (leaveN + prisonN >= 1 || /tools-rock-wander|tools wander thrash|phase intent — mine/i.test(this.lastStatus || ""))) {
              return this.durableTrwBanWalk(host, w, stance, "trw-reenter-ban");
            }
          }
        }
      }
      if (!this.afterLifeEscapeCapped) {
        const ale = this.statusFamilyHits(/explore — after life escape|gear farm — after life escape/);
        const rockSeek = this.statusFamilyHits(/tools find rock|tools mine|tools fund/);
        const banNotes = this.actions.slice(-8).filter((s) => /trw-reenter-ban|trw-wander-aba|after-life-escape-cap/i.test(s)).length;
        if (ale >= 5 || this.trwReenterBanned() && rockSeek >= 2 || banNotes >= 1 && rockSeek >= 2 || this.statusOscPair(/after life escape/, /tools find rock|tools mine|tools fund/)) {
          this.trwReenterBan = true;
          this.latchThrash();
          return this.durableTrwBanWalk(host, w, stance, ale >= 5 ? "after-life-escape-cap" : "trw-reenter-ban");
        }
      }
      if (this.tryInstaOscBreak(host, w, stance)) return true;
      if (this.tryPhaseIntentHold(host, w, stance)) return true;
      if (this.isLifeEscapeSpent() && (this.statusFamilyHits(/stuck rethink/) >= 3 || this.statusFamilyHits(/tools fund sell|tools fund sell mats/) >= 3 || this.statusFamilyHits(/emerg hub|emerg-tools/) >= 3 || this.statusFamilyHits(/tools explore|FIRST_WEP hold/) >= 4 || this.statusFamilyHits(/tools mine|tools find rock/) >= 4 || this.statusFamilyHits(/lethal kite/) >= 5 || this.statusFamilyHits(/enroute pond|food fish|find pond/) >= 4 || this.statusFamilyHits(/food sell ore|food find shop/) >= 4 || this.statusFamilyHits(/tools fund hatchet|tools fund /) >= 4 || this.statusOscPair(/enroute pond|find pond/, /food fish/) || this.statusOscPair(/tools mine|tools find rock/, /tools fund|lethal kite/) || this.statusOscPair(/food sell ore|sell ore/, /food find shop|find shop/) || this.statusFamilyHits(/tools wander thrash|rock find thrash|rock thrash|rock osc/) >= 3 || this.statusFamilyHits(/tools explore|tools find rock|tools wander/) >= 5 || this.statusOscPair(/tools explore|tools wander/, /tools find rock|rock thrash|rock osc/) || this.statusOscPair(/approach kite|mob kite|lethal kite/, /mob engage|mob kite outlook|lethal cover|emerg hub/) || this.statusFamilyHits(/camp-chest|hatchet\/chest|hatchet osc|camp-chain osc/) >= 3 || this.statusOscPair(/camp-chest|hatchet\/chest|open chest/, /hatchet osc|tools hatchet|kit hatchet|camp-chain/))) {
        if (this.trwReenterBanned()) {
          if (this.afterLifeEscapeCapped) return false;
          if (this.durableTrwBanWalk(host, w, stance, "trw-reenter-ban")) return true;
          return false;
        }
        this.noteAction("tools-rock-wander prison");
        if (this.lifeSpentDivertHits >= 2) {
          this.rockFindBreakUntil = 0;
          this.markTrwPrisonClear(host, "post-ex-mono");
          if (this.trwReenterBanned()) {
            if (this.afterLifeEscapeCapped) return false;
            if (this.durableTrwBanWalk(host, w, stance, "trw-reenter-ban")) return true;
            return false;
          }
        }
        return this.postExhaustDurableDivert(host, w, stance, "post-ex-mono");
      }
      if (this.oscCoolDivertActive() && (this.statusFamilyHits(/tools wander|tools explore/) >= 3 || this.statusFamilyHits(/tools fund sell|tools fund sell mats/) >= 3 || this.statusFamilyHits(/tools mine|tools find rock/) >= 4 || this.statusFamilyHits(/phase cool|FIRST_WEP hold|wanderSpin hard leave/) >= 3 || this.statusFamilyHits(/food-sell\/pond-break — prison|pond-cap — cool/) >= 1 || this.statusFamilyHits(/osc cool hold/) >= 2)) {
        return this.coolHoldOscDivert(host, w, stance, "post-cool-theater");
      }
      const st = (this.lastStatus || "").toLowerCase();
      const pondOsc = this.statusOscPair(/enroute pond|food last farm|round-trip pond/, /food fish|util fish|(^|\s)fish(\s|$)/) || this.statusOscPair(/find pond/, /enroute pond|food fish|remembered door|door through|door open/) || this.statusOscPair(/find shop|sell ore|sell trim/, /door through|door open|remembered door/) || /find pond|find shop/i.test(st) && this.stuckRecentTiles.length >= 6 || /find pond|find shop|door through|door open|sell trim/i.test(st) && this.doorOscStreak >= 2 || this.findPondMonoStreak >= 8;
      if (pondOsc && !this.pondBreakActive()) {
        this.pondRethinks = 0;
        this.latchThrash();
        if (this.doorOscStreak >= 2 || this.findPondMonoStreak >= 8) this.latchStuck();
        this.findPondMonoStreak = 0;
        this.armPondBreakSticky(768, true);
        if (this.lastFoodFarm) {
          this.noteGatherFail(this.lastFoodFarm.x, this.lastFoodFarm.y);
          this.lastFoodFarm = null;
          this.foodFarmSoftBlocks = 0;
        }
        const pondMem = (_a = this.mem(w, "pond")) != null ? _a : this.resolvePond(w);
        if (pondMem) this.noteGatherFail(pondMem.x, pondMem.y);
        this.dropEnroutePonds();
        this.noteGatherFail(w.tile.x, w.tile.y);
        this.doorSeenUntil = this.runTicks + 120;
        this.noteAction("status osc pond \u2014 break");
        host.log("AUTO: status osc pond/fish/find-pond \u2014 break (2085)");
        if (this.shouldEscalatePondBreakPrison(8)) {
          return this.escalatePondBreakPrison(host, w, stance, "pondOsc");
        }
        if (host.hasTool("pickaxe")) {
          const live = (_c = (_b = w.seen) == null ? void 0 : _b.rock) != null ? _c : this.mem(w, "rock");
          if (live && !this.isGatherTileBlocked(live.x, live.y)) {
            this.setStatus(host, w, stance, "pond osc \u2014 mine");
            if (this.walkToTile(host, live.x, live.y) || this.tryGather(host, w, stance, "pond osc \u2014 mine")) {
              this.cool = 4;
              return true;
            }
          }
        }
        this.armBreakerExploreCool(640);
        if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        this.setStatus(host, w, stance, "pond osc \u2014 wander");
        this.cool = 4;
        return true;
      }
      if (!this.rockFindBreakActive() && (this.statusOscPair(/tools find rock/, /tools mine/) || this.statusOscPair(/tools find rock|tools mine/, /tools explore|tools wander/) || this.statusOscPair(/rock osc/, /tools explore|tools find rock|tools mine|tools wander/))) {
        this.rockFindRethinks = 0;
        this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 480);
        const rk = (_e = (_d = w.seen) == null ? void 0 : _d.rock) != null ? _e : this.mem(w, "rock");
        if (rk) this.blockGatherTile(rk.x, rk.y);
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/tools find rock|tools mine|tools explore|tools wander|rock osc|status osc rock/i.test(s)
        );
        this.noteAction("status osc rock \u2014 wander");
        host.log("AUTO: status osc tools rock/mine \u2014 sticky break (2062)");
        this.armBreakerExploreCool(640);
        if (host.hasTool("hatchet")) {
          const tree = (_g = this.mem(w, "tree")) != null ? _g : (_f = w.seen) == null ? void 0 : _f.tree;
          if (tree && !this.isGatherTileBlocked(tree.x, tree.y)) {
            this.setStatus(host, w, stance, "rock osc \u2014 chop");
            if (this.walkToTile(host, tree.x, tree.y) || this.tryGather(host, w, stance, "rock osc \u2014 chop")) {
              this.cool = 4;
              return true;
            }
          }
        }
        if (host.hasTool("rod")) {
          const pond = this.resolvePond(w);
          if (pond && !this.isGatherTileBlocked(pond.x, pond.y) && !this.pondBreakActive()) {
            this.setStatus(host, w, stance, "rock osc \u2014 fish");
            if (this.walkToTile(host, pond.x, pond.y) || this.tryGather(host, w, stance, "rock osc \u2014 fish")) {
              this.cool = 4;
              return true;
            }
          }
        }
        if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon || w.oreCount >= 3)) {
          this.clearFundIntent("tool");
          this.h1001.phase = w.hasMetalWeapon || w.hasStyleWeapon ? "GEAR_FARM" : "FIRST_WEP";
        }
        if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        this.setStatus(host, w, stance, "rock osc \u2014 wander");
        this.cool = 8;
        return true;
      }
      if (!this.sellOreBreakActive() && (this.statusOscPair(/sell ore/, /find shop/) || this.statusOscPair(/sell-ore osc|mono divert/, /sell ore|find shop/))) {
        this.bagFindShopUntil = 0;
        this.bagFindShopTile = "";
        this.oreLiqSameTile = 0;
        this.oreLiqTile = "";
        this.sellOreKeepBlockUntil = this.runTicks + 512;
        this.sellOreBreakUntil = this.runTicks + 512;
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/sell ore|find shop|sell-ore osc|status osc sell-ore|mono divert/i.test(s)
        );
        this.noteGatherFail(w.tile.x, w.tile.y);
        const shop = this.mem(w, "shop");
        if (shop) this.noteGatherFail(shop.x, shop.y);
        this.noteAction("status osc sell-ore/shop \u2014 explore");
        host.log("AUTO: status osc sell ore/find shop \u2014 sticky break (2046)");
        this.clearFundIntent("food");
        if (this.pondBreakArms < 1 && !this.foodUrgency(w) && !this.calmFoodHighPri(w, stance)) {
          this.pondBreakUntil = Math.min(this.pondBreakUntil, this.runTicks);
        }
        if (host.hasTool("rod") && !this.pondBreakActive()) {
          const pond = this.resolvePond(w);
          if (pond && !this.isGatherTileBlocked(pond.x, pond.y)) {
            this.setStatus(host, w, stance, "sell-ore osc \u2014 fish");
            if (this.walkToTile(host, pond.x, pond.y) || this.tryGather(host, w, stance, "sell-ore osc \u2014 fish")) {
              this.cool = 8;
              return true;
            }
          }
        }
        if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        this.setStatus(host, w, stance, "sell-ore osc \u2014 explore");
        this.cool = 16;
        return true;
      }
      if (this.pondSellPrisonLatched || this.statusOscPair(/food sell/, /pond break — wander|food pond break|emerg pond break/) || this.statusOscPair(/food mine break/, /pond break — wander|food pond break|emerg pond break/) || this.statusFamilyHits(/food sell/) >= 4 && this.statusFamilyHits(/pond break — wander|food pond break|emerg pond break/) >= 4 || this.statusFamilyHits(/food mine break/) >= 4 && this.statusFamilyHits(/pond break — wander|food pond break|emerg pond break/) >= 4) {
        this.latchThrash();
        this.latchClash();
        this.pondSellPrisonLatched = true;
        if (this.pondBreakCapHits >= 2 || this.instaOscLeaveHits >= 2 || this.oscCoolDivertActive()) {
          return this.coolHoldOscDivert(host, w, stance, "pond-sell-latched");
        }
        this.armPondBreakSticky(2048, true);
        this.foodMineBreakUntil = Math.max(this.foodMineBreakUntil, this.runTicks + 1536);
        this.sellOreBreakUntil = Math.max(this.sellOreBreakUntil, this.runTicks + 1536);
        this.sellOreKeepBlockUntil = Math.max(this.sellOreKeepBlockUntil, this.runTicks + 1536);
        this.dropEnroutePonds();
        this.clearFundIntent("food");
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/food sell|pond break|food pond|emerg pond|pond-sell osc|food mine break/i.test(s)
        );
        this.noteAction("status osc food-sell/pond-break \u2014 prison");
        host.log("AUTO: status osc food sell \u2194 pond break \u2014 prison escalate (2090)");
        return this.escalatePondBreakPrison(host, w, stance, "pond-sell-2090");
      }
      if (this.statusOscPair(/round-trip rock|round-trip tree/, /sell trim/) || this.statusOscPair(/util chop|util mine/, /sell trim/) || this.statusOscPair(/sell trim/, /(?:^|\s)fish(?:\s|$)|gear score|explore|round-trip/) || this.statusOscPair(/bag sell trim/, /explore|fish|gear score/) || this.statusFamilyHits(/sell trim/) >= 4 && this.statusFamilyHits(/(?:^|\s)fish(?:\s|$)|gear score|explore|round-trip rock|round-trip tree/) >= 2) {
        this.sellTrimStickyUntil = 0;
        this.sellTrimEmptyUntil = Math.max(this.sellTrimEmptyUntil, this.runTicks + 160);
        this.sellTrimNoSellStreak = 0;
        this.chopBreakUntil = Math.max(this.chopBreakUntil, this.runTicks + 96);
        this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 96);
        this.campChainBreakUntil = Math.max(this.campChainBreakUntil, this.runTicks + 256);
        this.latchThrash();
        this.latchClash();
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/sell trim|bag sell trim|camp-trim osc|fish|gear score|round-trip/i.test(s)
        );
        this.noteAction("status osc camp/trim \u2014 explore");
        host.log("AUTO: status osc sell-trim/fish|explore|rock \u2014 break (2059)");
        if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        this.setStatus(host, w, stance, "camp-trim osc \u2014 explore");
        this.h1001.phase = "GEAR_FARM";
        this.cool = 10;
        return true;
      }
      if (!this.campChainBreakActive() && (this.statusOscPair(/round-trip tree/, /util chop|explore/) || this.statusOscPair(/util chop/, /round-trip tree|explore/) || this.statusFamilyHits(/round-trip tree|util chop/) >= 4 || this.statusFamilyHits(/round-trip tree/) >= 3 || this.campChainSameHits >= 2 && /round-trip tree/i.test(this.lastStatus || ""))) {
        this.campChainBreakUntil = this.runTicks + 768;
        this.chopBreakUntil = Math.max(this.chopBreakUntil, this.runTicks + 512);
        this.kiteCoolMineBanUntil = Math.max(this.kiteCoolMineBanUntil, this.runTicks + 768);
        this.kiteCoolMineKey = "";
        this.kiteCoolMineHits = 0;
        this.campChainSameKey = "";
        this.campChainSameHits = 0;
        const tree = (_j = (_i = (_h = w.seen) == null ? void 0 : _h.tree) != null ? _i : this.mem(w, "tree")) != null ? _j : this.lastTree;
        if (tree) this.blockGatherTile(tree.x, tree.y);
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/round-trip tree|util chop|camp-tree osc|camp-chain osc/i.test(s)
        );
        this.noteAction("status osc camp-tree \u2014 wander");
        host.log("AUTO: status osc round-trip tree/util chop \u2014 break (2065)");
        this.armBreakerExploreCool(768);
        if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        this.setStatus(host, w, stance, "camp-tree osc \u2014 wander");
        this.cool = 14;
        return true;
      }
      if (!this.campChainBreakActive() && (this.statusOscPair(/round-trip shop/, /explore/) || this.statusFamilyHits(/round-trip shop/) >= 5)) {
        this.campChainBreakUntil = this.runTicks + 512;
        this.sellOreBreakUntil = Math.max(this.sellOreBreakUntil, this.runTicks + 384);
        const shop = this.mem(w, "shop");
        if (shop) this.noteGatherFail(shop.x, shop.y);
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/round-trip shop|camp-shop osc|camp-chain osc/i.test(s)
        );
        this.noteAction("status osc camp-shop \u2014 wander");
        host.log("AUTO: status osc round-trip shop/explore \u2014 break (2062)");
        this.armBreakerExploreCool(640);
        if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        this.setStatus(host, w, stance, "camp-shop osc \u2014 wander");
        this.cool = 14;
        return true;
      }
      if (!this.campChainBreakActive() && (this.statusOscPair(/round-trip rock/, /explore|util mine/) || this.statusOscPair(/util mine/, /round-trip rock|explore/) || this.statusFamilyHits(/round-trip rock|util mine/) >= 3 || this.statusFamilyHits(/round-trip rock/) >= 3 || this.campChainSameHits >= 2 && /round-trip rock/i.test(this.lastStatus || ""))) {
        this.campChainBreakUntil = this.runTicks + 768;
        this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 640);
        this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 512);
        this.kiteCoolMineBanUntil = Math.max(this.kiteCoolMineBanUntil, this.runTicks + 768);
        this.kiteCoolMineKey = "";
        this.kiteCoolMineHits = 0;
        this.campChainSameKey = "";
        this.campChainSameHits = 0;
        const rk = (_l = (_k = w.seen) == null ? void 0 : _k.rock) != null ? _l : this.mem(w, "rock");
        if (rk) this.blockGatherTile(rk.x, rk.y);
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/round-trip rock|util mine|camp-rock osc|camp-chain osc/i.test(s)
        );
        this.noteAction("status osc camp-rock \u2014 wander");
        host.log("AUTO: status osc round-trip rock/util mine \u2014 break (2065)");
        this.armBreakerExploreCool(768);
        if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        this.setStatus(host, w, stance, "camp-rock osc \u2014 wander");
        this.cool = 16;
        return true;
      }
      if (!this.campChainBreakActive() && (this.statusOscPair(/round-trip chest/, /open chest|explore/) || this.statusOscPair(/open chest/, /round-trip chest|explore/) || this.statusFamilyHits(/round-trip chest|open chest/) >= 4 || this.statusFamilyHits(/round-trip chest/) >= 3 || this.campChainSameHits >= 2 && /round-trip chest/i.test(this.lastStatus || ""))) {
        this.campChainBreakUntil = this.runTicks + 768;
        this.hatchetChestBreakUntil = Math.max(this.hatchetChestBreakUntil, this.runTicks + 640);
        this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 512);
        this.campChainSameKey = "";
        this.campChainSameHits = 0;
        const ch = (_n = (_m = w.seen) == null ? void 0 : _m.chest) != null ? _n : this.mem(w, "chest");
        if (ch) this.softBlockChest(host, w, ch.x, ch.y, "camp-chest osc");
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/round-trip chest|open chest|camp-chest osc|camp-chain osc|camp-chain same/i.test(s)
        );
        this.noteAction("status osc camp-chest \u2014 wander");
        host.log("AUTO: status osc round-trip chest/open chest \u2014 break (2062)");
        this.armBreakerExploreCool(768);
        if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        this.setStatus(host, w, stance, "camp-chest osc \u2014 wander");
        this.cool = 16;
        return true;
      }
      if (this.statusFamilyHits(/sticky progress — mine|sticky progress mine/) >= 4 || this.statusOscPair(/sticky progress — mine|sticky progress mine/, /sticky progress — explore|stuck rethink/)) {
        const rk = (_p = (_o = w.seen) == null ? void 0 : _o.rock) != null ? _p : this.mem(w, "rock");
        if (rk) this.blockGatherTile(rk.x, rk.y);
        this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 480);
        this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 512);
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/sticky progress|sticky leave|tools mine|tools find rock/i.test(s)
        );
        this.noteAction("status osc sticky-mine \u2014 explore");
        host.log("AUTO: status osc sticky progress mine mono \u2014 explore (2050)");
        this.clearFundIntent("tool");
        if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
          this.h1001.phase = "GEAR_FARM";
        } else if (host.hasTool("pickaxe")) {
          this.h1001.phase = "FIRST_WEP";
        }
        this.setStatus(host, w, stance, "sticky progress \u2014 explore");
        if (w.explore) {
          this.desireXY = { x: w.explore.x, y: w.explore.y };
          host.walkTo(w.explore.x, w.explore.y);
        } else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        this.cool = 14;
        return true;
      }
      if (this.statusFamilyHits(/tools mine/) >= 4 || this.statusOscPair(/tools mine/, /open chest|looting|tools hatchet|scan HV loot/)) {
        const rk = (_r = (_q = w.seen) == null ? void 0 : _q.rock) != null ? _r : this.mem(w, "rock");
        if (rk) this.blockGatherTile(rk.x, rk.y);
        this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 480);
        this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 512);
        this.hatchetChestBreakUntil = Math.max(this.hatchetChestBreakUntil, this.runTicks + 320);
        this.kitAcquireBlockUntil = Math.max(this.kitAcquireBlockUntil, this.runTicks + 192);
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/tools mine|tools find rock|open chest|looting|tools hatchet|scan HV loot/i.test(s)
        );
        this.clearFundIntent("tool");
        if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
          this.h1001.phase = "GEAR_FARM";
        } else if (host.hasTool("pickaxe")) {
          this.h1001.phase = "FIRST_WEP";
        }
        this.noteAction("status osc tools-mine mono \u2014 explore");
        host.log("AUTO: status osc tools mine mono \u2014 explore (2051)");
        if (w.explore) {
          this.desireXY = { x: w.explore.x, y: w.explore.y };
          host.walkTo(w.explore.x, w.explore.y);
        } else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        this.setStatus(host, w, stance, "tools-mine mono \u2014 explore");
        this.cool = 14;
        return true;
      }
      if (this.statusOscPair(
        /tools fund sell|tools fund sell mats|tools-hatchet hang/,
        /FIRST_WEP hold|quiet hold — tools|quiet hold — bootstrap break/
      ) || this.statusFamilyHits(/tools fund sell|tools fund sell mats/) >= 4 && this.statusFamilyHits(/FIRST_WEP hold|quiet hold — tools/) >= 4) {
        return this.finishQuietHoldProgress(host, w, stance, "fund-hold-osc");
      }
      if (this.statusFamilyHits(/tools hatchet|tools fund sell|kit hatchet/) >= 3 || this.statusOscPair(/tools hatchet|kit hatchet/, /tools fund sell|tools fund sell mats|tools mine/) || this.statusOscPair(/tools fund sell mats|tools fund sell/, /tools hatchet|kit hatchet|tools mine/)) {
        this.kitAcquireBlockUntil = Math.max(this.kitAcquireBlockUntil, this.runTicks + 384);
        this.hatchetChestBreakUntil = Math.max(this.hatchetChestBreakUntil, this.runTicks + 320);
        this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 512);
        this.clearFundIntent("tool");
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/tools hatchet|kit hatchet|tools fund sell|tools fund|tools mine/i.test(s)
        );
        if (this.kiteCoolExitQuietActive() || this.phaseCoolNoKiteWander()) {
          return this.finishQuietHoldProgress(host, w, stance, "tools-hatchet-hang");
        }
        if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
          this.h1001.phase = "GEAR_FARM";
        } else if (host.hasTool("pickaxe")) {
          this.h1001.phase = "FIRST_WEP";
        }
        this.noteAction("status osc tools-hatchet hang \u2014 wander");
        host.log("AUTO: status osc tools hatchet/fund sell hang \u2014 wander (2058)");
        if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        this.setStatus(host, w, stance, "tools-hatchet hang \u2014 wander");
        this.cool = 16;
        return true;
      }
      if (this.statusFamilyHits(/sticky progress — explore|sticky progress explore/) >= 3 || this.statusOscPair(/sticky progress — explore|sticky progress explore|TOOLS sticky/, /lethal kite|lethal close|fork|stuck watchdog|mob kite/) || this.statusFamilyHits(/wanderSpin re-sticky/) >= 1 || this.statusFamilyHits(/stuck watchdog/) >= 1 && this.statusFamilyHits(/sticky progress — explore|sticky progress explore/) >= 1) {
        this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 1024);
        this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 896);
        this.emergToolsBreakUntil = Math.max(this.emergToolsBreakUntil, this.runTicks + 768);
        this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 640);
        this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 1024);
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/sticky progress|sticky leave|wanderSpin|lethal|explore-kite|TOOLS sticky|stuck watchdog|mob kite/i.test(s)
        );
        this.clearFundIntent("tool");
        if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
          this.h1001.phase = "GEAR_FARM";
        } else if (host.hasTool("pickaxe")) {
          this.h1001.phase = "FIRST_WEP";
        }
        this.noteAction("status osc sticky-explore mono \u2014 phase");
        host.log("AUTO: status osc sticky progress explore mono \u2014 phase leave (2053)");
        if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.explore) {
          this.desireXY = { x: w.explore.x, y: w.explore.y };
          host.walkTo(w.explore.x, w.explore.y);
        } else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        this.setStatus(host, w, stance, "sticky-explore mono \u2014 phase");
        this.cool = 18;
        return true;
      }
      if ((!this.emergToolsBreakActive() || this.statusOscPair(/emerg hub fund/, /lethal kite|enroute loot|walk HV loot/) || this.statusOscPair(/enroute loot|walk HV loot|walk loot/, /lethal kite|lethal close|mob kite/)) && (this.statusOscPair(/emerg hub fund/, /lethal kite|lethal close|enroute loot|walk HV loot|walk loot/) || this.statusOscPair(/sticky progress/, /emerg hub fund|enroute loot|walk HV loot/) || this.statusOscPair(/enroute loot|walk HV loot|walk loot/, /lethal kite|lethal close|emerg hub fund|mob kite/))) {
        this.emergToolsBreakUntil = this.runTicks + 768;
        this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 640);
        this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 640);
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/emerg hub|enroute loot|walk HV loot|walk loot|lethal|sticky progress|emerg-loot osc|mob kite/i.test(s)
        );
        this.clearFundIntent("tool");
        this.clearFundIntent("food");
        this.noteAction("status osc emerg-loot \u2014 progress");
        host.log("AUTO: status osc emerg hub/lethal/loot \u2014 sticky progress (2052)");
        return this.tryStickyProgressLeave(host, w, stance, "emerg-loot osc");
      }
      if (this.statusOscPair(/lethal cover/, /lethal close/) || this.statusFamilyHits(/lethal cover/) >= 3 && this.statusFamilyHits(/lethal close/) >= 3) {
        this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 896);
        this.emergToolsBreakUntil = Math.max(this.emergToolsBreakUntil, this.runTicks + 640);
        this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 768);
        this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 768);
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/lethal cover|lethal close|lethal kite|lethal-cover osc/i.test(s)
        );
        this.clearFundIntent("tool");
        this.clearFundIntent("food");
        if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
          this.h1001.phase = "GEAR_FARM";
        } else if (host.hasTool("pickaxe")) {
          this.h1001.phase = "FIRST_WEP";
        }
        this.noteAction("status osc lethal-cover/close \u2014 phase");
        host.log("AUTO: status osc lethal cover\u2194close \u2014 phase leave (2053)");
        if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        this.setStatus(host, w, stance, "lethal-cover osc \u2014 phase");
        this.cool = 16;
        return true;
      }
      if ((!this.exploreKiteBreakActive() || this.statusOscPair(
        /lethal kite|lethal close|mob kite outlook|mob kite|mob engage|approach engage/,
        /enroute loot|walk loot|walk HV loot|floor_loot|high-ceiling loot/
      )) && (this.statusOscPair(
        /lethal kite|lethal close|mob kite outlook|mob kite/,
        /enroute loot|walk loot|walk HV loot|floor_loot|high-ceiling loot/
      ) || this.statusOscPair(
        /mob engage|approach engage/,
        /walk loot|enroute loot|walk HV loot|floor_loot/
      ) || this.statusFamilyHits(/mob engage|approach engage/) >= 4 && this.statusFamilyHits(/walk loot|enroute loot|walk HV loot/) >= 4)) {
        this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 896);
        this.emergToolsBreakUntil = Math.max(this.emergToolsBreakUntil, this.runTicks + 768);
        this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 768);
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/lethal|mob kite|kite outlook|mob engage|approach engage|enroute loot|walk loot|walk HV loot|floor_loot|high-ceiling|lethal-loot osc/i.test(s)
        );
        this.clearFundIntent("tool");
        this.clearFundIntent("food");
        if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
          this.h1001.phase = "GEAR_FARM";
        } else if (host.hasTool("pickaxe")) {
          this.h1001.phase = "FIRST_WEP";
        }
        this.noteAction("status osc lethal-loot \u2014 progress");
        host.log("AUTO: status osc lethal/kite/engage\u2194loot \u2014 sticky progress (2052)");
        return this.tryStickyProgressLeave(host, w, stance, "lethal-loot osc");
      }
      const bareExploreLethal = this.statusOscPair(
        /auto — explore\s*\||auto — first wep explore\s*\|/,
        /lethal kite|lethal close|lethal cover|approach kite|mob kite|kite outlook|mob engage|approach engage/
      ) || this.statusFamilyHits(/auto — explore\s*\||auto — first wep explore/) >= 3 && this.statusFamilyHits(/lethal kite|lethal close|lethal cover|mob engage|mob kite|kite outlook|approach engage/) >= 3;
      if ((!this.exploreKiteBreakActive() || bareExploreLethal) && bareExploreLethal) {
        if (!this.kiteCoolExitQuietActive()) {
          this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 1280);
          this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 1280);
          this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 1024);
          this.emergToolsBreakUntil = Math.max(this.emergToolsBreakUntil, this.runTicks + 768);
        }
        this.stickyPhaseLeaveArmed = true;
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/auto — explore\s*\||auto — first wep explore|explore\s*\||lethal|kite|mob engage|approach engage|gear-explore-kite|explore-kite|kite cool|sticky progress|FIRST_WEP hold/i.test(s)
        );
        if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
          this.h1001.phase = "GEAR_FARM";
        } else if (host.hasTool("pickaxe")) {
          this.h1001.phase = "FIRST_WEP";
        }
        this.noteAction("status osc gear-explore/kite \u2014 wander");
        host.log(
          this.kiteCoolExitQuietActive() ? "AUTO: status osc explore\u2194lethal/mob \u2014 wander quiet cool-exit ban (2072)" : "AUTO: status osc explore\u2194lethal/mob \u2014 wander break (2061)"
        );
        if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        if (this.kiteCoolExitQuietActive()) {
          this.stickyPhaseLeaveArmed = true;
          this.armPhaseCoolNoKiteEmit();
        }
        this.setStatus(host, w, stance, "gear-explore-kite osc \u2014 wander");
        this.cool = 18;
        return true;
      }
      if (this.statusOscPair(/chop for fire/, /\bcook\b/)) {
        this.chopBreakUntil = this.runTicks + 160;
        this.noteAction("status osc chop/cook \u2014 explore");
        host.log("AUTO: status osc chop for fire/cook \u2014 break (2041)");
        if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        this.setStatus(host, w, stance, "chop-cook osc \u2014 explore");
        this.cool = 6;
        return true;
      }
      if (this.statusOscPair(/mine first wep/, /first wep/) || this.statusOscPair(/chop first wep/, /first wep/) || this.statusOscPair(/first-wep osc/, /first wep|mine first wep/) || this.statusOscPair(/FIRST_WEP hold — mine/, /FIRST_WEP hold — wander|kite cool wander/) || this.statusFamilyHits(/mine first wep|first wep mine|FIRST_WEP hold — mine/) >= 3) {
        this.noteAction("status osc first-wep \u2014 explore");
        host.log("AUTO: status osc first wep \u2014 break (2064)");
        this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 480);
        this.kiteCoolMineBanUntil = Math.max(this.kiteCoolMineBanUntil, this.runTicks + 768);
        this.kiteCoolMineKey = "";
        this.kiteCoolMineHits = 0;
        const rk = (_t = (_s = w.seen) == null ? void 0 : _s.rock) != null ? _t : this.mem(w, "rock");
        if (rk) this.blockGatherTile(rk.x, rk.y);
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/first wep|mine first wep|first-wep osc|FIRST_WEP hold/i.test(s)
        );
        if (host.hasTool("pickaxe")) this.h1001.phase = "FIRST_WEP";
        if (this.kiteExploreCoolActive()) {
          this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 768);
          this.stickyPhaseLeaveArmed = true;
          if (w.wander) host.walkTo(w.wander.x, w.wander.y);
          else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
          else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
          this.setStatus(host, w, stance, "first-wep osc \u2014 wander");
          this.cool = 14;
          return true;
        }
        if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        this.setStatus(host, w, stance, "first-wep osc \u2014 explore");
        this.cool = 12;
        return true;
      }
      if (!this.hatchetChestBreakActive() && (this.statusOscPair(/tools hatchet|tools fund hatchet|kit hatchet|hatchet osc|hatchet thrash/, /open chest|chest thrash|looting|chest soft-block/) || this.statusOscPair(/tools hatchet|tools fund hatchet|kit hatchet|hatchet osc|hatchet thrash/, /stuck rethink/) || this.statusOscPair(/tools hatchet|tools fund hatchet/, /mob engage|approach engage|high-ceiling loot|approach kite|mob kite/) || this.statusOscPair(/hatchet osc|hatchet thrash|status osc hatchet/, /chest soft-block|open chest|tools hatchet/))) {
        this.hatchetChestBreakUntil = this.runTicks + 640;
        this.kitAcquireBlockUntil = Math.max(this.kitAcquireBlockUntil, this.runTicks + 320);
        this.toolBlock.set("hatchet", this.runTicks + 320);
        this.clearFundIntent("tool");
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/tools hatchet|tools fund hatchet|kit hatchet|open chest|chest thrash|looting|chest soft-block|hatchet osc|hatchet thrash|stuck rethink|status osc hatchet/i.test(s)
        );
        if ((_u = w.seen) == null ? void 0 : _u.chest) this.softBlockChest(host, w, w.seen.chest.x, w.seen.chest.y, "hatchet/chest osc");
        if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
          this.h1001.phase = "GEAR_FARM";
        } else if (host.hasTool("pickaxe")) {
          this.h1001.phase = "FIRST_WEP";
        }
        this.noteAction("status osc hatchet/chest \u2014 gear");
        host.log("AUTO: status osc tools hatchet/chest \u2014 sticky leave (2047)");
        if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        this.setStatus(host, w, stance, "hatchet osc \u2014 explore");
        this.cool = 16;
        return true;
      }
      const toolsPickaxeLethal = this.statusOscPair(/tools pickaxe/, /lethal kite|lethal close|lethal cover|mob kite|kite outlook|approach kite|mob engage|approach engage/) || this.statusFamilyHits(/tools pickaxe/) >= 4 && this.statusFamilyHits(/lethal kite|lethal close|lethal cover|mob kite|kite outlook|approach kite|mob engage|approach engage/) >= 3;
      if ((!this.exploreKiteBreakActive() || toolsPickaxeLethal) && (this.statusOscPair(
        /tools explore|rock osc — explore|tools find rock|tools wander|tools pickaxe|tools hatchet|tools fund|tools mine|sticky leave|sticky progress/,
        /lethal kite|lethal close|lethal cover|approach kite|mob kite|kite outlook|\bkite\b/
      ) || this.statusOscPair(/tools explore|tools wander|sticky leave|sticky progress/, /lethal cover|lethal kite|lethal close/) || this.statusOscPair(/tools pickaxe/, /lethal kite|lethal close|lethal cover|mob kite|kite outlook|approach kite/) || toolsPickaxeLethal)) {
        this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 896);
        this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 640);
        this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 768);
        this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 768);
        this.kitAcquireBlockUntil = Math.max(this.kitAcquireBlockUntil, this.runTicks + 384);
        this.clearFundIntent("tool");
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/tools explore|tools find rock|tools wander|tools pickaxe|tools hatchet|tools fund|tools mine|kite|lethal|explore-kite osc|status osc explore\/kite|mono divert|mono status/i.test(s)
        );
        if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
          this.h1001.phase = "GEAR_FARM";
        } else if (host.hasTool("pickaxe")) {
          this.h1001.phase = "FIRST_WEP";
        } else {
          this.kitAcquireBlockUntil = Math.max(this.kitAcquireBlockUntil, this.runTicks + 512);
        }
        this.stickyPhaseLeaveArmed = true;
        this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 1280);
        this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 1280);
        this.noteAction("status osc explore/kite \u2014 wander");
        host.log("AUTO: status osc tools\u2194lethal/kite \u2014 wander break (2061)");
        if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        this.setStatus(host, w, stance, "explore-kite osc \u2014 wander");
        this.cool = 18;
        return true;
      }
      if (this.statusFamilyHits(/tools pickaxe/) >= 6 || this.statusOscPair(/tools pickaxe/, /stuck rethink/) || this.statusFamilyHits(/tools pickaxe/) >= 4 && this.statusFamilyHits(/stuck rethink/) >= 2) {
        this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 768);
        this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 768);
        this.emergToolsBreakUntil = Math.max(this.emergToolsBreakUntil, this.runTicks + 640);
        this.kitAcquireBlockUntil = Math.max(this.kitAcquireBlockUntil, this.runTicks + 384);
        this.clearFundIntent("tool");
        this.latchThrash();
        this.latchClash();
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/tools pickaxe|tools mine|tools find rock|stuck rethink|emerg-tools|mob engage/i.test(s)
        );
        const rock = (_w = (_v = w.seen) == null ? void 0 : _v.rock) != null ? _w : this.mem(w, "rock");
        if (rock) this.blockGatherTile(rock.x, rock.y);
        if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
          this.h1001.phase = "GEAR_FARM";
        } else if (host.hasTool("pickaxe")) {
          this.h1001.phase = "FIRST_WEP";
        }
        this.noteAction("tools pickaxe mono \u2014 wander");
        host.log("AUTO: tools pickaxe mono \u2014 wander break (2088)");
        if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        this.setStatus(host, w, stance, "tools pickaxe mono \u2014 wander");
        this.cool = 18;
        return true;
      }
      if ((!this.emergToolsBreakActive() || this.statusOscPair(/sticky leave|sticky progress/, /emerg hub fund|emerg find pond|mob engage/)) && (this.statusOscPair(
        /tools explore|tools find rock|tools mine|tools wander|tools hatchet|tools fund|tools pickaxe|sticky leave|sticky progress/,
        /emerg hub fund|emerg find pond/
      ) || this.statusOscPair(
        /emerg hub fund|emerg find pond/,
        /mob engage|approach engage|high-ceiling loot|mob kite|approach kite|kite outlook|sticky leave|sticky progress/
      ) || this.statusOscPair(/tools fund hatchet|tools fund sell|tools hatchet/, /emerg hub fund|mob kite|approach kite/) || this.statusOscPair(
        /tools wander|tools explore|tools hatchet|sticky leave|sticky progress/,
        /mob engage|approach engage|high-ceiling loot|emerg hub fund/
      ) || this.statusOscPair(
        /tools pickaxe|tools mine|tools find rock/,
        /mob engage|approach engage/
      ) || this.statusFamilyHits(/tools pickaxe/) >= 4 && this.statusFamilyHits(/mob engage|approach engage/) >= 4)) {
        this.emergToolsBreakUntil = this.runTicks + 640;
        this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 480);
        this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 512);
        this.clearFundIntent("tool");
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/tools explore|tools find rock|tools mine|tools wander|tools hatchet|tools fund|tools pickaxe|emerg hub|emerg find|emerg-tools osc|mob engage|approach engage|mob kite|approach kite|kite outlook|high-ceiling|wander-mob osc/i.test(s)
        );
        this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 640);
        this.noteAction("status osc emerg-tools \u2014 progress");
        return this.tryStickyProgressLeave(host, w, stance, "emerg-tools osc");
      }
      if (host.hasTool("pickaxe") && (this.statusOscPair(/sticky leave|sticky progress/, /stuck rethink/) || this.statusOscPair(/sticky leave|sticky progress/, /emerg hub fund|emerg find pond/) || this.statusOscPair(/sticky leave|sticky progress/, /lethal cover|lethal kite|lethal close|mob engage|approach engage/) || this.statusOscPair(/sticky leave|sticky progress/, /tools fund sell|tools fund|food find pond/) || this.statusOscPair(/sticky leave|sticky progress/, /tools mine|tools find rock|tools hatchet/) || this.stuckWanderBreakActive() && this.statusFamilyHits(/stuck rethink|sticky leave|sticky progress/) >= 2)) {
        const lethalKiteLive = this.statusFamilyHits(
          /lethal kite|lethal close|lethal cover|mob kite|kite outlook|approach kite/
        ) >= 1;
        if (this.stickyExploreBlockActive() || lethalKiteLive || this.exploreKiteBreakActive() || this.statusFamilyHits(/sticky leave — phase|sticky-explore mono|phase cool/) >= 1 || this.stickyPhaseLeaveArmed) {
          if (this.kiteCoolExitQuietActive()) {
            this.stickyPhaseLeaveArmed = true;
            this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
            this.stuckRecentStatus = this.stuckRecentStatus.filter(
              (s) => !/sticky progress|sticky leave|lethal|mob kite|kite outlook|stuck rethink|phase cool|kite cool exit grace|flat thrash/i.test(s)
            );
            if (w.hasMetalWeapon || w.hasStyleWeapon) this.h1001.phase = "GEAR_FARM";
            else this.h1001.phase = "FIRST_WEP";
            if (this.oscCoolDivertActive()) {
              return this.coolHoldOscDivert(host, w, stance, "first-wep-quiet-hold");
            }
            this.noteAction("FIRST_WEP hold \u2014 wander");
            host.log("AUTO: status osc sticky \u2014 quiet hold no cool re-arm (2073)");
            this.setStatus(host, w, stance, "FIRST_WEP hold \u2014 wander");
            if (w.wander) host.walkTo(w.wander.x, w.wander.y);
            else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
            else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
            this.cool = 12;
            return true;
          }
          this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 896);
          this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 768);
          this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 768);
          const oscWasArmed = this.stickyPhaseLeaveArmed;
          this.stickyPhaseLeaveArmed = true;
          this.stuckRecentStatus = this.stuckRecentStatus.filter(
            (s) => !/sticky progress|sticky leave|lethal|mob kite|kite outlook|stuck rethink|phase cool/i.test(s)
          );
          if (w.hasMetalWeapon || w.hasStyleWeapon) this.h1001.phase = "GEAR_FARM";
          else this.h1001.phase = "FIRST_WEP";
          if (this.oscCoolDivertActive()) {
            return this.coolHoldOscDivert(host, w, stance, "sticky-phase-divert");
          }
          if (oscWasArmed) {
            host.log("AUTO: status osc sticky \u2014 quiet phase divert (2054)");
            this.cool = 8;
            return true;
          }
          this.noteAction("status osc sticky \u2014 phase divert");
          host.log("AUTO: status osc sticky \u2014 phase divert no re-arm (2071)");
          if (w.wander) host.walkTo(w.wander.x, w.wander.y);
          else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
          else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
          this.armPhaseCoolNoKiteEmit();
          this.setStatus(host, w, stance, "phase cool");
          this.cool = 14;
          return true;
        }
        this.noteAction("status osc sticky \u2014 progress");
        return this.tryStickyProgressLeave(host, w, stance, "sticky osc");
      }
      if (!this.stuckWanderBreakActive() && (this.statusOscPair(/stuck rethink/, /tools wander|tools explore|tools hatchet|tools fund|tools pickaxe/) || this.statusOscPair(/stuck rethink/, /mono divert|mono status/) || this.statusOscPair(/tools wander/, /tools explore/) || this.statusOscPair(/tools fund sell|tools fund/, /tools wander|tools explore/) || this.statusOscPair(/stuck-wander thrash|tools wander thrash|sticky leave/, /tools wander|tools explore/) || this.statusFamilyHits(/stuck rethink/) >= 3 || this.statusFamilyHits(/tools wander|tools explore/) >= 5)) {
        this.noteAction("status osc stuck-wander \u2014 progress");
        return this.tryStickyProgressLeave(host, w, stance, "stuck-wander osc");
      }
      if (!this.pondBreakActive() && this.statusOscPair(/round-trip pond|util fish|food fish|(?:^|\s)fish(?:\s|$)/, /sell trim/)) {
        this.armPondBreakSticky(768, true);
        this.dropEnroutePonds();
        this.latchThrash();
        this.latchClash();
        if (this.sellTrimHasWork(host, w)) {
          this.sellTrimStickyUntil = Math.max(this.sellTrimStickyUntil, this.runTicks + 256);
        } else {
          this.sellTrimStickyUntil = 0;
          this.sellTrimEmptyUntil = Math.max(this.sellTrimEmptyUntil, this.runTicks + 160);
        }
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/round-trip pond|util fish|food fish|sell trim|pond-sell osc|(?:^|\s)fish(?:\s|$)/i.test(s)
        );
        this.noteAction("status osc pond/sell-trim \u2014 hub");
        host.log("AUTO: status osc round-trip pond/sell trim \u2014 break (2059)");
        if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        this.setStatus(host, w, stance, "pond-sell osc \u2014 hub");
        this.h1001.phase = this.sellTrimHasWork(host, w) ? "SELL_TRIM" : "GEAR_FARM";
        this.cool = 12;
        return true;
      }
      if (this.kiteCoolWanderTheater()) {
        return this.breakKiteCoolWanderHub(host, w, stance, "osc");
      }
      if (this.statusOscPair(
        /FIRST_WEP hold|first wep explore|kite cool wander/,
        /mob engage|approach engage|lethal kite|lethal close|mob kite|kite outlook/
      ) || this.statusFamilyHits(/FIRST_WEP hold — explore|first wep explore|kite cool wander/) >= 3 && this.statusFamilyHits(/mob engage|approach engage|lethal kite|lethal close/) >= 2) {
        this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 896);
        this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 896);
        this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 768);
        this.emergToolsBreakUntil = Math.max(this.emergToolsBreakUntil, this.runTicks + 640);
        this.stickyPhaseLeaveArmed = true;
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/FIRST_WEP hold|first wep explore|first wep|mob engage|approach engage|lethal|kite|first-wep-combat|first-wep osc/i.test(s)
        );
        if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
          this.h1001.phase = "GEAR_FARM";
        } else if (host.hasTool("pickaxe")) {
          this.h1001.phase = "FIRST_WEP";
        }
        this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 1280);
        this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 1280);
        this.noteAction("status osc first-wep-combat \u2014 wander");
        host.log("AUTO: status osc FIRST_WEP hold/explore\u2194mob \u2014 wander (2061)");
        if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        this.setStatus(host, w, stance, "first-wep-combat osc \u2014 wander");
        this.cool = 18;
        return true;
      }
      if (this.statusOscPair(/first wep|mine first wep|first-wep osc|FIRST_WEP hold/, /explore|enroute toward gather|enroute gather/) || this.statusFamilyHits(/first wep|FIRST_WEP hold/) >= 4 || this.statusFamilyHits(/mine first wep|first wep mine/) >= 4 || this.statusFamilyHits(/FIRST_WEP hold|first wep explore|first wep mine/) >= 3 && this.statusFamilyHits(/phase cool|sticky block divert/) >= 2) {
        this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 768);
        this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 640);
        this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 640);
        const rk = (_y = (_x = w.seen) == null ? void 0 : _x.rock) != null ? _y : this.mem(w, "rock");
        if (rk) this.blockGatherTile(rk.x, rk.y);
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/first wep|mine first wep|explore|enroute toward|enroute gather|first-wep osc|FIRST_WEP hold|phase cool|sticky block/i.test(s)
        );
        if (this.stickyExploreBlockActive() || this.stickyPhaseLeaveArmed || this.statusFamilyHits(/phase cool|sticky block divert/) >= 2) {
          this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 896);
          this.stickyPhaseLeaveArmed = true;
          this.noteAction("status osc first-wep/explore \u2014 wander");
          host.log("AUTO: status osc first wep/explore under sticky \u2014 wander (2058)");
          if (w.wander) host.walkTo(w.wander.x, w.wander.y);
          else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
          else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
          this.setStatus(host, w, stance, "first-wep osc \u2014 wander");
          this.cool = 16;
          return true;
        }
        this.noteAction("status osc first-wep/explore \u2014 progress");
        host.log("AUTO: status osc first wep/explore \u2014 sticky progress (2055)");
        return this.tryStickyProgressLeave(host, w, stance, "first-wep osc");
      }
      if (!this.foodMineBreakActive() && (this.statusOscPair(/food mine break|mine break/, /altar runecraft|altar→forge|altar rune/) || this.statusOscPair(/food mine break|mine break/, /enroute pond|enroute toward gather|enroute gather/) || this.statusOscPair(/pond osc — mine|food mine break/, /altar|enroute/) || this.statusFamilyHits(/food mine break|mine break|pond osc — mine/) >= 5)) {
        this.foodMineBreakUntil = this.runTicks + 320;
        this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 256);
        this.pondBreakUntil = Math.max(this.pondBreakUntil, this.runTicks + 768);
        const rk = (_A = (_z = w.seen) == null ? void 0 : _z.rock) != null ? _A : this.mem(w, "rock");
        if (rk) this.blockGatherTile(rk.x, rk.y);
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/food mine break|mine break|pond osc — mine|altar|enroute pond|enroute toward|enroute gather/i.test(s)
        );
        this.noteAction("status osc food-mine \u2014 wander");
        host.log("AUTO: status osc food mine break/altar/enroute \u2014 sticky (2085)");
        this.clearFundIntent("food");
        if (this.shouldEscalatePondBreakPrison(8)) {
          return this.escalatePondBreakPrison(host, w, stance, "food-mine-osc");
        }
        this.armBreakerExploreCool(640);
        if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        this.setStatus(host, w, stance, "food-mine osc \u2014 wander");
        this.cool = 12;
        return true;
      }
      if (!this.pondBreakActive() && this.statusFamilyHits(/food fish|util fish|(^|\s)fish(\s|$)/) >= 5) {
        this.armPondBreakSticky(768, true);
        this.dropEnroutePonds();
        if (this.lastFoodFarm) {
          this.noteGatherFail(this.lastFoodFarm.x, this.lastFoodFarm.y);
          this.lastFoodFarm = null;
        }
        const pondMem = (_B = this.mem(w, "pond")) != null ? _B : this.resolvePond(w);
        if (pondMem) this.noteGatherFail(pondMem.x, pondMem.y);
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/food fish|util fish|enroute pond|fish /i.test(s)
        );
        this.noteAction("status osc food-fish mono \u2014 wander");
        host.log("AUTO: food fish family mono \u2014 pond sticky (2085)");
        if (this.shouldEscalatePondBreakPrison(8)) {
          return this.escalatePondBreakPrison(host, w, stance, "food-fish-mono");
        }
        this.armBreakerExploreCool(640);
        if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        this.setStatus(host, w, stance, "food-fish mono \u2014 wander");
        this.cool = 10;
        return true;
      }
      if (this.statusOscPair(/altar runecraft/, /gather fund/) || this.statusFamilyHits(/altar runecraft|gather fund/) >= 6) {
        this.clearFundIntent("tool");
        this.clearFundIntent("food");
        this.armBreakerExploreCool(768);
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/altar runecraft|gather fund|altar→forge|altar rune/i.test(s)
        );
        this.noteAction("status osc altar-fund \u2014 wander");
        host.log("AUTO: status osc altar runecraft/gather fund \u2014 wander (2062)");
        if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        this.setStatus(host, w, stance, "altar-fund osc \u2014 wander");
        this.cool = 14;
        return true;
      }
      const mono = this.stuckRecentStatus.length >= 6 && (() => {
        const counts = /* @__PURE__ */ new Map();
        for (const s of this.stuckRecentStatus) {
          const fam = s.toLowerCase().replace(/\s*\|.*$/, "").replace(/\s*\(\d+,\d+\)\s*/g, " ").trim();
          counts.set(fam, (counts.get(fam) || 0) + 1);
        }
        let top = "";
        let n = 0;
        for (const [s, c] of counts) if (c > n) {
          top = s;
          n = c;
        }
        return n >= 6 ? top : "";
      })();
      if (mono) {
        const low = mono.toLowerCase();
        if (/food fish|food mine break|tools mine|tools find rock|tools explore|tools wander|tools pickaxe|tools fund|explore-kite|emerg-tools|tools hatchet|open chest|chest soft-block|hatchet osc|hatchet thrash|chop for fire|\bcook\b|rock osc|food sell ore|food find shop|sell ore|find shop|lethal kite|lethal close|approach kite|mob kite|kite outlook|enroute loot|emerg hub|sticky progress|stuck rethink|first wep|^explore\b|kite cool mine|kite cool wander|altar runecraft|gather fund/.test(low)) {
          if (/food fish|food mine break|rock osc/.test(low)) {
            this.pondBreakUntil = Math.max(this.pondBreakUntil, this.runTicks + 768);
            this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 256);
            if (/food mine break/.test(low)) {
              this.foodMineBreakUntil = Math.max(this.foodMineBreakUntil, this.runTicks + 320);
            }
            this.dropEnroutePonds();
            if (w.gather) this.noteGatherFail(w.gather.x, w.gather.y);
            const rk = (_D = (_C = w.seen) == null ? void 0 : _C.rock) != null ? _D : this.mem(w, "rock");
            if (rk) this.blockGatherTile(rk.x, rk.y);
          }
          if (/tools mine|tools find rock|kite cool mine/.test(low)) {
            this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 256);
            this.kiteCoolMineKey = "";
            this.kiteCoolMineHits = 0;
            const rk = (_F = (_E = w.seen) == null ? void 0 : _E.rock) != null ? _F : this.mem(w, "rock");
            if (rk) this.blockGatherTile(rk.x, rk.y);
          }
          if (/altar runecraft|gather fund/.test(low)) {
            this.clearFundIntent("tool");
            this.clearFundIntent("food");
            this.armBreakerExploreCool(640);
          }
          if (/tools explore|tools wander|explore-kite|emerg-tools|tools fund|tools pickaxe|stuck rethink|sticky leave|sticky progress|^explore\b|lethal kite|mob kite|kite outlook|enroute loot|emerg hub/.test(low)) {
            this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 640);
            this.emergToolsBreakUntil = Math.max(this.emergToolsBreakUntil, this.runTicks + 480);
            this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 512);
            this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 768);
            if (/tools fund chop/.test(low)) {
              this.chopBreakUntil = Math.max(this.chopBreakUntil, this.runTicks + 192);
            }
            if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) this.h1001.phase = "GEAR_FARM";
            else if (host.hasTool("pickaxe")) this.h1001.phase = "FIRST_WEP";
          }
          if (/chop for fire|\bcook\b/.test(low)) {
            this.chopBreakUntil = Math.max(this.chopBreakUntil, this.runTicks + 128);
          }
          if (/tools hatchet|open chest|chest soft-block|hatchet osc|hatchet thrash/.test(low)) {
            if ((_G = w.seen) == null ? void 0 : _G.chest) this.softBlockChest(host, w, w.seen.chest.x, w.seen.chest.y, "mono chest/hatchet");
            this.kitAcquireBlockUntil = Math.max(this.kitAcquireBlockUntil, this.runTicks + 160);
            this.hatchetChestBreakUntil = Math.max(this.hatchetChestBreakUntil, this.runTicks + 480);
          }
          if (/food sell ore|food find shop|sell ore|find shop/.test(low)) {
            this.bagFindShopUntil = 0;
            this.bagFindShopTile = "";
            this.oreLiqSameTile = 0;
            this.oreLiqTile = "";
            this.sellOreKeepBlockUntil = this.runTicks + 512;
            this.sellOreBreakUntil = Math.max(this.sellOreBreakUntil, this.runTicks + 512);
            this.clearFundIntent("food");
          }
          this.monoDivertFails++;
          const stickyMobMono = /sticky progress|mono divert|mob kite|kite outlook|lethal kite|tools pickaxe/.test(low) || this.statusOscPair(/sticky progress|tools pickaxe|mono divert/, /mob kite|kite outlook|lethal kite|lethal close|approach kite/) || this.statusFamilyHits(/mono divert — explore|mono divert/) >= 2 || /tools pickaxe/.test(low) && this.statusFamilyHits(/lethal kite|lethal close|mob kite|kite outlook|approach kite/) >= 2;
          if (this.monoDivertFails >= 2 && stickyMobMono) {
            this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 1280);
            this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 1024);
            this.emergToolsBreakUntil = Math.max(this.emergToolsBreakUntil, this.runTicks + 768);
            this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 1024);
            this.stickyPhaseLeaveArmed = true;
            this.monoDivertFails = 0;
            this.stuckRecentStatus = this.stuckRecentStatus.filter(
              (s) => !/sticky progress|mono divert|mob kite|kite outlook|lethal|mono status|tools pickaxe/i.test(s)
            );
            if (/tools pickaxe/.test(low) && !host.hasTool("pickaxe")) {
              this.kitAcquireBlockUntil = Math.max(this.kitAcquireBlockUntil, this.runTicks + 384);
              this.clearFundIntent("tool");
            } else if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
              this.h1001.phase = "GEAR_FARM";
            } else if (host.hasTool("pickaxe")) {
              this.h1001.phase = "FIRST_WEP";
            }
            this.noteAction("mono divert escalate \u2014 phase");
            if (w.wander) host.walkTo(w.wander.x, w.wander.y);
            else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
            else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
            if (this.kiteCoolExitQuietActive()) {
              return this.finishQuietHoldProgress(host, w, stance, "mono-divert");
            }
            host.log("AUTO: mono divert escalate \u2014 hard phase leave (2071)");
            this.armPhaseCoolNoKiteEmit();
            this.setStatus(host, w, stance, "phase cool");
            this.cool = 18;
            return true;
          }
          this.noteAction(`mono status ${mono} \u2014 explore`);
          host.log(`AUTO: mono status divert \u2014 ${mono} (2043)`);
          if (w.wander) host.walkTo(w.wander.x, w.wander.y);
          else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
          else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
          this.setStatus(host, w, stance, "mono divert \u2014 explore");
          this.cool = 6;
          return true;
        }
      }
      return false;
    }
    /** e47: cool window after pond thrash — block find-pond/farm-food desire re-entry. */
    pondBreakActive() {
      return this.runTicks < this.pondBreakUntil;
    }
    /** Eng 2085: pond-break / food-mine prison family hits this life window. */
    pondBreakPrisonFamilyHits() {
      return this.statusFamilyHits(
        /pond break — wander|food-mine osc|pond osc — wander|emerg pond break|food pond break|food-fish mono/
      );
    }
    /** Eng 2085: after 2 fresh arms or heavy soft-wander spam → quiet leave, not soft wander. */
    shouldEscalatePondBreakPrison(familyMin = 8) {
      return this.pondBreakArms >= 2 || this.pondBreakPrisonFamilyHits() >= familyMin;
    }
    /**
     * Eng 2085: freshly arm pondBreak (inactive→active increments pondBreakArms).
     * Always extends to at least runTicks+ticks.
     */
    armPondBreakSticky(ticks = 768, countArm = true) {
      const wasActive = this.pondBreakActive();
      this.pondBreakUntil = Math.max(this.pondBreakUntil, this.runTicks + ticks);
      if (countArm && !wasActive) this.pondBreakArms++;
    }
    /**
     * Eng 2085 / R54: stop find-pond↔break prison — latch + durable quiet leave.
     */
    escalatePondBreakPrison(host, w, stance, why) {
      this.latchThrash();
      if (this.pondBreakCapHits >= 3 || this.pondSellPrisonLatched && this.pondBreakCapHits >= 2) {
        return this.coolHoldOscDivert(host, w, stance, `pond-cap-hold:${why}`);
      }
      this.pondBreakCapHits++;
      if (this.pondBreakCapHits >= 2) {
        this.latchClash();
        this.pondBreakUntil = Math.min(this.pondBreakUntil, this.runTicks);
        this.armBreakerExploreCool(1280);
        this.foodMineBreakUntil = Math.max(this.foodMineBreakUntil, this.runTicks + 1280);
        this.sellOreBreakUntil = Math.max(this.sellOreBreakUntil, this.runTicks + 1280);
        this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 1280);
        this.clearFundIntent("food");
        this.dropEnroutePonds();
        if (this.lastFoodFarm) {
          this.noteGatherFail(this.lastFoodFarm.x, this.lastFoodFarm.y);
          this.lastFoodFarm = null;
        }
        this.instaOscLeaveArmed = true;
        this.instaOscLeaveHits = Math.max(this.instaOscLeaveHits, this.pondBreakCapHits >= 3 ? 3 : 2);
        this.stickyPhaseLeaveArmed = true;
        this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
        this.pondSellPrisonLatched = true;
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/pond break|pond osc|pond-break-cap|pond-cap|food-mine osc|food-fish mono|find pond|enroute pond|food fish|emerg pond|FIRST_WEP hold|insta osc/i.test(s)
        );
        this.actions = this.actions.filter((s) => !/pond-break-cap|pond-cap —|insta osc/i.test(s));
        const shop = this.mem(w, "shop");
        if (shop) host.walkTo(shop.x, shop.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.explore) {
          this.desireXY = { x: w.explore.x, y: w.explore.y };
          host.walkTo(w.explore.x, w.explore.y);
        }
        if (this.isLifeEscapeSpent() || this.durableLeaveHierarchyReleased || this.postHierarchyReleaseEscapeCount >= 1 || this.statusFamilyHits(/osc cool — leave→release|insta osc — release|pond-cap — release/) >= 1) {
          this.markLifeEscapeSpent(host, `pond-cap-postrel:${why}`);
          return this.postExhaustDurableDivert(host, w, stance, `pond-cap-postrel:${why}`);
        }
        if (this.pondBreakCapHits >= 3) {
          this.noteAction(`pond-cap \u2014 cool (${why})`);
          host.log(`AUTO: pond-cap \u2014 cool divert (3010) ${why}`);
          this.setStatus(host, w, stance, "pond-cap \u2014 cool");
          this.cool = 16;
        } else {
          this.markLifeEscapeSpent(host, `pond-cap-release:${why}`);
          this.noteAction(`pond-cap \u2014 release (${why})`);
          host.log(`AUTO: pond-cap \u2014 release (3010) ${why}`);
          this.setStatus(host, w, stance, "pond-cap \u2014 release");
          this.cool = 14;
        }
        return true;
      }
      this.pondBreakUntil = Math.max(this.pondBreakUntil, this.runTicks + 768);
      this.armBreakerExploreCool(768);
      this.clearFundIntent("food");
      this.dropEnroutePonds();
      if (this.lastFoodFarm) {
        this.noteGatherFail(this.lastFoodFarm.x, this.lastFoodFarm.y);
        this.lastFoodFarm = null;
      }
      this.stuckRecentStatus = this.stuckRecentStatus.filter(
        (s) => !/pond break|pond osc|food-mine osc|food-fish mono|find pond|enroute pond|food fish|emerg pond/i.test(s)
      );
      this.stuckRecentStatus.push(`pond-break-cap \u2014 ${why}`);
      if (this.stuckRecentStatus.length > 8) this.stuckRecentStatus.shift();
      this.noteAction(`pond-break-cap \u2014 ${why}`);
      host.log(`AUTO: pond-break-cap escalate leave (3002) ${why}`);
      return this.finishQuietHoldProgress(host, w, stance, "pond-break-cap");
    }
    /** Eng 2035/2037: cool after tools find rock/mine thrash — stop infinite find-rock. */
    rockFindBreakActive() {
      return this.runTicks < this.rockFindBreakUntil;
    }
    /** Eng 2044: cool after tools explore↔kite breaker self-loop. */
    exploreKiteBreakActive() {
      return this.runTicks < this.exploreKiteBreakUntil;
    }
    /** Eng 2044: cool after tools↔emerg hub / emerg↔mob engage. */
    emergToolsBreakActive() {
      return this.runTicks < this.emergToolsBreakUntil;
    }
    /** Eng 2045: cool after hatchet↔chest / hatchet thrash sticky. */
    hatchetChestBreakActive() {
      return this.runTicks < this.hatchetChestBreakUntil;
    }
    /** Eng 2045: cool after sell-ore↔find-shop sticky. */
    sellOreBreakActive() {
      return this.runTicks < this.sellOreBreakUntil;
    }
    /** Eng 2046: cool after food mine break ↔ altar/enroute / mine mono. */
    foodMineBreakActive() {
      return this.runTicks < this.foodMineBreakUntil;
    }
    /** Eng 2047: cool after stuck-rethink ↔ tools wander/explore sticky. */
    stuckWanderBreakActive() {
      return this.runTicks < this.stuckWanderBreakUntil;
    }
    /** Eng 2053: cool after sticky explore hard-leave — block sticky progress re-arm. */
    stickyExploreBlockActive() {
      if (this.runTicks >= this.stickyExploreBlockUntil) {
        if (this.stickyPhaseLeaveArmed && this.stickyExploreBlockUntil > 0) {
          if (!this.kiteCoolExitQuietActive()) {
            this.stickyPhaseLeaveArmed = false;
            this.stickyLeaveRethinks = 0;
          }
        }
        return false;
      }
      return true;
    }
    /** Eng 2063–2065: mine/gather banned under kite cool / FIRST_WEP hold after same-tile thrash. */
    kiteCoolMineBanActive() {
      return this.runTicks < this.kiteCoolMineBanUntil;
    }
    /** Eng 2067 / R36: ban kite cool wander re-arm after theater hub break. */
    kiteCoolWanderBanActive() {
      return this.runTicks < this.kiteCoolWanderBanUntil;
    }
    /**
     * Eng 2067–2068: kite cool park theater — wander/mine/hub ↔ flat/phase/lethal/mob,
     * or wander/hub mono. 2068 adds hub|osc-hub on the left so hub↔lethal/flat re-breaks.
     */
    kiteCoolWanderTheater() {
      if (this.durableLeaveSettleActive() || this.durableLeaveSettleDone) return false;
      return this.statusOscPair(
        /kite cool wander|kite cool mine|kite cool hub|kite-cool-wander osc/,
        /flat thrash|flat rethink|phase cool|lethal kite|lethal close|lethal cover|mob engage|mob kite|kite outlook|approach kite|approach engage/
      ) || this.statusFamilyHits(/kite cool wander|kite cool mine|kite cool hub|kite-cool-wander osc/) >= 3 && this.statusFamilyHits(/flat thrash|flat rethink|phase cool|camp-chain|lethal kite|lethal close|lethal cover|mob engage|mob kite|kite outlook|approach/) >= 2 || this.statusFamilyHits(/kite cool wander/) >= 3 && this.statusFamilyHits(/phase cool|flat rethink|flat thrash/) >= 2 || this.statusFamilyHits(/kite cool wander/) >= 1 && this.statusFamilyHits(/phase cool/) >= 1 || this.statusFamilyHits(/kite cool exit grace/) >= 2 && this.statusFamilyHits(/phase cool|flat thrash|flat rethink/) >= 2 || this.statusOscPair(/kite cool exit grace/, /phase cool|flat thrash|flat rethink/) || this.statusFamilyHits(/FIRST_WEP hold/) >= 8 || this.statusOscPair(/FIRST_WEP hold/, /tools fund sell|tools-hatchet hang|kite cool exit grace/) || this.statusFamilyHits(/FIRST_WEP hold/) >= 4 && this.statusFamilyHits(/tools fund sell|tools-hatchet hang/) >= 4 || this.statusFamilyHits(/quiet hold — tools/) >= 4 || this.statusOscPair(
        /quiet hold — tools|quiet hold — bootstrap break/,
        /tools fund sell|tools-hatchet hang|FIRST_WEP hold|kite cool exit grace|stuck rethink/
      ) || this.statusFamilyHits(/quiet hold — tools/) >= 2 && this.statusFamilyHits(/tools fund sell|tools-hatchet hang|FIRST_WEP hold|stuck rethink/) >= 2 || this.statusFamilyHits(/quiet hold — bootstrap break/) >= 3 || this.statusOscPair(
        /quiet hold — bootstrap break/,
        /kite cool exit grace|kite cool exit|phase cool|stuck rethink/
      ) || this.quietBreakEmitHits >= 3 || this.runTicks < this.quietBootstrapBreakUntil || this.quietBreakEscalateHits >= 2 || this.runTicks < this.quietBreakEscalateUntil || this.statusFamilyHits(/quiet hold — break escalate/) >= 3 || this.statusOscPair(
        /quiet hold — break escalate/,
        /quiet hold — tools bootstrap|FIRST_WEP hold|kite cool exit grace/
      ) || !this.durableLeaveSettleActive() && (this.quietEscalateLeaveHits >= 2 || this.statusFamilyHits(/quiet hold — escalate leave/) >= 3 || this.statusOscPair(
        /quiet hold — escalate leave/,
        /kite cool exit grace|kite cool exit|phase cool/
      )) || !this.durableLeaveSettleActive() && (this.statusOscPair(
        /quiet hold — escalate leave|sticky progress — explore/,
        /kite-cool-wander|kite cool wander|kite cool exit|kite cool park/
      ) || this.statusFamilyHits(/quiet hold — escalate leave sticky|sticky progress — explore/) >= 4 && this.statusFamilyHits(/kite-cool-wander|kite cool exit|kite cool park/) >= 2) || !this.durableLeaveSettleClosed() && this.statusOscPair(
        /escalate leave durable|quiet hold — durable settle/,
        /kite-cool-wander|kite cool wander|sticky progress — explore|kite cool hub/
      ) || this.statusFamilyHits(/kite cool wander/) >= 5 || this.statusFamilyHits(/kite cool hub/) >= 5;
    }
    /**
     * Eng 2068 / R37: cool park is temporary. Re-entry while wander-ban/hub live →
     * expire cool stickies so hierarchy can do real work (not another hub park).
     * Eng 2069 / R38: also expire campChain/foodMine (else kiteExploreCoolActive stays
     * true), arm sticky quiet-yield, and open kiteCoolExitUntil grace so TOOLS sticky /
     * phase cool cannot re-park hub (v2tcev/qmq6aa/sp7npv/zynf9j/7k53tg).
     */
    exitKiteCoolPark(host, w, stance, why) {
      if (this.durableLeaveSettleActive()) {
        return this.routeDurableLeaveSettleOrEscape(host, w, stance, `park ${why}`);
      }
      if (this.durableLeaveSettleClosed()) {
        return this.routeDurableLeaveClosed(host, w, stance, `park ${why}`);
      }
      if (this.quietEscalateLeaveLatchActive()) {
        return this.durableEscalateLeaveExit(host, w, stance, `park ${why}`);
      }
      this.latchThrash();
      this.latchClash();
      this.exploreKiteBreakUntil = Math.min(this.exploreKiteBreakUntil, this.runTicks);
      this.stickyExploreBlockUntil = Math.min(this.stickyExploreBlockUntil, this.runTicks);
      this.stuckWanderBreakUntil = Math.min(this.stuckWanderBreakUntil, this.runTicks);
      this.campChainBreakUntil = Math.min(this.campChainBreakUntil, this.runTicks);
      this.foodMineBreakUntil = Math.min(this.foodMineBreakUntil, this.runTicks);
      this.kiteCoolWanderBanUntil = Math.min(this.kiteCoolWanderBanUntil, this.runTicks);
      this.kiteCoolMineBanUntil = this.runTicks + 256;
      this.kiteCoolParkHits = 0;
      this.kiteCoolExitUntil = this.runTicks + 1280;
      this.kiteCoolReentryBanUntil = this.runTicks + 2560;
      this.dropEnroutePonds();
      this.stickyPhaseLeaveArmed = true;
      this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
      this.stuckRecentStatus = this.stuckRecentStatus.filter(
        (s) => !/kite cool|lethal|mob engage|approach|camp-chain|flat thrash|flat rethink|phase cool|first-wep-combat|kite-cool-lethal|kite-cool-wander|TOOLS sticky/i.test(s)
      );
      if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
        this.h1001.phase = "GEAR_FARM";
      } else if (host.hasTool("pickaxe")) {
        this.h1001.phase = "FIRST_WEP";
      }
      this.noteAction("kite cool park \u2014 exit");
      host.log(`AUTO: kite cool park exit \u2014 clear cool + 2072 wander/ban ${why}`);
      if (w.wander) host.walkTo(w.wander.x, w.wander.y);
      else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
      else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
      this.setStatus(host, w, stance, "kite cool exit");
      this.cool = 8;
      return true;
    }
    /**
     * Eng 2067 hub break; Eng 2068 re-entry → exit cool park (sas3aw/yfg5vq/9qmve2).
     * Eng 2069 / R38: during exit grace, never re-arm bans + hub — finish grace walk.
     */
    breakKiteCoolWanderHub(host, w, stance, why) {
      if (this.durableLeaveSettleActive()) {
        return this.routeDurableLeaveSettleOrEscape(host, w, stance, `wander-hub ${why}`);
      }
      if (this.durableLeaveSettleClosed()) {
        return this.routeDurableLeaveClosed(host, w, stance, `wander-hub ${why}`);
      }
      if (this.quietEscalateLeaveLatchActive()) {
        return this.durableEscalateLeaveExit(host, w, stance, `wander-hub ${why}`);
      }
      if (this.kiteCoolExitQuietActive()) {
        return this.finishKiteCoolExitGrace(host, w, stance, why);
      }
      this.kiteCoolParkHits++;
      const reentry = this.kiteCoolWanderBanActive() || this.statusFamilyHits(/kite cool hub|kite-cool-wander osc/) >= 2 || this.kiteCoolParkHits >= 2 || this.statusFamilyHits(/kite cool wander/) >= 3 && this.statusFamilyHits(/phase cool|flat rethink/) >= 2;
      if (reentry) {
        return this.exitKiteCoolPark(host, w, stance, why);
      }
      this.latchThrash();
      this.latchClash();
      this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 1280);
      this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 1280);
      this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 1024);
      this.emergToolsBreakUntil = Math.max(this.emergToolsBreakUntil, this.runTicks + 768);
      this.campChainBreakUntil = Math.max(this.campChainBreakUntil, this.runTicks + 768);
      this.pondBreakUntil = Math.max(this.pondBreakUntil, this.runTicks + 768);
      this.kiteCoolMineBanUntil = Math.max(this.kiteCoolMineBanUntil, this.runTicks + 768);
      this.kiteCoolWanderBanUntil = Math.max(this.kiteCoolWanderBanUntil, this.runTicks + 1280);
      this.dropEnroutePonds();
      this.stickyPhaseLeaveArmed = true;
      this.stuckRecentStatus = this.stuckRecentStatus.filter(
        (s) => !/kite cool|lethal|mob engage|approach|camp-chain|flat thrash|flat rethink|phase cool|first-wep-combat|kite-cool-lethal|kite-cool-wander/i.test(s)
      );
      if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
        this.h1001.phase = "GEAR_FARM";
      } else if (host.hasTool("pickaxe")) {
        this.h1001.phase = "FIRST_WEP";
      }
      this.noteAction("status osc kite-cool-wander \u2014 hub");
      host.log(`AUTO: status osc kite cool wander theater \u2014 hub break (2068) ${why}`);
      if (w.hub) host.walkTo(w.hub.x, w.hub.y);
      else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
      else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
      this.setStatus(host, w, stance, "kite-cool-wander osc \u2014 hub");
      this.cool = 20;
      return true;
    }
    /**
     * Eng 2065 / R34: FIRST_WEP must not re-enter camp_chain tree/rock (or util chop/mine)
     * while kite cool wander / kiteCoolMineBan is live — osc→wander→rechop was the R34 WD class.
     * Eng 2066 / R35: also gates camp_chain pond (same-node pond → osc → kite cool WD).
     */
    firstWepCampGatherBanActive() {
      if (this.h1001.phase !== "FIRST_WEP") return false;
      return this.kiteExploreCoolActive() || this.kiteCoolMineBanActive();
    }
    /** Eng 2069 / R38: post-exitKiteCoolPark grace (~1280t). */
    kiteCoolExitGraceActive() {
      return this.runTicks < this.kiteCoolExitUntil;
    }
    /** Eng 2070 / R39: post-exit reentry ban (~2560t). */
    kiteCoolReentryBanActive() {
      return this.runTicks < this.kiteCoolReentryBanUntil;
    }
    /**
     * Eng 2070 / R39: grace OR reentry ban — quiet cool-exit window (no hub / no
     * sticky re-arm / no kite cool wander emit).
     */
    kiteCoolExitQuietActive() {
      return this.kiteCoolExitGraceActive() || this.kiteCoolReentryBanActive();
    }
    /**
     * Eng 2080 / R49: escalate-leave latch — once leave/sticky fired, never re-open
     * kite cool park quiet window (exitKiteCoolPark → grace → leave sticky WD).
     */
    quietEscalateLeaveLatchActive() {
      return this.quietBreakEscalateActive() || this.quietEscalateLeaveHits >= 1 || this.statusFamilyHits(/quiet hold — escalate leave/) >= 1;
    }
    /**
     * Eng 2084 / R53: after settle closed, one/two DONE emits then RELEASE to quiet
     * hierarchy — never perpetual finishDurableLeaveDone (wander-hub osc).
     */
    routeDurableLeaveClosed(host, w, stance, why) {
      if (this.durableLeaveHierarchyReleased || this.durableLeaveDoneHits >= 2) {
        this.markDurableLeaveHierarchyReleased(host, why);
        this.expireDurableCoolForHierarchy();
        return this.finishQuietHoldProgress(host, w, stance, `post-durable ${why}`);
      }
      return this.finishDurableLeaveDone(host, w, stance, why);
    }
    /** Eng 2084: expire cool stickies that keep kiteExploreCoolActive / park loops alive.
     *  Eng 2087 / R56: also clear emergTools + quiet escalate latch (grexs7 post-RELEASE
     *  escalate leave sticky ↔ TOOLS sticky ↔ phase cool used leftover emerg + latch). */
    expireDurableCoolForHierarchy() {
      this.exploreKiteBreakUntil = Math.min(this.exploreKiteBreakUntil, this.runTicks);
      this.stickyExploreBlockUntil = Math.min(this.stickyExploreBlockUntil, this.runTicks);
      this.stuckWanderBreakUntil = Math.min(this.stuckWanderBreakUntil, this.runTicks);
      this.campChainBreakUntil = Math.min(this.campChainBreakUntil, this.runTicks);
      this.foodMineBreakUntil = Math.min(this.foodMineBreakUntil, this.runTicks);
      this.emergToolsBreakUntil = Math.min(this.emergToolsBreakUntil, this.runTicks);
      this.kiteCoolExitUntil = Math.min(this.kiteCoolExitUntil, this.runTicks);
      this.kiteCoolReentryBanUntil = Math.min(this.kiteCoolReentryBanUntil, this.runTicks);
      this.kiteCoolWanderBanUntil = Math.min(this.kiteCoolWanderBanUntil, this.runTicks);
      this.kiteCoolParkHits = 0;
      this.quietBreakEscalateUntil = Math.min(this.quietBreakEscalateUntil, this.runTicks);
      this.quietEscalateLeaveHits = 0;
      this.quietBreakEscalateHits = 0;
    }
    /** Eng 2084 + eng 3010: mark hierarchy released (idempotent); spends life escape. */
    markDurableLeaveHierarchyReleased(host, why) {
      if (!this.durableLeaveHierarchyReleased) {
        this.durableLeaveHierarchyReleased = true;
        if (!this.durableLeaveSettleDone) this.markDurableLeaveSettleDone(host, why);
        host.log(`AUTO: durable leave hierarchy RELEASED (2084) ${why}`);
        this.markLifeEscapeSpent(host, `hierarchy-RELEASE:${why}`);
      }
    }
    /** Eng 2081 / R50: durable leave settle window (~1920t). */
    durableLeaveSettleActive() {
      return !this.durableLeaveSettleDone && this.runTicks < this.durableLeaveSettleUntil;
    }
    /**
     * Eng 2083 / R52: settle closed — window expired / hit-capped / tools-complete clear.
     * Post-expire latch must NOT sink into finishDurableLeaveSettle(rearm:false).
     */
    durableLeaveSettleClosed() {
      return this.durableLeaveSettleDone || this.durableEscalateLeaveHits >= 1 && this.durableLeaveSettleUntil > 0 && this.runTicks >= this.durableLeaveSettleUntil;
    }
    /** Eng 2083: mark settle done and scrub settle status fuel. */
    markDurableLeaveSettleDone(host, why) {
      this.durableLeaveSettleDone = true;
      this.durableLeaveSettleUntil = Math.min(this.durableLeaveSettleUntil, this.runTicks);
      this.durableLeaveSettleEmitUntil = 0;
      this.stuckRecentStatus = this.stuckRecentStatus.filter(
        (s) => !/durable leave settle|quiet hold — durable settle|escalate leave durable/i.test(s)
      );
      host.log(`AUTO: durable leave settle DONE \u2014 hierarchy (2083) ${why}`);
    }
    /**
     * Eng 2086 / R55: settle sticky re-entry prison (dm7kcj) — after 2 non-soft settles
     * OR heavy settle family, RELEASE quiet leave instead of more finishDurableLeaveSettle.
     */
    durableLeaveSettleCapReached() {
      return this.durableLeaveSettleHits >= 2 || this.statusFamilyHits(
        /quiet hold — durable settle|durable leave settle|durable settle mine/
      ) >= 4;
    }
    /** Eng 2086: force settle DONE + hierarchy RELEASE → finishQuietHoldProgress. */
    escapeDurableLeaveSettleCap(host, w, stance, why) {
      this.latchThrash();
      this.latchClash();
      this.markDurableLeaveSettleDone(host, `settle-cap ${why}`);
      this.markDurableLeaveHierarchyReleased(host, `settle-cap ${why}`);
      this.expireDurableCoolForHierarchy();
      this.noteAction(`durable settle-cap \u2014 ${why}`);
      host.log(`AUTO: durable settle-cap RELEASE quiet leave (2086) ${why}`);
      return this.finishQuietHoldProgress(host, w, stance, `post-durable settle-cap ${why}`);
    }
    /**
     * Eng 2086: while settle live, sticky/cool/wander-hub/park either settle (early)
     * or escape to RELEASE once cap reached — never perpetual settle mine.
     */
    routeDurableLeaveSettleOrEscape(host, w, stance, why) {
      if (this.durableLeaveHierarchyReleased) {
        return this.finishPostHierarchyReleaseQuiet(host, w, stance, `route-after-release ${why}`);
      }
      if (this.durableLeaveSettleCapReached()) {
        return this.escapeDurableLeaveSettleCap(host, w, stance, why);
      }
      return this.finishDurableLeaveSettle(host, w, stance, why);
    }
    /**
     * Eng 2081 / R50 + Eng 2082 / R51 + Eng 2083 / R52: productive settle WHILE window live.
     * 2083: hit-cap (≥6 non-soft) forces DONE → finishDurableLeaveDone (no settle sink).
     * Never call after durableLeaveSettleClosed — use finishDurableLeaveDone instead.
     */
    finishDurableLeaveSettle(host, w, stance, why, opts = {}) {
      var _a, _b, _c, _d;
      if (this.durableLeaveHierarchyReleased) {
        return this.finishPostHierarchyReleaseQuiet(host, w, stance, `settle-after-release ${why}`);
      }
      if (this.durableLeaveSettleClosed() && !this.durableLeaveSettleActive()) {
        return this.finishDurableLeaveDone(host, w, stance, why);
      }
      const rearm = opts.rearm !== false;
      const soft = this.runTicks < this.durableLeaveSettleEmitUntil && this.statusFamilyHits(/quiet hold — durable settle/) >= 1;
      if (!soft) {
        this.durableLeaveSettleHits++;
        this.latchThrash();
        this.latchClash();
        this.noteAction(`durable leave settle (${why})`);
        host.log(`AUTO: durable leave settle \u2014 no re-durable (2083) ${why}`);
        this.durableLeaveSettleEmitUntil = this.runTicks + 128;
      }
      if (this.durableLeaveSettleHits >= 2) {
        return this.escapeDurableLeaveSettleCap(host, w, stance, `hit-cap ${why}`);
      }
      if (rearm) {
        if (!this.durableLeaveSettleActive() && !this.durableLeaveSettleDone) {
          this.durableLeaveSettleUntil = this.runTicks + 1920;
        }
      }
      if (!soft && this.beginnerToolsIncomplete(host)) {
        this.quietBreakEscalateUntil = Math.max(
          this.quietBreakEscalateUntil,
          this.runTicks + 640
        );
      }
      this.kiteCoolExitUntil = Math.min(this.kiteCoolExitUntil, this.runTicks);
      this.kiteCoolReentryBanUntil = Math.min(this.kiteCoolReentryBanUntil, this.runTicks);
      this.kiteCoolParkHits = 0;
      this.exploreKiteBreakUntil = Math.min(this.exploreKiteBreakUntil, this.runTicks);
      this.stickyExploreBlockUntil = Math.min(this.stickyExploreBlockUntil, this.runTicks);
      this.stuckWanderBreakUntil = Math.min(this.stuckWanderBreakUntil, this.runTicks);
      this.campChainBreakUntil = Math.min(this.campChainBreakUntil, this.runTicks);
      this.foodMineBreakUntil = Math.min(this.foodMineBreakUntil, this.runTicks);
      this.stickyPhaseLeaveArmed = true;
      this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
      this.clearFundIntent("tool");
      if (!soft) {
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/kite cool|kite-cool-wander|escalate leave durable|quiet hold — escalate leave|quiet hold — durable settle|sticky progress|sticky leave|phase cool|lethal|FIRST_WEP hold/i.test(s)
        );
      }
      if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
        this.h1001.phase = "GEAR_FARM";
      } else if (host.hasTool("pickaxe")) {
        this.h1001.phase = "FIRST_WEP";
      } else {
        this.h1001.phase = "TOOLS";
      }
      this.setStatus1001(host, w, stance, "quiet hold \u2014 durable settle");
      const rock = (_b = (_a = w.seen) == null ? void 0 : _a.rock) != null ? _b : this.mem(w, "rock");
      if (rock && host.hasTool("pickaxe") && !this.isGatherTileBlocked(rock.x, rock.y)) {
        if (this.walkToTile(host, rock.x, rock.y)) {
          this.cool = 14;
          return true;
        }
        if (this.tryGather(host, w, stance, "durable settle mine")) {
          this.cool = 10;
          return true;
        }
      }
      if (this.beginnerToolsIncomplete(host) && this.runTicks >= this.kitAcquireBlockUntil) {
        const anvil = this.mem(w, "anvil");
        const tool = !host.hasTool("pickaxe") ? "pickaxe" : "hatchet";
        if (this.tryKitAcquireWalk(host, w, stance, tool, anvil)) {
          this.kitAcquireBlockUntil = Math.max(this.kitAcquireBlockUntil, this.runTicks + 128);
          this.cool = 12;
          return true;
        }
      }
      const chest = (_d = (_c = w.seen) == null ? void 0 : _c.chest) != null ? _d : this.mem(w, "chest");
      const shop = this.mem(w, "shop");
      if (chest && !this.isGatherTileBlocked(chest.x, chest.y)) {
        if (this.walkToTile(host, chest.x, chest.y)) {
          this.cool = 14;
          return true;
        }
      }
      if (shop) {
        host.walkTo(shop.x, shop.y);
        this.cool = 14;
        return true;
      }
      if (w.wander) {
        host.walkTo(w.wander.x, w.wander.y);
        this.cool = 16;
        return true;
      }
      if (w.hub) {
        host.walkTo(w.hub.x, w.hub.y);
        this.cool = 14;
        return true;
      }
      if (w.explore) {
        this.desireXY = { x: w.explore.x, y: w.explore.y };
        host.walkTo(w.explore.x, w.explore.y);
        this.cool = 16;
        return true;
      }
      this.cool = 12;
      return true;
    }
    /**
     * Eng 2083 / R52 + Eng 2084 / R53: settle DONE — hierarchy, NEVER settle label.
     * Soft-continue emit; clear cool inputs. 2084: doneHits≥2 → hierarchyReleased +
     * finishQuietHoldProgress (stops done↔wander-hub prison).
     */
    finishDurableLeaveDone(host, w, stance, why) {
      var _a, _b, _c, _d;
      if (!this.durableLeaveSettleDone) this.markDurableLeaveSettleDone(host, why);
      if (this.durableLeaveHierarchyReleased) {
        this.expireDurableCoolForHierarchy();
        return this.finishQuietHoldProgress(host, w, stance, `post-durable-released ${why}`);
      }
      const soft = this.runTicks < this.durableLeaveSettleEmitUntil && this.statusFamilyHits(/FIRST_WEP hold — wander|quiet hold — progress|durable leave done/) >= 1;
      if (!soft) {
        this.durableLeaveDoneHits++;
        this.latchThrash();
        this.latchClash();
        this.noteAction(`durable leave done (${why})`);
        host.log(`AUTO: durable leave done \u2014 hierarchy not settle (2084) ${why}`);
        this.durableLeaveSettleEmitUntil = this.runTicks + 160;
      }
      if (this.durableLeaveDoneHits >= 2) {
        this.markDurableLeaveHierarchyReleased(host, `done-cap ${why}`);
        this.expireDurableCoolForHierarchy();
        return this.finishQuietHoldProgress(host, w, stance, `post-durable done-cap ${why}`);
      }
      this.kiteCoolExitUntil = Math.min(this.kiteCoolExitUntil, this.runTicks);
      this.kiteCoolReentryBanUntil = Math.min(this.kiteCoolReentryBanUntil, this.runTicks);
      this.kiteCoolParkHits = 0;
      this.exploreKiteBreakUntil = Math.min(this.exploreKiteBreakUntil, this.runTicks);
      this.stickyExploreBlockUntil = Math.min(this.stickyExploreBlockUntil, this.runTicks);
      this.stuckWanderBreakUntil = Math.min(this.stuckWanderBreakUntil, this.runTicks);
      this.campChainBreakUntil = Math.min(this.campChainBreakUntil, this.runTicks);
      this.foodMineBreakUntil = Math.min(this.foodMineBreakUntil, this.runTicks);
      this.stickyPhaseLeaveArmed = true;
      this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
      this.clearFundIntent("tool");
      if (!soft) {
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/kite cool|kite-cool-wander|escalate leave durable|quiet hold — escalate leave|quiet hold — durable settle|durable leave settle|sticky progress|sticky leave|phase cool|lethal|FIRST_WEP hold/i.test(s)
        );
      }
      if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
        this.h1001.phase = "GEAR_FARM";
      } else if (host.hasTool("pickaxe")) {
        this.h1001.phase = "FIRST_WEP";
      } else {
        this.h1001.phase = "TOOLS";
      }
      this.setStatus1001(host, w, stance, "FIRST_WEP hold \u2014 wander");
      if (this.beginnerToolsIncomplete(host) && this.runTicks >= this.kitAcquireBlockUntil) {
        const anvil = this.mem(w, "anvil");
        const tool = !host.hasTool("pickaxe") ? "pickaxe" : "hatchet";
        if (this.tryKitAcquireWalk(host, w, stance, tool, anvil)) {
          this.kitAcquireBlockUntil = Math.max(this.kitAcquireBlockUntil, this.runTicks + 128);
          this.cool = 12;
          return true;
        }
      }
      const rock = (_b = (_a = w.seen) == null ? void 0 : _a.rock) != null ? _b : this.mem(w, "rock");
      if (rock && host.hasTool("pickaxe") && !this.isGatherTileBlocked(rock.x, rock.y) && this.durableLeaveSettleHits < 3) {
        if (this.walkToTile(host, rock.x, rock.y)) {
          this.cool = 12;
          return true;
        }
      }
      const chest = (_d = (_c = w.seen) == null ? void 0 : _c.chest) != null ? _d : this.mem(w, "chest");
      const shop = this.mem(w, "shop");
      if (chest && !this.isGatherTileBlocked(chest.x, chest.y)) {
        if (this.walkToTile(host, chest.x, chest.y)) {
          this.cool = 14;
          return true;
        }
      }
      if (shop) {
        host.walkTo(shop.x, shop.y);
        this.cool = 14;
        return true;
      }
      if (w.wander) {
        host.walkTo(w.wander.x, w.wander.y);
        this.cool = 16;
        return true;
      }
      if (w.explore) {
        this.desireXY = { x: w.explore.x, y: w.explore.y };
        host.walkTo(w.explore.x, w.explore.y);
        this.cool = 16;
        return true;
      }
      if (w.hub) {
        host.walkTo(w.hub.x, w.hub.y);
        this.cool = 14;
        return true;
      }
      this.cool = 12;
      return true;
    }
    /**
     * Eng 2080 / R49: durable leave under escalate latch — expire cool stickies that
     * feed kiteExploreCoolActive, soft-end quiet window, walk explore/chest/shop.
     * Never arm kiteCoolExitUntil / reentryBan (that reopened grace theater).
     * Eng 2081 / R50: first durable only; further re-entry → finishDurableLeaveSettle.
     * Eng 2082 / R51: settle live → soft finish; hits≥1 after settle expire → no re-arm.
     * Eng 2083 / R52: after settle closed → finishDurableLeaveDone (NOT finish settle sink).
     */
    durableEscalateLeaveExit(host, w, stance, why) {
      var _a, _b, _c, _d;
      if (this.durableLeaveHierarchyReleased) {
        return this.finishPostHierarchyReleaseQuiet(host, w, stance, `durable-after-release ${why}`);
      }
      if (this.durableLeaveSettleActive()) {
        return this.routeDurableLeaveSettleOrEscape(host, w, stance, why);
      }
      if (this.durableLeaveSettleClosed() || this.durableEscalateLeaveHits >= 1) {
        if (!this.durableLeaveSettleDone) this.markDurableLeaveSettleDone(host, why);
        return this.routeDurableLeaveClosed(host, w, stance, why);
      }
      this.durableEscalateLeaveHits++;
      this.durableLeaveSettleUntil = Math.max(this.durableLeaveSettleUntil, this.runTicks + 1920);
      this.durableLeaveSettleEmitUntil = this.runTicks + 128;
      this.latchThrash();
      this.latchClash();
      this.exploreKiteBreakUntil = Math.min(this.exploreKiteBreakUntil, this.runTicks);
      this.stickyExploreBlockUntil = Math.min(this.stickyExploreBlockUntil, this.runTicks);
      this.stuckWanderBreakUntil = Math.min(this.stuckWanderBreakUntil, this.runTicks);
      this.campChainBreakUntil = Math.min(this.campChainBreakUntil, this.runTicks);
      this.foodMineBreakUntil = Math.min(this.foodMineBreakUntil, this.runTicks);
      this.emergToolsBreakUntil = Math.min(this.emergToolsBreakUntil, this.runTicks);
      this.kiteCoolWanderBanUntil = Math.min(this.kiteCoolWanderBanUntil, this.runTicks);
      this.kiteCoolParkHits = 0;
      this.kiteCoolExitUntil = Math.min(this.kiteCoolExitUntil, this.runTicks);
      this.kiteCoolReentryBanUntil = Math.min(this.kiteCoolReentryBanUntil, this.runTicks);
      if (this.beginnerToolsIncomplete(host)) {
        this.quietBreakEscalateUntil = Math.max(
          this.quietBreakEscalateUntil,
          this.runTicks + 640
        );
      }
      this.stickyPhaseLeaveArmed = true;
      this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
      this.clearFundIntent("tool");
      this.stuckRecentStatus = this.stuckRecentStatus.filter(
        (s) => !/kite cool|kite-cool-wander|quiet hold — escalate leave|sticky progress|sticky leave|phase cool|lethal|FIRST_WEP hold/i.test(s)
      );
      if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
        this.h1001.phase = "GEAR_FARM";
      } else if (host.hasTool("pickaxe")) {
        this.h1001.phase = "FIRST_WEP";
      } else {
        this.h1001.phase = "TOOLS";
      }
      this.noteAction(`escalate leave durable (${why})`);
      host.log(`AUTO: escalate leave durable \u2014 no quiet re-arm (2083) ${why}`);
      this.setStatus1001(host, w, stance, "quiet hold \u2014 durable settle");
      const chest = (_b = (_a = w.seen) == null ? void 0 : _a.chest) != null ? _b : this.mem(w, "chest");
      const shop = this.mem(w, "shop");
      if (chest && !this.isGatherTileBlocked(chest.x, chest.y)) {
        if (this.walkToTile(host, chest.x, chest.y)) {
          this.cool = 12;
          return true;
        }
      }
      if (shop) {
        host.walkTo(shop.x, shop.y);
        this.cool = 12;
        return true;
      }
      const rock = (_d = (_c = w.seen) == null ? void 0 : _c.rock) != null ? _d : this.mem(w, "rock");
      if (rock && host.hasTool("pickaxe") && !this.isGatherTileBlocked(rock.x, rock.y)) {
        if (this.walkToTile(host, rock.x, rock.y)) {
          this.cool = 12;
          return true;
        }
      }
      if (w.wander) {
        host.walkTo(w.wander.x, w.wander.y);
        this.cool = 14;
        return true;
      }
      if (w.explore) {
        this.desireXY = { x: w.explore.x, y: w.explore.y };
        host.walkTo(w.explore.x, w.explore.y);
        this.cool = 14;
        return true;
      }
      if (w.hub) {
        host.walkTo(w.hub.x, w.hub.y);
        this.cool = 12;
        return true;
      }
      this.cool = 10;
      return true;
    }
    /**
     * Eng 2071 / R40: arm cool-exit ban the moment we enter phase cool from sticky
     * break / wanderSpin — BEFORE first `kite cool wander` emit (2tnawb/q89t8h class).
     * 2070 only armed ban after exit theater; FIRST phase-cool→kite-cool was free.
     */
    armPhaseCoolNoKiteEmit() {
      this.kiteCoolReentryBanUntil = Math.max(this.kiteCoolReentryBanUntil, this.runTicks + 2560);
      this.stickyPhaseLeaveArmed = true;
      this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 1);
    }
    /**
     * Eng 2074 / R43: quiet hold must stay productive — 2073 latched FIRST_WEP hold
     * wander until WD. Quiet bans cool sticky re-arm / grace re-label; must not freeze kit.
     * Eng 2075 / R44: tools-incomplete must NOT early-return bootstrap forever
     * (r45ghz/5sd7u8/k9k4wt bootstrap↔fund WD; kit_ok=0). Bootstrap mono / fund↔bootstrap
     * escalate to explore/shop/chest; progress leave when tools complete or mono.
     * Eng 2076 / R45: durable quietBootstrapBreakUntil latch — ring hits≥6 unreachable
     * for pure bootstrap mono (s856v3/9m6543); break must not reset via status filter
     * (pbbfcs/ax3v57 bootstrap↔break/fund). Emit≥3 → 640t break; while latched never
     * brief bootstrap.
     * Eng 2077 / R46: break path itself mono'd with kite cool exit grace (x4j899
     * 66× break / 34× grace). Cap via quietBreakEmitHits≥3 escalate — clear latch +
     * kitAcquireBlock, soft-end grace, try kit acquire or sticky leave (not another
     * explore break that refreshes BreakUntil forever).
     * Eng 2078 / R47: escalate itself re-entered bootstrap (sukdr2 15× escalate;
     * 3qj9mc/b2p78x/jyh55k). 2077 cleared ring + reset EmitHits → tools bootstrap next
     * tick. Durable quietBreakEscalateUntil bans bootstrap/break; escalate leave only.
     */
    quietBreakEscalateActive() {
      return this.runTicks < this.quietBreakEscalateUntil;
    }
    /**
     * Eng 2087 / R56: post hierarchy RELEASE productive quiet — mine/wander/hub only.
     * Never finishQuietBreakEscalated / escalate leave sticky / TOOLS sticky phase cool.
     * Eng 2088 / R57: hit-cap + same-tile gather block — 2087 looped post-RELEASE mine
     * / sticky TOOLS / pond-break-cap forever (5366ma/6d6r8k/rmg8sf WD).
     * Eng 2089 / R58: do NOT expireDurableCoolForHierarchy on every quiet emit (cleared
     * escape breakers → escape↔quiet prison 6pajs5/wbx74t/k7ehgt). Escape cool latch +
     * escape-count ban → yield false so FIRST_WEP/combat hierarchy can run.
     * Eng 2090 / R59: ban after first escape (≥1); arm foodMine/sellOre/pond break on
     * escape so food sell↔pond cannot re-prison after RELEASE (avsnmu/jmg85x/ybtec8).
     */
    postHierarchyReleaseEscapeActive() {
      return this.runTicks < this.postHierarchyReleaseEscapeUntil;
    }
    finishPostHierarchyReleaseQuiet(host, w, stance, why) {
      var _a, _b, _c, _d, _e, _f;
      if (this.postHierarchyReleaseEscapeActive() || this.postHierarchyReleaseEscapeCount >= 1 || this.isLifeEscapeSpent()) {
        if (this.isLifeEscapeSpent() || this.postHierarchyReleaseEscapeCount >= 1) {
          this.markLifeEscapeSpent(host, `post-RELEASE-quiet:${why}`);
          return this.oneProductiveQuietAfterRelease(host, w, stance, `post-RELEASE-quiet:${why}`);
        }
        this.stickyPhaseLeaveArmed = true;
        this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
        this.durableLeaveSettleDone = true;
        this.latchThrash();
        this.latchClash();
        host.log(`AUTO: post hierarchy RELEASE cool yield (3000) ${why}`);
        this.cool = 8;
        return false;
      }
      this.stuckRecentStatus = this.stuckRecentStatus.filter(
        (s) => !/quiet hold — escalate leave|TOOLS sticky|phase cool|sticky progress|sticky leave|durable leave settle|quiet hold — durable settle/i.test(s)
      );
      if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
        this.h1001.phase = "GEAR_FARM";
      } else if (host.hasTool("pickaxe")) {
        this.h1001.phase = "FIRST_WEP";
      } else {
        this.h1001.phase = "TOOLS";
      }
      this.postHierarchyReleaseHits++;
      const familyHits = this.statusFamilyHits(/quiet hold — post RELEASE|post-RELEASE mine|post-RELEASE escape/);
      const stickyWhy = /sticky TOOLS sticky|sticky emerg-tools|sticky stuck-wander|pond-break-cap|first-wep-hold|cool-active/i.test(why);
      const escape = this.postHierarchyReleaseHits >= 8 || familyHits >= 6 || stickyWhy && this.postHierarchyReleaseHits >= 4 || this.postHierarchyReleaseMineHits >= 3;
      if (escape) {
        this.latchThrash();
        this.latchClash();
        const rockEsc = (_b = (_a = w.seen) == null ? void 0 : _a.rock) != null ? _b : this.mem(w, "rock");
        if (rockEsc) this.blockGatherTile(rockEsc.x, rockEsc.y);
        this.armBreakerExploreCool(1024);
        this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 768);
        this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 1024);
        this.emergToolsBreakUntil = Math.max(this.emergToolsBreakUntil, this.runTicks + 768);
        this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 1024);
        this.pondBreakUntil = Math.min(this.pondBreakUntil, this.runTicks);
        this.postHierarchyReleaseHits = 0;
        this.postHierarchyReleaseMineKey = "";
        this.postHierarchyReleaseMineHits = 0;
        this.postHierarchyReleaseEscapeCount++;
        this.postHierarchyReleaseEscapeUntil = this.runTicks + 2048;
        this.markLifeEscapeSpent(host, `post-RELEASE-escape:${why}`);
        this.foodMineBreakUntil = Math.max(this.foodMineBreakUntil, this.runTicks + 1024);
        this.sellOreBreakUntil = Math.max(this.sellOreBreakUntil, this.runTicks + 1024);
        this.armPondBreakSticky(1024, true);
        this.durableLeaveSettleDone = true;
        this.durableLeaveSettleUntil = Math.min(this.durableLeaveSettleUntil, this.runTicks);
        this.quietBreakEscalateUntil = Math.min(this.quietBreakEscalateUntil, this.runTicks);
        this.quietEscalateLeaveHits = 0;
        this.quietBreakEscalateHits = 0;
        this.instaOscLeaveArmed = true;
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/quiet hold — post RELEASE|post-RELEASE mine|TOOLS sticky|emerg-tools|pond-break-cap|stuck-wander|first-wep-hold|durable leave settle|quiet hold — durable settle/i.test(s)
        );
        this.noteAction(`post-RELEASE escape (${why})`);
        host.log(`AUTO: post hierarchy RELEASE \u2192 productive quiet (3011) #${this.postHierarchyReleaseEscapeCount} ${why}`);
        return this.oneProductiveQuietAfterRelease(host, w, stance, `post-RELEASE-escape:${why}`);
      }
      this.noteAction(`quiet hold \u2014 post RELEASE (${why})`);
      host.log(`AUTO: post hierarchy RELEASE quiet (2090) ${why}`);
      this.setStatus1001(host, w, stance, "quiet hold \u2014 post RELEASE");
      const rock = (_d = (_c = w.seen) == null ? void 0 : _c.rock) != null ? _d : this.mem(w, "rock");
      if (rock && host.hasTool("pickaxe") && !this.isGatherTileBlocked(rock.x, rock.y)) {
        const key = `${rock.x},${rock.y}`;
        if (key === this.postHierarchyReleaseMineKey) {
          this.postHierarchyReleaseMineHits++;
        } else {
          this.postHierarchyReleaseMineKey = key;
          this.postHierarchyReleaseMineHits = 1;
        }
        if (this.postHierarchyReleaseMineHits >= 3) {
          this.blockGatherTile(rock.x, rock.y);
          this.postHierarchyReleaseMineKey = "";
          this.postHierarchyReleaseMineHits = 0;
          host.log(`AUTO: post-RELEASE same-tile mine block (2089) ${key}`);
        } else {
          if (this.walkToTile(host, rock.x, rock.y)) {
            this.cool = 10;
            return true;
          }
          if (this.tryGather(host, w, stance, "post-RELEASE mine")) {
            this.cool = 8;
            return true;
          }
        }
      } else {
        this.postHierarchyReleaseMineKey = "";
        this.postHierarchyReleaseMineHits = 0;
      }
      const chest = (_f = (_e = w.seen) == null ? void 0 : _e.chest) != null ? _f : this.mem(w, "chest");
      if (chest && !this.isGatherTileBlocked(chest.x, chest.y)) {
        if (this.walkToTile(host, chest.x, chest.y)) {
          this.cool = 10;
          return true;
        }
      }
      if (w.wander) {
        host.walkTo(w.wander.x, w.wander.y);
        this.cool = 12;
        return true;
      }
      if (w.hub) {
        host.walkTo(w.hub.x, w.hub.y);
        this.cool = 10;
        return true;
      }
      if (w.explore) {
        this.desireXY = { x: w.explore.x, y: w.explore.y };
        host.walkTo(w.explore.x, w.explore.y);
        this.cool = 12;
        return true;
      }
      this.cool = 10;
      return true;
    }
    finishQuietHoldProgress(host, w, stance, why) {
      var _a, _b, _c, _d;
      this.stickyPhaseLeaveArmed = true;
      this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
      this.armPhaseCoolNoKiteEmit();
      if (this.durableLeaveHierarchyReleased) {
        return this.finishPostHierarchyReleaseQuiet(host, w, stance, why);
      }
      if (!this.beginnerToolsIncomplete(host)) {
        this.quietBootstrapEmitHits = 0;
        this.quietBootstrapBreakUntil = 0;
        this.quietBreakEmitHits = 0;
        this.quietBreakEscalateUntil = Math.min(this.quietBreakEscalateUntil, this.runTicks);
        this.quietBreakEscalateHits = 0;
        this.quietEscalateLeaveHits = 0;
        this.durableEscalateLeaveHits = 0;
        this.durableLeaveSettleUntil = Math.min(this.durableLeaveSettleUntil, this.runTicks);
        this.durableLeaveSettleEmitUntil = 0;
        this.durableLeaveSettleDone = true;
        this.durableLeaveSettleHits = 0;
      }
      if (this.quietBreakEscalateActive() || this.quietBreakEscalateHits >= 3) {
        return this.finishQuietBreakEscalated(host, w, stance, why);
      }
      const bootLatched = this.runTicks < this.quietBootstrapBreakUntil;
      const bootHits = this.statusFamilyHits(/quiet hold — tools/);
      const breakHits = this.statusFamilyHits(/quiet hold — bootstrap break/);
      const holdHits = this.statusFamilyHits(
        /FIRST_WEP hold|quiet hold — tools|quiet hold — progress|quiet hold — bootstrap break/
      );
      const breakGraceOsc = this.statusOscPair(
        /quiet hold — bootstrap break/,
        /kite cool exit grace|kite cool exit|phase cool|stuck rethink/
      );
      if (this.quietBreakEmitHits >= 3 || breakHits >= 4 || breakGraceOsc) {
        return this.escalateQuietBreakMono(host, w, stance, why);
      }
      const bootstrapMono = bootLatched || this.quietBootstrapEmitHits >= 3 || bootHits >= 4 || this.statusOscPair(
        /quiet hold — tools|quiet hold — bootstrap break/,
        /tools fund sell|tools-hatchet hang|FIRST_WEP hold|kite cool exit grace|stuck rethink/
      ) || this.statusFamilyHits(/tools fund sell|tools-hatchet hang/) >= 3 && bootHits >= 2 || breakHits >= 2;
      if (this.beginnerToolsIncomplete(host) && !bootstrapMono) {
        this.clearFundIntent("food");
        this.h1001.phase = "TOOLS";
        const anvil = this.mem(w, "anvil");
        const needPick = !host.hasTool("pickaxe");
        const tool = needPick ? "pickaxe" : "hatchet";
        this.quietBootstrapEmitHits++;
        if (this.quietBootstrapEmitHits >= 3) {
          this.quietBootstrapBreakUntil = Math.max(
            this.quietBootstrapBreakUntil,
            this.runTicks + 640
          );
          this.kitAcquireBlockUntil = Math.max(this.kitAcquireBlockUntil, this.runTicks + 192);
        } else {
          if (this.tryKitAcquireWalk(host, w, stance, tool, anvil)) {
            host.log(`AUTO: quiet hold \u2014 tools bootstrap ${tool} (2078) ${why}`);
            this.cool = 8;
            return true;
          }
          this.noteAction("quiet hold \u2014 tools bootstrap");
          host.log(`AUTO: quiet hold \u2014 tools bootstrap wander (2078) ${why}`);
          this.setStatus1001(host, w, stance, "quiet hold \u2014 tools bootstrap");
          const shop = this.mem(w, "shop");
          const dest = anvil || shop || w.hub || w.wander;
          if (dest) host.walkTo(dest.x, dest.y);
          else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
          this.cool = 10;
          return true;
        }
      }
      if (bootstrapMono || bootLatched || holdHits >= 6 || this.statusOscPair(
        /FIRST_WEP hold|quiet hold — tools/,
        /tools fund sell|tools-hatchet hang|kite cool exit grace|stuck rethink/
      ) || this.statusFamilyHits(/tools fund sell/) >= 4 && holdHits >= 3) {
        if (this.beginnerToolsIncomplete(host) && !bootLatched) {
          this.quietBootstrapBreakUntil = Math.max(
            this.quietBootstrapBreakUntil,
            this.runTicks + 640
          );
        }
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/FIRST_WEP hold|tools fund sell|tools-hatchet hang|kite cool exit grace|quiet hold/i.test(s)
        );
        this.clearFundIntent("tool");
        this.quietBreakEmitHits++;
        if (this.quietBreakEmitHits >= 3) {
          return this.escalateQuietBreakMono(host, w, stance, `break-hits ${why}`);
        }
        const rock = (_b = (_a = w.seen) == null ? void 0 : _a.rock) != null ? _b : this.mem(w, "rock");
        if (rock && host.hasTool("pickaxe") && host.hasTool("hatchet") && !this.isGatherTileBlocked(rock.x, rock.y) && !this.kiteCoolMineBanActive()) {
          this.noteAction("quiet hold \u2014 progress mine");
          host.log(`AUTO: quiet hold \u2014 progress mine (2078) ${why}`);
          this.setStatus1001(host, w, stance, "quiet hold \u2014 progress mine");
          if (this.walkToTile(host, rock.x, rock.y)) {
            this.cool = 8;
            return true;
          }
          if (this.tryGather(host, w, stance, "quiet hold mine")) {
            this.cool = 6;
            return true;
          }
          this.blockGatherTile(rock.x, rock.y);
        }
        if (this.beginnerToolsIncomplete(host) || bootstrapMono || bootLatched) {
          this.h1001.phase = "TOOLS";
          this.noteAction("quiet hold \u2014 bootstrap break");
          host.log(`AUTO: quiet hold \u2014 bootstrap break explore (2078) ${why}`);
          this.setStatus1001(host, w, stance, "quiet hold \u2014 bootstrap break");
          const shop = this.mem(w, "shop");
          const chest = (_d = (_c = w.seen) == null ? void 0 : _c.chest) != null ? _d : this.mem(w, "chest");
          if (shop && w.coins < 30) {
            if (chest && !this.isGatherTileBlocked(chest.x, chest.y)) {
              if (this.walkToTile(host, chest.x, chest.y)) {
                this.cool = 10;
                return true;
              }
            }
            if (w.explore) {
              this.desireXY = { x: w.explore.x, y: w.explore.y };
              host.walkTo(w.explore.x, w.explore.y);
            } else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
            else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
            this.cool = 14;
            return true;
          }
          if (shop) {
            host.walkTo(shop.x, shop.y);
            this.cool = 12;
            return true;
          }
          if (chest && !this.isGatherTileBlocked(chest.x, chest.y)) {
            if (this.walkToTile(host, chest.x, chest.y)) {
              this.cool = 10;
              return true;
            }
          }
          if (w.explore) {
            this.desireXY = { x: w.explore.x, y: w.explore.y };
            host.walkTo(w.explore.x, w.explore.y);
          } else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
          else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
          this.cool = 14;
          return true;
        }
        host.log(`AUTO: quiet hold \u2014 sticky progress leave (2078) ${why}`);
        return this.tryStickyProgressLeave(host, w, stance, `quiet-hold ${why}`);
      }
      this.noteAction("FIRST_WEP hold \u2014 wander");
      host.log(`AUTO: quiet hold \u2014 wander (2078) ${why}`);
      this.setStatus1001(host, w, stance, "FIRST_WEP hold \u2014 wander");
      if (w.wander) host.walkTo(w.wander.x, w.wander.y);
      else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
      else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
      this.cool = 10;
      return true;
    }
    /**
     * Eng 2077 / R46: leave bootstrap-break ↔ kite-cool-grace theater.
     * Eng 2078 / R47: arm durable quietBreakEscalateUntil so finishQuietHoldProgress
     * cannot re-enter tools bootstrap next tick (sukdr2/3qj9mc). Soft-end reentry ban
     * so tryStickyProgressLeave does not label FIRST_WEP hold — wander under quiet.
     * Eng 2079 / R48: do NOT re-arm quiet window after escalate (leave↔grace 8f2a8t).
     */
    escalateQuietBreakMono(host, w, stance, why) {
      this.latchThrash();
      this.latchClash();
      this.quietBootstrapBreakUntil = Math.min(this.quietBootstrapBreakUntil, this.runTicks);
      this.quietBootstrapEmitHits = 0;
      this.quietBreakEmitHits = Math.max(this.quietBreakEmitHits, 3);
      this.quietBreakEscalateHits++;
      this.quietBreakEscalateUntil = Math.max(
        this.quietBreakEscalateUntil,
        this.runTicks + 960
      );
      this.kitAcquireBlockUntil = Math.min(this.kitAcquireBlockUntil, this.runTicks);
      this.kiteCoolExitUntil = Math.min(this.kiteCoolExitUntil, this.runTicks);
      this.kiteCoolReentryBanUntil = Math.min(this.kiteCoolReentryBanUntil, this.runTicks);
      this.stuckRecentStatus = this.stuckRecentStatus.filter(
        (s) => !/kite cool exit|FIRST_WEP hold|tools fund|phase cool|stuck rethink/i.test(s)
      );
      this.clearFundIntent("tool");
      this.stickyPhaseLeaveArmed = true;
      this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
      this.h1001.phase = "TOOLS";
      this.noteAction("quiet hold \u2014 break escalate");
      host.log(`AUTO: quiet hold \u2014 break escalate kit/leave (2079) ${why}`);
      this.setStatus1001(host, w, stance, "quiet hold \u2014 break escalate");
      return this.finishQuietBreakEscalated(host, w, stance, `escalate ${why}`);
    }
    /**
     * Eng 2078 / R47: productive leave under escalate latch — no tools bootstrap,
     * no bootstrap break explore, no FIRST_WEP hold wander. One kit try if hits≤1;
     * else explore/chest/shop or sticky progress leave.
     * Eng 2079 / R48: NEVER armPhaseCoolNoKiteEmit here — that re-armed
     * kiteCoolReentryBanUntil and bounced into finishKiteCoolExitGrace → grace
     * re-label → escalate leave forever (8f2a8t 66×/34×). Soft-end quiet window;
     * cap leave emits → sticky progress leave.
     * Eng 2080 / R49: sticky cap routes through durableEscalateLeaveExit (no cool
     * sticky re-arms / no park quiet reopen).
     */
    finishQuietBreakEscalated(host, w, stance, why) {
      var _a, _b;
      this.latchThrash();
      this.kiteCoolExitUntil = Math.min(this.kiteCoolExitUntil, this.runTicks);
      this.kiteCoolReentryBanUntil = Math.min(this.kiteCoolReentryBanUntil, this.runTicks);
      this.stickyPhaseLeaveArmed = true;
      this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
      this.clearFundIntent("tool");
      this.h1001.phase = "TOOLS";
      if (this.beginnerToolsIncomplete(host)) {
        this.quietBreakEscalateUntil = Math.max(
          this.quietBreakEscalateUntil,
          this.runTicks + 640
        );
      }
      this.quietEscalateLeaveHits++;
      if (this.quietEscalateLeaveHits >= 3 || this.statusFamilyHits(/quiet hold — escalate leave/) >= 4 || this.statusOscPair(
        /quiet hold — escalate leave/,
        /kite cool exit grace|kite cool exit|phase cool/
      )) {
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/kite cool exit grace|quiet hold — escalate leave|phase cool/i.test(s)
        );
        this.noteAction("quiet hold \u2014 escalate leave sticky");
        host.log(`AUTO: quiet hold \u2014 escalate leave sticky (2079) ${why}`);
        this.setStatus1001(host, w, stance, "quiet hold \u2014 escalate leave sticky");
        return this.tryStickyProgressLeave(host, w, stance, `escalate-leave-cap ${why}`);
      }
      this.noteAction("quiet hold \u2014 escalate leave");
      host.log(`AUTO: quiet hold \u2014 escalate leave (2079) ${why}`);
      this.setStatus1001(host, w, stance, "quiet hold \u2014 escalate leave");
      if (this.beginnerToolsIncomplete(host) && this.quietBreakEscalateHits <= 1 && this.quietEscalateLeaveHits <= 1 && this.runTicks >= this.kitAcquireBlockUntil) {
        const anvil2 = this.mem(w, "anvil");
        const needPick = !host.hasTool("pickaxe");
        const tool = needPick ? "pickaxe" : "hatchet";
        if (this.tryKitAcquireWalk(host, w, stance, tool, anvil2)) {
          this.kitAcquireBlockUntil = Math.max(this.kitAcquireBlockUntil, this.runTicks + 96);
          this.cool = 8;
          return true;
        }
      }
      const shop = this.mem(w, "shop");
      const chest = (_b = (_a = w.seen) == null ? void 0 : _a.chest) != null ? _b : this.mem(w, "chest");
      const anvil = this.mem(w, "anvil");
      if (this.beginnerToolsIncomplete(host) && w.coins < 30) {
        if (chest && !this.isGatherTileBlocked(chest.x, chest.y)) {
          if (this.walkToTile(host, chest.x, chest.y)) {
            this.cool = 10;
            return true;
          }
        }
        if (w.explore) {
          this.desireXY = { x: w.explore.x, y: w.explore.y };
          host.walkTo(w.explore.x, w.explore.y);
          this.cool = 14;
          return true;
        }
        if (w.wander) {
          host.walkTo(w.wander.x, w.wander.y);
          this.cool = 12;
          return true;
        }
      }
      if (this.beginnerToolsIncomplete(host) && (anvil || shop)) {
        const dest = anvil || shop;
        if (dest) {
          host.walkTo(dest.x, dest.y);
          this.cool = 12;
          return true;
        }
      }
      if (chest && !this.isGatherTileBlocked(chest.x, chest.y)) {
        if (this.walkToTile(host, chest.x, chest.y)) {
          this.cool = 10;
          return true;
        }
      }
      if (w.explore) {
        this.desireXY = { x: w.explore.x, y: w.explore.y };
        host.walkTo(w.explore.x, w.explore.y);
        this.cool = 14;
        return true;
      }
      if (w.wander) {
        host.walkTo(w.wander.x, w.wander.y);
        this.cool = 12;
        return true;
      }
      if (w.hub) {
        host.walkTo(w.hub.x, w.hub.y);
        this.cool = 12;
        return true;
      }
      return this.tryStickyProgressLeave(host, w, stance, `escalate-leave ${why}`);
    }
    /** Eng 2071: sticky phase leave or phase cool already in ring → no kite cool emit. */
    phaseCoolNoKiteWander() {
      return this.stickyPhaseLeaveArmed || this.kiteCoolReentryBanActive() || this.statusFamilyHits(/phase cool/) >= 1;
    }
    /**
     * Eng 2069 / R38: while grace live, expire cool inputs again + walk explore —
     * never set kite cool hub / re-arm wander ban (prevents hub re-park).
     * Eng 2070 / R39: also used under reentry ban when cool stickies reappear.
     */
    finishKiteCoolExitGrace(host, w, stance, why) {
      this.exploreKiteBreakUntil = Math.min(this.exploreKiteBreakUntil, this.runTicks);
      this.stickyExploreBlockUntil = Math.min(this.stickyExploreBlockUntil, this.runTicks);
      this.stuckWanderBreakUntil = Math.min(this.stuckWanderBreakUntil, this.runTicks);
      this.campChainBreakUntil = Math.min(this.campChainBreakUntil, this.runTicks);
      this.foodMineBreakUntil = Math.min(this.foodMineBreakUntil, this.runTicks);
      this.kiteCoolWanderBanUntil = Math.min(this.kiteCoolWanderBanUntil, this.runTicks);
      this.kiteCoolParkHits = 0;
      this.stickyPhaseLeaveArmed = true;
      this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
      if (this.quietBreakEscalateActive() || this.quietBreakEscalateHits >= 2 || this.quietEscalateLeaveHits >= 1 || this.statusFamilyHits(/quiet hold — escalate leave/) >= 1) {
        this.kiteCoolExitUntil = Math.min(this.kiteCoolExitUntil, this.runTicks);
        this.kiteCoolReentryBanUntil = Math.min(this.kiteCoolReentryBanUntil, this.runTicks);
        return this.finishQuietBreakEscalated(host, w, stance, `grace-pre-escalated ${why}`);
      }
      const graceTheater = this.statusFamilyHits(/kite cool exit grace/) >= 1 || this.statusFamilyHits(/phase cool|flat thrash|flat rethink/) >= 1;
      this.stuckRecentStatus = this.stuckRecentStatus.filter(
        (s) => !/kite cool exit grace|phase cool|flat thrash|flat rethink|kite cool wander|kite cool hub/i.test(s)
      );
      if (graceTheater) {
        if (this.quietBreakEscalateActive() || this.quietBreakEscalateHits >= 2 || this.quietEscalateLeaveHits >= 1 || this.statusFamilyHits(/quiet hold — escalate leave/) >= 1) {
          this.kiteCoolExitUntil = Math.min(this.kiteCoolExitUntil, this.runTicks);
          this.kiteCoolReentryBanUntil = Math.min(this.kiteCoolReentryBanUntil, this.runTicks);
          return this.finishQuietBreakEscalated(host, w, stance, `grace-escalated ${why}`);
        }
        if (this.quietBreakEmitHits >= 2 || this.statusFamilyHits(/quiet hold — bootstrap break/) >= 2 || this.statusFamilyHits(/quiet hold — break escalate/) >= 1 || this.statusOscPair(
          /quiet hold — bootstrap break/,
          /kite cool exit grace|kite cool exit|phase cool/
        )) {
          return this.escalateQuietBreakMono(host, w, stance, `grace-break ${why}`);
        }
        return this.finishQuietHoldProgress(host, w, stance, `grace-theater ${why}`);
      }
      this.noteAction("kite cool exit grace");
      host.log(`AUTO: kite cool exit grace \u2014 wander not explore (2072) ${why}`);
      this.setStatus(host, w, stance, "kite cool exit grace");
      if (w.wander) host.walkTo(w.wander.x, w.wander.y);
      else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
      else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
      this.cool = 10;
      return true;
    }
    /**
     * Eng 2061 / R30: explore↔lethal / FIRST_WEP hold-explore cool window.
     * Eng 2062 / R31: also while campChain / foodMine break — recovery `— explore`
     * labels were rearming bare explore outside the 2061 sticky set.
     * While any of these stickies live, bare explore fallback is banned.
     */
    kiteExploreCoolActive() {
      return this.exploreKiteBreakActive() || this.stickyExploreBlockActive() || this.stuckWanderBreakActive() || this.campChainBreakActive() || this.foodMineBreakActive() || this.pondBreakActive();
    }
    /**
     * Eng 2062 / R31: when a breaker recovers via explore, latch sticky so the
     * next hierarchy fall-through cannot rearm bare `explore |` into lethal flaps.
     */
    armBreakerExploreCool(ticks = 768) {
      this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + ticks);
      this.exploreKiteBreakUntil = Math.max(
        this.exploreKiteBreakUntil,
        this.runTicks + Math.max(384, Math.floor(ticks * 0.75))
      );
      this.stuckWanderBreakUntil = Math.max(
        this.stuckWanderBreakUntil,
        this.runTicks + Math.max(256, Math.floor(ticks * 0.5))
      );
    }
    /** Eng 2050: cool after GEAR camp_chain round-trip tree/shop/rock osc. */
    campChainBreakActive() {
      return this.runTicks < this.campChainBreakUntil;
    }
    /**
     * Eng 2049 / R19: sticky leave must not perpetual-hub while rethink/emerg/lethal
     * re-fire (hfpa6f/kr6sst/w5fkg3/bmkjzd/gbwzpd/93ahj4/8keazu/2hgqx6/65m7s9/nybszk
     * sticky↔rethink WD; f26msz/97uvuk emerg; dzt2jh lethal; aabkqf fund-sell).
     * Prefer rock mine → explore → wander → hub last. Extends stickies.
     */
    tryStickyProgressLeave(host, w, stance, why) {
      var _a, _b, _c, _d;
      if (this.durableLeaveSettleActive()) {
        return this.routeDurableLeaveSettleOrEscape(host, w, stance, `sticky ${why}`);
      }
      if (this.durableLeaveSettleClosed()) {
        return this.routeDurableLeaveClosed(host, w, stance, `sticky ${why}`);
      }
      if (this.quietEscalateLeaveLatchActive()) {
        return this.durableEscalateLeaveExit(host, w, stance, `sticky ${why}`);
      }
      if (this.kiteCoolExitQuietActive()) {
        this.stickyPhaseLeaveArmed = true;
        this.stickyLeaveRethinks = Math.max(this.stickyLeaveRethinks, 2);
        this.clearFundIntent("tool");
        this.stuckRecentStatus = this.stuckRecentStatus.filter(
          (s) => !/stuck rethink|sticky leave|sticky progress|tools wander|tools explore|lethal|explore-kite|gear-explore-kite|kite cool exit|first wep|FIRST_WEP hold/i.test(s)
        );
        this.noteAction(`quiet sticky wander (${why})`);
        host.log(`AUTO: quiet sticky \u2014 wander not explore (2072) ${why}`);
        this.setStatus(host, w, stance, "FIRST_WEP hold \u2014 wander");
        if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        else if (w.explore) {
          this.desireXY = { x: w.explore.x, y: w.explore.y };
          host.walkTo(w.explore.x, w.explore.y);
        }
        this.cool = 12;
        return true;
      }
      this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 768);
      this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 640);
      this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 480);
      this.emergToolsBreakUntil = Math.max(this.emergToolsBreakUntil, this.runTicks + 384);
      this.clearFundIntent("tool");
      this.stickyLeaveRethinks = 0;
      this.stuckRecentStatus = this.stuckRecentStatus.filter(
        (s) => !/stuck rethink|sticky leave|sticky progress|tools wander|tools explore|tools fund|emerg hub|emerg find|lethal|explore-kite|emerg-tools|fund sell|first wep|first-wep osc/i.test(s)
      );
      if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
        this.h1001.phase = "GEAR_FARM";
      } else if (host.hasTool("pickaxe")) {
        this.h1001.phase = "FIRST_WEP";
      }
      if (this.stickyExploreBlockActive()) {
        this.stickyPhaseLeaveArmed = true;
        const rock2 = (_b = (_a = w.seen) == null ? void 0 : _a.rock) != null ? _b : this.mem(w, "rock");
        if (rock2 && host.hasTool("pickaxe") && !this.isGatherTileBlocked(rock2.x, rock2.y)) {
          this.noteAction(`sticky block mine (${why})`);
          host.log(`AUTO: sticky explore block mine (${why}) (2054)`);
          this.setStatus(host, w, stance, "phase cool mine");
          if (this.walkToTile(host, rock2.x, rock2.y)) {
            this.cool = 8;
            return true;
          }
          if (this.tryGather(host, w, stance, "sticky block mine")) {
            this.cool = 6;
            return true;
          }
          this.blockGatherTile(rock2.x, rock2.y);
        }
        this.noteAction(`sticky block divert (${why})`);
        host.log(`AUTO: sticky explore block divert (${why}) (2071)`);
        if (w.explore) {
          this.desireXY = { x: w.explore.x, y: w.explore.y };
          host.walkTo(w.explore.x, w.explore.y);
        } else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        this.armPhaseCoolNoKiteEmit();
        this.setStatus(host, w, stance, "phase cool");
        this.cool = 14;
        return true;
      }
      const mineMono = this.statusFamilyHits(/sticky progress — mine|sticky progress mine/) >= 3 || this.statusFamilyHits(/tools mine/) >= 3 || this.rockFindBreakActive();
      const rock = (_d = (_c = w.seen) == null ? void 0 : _c.rock) != null ? _d : this.mem(w, "rock");
      if (!mineMono && rock && host.hasTool("pickaxe") && !this.isGatherTileBlocked(rock.x, rock.y)) {
        this.noteAction(`sticky progress \u2014 mine (${why})`);
        host.log(`AUTO: sticky progress \u2014 mine (${why}) (2050)`);
        this.setStatus(host, w, stance, "sticky progress \u2014 mine");
        if (this.walkToTile(host, rock.x, rock.y)) {
          this.cool = 10;
          return true;
        }
        if (this.tryGather(host, w, stance, "sticky progress mine")) {
          this.cool = 8;
          return true;
        }
        this.blockGatherTile(rock.x, rock.y);
      }
      this.noteAction(`sticky progress \u2014 explore (${why})`);
      host.log(`AUTO: sticky progress \u2014 explore (${why}) (2050)`);
      this.setStatus(host, w, stance, "sticky progress \u2014 explore");
      if (w.explore) {
        this.desireXY = { x: w.explore.x, y: w.explore.y };
        host.walkTo(w.explore.x, w.explore.y);
      } else if (w.wander) {
        host.walkTo(w.wander.x, w.wander.y);
      } else if (w.hub) {
        host.walkTo(w.hub.x, w.hub.y);
      }
      this.cool = 12;
      return true;
    }
    /** Eng 2046: count ring hits matching a family regex (coords/tags ignored). */
    statusFamilyHits(re) {
      let n = 0;
      for (const s of this.stuckRecentStatus) {
        const fam = s.toLowerCase().replace(/\s*\|.*$/, "").replace(/\s*\(\d+,\d+\)\s*/g, " ").trim();
        if (re.test(fam)) n++;
      }
      return n;
    }
    /**
     * Eng 2035 / R4: tools find rock with explore/wander — or break-label explore
     * when rockFindBreakActive (m54rep/r7juze).
     */
    tryToolsFindRockOrBreak(host, w, stance) {
      var _a, _b;
      if (this.trwReenterBanned()) {
        return this.durableTrwBanWalk(host, w, stance, "trw-reenter-ban");
      }
      const breaking = this.rockFindBreakActive() || this.exploreKiteBreakActive() || this.emergToolsBreakActive() || this.hatchetChestBreakActive() || this.stuckWanderBreakActive();
      if (breaking && host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon || w.oreCount >= 3 || this.exploreKiteBreakActive() || this.emergToolsBreakActive() || this.hatchetChestBreakActive() || this.stuckWanderBreakActive())) {
        this.clearFundIntent("tool");
        if (w.hasMetalWeapon || w.hasStyleWeapon) this.h1001.phase = "GEAR_FARM";
        else this.h1001.phase = "FIRST_WEP";
        return false;
      }
      const stickyLeave = this.stuckWanderBreakActive() || this.exploreKiteBreakActive() || this.emergToolsBreakActive() || this.hatchetChestBreakActive();
      if (this.isLifeEscapeSpent() && this.rockFindBreakActive() && this.lifeSpentDivertHits >= 2) {
        if (this.trwReenterBanned()) {
          if (this.afterLifeEscapeCapped) return false;
          return this.durableTrwBanWalk(host, w, stance, "trw-reenter-ban");
        }
        this.noteAction("tools-rock-wander prison");
        if (this.lifeSpentDivertHits >= 4 || this.trwPrisonClearHits >= 1) {
          this.rockFindBreakUntil = 0;
          this.markTrwPrisonClear(host, "find-rock-yield");
          if (this.trwReenterBanned()) {
            return this.durableTrwBanWalk(host, w, stance, "trw-reenter-ban");
          }
        }
        if (this.phaseIntentLocked() && this.phaseIntentGoal !== "mine") return false;
        if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
          this.armPhaseIntent("GEAR_FARM", "hunt");
        } else if (host.hasTool("pickaxe") && this.trwPrisonClearHits < 1) {
          this.armPhaseIntent(this.h1001.phase === "TOOLS" ? "TOOLS" : "FIRST_WEP", "mine");
        } else {
          this.clearPhaseIntent();
          if (this.emitPostLifeEscapeOrFree(host, w, stance, true)) return true;
          return false;
        }
        return false;
      }
      const label = this.stickyExploreBlockActive() ? "phase cool" : stickyLeave ? "sticky progress \u2014 explore" : breaking ? "tools wander" : "tools find rock";
      if (this.oscCoolDivertActive() && /tools wander|phase cool|sticky progress|tools find rock/i.test(label)) {
        return this.coolHoldOscDivert(host, w, stance, "tools-label-cool-hold");
      }
      if (stickyLeave && !this.stickyExploreBlockActive()) {
        const mineMono = this.statusFamilyHits(/sticky progress — mine|sticky progress mine/) >= 3 || this.rockFindBreakActive();
        const rock = (_b = (_a = w.seen) == null ? void 0 : _a.rock) != null ? _b : this.mem(w, "rock");
        if (!mineMono && rock && host.hasTool("pickaxe") && !this.isGatherTileBlocked(rock.x, rock.y)) {
          this.setStatus1001(host, w, stance, "sticky progress \u2014 mine");
          if (this.walkToTile(host, rock.x, rock.y)) return true;
          if (this.tryGather(host, w, stance, "sticky progress mine")) return true;
          this.blockGatherTile(rock.x, rock.y);
        }
      }
      if (w.explore) {
        this.setStatus1001(host, w, stance, label);
        this.desireXY = { x: w.explore.x, y: w.explore.y };
        host.walkTo(w.explore.x, w.explore.y);
        return true;
      }
      if (w.wander) {
        this.setStatus1001(host, w, stance, label);
        host.walkTo(w.wander.x, w.wander.y);
        return true;
      }
      if (w.hub) {
        this.setStatus1001(host, w, stance, breaking ? label : "tools find rock");
        this.desireXY = { x: w.hub.x, y: w.hub.y };
        host.walkTo(w.hub.x, w.hub.y);
        return true;
      }
      if (breaking) {
        this.setStatus1001(host, w, stance, label);
        return true;
      }
      return false;
    }
    /**
     * Eng 2035 / 5wavp7: kit acquire with desire+walk; sameTile streak → cool-block
     * explore/mine so hang sameTile never parks on acquire claim alone.
     * Eng 2036 / R5: also tick-budget (≥32 without ownership even while moving) —
     * hub orbit never reaches sameTile 16 before stuck WD.
     */
    tryKitAcquireWalk(host, w, stance, tool, anvil) {
      var _a, _b;
      if (this.runTicks < this.kitAcquireBlockUntil) return false;
      if (tool === "hatchet" && this.hatchetChestBreakActive()) return false;
      this.kitAcquireTicks++;
      const label = tool === "pickaxe" ? "kit pickaxe" : tool === "hatchet" ? "kit hatchet" : "kit rod";
      this.setStatus1001(host, w, stance, label);
      const shop = this.mem(w, "shop");
      const dest = anvil || shop || w.hub;
      if (dest) this.desireXY = { x: dest.x, y: dest.y };
      const tileKey = `${w.tile.x},${w.tile.y}`;
      if (tileKey === this.kitAcquireTile) this.kitAcquireSameTile++;
      else {
        this.kitAcquireTile = tileKey;
        this.kitAcquireSameTile = 1;
      }
      if (host.acquireTool(tool)) {
        if (host.hasTool(tool)) {
          this.kitAcquireSameTile = 0;
          this.kitAcquireTile = "";
          this.kitAcquireTicks = 0;
          return true;
        }
      }
      const coolNow = this.kitAcquireSameTile >= 16 || this.kitAcquireTicks >= 32;
      if (coolNow) {
        this.kitAcquireBlockUntil = this.runTicks + 48;
        this.kitAcquireSameTile = 0;
        this.kitAcquireTile = "";
        this.kitAcquireTicks = 0;
        this.noteAction(`kit ${tool} cool \u2014 explore`);
        if (this.beginnerToolsIncomplete(host)) {
          this.clearFundIntent("food");
          this.h1001.phase = "TOOLS";
        }
        if (host.hasTool("pickaxe")) {
          const live = (_b = (_a = w.seen) == null ? void 0 : _a.rock) != null ? _b : this.mem(w, "rock");
          if (live && !this.isGatherTileBlocked(live.x, live.y)) {
            this.setStatus1001(host, w, stance, "kit cool \u2014 mine");
            if (this.walkToTile(host, live.x, live.y)) return true;
            if (this.tryGather(host, w, stance, "kit cool \u2014 mine")) return true;
          }
        }
        if (w.explore) {
          this.setStatus1001(host, w, stance, "kit cool \u2014 explore");
          host.walkTo(w.explore.x, w.explore.y);
          return true;
        }
        if (w.wander) {
          this.setStatus1001(host, w, stance, "kit cool \u2014 explore");
          host.walkTo(w.wander.x, w.wander.y);
          return true;
        }
        return false;
      }
      if (dest) {
        host.walkTo(dest.x, dest.y);
        return true;
      }
      if (w.explore) {
        host.walkTo(w.explore.x, w.explore.y);
        return true;
      }
      if (w.wander) {
        host.walkTo(w.wander.x, w.wander.y);
        return true;
      }
      return this.kitAcquireSameTile < 8;
    }
    /** Eng 2033: empty food + ore≥3 → liquidate before fish (t1735); drop queued ponds. */
    oreLiquidateBeforeFish(w) {
      if (this.runTicks < this.sellOreKeepBlockUntil || this.sellOreBreakActive()) return false;
      return this.foodPathEmpty(w) && w.oreCount >= 3;
    }
    dropEnroutePonds() {
      const stops = this.scan.enrouteStops;
      if (!stops.length) return;
      for (let i = stops.length - 1; i >= 0; i--) {
        if (stops[i].kind === "pond") stops.splice(i, 1);
      }
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
        ...this.detectMarks(),
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
     * Eng 2060 / t1789: latch thrash for the rest of this life (recovery may still break).
     */
    latchThrash() {
      this.markThrash = true;
      this.lifeThrash = true;
    }
    /** Eng 2060 / t1789: latch clash for the rest of this life. */
    latchClash() {
      this.markClash = true;
      this.lifeClash = true;
    }
    /** Eng 2060 / t1789: latch stuck for the rest of this life. */
    latchStuck() {
      this.markStuck = true;
      this.lifeStuck = true;
    }
    /**
     * Eng 2020 / t1669 + Eng 2060 life-latch: thrash | clash | stuck observational marks.
     * Always available for FHD / SIT / LIVE STATS. Latched bits survive combat/progress.
     */
    detectMarks() {
      return {
        thrash: !!(this.markThrash || this.lifeThrash),
        clash: !!(this.markClash || this.lifeClash),
        stuck: !!(this.markStuck || this.lifeStuck)
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
      if (/find pond|find shop|door through|door open/i.test(st) && this.desireXY) {
        return { key: `desire:${this.desireXY.x},${this.desireXY.y}`, x: this.desireXY.x, y: this.desireXY.y };
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
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
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
        const ignoreHpMp = this.statusIgnoresHpMpProgress(this.lastStatus || "");
        const hardProg = meters.xp !== this.stuckMeterXp || meters.gear !== this.stuckMeterGear;
        const softProg = meters.hp !== this.stuckMeterHp || meters.mp !== this.stuckMeterMp;
        meterProg = hardProg || !ignoreHpMp && softProg;
        metersFlat = !meterProg;
        this.stuckMeterAt = this.runTicks;
        this.stuckMeterXp = meters.xp;
        this.stuckMeterGear = meters.gear;
        this.stuckMeterHp = meters.hp;
        this.stuckMeterMp = meters.mp;
      } else {
        const ignoreHpMp = this.statusIgnoresHpMpProgress(this.lastStatus || "");
        const hardFlat = meters.xp === this.stuckMeterXp && meters.gear === this.stuckMeterGear;
        const softFlat = meters.hp === this.stuckMeterHp && meters.mp === this.stuckMeterMp;
        metersFlat = hardFlat && (ignoreHpMp || softFlat);
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
      if (/find pond/i.test(stNow) && metersFlat && !combatBusy && !gatherBusy) {
        this.findPondMonoStreak++;
      } else if (!/find pond|door through|door open|remembered door/i.test(stNow)) {
        this.findPondMonoStreak = 0;
      }
      if (this.tryStatusOscBreak(host, w, stance)) {
        this.latchThrash();
        if (uniqueStatuses >= 2) this.latchClash();
        this.stuckTicks = 0;
        this.stuckRecentTiles = [];
        return;
      }
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
          const parked = /food fell|sell for loot|fletch sell|bag stuck|wait anvil|hub for hatchet|cook fuel|dry ground|food fat|farm ceiling → next floor|stairs soft-block|hoard food|hoard fire|hoard loot|hoard explore|enroute pond|enroute gather|enroute toward gather|fish for food|open chest|remembered chest|remembered door|door through|door open|door thrash|find pond|tools fund chop|tools fund fish|tools fund hatchet|tools fund sell|tools fund pickaxe|tools fund|tools chop|tools mine|tools fish|tools hatchet|tools pickaxe|tools find shop|tools find rock|tools wait|tools explore|kit pickaxe|kit hatchet|kit cool|kit pickaxe thrash|food rod|food find shop|food fish|food sell ore|food last farm|food buffer|food farm thrash|pond thrash|pond osc|round-trip pond|round-trip rock|util fish|bag sell trim|bag forge|bag find shop|raw sell fund|hub forge\/clean|sell trim|gear cook|sell cook|chop for fire|first wep|mine first wep/i.test(stPark);
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
        const gatherIntent = /tools fund chop|tools fund fish|tools fund hatchet|tools fund|tools chop|tools mine|tools fish|tools hatchet|tools find rock|enroute gather|enroute pond|enroute toward gather|chop for|fund chop|fund mine|fish for food|farm food|food fish|food last farm|food buffer|food farm thrash|pond thrash|pond osc|find pond|round-trip pond|round-trip rock|(^|\s)fish(\s|$)|mine ore|mine gear|util chop|util mine|util fish|open chest|remembered chest|remembered door|door through|door open|door thrash|food sell ore|food find shop|sell trim|first wep|mine first wep/i.test(stG);
        if (gatherIntent && !gatherBusy && !realProg) {
          if (usefulApproach) walkOsc = true;
          usefulApproach = false;
        }
      }
      const insta = this.detectInstaOsc();
      if (insta) {
        this.latchThrash();
        if (insta.fams.length >= 2) this.latchClash();
      }
      const doorThrash = this.doorOscStreak >= 2;
      const sellTrimThrash = /sell trim|bag sell trim/i.test(stNow) && this.sellTrimNoSellStreak >= 2 && metersFlat;
      const findPondThrash = /find pond/i.test(stNow) && this.findPondMonoStreak >= 6 && metersFlat;
      if (doorThrash || sellTrimThrash || findPondThrash) walkOsc = true;
      const thrashNow = (metersFlat && repeatedAction && walkOsc || doorThrash || sellTrimThrash || findPondThrash) && !combatBusy && !gatherBusy && !striveBusy;
      const clashNow = (metersFlat && uniqueStatuses >= 2 && this.stuckRecentStatus.length >= 4 || metersFlat && /sell trim/i.test(stNow) && this.statusFamilyHits(/sell trim/) >= 2 && this.statusFamilyHits(/(?:^|\s)fish(?:\s|$)|gear score|explore|round-trip/) >= 2) && !combatBusy && !gatherBusy && !striveBusy;
      if (realProg || gatherBusy) this.findPondMonoStreak = 0;
      if (thrashNow) this.latchThrash();
      if (clashNow) this.latchClash();
      if (metersFlat && this.stuckTicks >= Math.floor(IDLE_STUCK_TICKS / 2) && !combatBusy && !gatherBusy && !striveBusy) {
        this.latchStuck();
        if (!this.wdFirstClassDiverted) {
          this.wdFirstClassDiverted = true;
          this.forceWdFirstClassDivert(host, w, stance, "near-stuck");
          this.stuckTicks = 0;
          return;
        }
      }
      if (metersFlat && !combatBusy && !gatherBusy && !striveBusy) {
        const actTail = this.actions.slice(-10);
        const lastAct = actTail[actTail.length - 1] || "";
        const actMono = !!lastAct && actTail.length >= 6 && actTail.filter((a) => a === lastAct).length >= 5;
        const shopWalkSpam = actTail.filter((a) => /walk to shop|sell unused|sell trim empty|gather fund/i.test(a)).length >= 4;
        const statusMono = topStatusHits >= 5 && this.stuckRecentStatus.length >= 5;
        const statusOscPersist = uniqueStatuses >= 2 && this.stuckRecentStatus.length >= 6 && topStatusHits >= 2;
        if (actMono || shopWalkSpam || statusMono || statusOscPersist && (walkOsc || doorThrash)) {
          this.latchThrash();
          if (statusOscPersist || uniqueStatuses >= 2) this.latchClash();
        }
      }
      const thrashing = this.markThrash || this.lifeThrash || walkOsc;
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
          this.wdFirstClassDiverted = false;
        }
        if (usefulApproach || realProg || combatBusy || striveBusy) {
          this.stuckRecentTiles = [];
        }
        return;
      }
      this.stuckTile = tile;
      this.stuckTicks += thrashing ? 2 : 1;
      if (metersFlat && this.stuckTicks >= Math.floor(IDLE_STUCK_TICKS / 2)) {
        this.latchStuck();
      }
      if (this.stuckTicks < IDLE_STUCK_TICKS) return;
      const keepStairs = this.stairsStrive && /ceiling thrash|farm ceiling|food fat/i.test(this.stairsStrive.label) && (w.healReserve > 0 || w.food > 0) && w.kitReady && w.descendSafe;
      if (keepStairs) {
        this.stuckTicks = 0;
        this.noteAction("stuck rethink \u2014 keep ceiling stairs");
        return;
      }
      this.latchStuck();
      if (thrashing) this.latchThrash();
      const stuckReason = this.markThrash || this.lifeThrash ? "stuck thrash (no approach / meters flat)" : this.markClash || this.lifeClash ? "stuck clash (status osc / meters flat)" : "stuck (no gear/food/exp/meters/approach)";
      try {
        (_a = host.onStuckProgress) == null ? void 0 : _a.call(host, {
          status: this.lastStatus || "stuck rethink",
          ticks: this.runTicks,
          thrashing: !!(this.markThrash || this.lifeThrash),
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
          this.forceWdFirstClassDivert(host, w, stance, "watchdog-arm");
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
          this.pondBreakUntil = Math.max(this.pondBreakUntil, this.runTicks + 512);
          this.dropEnroutePonds();
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
      const pondSpin = /find pond|farm food|enroute pond|enroute toward gather|regen to hub|food fish|emerg fish|tools fish|tools fund fish|(^|\s)fish(\s|$)|food last farm|food buffer|round-trip pond|util fish|food farm thrash/i.test(stRethink);
      if (pondSpin) this.pondRethinks++;
      const emptyFoodPath = w.food === 0 && w.healReserve === 0 && !this.hasBagCookables(w);
      const pondThresh = emptyFoodPath ? 1 : 3;
      if (this.pondRethinks >= pondThresh) {
        this.pondRethinks = 0;
        this.laneBias = "gear";
        if (this.lastFoodFarm) {
          this.noteGatherFail(this.lastFoodFarm.x, this.lastFoodFarm.y);
          this.noteAction("pond thrash \u2014 drop last food farm");
          this.lastFoodFarm = null;
          this.foodFarmSoftBlocks = 0;
        }
        const pondMem = (_d = this.mem(w, "pond")) != null ? _d : this.resolvePond(w);
        if (pondMem) this.noteGatherFail(pondMem.x, pondMem.y);
        this.dropEnroutePonds();
        this.armPondBreakSticky(emptyFoodPath ? 768 : 512, true);
        this.noteAction("pond thrash \u2014 fight/XP");
        host.log("AUTO: pond thrash \u2014 break to fight/XP (2085)");
        if (this.shouldEscalatePondBreakPrison(8)) {
          this.escalatePondBreakPrison(host, w, stance, "pond-thrash-rethink");
          this.cool = 5;
          return;
        }
        if (host.hasTool("pickaxe")) {
          const live = (_f = (_e = w.seen) == null ? void 0 : _e.rock) != null ? _f : this.mem(w, "rock");
          if (live && !this.isGatherTileBlocked(live.x, live.y)) {
            this.setStatus(host, w, stance, "pond thrash \u2014 mine");
            if (this.walkToTile(host, live.x, live.y) || this.tryGather(host, w, stance, "pond thrash \u2014 mine")) {
              this.cool = 5;
              return;
            }
          }
        }
        if (w.explore) {
          host.walkTo(w.explore.x, w.explore.y);
        } else if (w.wander) {
          host.walkTo(w.wander.x, w.wander.y);
        }
        this.setStatus(host, w, stance, "pond thrash \u2014 fight/XP");
        this.cool = 5;
        return;
      }
      const rockSpin = /tools find rock|tools mine/i.test(stRethink);
      if (rockSpin) this.rockFindRethinks++;
      else if (!/tools explore|tools mine|tools wait|rock thrash/i.test(stRethink)) this.rockFindRethinks = 0;
      if (this.rockFindRethinks >= 1) {
        this.rockFindRethinks = 0;
        this.rockFindBreakUntil = Math.max(this.rockFindBreakUntil, this.runTicks + 768);
        this.noteAction("rock find thrash \u2014 explore");
        host.log("AUTO: tools find rock/mine thrash \u2014 break to explore (2037)");
        if (!host.hasTool("hatchet") && w.coins >= 30) {
          const anvil = this.mem(w, "anvil");
          if (this.canFundToolNow("hatchet", w, anvil) && this.tryKitAcquireWalk(host, w, stance, "hatchet", anvil)) {
            this.cool = 3;
            return;
          }
        }
        if (host.hasTool("hatchet")) {
          const tree = (_h = this.mem(w, "tree")) != null ? _h : (_g = w.seen) == null ? void 0 : _g.tree;
          if (tree && !this.isGatherTileBlocked(tree.x, tree.y)) {
            this.setStatus(host, w, stance, "rock thrash \u2014 chop");
            if (this.walkToTile(host, tree.x, tree.y) || this.tryGather(host, w, stance, "rock thrash \u2014 chop")) {
              this.cool = 3;
              return;
            }
          }
        }
        if (w.wander) {
          host.walkTo(w.wander.x, w.wander.y);
        } else if (w.explore) {
          host.walkTo(w.explore.x, w.explore.y);
        } else if (w.hub) {
          host.walkTo(w.hub.x, w.hub.y);
        }
        this.setStatus(host, w, stance, "rock thrash \u2014 explore");
        this.cool = 3;
        return;
      }
      const wanderSpin = /tools wander|tools explore|tools pickaxe|tools fund|mono divert|stuck-wander osc|stuck-wander thrash|tools wander thrash|sticky leave|sticky progress/i.test(stRethink);
      if (wanderSpin && host.hasTool("pickaxe")) {
        if (this.stickyExploreBlockActive() && this.stickyPhaseLeaveArmed) {
          if (w.hasMetalWeapon || w.hasStyleWeapon) this.h1001.phase = "GEAR_FARM";
          else this.h1001.phase = "FIRST_WEP";
          if (this.kiteCoolExitQuietActive()) {
            this.noteAction("wanderSpin \u2014 cool-exit ban wander");
            host.log("AUTO: wanderSpin \u2014 plain wander cool-exit ban (2070)");
            if (w.wander) host.walkTo(w.wander.x, w.wander.y);
            else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
            else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
            this.setStatus(host, w, stance, "FIRST_WEP hold \u2014 wander");
            this.cool = 14;
            return;
          }
          const rock = (_j = (_i = w.seen) == null ? void 0 : _i.rock) != null ? _j : this.mem(w, "rock");
          if (rock && !this.isGatherTileBlocked(rock.x, rock.y)) {
            this.noteAction("wanderSpin \u2014 cool mine");
            host.log("AUTO: wanderSpin \u2014 phase cool mine (2054)");
            this.setStatus(host, w, stance, "phase cool mine");
            if (this.walkToTile(host, rock.x, rock.y) || this.tryGather(host, w, stance, "wanderSpin cool mine")) {
              this.cool = 10;
              return;
            }
            this.blockGatherTile(rock.x, rock.y);
          }
          if (this.oscCoolDivertActive()) {
            this.coolHoldOscDivert(host, w, stance, "wanderspin-cool-wander");
            return;
          }
          this.noteAction("wanderSpin \u2014 cool wander");
          host.log("AUTO: wanderSpin \u2014 phase cool plain wander ban (2071)");
          if (w.wander) host.walkTo(w.wander.x, w.wander.y);
          else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
          else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
          this.armPhaseCoolNoKiteEmit();
          this.setStatus(host, w, stance, "phase cool");
          this.cool = 14;
          return;
        }
        if (this.exploreKiteBreakActive() || this.emergToolsBreakActive() || this.stickyExploreBlockActive() || this.stickyLeaveRethinks >= 3 || this.statusFamilyHits(/stuck watchdog/) >= 1 || this.statusFamilyHits(/wanderSpin hard leave/) >= 2) {
          this.stickyLeaveRethinks = Math.min(this.stickyLeaveRethinks + 1, 4);
          this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 1024);
          this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 896);
          this.emergToolsBreakUntil = Math.max(this.emergToolsBreakUntil, this.runTicks + 768);
          this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 1280);
          this.stickyPhaseLeaveArmed = true;
          this.stuckRecentStatus = this.stuckRecentStatus.filter(
            (s) => !/sticky progress|sticky leave|wanderSpin|tools wander|stuck watchdog|lethal|TOOLS sticky|phase cool/i.test(s)
          );
          if (w.hasMetalWeapon || w.hasStyleWeapon) this.h1001.phase = "GEAR_FARM";
          else this.h1001.phase = "FIRST_WEP";
          if (this.oscCoolDivertActive()) {
            this.coolHoldOscDivert(host, w, stance, "wanderspin-hard-leave");
            return;
          }
          this.noteAction(`wanderSpin hard leave#${this.stickyLeaveRethinks}`);
          host.log("AUTO: wanderSpin \u2014 exploreKite/emerg/watchdog hard phase leave (2071)");
          if (w.wander) host.walkTo(w.wander.x, w.wander.y);
          else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
          else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
          this.armPhaseCoolNoKiteEmit();
          this.setStatus(host, w, stance, "phase cool");
          this.cool = 18;
          return;
        }
        if (this.stuckWanderBreakActive()) {
          this.stickyLeaveRethinks = Math.min(this.stickyLeaveRethinks + 1, 4);
          if (this.stickyLeaveRethinks >= 2) {
            this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 896);
            this.stickyPhaseLeaveArmed = true;
          }
          this.tryStickyProgressLeave(host, w, stance, `wanderSpin re-sticky#${this.stickyLeaveRethinks}`);
          return;
        }
        const recentPrison = this.actions.slice(-8).some((s) => /tools-rock-wander prison|trw-prison-clear/i.test(s));
        if (recentPrison || this.trwReenterBanned()) {
          this.trwReenterBan = true;
          this.durableTrwBanWalk(host, w, stance, "trw-wander-aba");
          return;
        }
        this.noteAction("tools wander thrash \u2014 leave");
        this.tryStickyProgressLeave(host, w, stance, "wanderSpin arm");
        return;
      }
      const kitPickSpin = /kit pickaxe|kit cool/i.test(stRethink) && !host.hasTool("pickaxe");
      if (kitPickSpin) this.kitPickRethinks++;
      else if (!/kit pickaxe|kit cool/i.test(stRethink)) this.kitPickRethinks = 0;
      if (this.kitPickRethinks >= 1) {
        this.kitPickRethinks = 0;
        this.kitAcquireBlockUntil = this.runTicks + 64;
        this.kitAcquireSameTile = 0;
        this.kitAcquireTile = "";
        this.kitAcquireTicks = 0;
        this.clearFundIntent("food");
        this.h1001.phase = "TOOLS";
        this.noteAction("kit pickaxe thrash \u2014 TOOLS explore");
        host.log("AUTO: kit pickaxe thrash \u2014 break to TOOLS explore");
        if (w.explore) host.walkTo(w.explore.x, w.explore.y);
        else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
        else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
        this.setStatus(host, w, stance, "kit pickaxe thrash \u2014 explore");
        this.cool = 3;
        return;
      }
      const hatchetSpin = /hub for hatchet|forge hatchet|shop for hatchet|wait anvil hatchet|explore for hatchet|kit hatchet|tools hatchet/i.test(stRethink) && !host.hasTool("hatchet");
      if (hatchetSpin) this.hatchetRethinks++;
      else this.hatchetRethinks = 0;
      const hatchetThresh = /tools hatchet/i.test(stRethink) && host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon) ? 1 : /kit hatchet|tools hatchet/i.test(stRethink) ? 2 : 3;
      if (this.hatchetRethinks >= hatchetThresh) {
        this.hatchetRethinks = 0;
        this.clearAnvilStrive();
        this.stylePivot = false;
        this.toolBlock.set("hatchet", this.runTicks + TOOL_BLOCK_TICKS);
        this.kitAcquireBlockUntil = Math.max(this.kitAcquireBlockUntil, this.runTicks + 128);
        this.laneBias = "gear";
        if (host.hasTool("pickaxe") && (w.hasMetalWeapon || w.hasStyleWeapon)) {
          this.clearFundIntent("tool");
          this.h1001.phase = "GEAR_FARM";
        }
        this.hatchetChestBreakUntil = Math.max(this.hatchetChestBreakUntil, this.runTicks + 256);
        this.noteAction("hatchet thrash \u2014 explore/mine");
        host.log("AUTO: hatchet thrash \u2014 sticky break to explore/mine (2045)");
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
      if (host.hasTool("pickaxe") && (this.stuckWanderBreakActive() || this.exploreKiteBreakActive() || this.emergToolsBreakActive() || this.stickyExploreBlockActive() || /sticky leave|sticky progress|phase cool|FIRST_WEP hold/i.test(this.lastStatus || ""))) {
        this.stickyLeaveRethinks++;
        if (this.stickyLeaveRethinks >= 2 && (this.stickyExploreBlockActive() || this.stickyPhaseLeaveArmed)) {
          this.stickyPhaseLeaveArmed = true;
          this.stuckRecentStatus = this.stuckRecentStatus.filter(
            (s) => !/sticky|phase cool|FIRST_WEP hold|first wep|flat thrash|flat rethink|kite cool exit grace/i.test(s)
          );
          if (this.kiteCoolExitQuietActive()) {
            this.noteAction("FIRST_WEP hold \u2014 wander");
            host.log("AUTO: flat thrash under quiet \u2014 hold no cool re-arm (2073)");
            this.setStatus(host, w, stance, "FIRST_WEP hold \u2014 wander");
            if (w.wander) host.walkTo(w.wander.x, w.wander.y);
            else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
            else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
            this.cool = 18;
            return;
          }
          this.stickyExploreBlockUntil = Math.max(this.stickyExploreBlockUntil, this.runTicks + 1024);
          this.stuckWanderBreakUntil = Math.max(this.stuckWanderBreakUntil, this.runTicks + 896);
          this.exploreKiteBreakUntil = Math.max(this.exploreKiteBreakUntil, this.runTicks + 768);
          this.noteAction(
            thrashing ? `flat thrash#${this.stickyLeaveRethinks} \u2014 wander` : `flat rethink#${this.stickyLeaveRethinks} \u2014 wander`
          );
          host.log("AUTO: flat thrash under stickyExploreBlock \u2014 wander quiet (2071)");
          if (w.wander) host.walkTo(w.wander.x, w.wander.y);
          else if (w.hub) host.walkTo(w.hub.x, w.hub.y);
          else if (w.explore) host.walkTo(w.explore.x, w.explore.y);
          this.armPhaseCoolNoKiteEmit();
          this.setStatus(host, w, stance, "phase cool");
          this.cool = 18;
          return;
        }
        this.tryStickyProgressLeave(
          host,
          w,
          stance,
          thrashing ? `flat thrash#${this.stickyLeaveRethinks}` : `flat rethink#${this.stickyLeaveRethinks}`
        );
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
