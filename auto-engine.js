/* phd auto-engine e74 — pull via GET /api/auto-engine */
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

  // src/systems/AutoplayDriver.ts
  var AUTO_ENGINE_VERSION = "e74";
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
  var STUCK_TILE_RING = 12;
  var TOOL_BLOCK_TICKS = 400;
  var PROGRESS_STALL_TICKS = 60;
  function pickFarmLane(traits, stance, descendSafe, rnd) {
    let gear = traits.aggression * 0.45 + traits.risk * 0.35 + traits.goldChase * 0.2;
    let food = traits.foodCaution * 0.7 + (1 - traits.risk) * 0.3;
    let resource = traits.patience * 0.55 + (1 - traits.aggression) * 0.35 + traits.greed * 0.1;
    if (stance.hungry) {
      food += 0.55;
      gear *= 0.55;
    } else if (stance.stocked) {
      gear += 0.25;
      food *= 0.6;
    }
    if (!descendSafe) {
      gear += 0.2;
      resource += 0.25;
    }
    gear += rnd() * 0.08;
    food += rnd() * 0.08;
    resource += rnd() * 0.08;
    if (gear >= food && gear >= resource) return "gear";
    if (food >= resource) return "food";
    return "resource";
  }
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
      if (id === "pull") s += 2;
      if (id === "fight_pack") s *= stance.hungry || hpPct < 0.6 ? 0.15 : 0.4;
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
      const trash = w.foes.filter((f) => f.alive && f.lit && !f.gold && !f.elite && !f.alpha && !f.gateBoss && !f.boss).length;
      if (trash < t.trash_gte) return false;
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
      /** Last progressFp (heal+gear+ore); reset stall when it changes. */
      __publicField(this, "progressFp", "");
      /** runTicks when progressFp last changed (heal up / equip / forge+). */
      __publicField(this, "progressTick", 0);
      /** Explicit improve mark (forge success) — also bumps progressTick. */
      __publicField(this, "lastImproveTick", 0);
      /** Last successful food-farm tile (depth + xy) — food fell → walk back (e18). */
      __publicField(this, "lastFoodFarm", null);
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
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r;
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
        const meleePress2 = w.foes.some((f) => f.alive && f.lit && f.dist <= 2);
        const eatBelowEarly = meleePress2 ? 0.75 : stance.hungry ? 0.5 : stance.stocked ? 0.35 : 0.45;
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
        const noFood2 = w.food <= 0 && w.healReserve <= 0;
        if (!noFood2 && this.tryFunnel1v1(host, w, stance)) return;
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
      if (this.stairsStrive && this.resumeStairsStrive(host, w, stance)) return;
      if (this.actOnSeen(host, w, stance)) return;
      {
        const pressed = w.foes.some((f) => f.alive && f.lit && f.dist <= 2);
        const fed = w.healReserve > 0 || w.food >= 2;
        const geared = w.hasMetalWeapon || w.hasStyleWeapon || w.hasArmour || host.hasTool("rod");
        if (!pressed && fed && geared && host.runecraftOnce()) {
          this.setStatus(host, w, stance, "runecraft");
          this.cool = 4;
          return;
        }
      }
      {
        const pressedGear = w.foes.some((f) => f.alive && f.lit && f.dist <= 2);
        const sewn = (_h = (_g = host.craftClothesOnce) == null ? void 0 : _g.call(host)) != null ? _h : null;
        if (sewn) {
          host.equipUp();
          this.setStatus(host, w, stance, sewn === "robe" ? "craft robe" : "craft leather");
          this.cool = 2;
          return;
        }
        const shield = ((_j = (_i = w.seen) == null ? void 0 : _i.hands) != null ? _j : 0) >= 2 ? null : (_l = (_k = host.craftShieldOnce) == null ? void 0 : _k.call(host)) != null ? _l : null;
        if (shield) {
          host.equipUp();
          this.setStatus(host, w, stance, shield === "cshield" ? "craft cloth shield" : "craft leather shield");
          this.cool = 2;
          return;
        }
        if (!pressedGear && ((_m = host.brewOnce) == null ? void 0 : _m.call(host))) {
          this.setStatus(host, w, stance, "brew potion");
          this.cool = 3;
          return;
        }
        if (!pressedGear && (w.healReserve > 0 || w.food > 0) && ((_n = host.drinkOnce) == null ? void 0 : _n.call(host, "buff"))) {
          this.setStatus(host, w, stance, "drink potion");
          this.cool = 2;
          return;
        }
      }
      host.equipUp();
      if (w.unspentPoints > 0) host.spendPoints();
      if (stance.hungry || w.healReserve <= 0) {
        host.cookOnce();
        host.pickupLoot();
        host.buyFoodIfCritical();
      }
      {
        const hpPctR = w.maxHp > 0 ? w.hp / w.maxHp : 1;
        const foodCleaned = w.food <= 0 && w.healReserve <= 0;
        const belowSafe = w.healReserve < stance.safetyLevel || w.food < stance.minFood && w.healReserve < stance.safetyLevel * 1.5;
        const unsafeNear = hpPctR < 0.45 || w.foes.some(
          (f) => f.alive && f.lit && f.dist <= 8 && (f.elite || f.alpha || f.gold || f.danger === "threat" || f.danger === "deadly")
        );
        const imminentR = w.foes.some((f) => f.alive && f.lit && f.dist <= 2);
        if (this.hoarding && !stance.stocked && !imminentR) {
          host.buyFoodIfCritical();
          if (this.tryMeal(host, w, stance)) return;
          if (w.bagFree > 0 && this.tryWalkLoot(host, w, stance, "hoard loot")) return;
          if (w.explore) {
            host.clearEngage();
            host.walkTo(w.explore.x, w.explore.y);
            this.setStatus(host, w, stance, "hoard explore");
            this.cool = 3;
            return;
          }
        }
        if (belowSafe && !imminentR && !this.hoarding) {
          if (this.tryMeal(host, w, stance)) return;
          if (w.rawFish > 0 && !w.hasFire && !w.hasLogs && host.hasTool("hatchet") && this.bagFullActive()) {
            if (this.dropUntilCookSlot(host)) {
              if (host.world().bagFree <= 0) {
                this.setStatus(host, w, stance, "drop for a log");
                this.cool = 2;
                return;
              }
              this.bagFullUntil = 0;
            } else if (host.world().bagFree <= 0 && this.tryBagFullRelief(host, w, stance)) return;
          }
          if (w.rawFish > 0 && !w.hasFire && !w.hasLogs && host.hasTool("hatchet") && this.tryChopForCookFuel(host, w, stance)) {
            return;
          }
          if (w.rawFish > 0 && !w.hasFire && !w.hasLogs && host.hasTool("hatchet") && this.cookOwed(w, stance)) {
            if (w.bagFree <= 0 && this.dropUntilCookSlot(host)) {
              this.setStatus(host, w, stance, "drop for a log");
              this.cool = 2;
              return;
            }
            host.clearEngage();
            if (w.explore) host.walkTo(w.explore.x, w.explore.y);
            else if (w.wander) host.walkTo(w.wander.x, w.wander.y);
            this.setStatus(host, w, stance, "explore for a tree");
            this.cool = 3;
            return;
          }
          const postKitFood = w.kitReady || w.hasMetalWeapon && w.hasArmour || w.hasStyleWeapon;
          if (postKitFood && host.craftGemRingOnce()) {
            this.noteImprove();
            this.setStatus(host, w, stance, "craft gem ring");
            this.cool = 4;
            return;
          }
          const nearRock = this.nearbyGather(w).some((n) => n.tool === "pickaxe");
          const earlyForgeFirst = w.depth <= 5 && !postKitFood && (w.oreCount > 0 || host.hasTool("pickaxe") && w.anvilNearby || !host.hasTool("pickaxe") && w.coins >= 30 && nearRock);
          if (postKitFood && !host.hasTool("rod")) {
          } else if (postKitFood && this.farmCeiling() && w.food >= stance.minFood && w.rawFish <= 0) {
          } else if (earlyForgeFirst && !(w.food <= 0 && w.healReserve <= 0 && (w.pondKnown || w.rawFish > 0))) {
          } else if (this.resumeMineStrive(host, w, stance)) {
            return;
          } else if (this.bagFullActive()) {
            if (this.tryBagFullRelief(host, w, stance)) return;
          } else if (w.pondKnown && w.gather && this.tryGather(host, w, stance, "farm food")) {
            this.rememberFoodFarm(w);
            return;
          } else if ((stance.hungry || w.healReserve <= 0 || w.food <= 0) && (w.pondKnown || stance.hungry || w.healReserve <= 0)) {
            this.clearAnvilStrive();
            if (w.bagFree > 0 && this.tryWalkLoot(host, w, stance, "loot for food")) return;
            if (this.pondBreakActive()) {
              if (this.exploreOut(host, w, stance, "pond break \u2014 explore")) return;
            }
            if (this.exploreOut(host, w, stance, w.pondKnown ? "farm food" : "find pond")) return;
            this.setStatus(host, w, stance, w.pondKnown ? "farm food" : "find pond");
            this.cool = 2;
            return;
          }
        }
        if (!imminentR && !this.hoarding && this.peakHealThisFloor >= stance.safetyLevel * 1.2 && w.healReserve < stance.safetyLevel && (w.kitReady || w.hasMetalWeapon || w.hasStyleWeapon)) {
          if (this.tryFoodFellFallback(host, w, stance)) return;
        }
        if (w.rawFish > 0 && !imminentR && !this.hoarding) {
          if (this.tryMeal(host, w, stance)) return;
          if (this.cookOwed(w, stance) && !w.hasLogs && host.hasTool("hatchet")) {
            if (w.bagFree <= 0) {
              if (this.sellJunk(host, w)) {
                this.setStatus(host, w, stance, "sell for cook slot");
                this.cool = 3;
                return;
              }
              if (this.dropUntilCookSlot(host)) {
                this.setStatus(host, w, stance, "drop for cook slot");
                this.cool = 2;
                return;
              }
            }
            if (this.tryChopForCookFuel(host, w, stance)) return;
          }
        }
        const canClimb = w.depth > 1 && !!w.upStairs && this.runTicks >= this.foodRetreatCoolUntil && !this.hoarding;
        if (canClimb && (foodCleaned || belowSafe && unsafeNear)) {
          const emptyBias = foodCleaned ? 0.9 : 0;
          const lowUnsafeBias = !foodCleaned && belowSafe && unsafeNear ? 0.2 + stance.caution * 0.45 + (1 - this.traits.risk) * 0.2 : 0;
          const urge = emptyBias + lowUnsafeBias + this.traits.foodCaution * 0.15 + this.traits.patience * 0.1 - this.traits.risk * 0.2;
          if (urge + this.rnd() * 0.25 > 0.5) {
            this.pendingFoodRetreat = true;
            host.clearEngage();
            host.walkTo(w.upStairs.x, w.upStairs.y);
            this.setStatus(
              host,
              w,
              stance,
              foodCleaned ? "retreat for food" : "retreat unsafe"
            );
            this.cool = 4;
            return;
          }
        }
      }
      const earlyBare = w.depth <= 5 && !w.kitReady;
      const imminent = w.foes.some((f) => f.alive && f.lit && f.dist <= 2);
      const meleeOnMe = w.foes.some((f) => f.alive && f.lit && f.dist <= 1);
      const TOOL = 30;
      if (w.bagFree > 0 && host.pickupLoot()) {
        host.equipUp();
        this.noteImprove();
        this.setStatus(host, w, stance, "equip drop");
        this.cool = 1;
        return;
      }
      if (earlyBare && !imminent && !host.hasTool("pickaxe") && w.coins >= TOOL && host.acquireTool("pickaxe")) {
        this.setStatus(host, w, stance, "shop for pickaxe");
        this.cool = 3;
        return;
      }
      if (!this.chestExposed(w) && !this.mealOwns(w, stance) && this.tryOpenChestOnce(host, w, stance, { needBag: true, cool: 1 })) {
        return;
      }
      {
        const lootUrge = this.traits.greed * 0.45 + this.traits.goldChase * 0.4 + (stance.hungry ? this.traits.foodCaution * 0.5 : 0);
        if (w.bagFree > 0 && !imminent && (earlyBare || w.kitReady || stance.hungry) && lootUrge + this.rnd() * 0.35 > 0.4 && this.tryWalkLoot(host, w, stance, "loot drop")) return;
      }
      if (w.bagFree <= 0 && w.loot && !imminent) {
        const freeUrge = this.traits.greed * 0.45 + this.traits.patience * 0.35 + this.traits.goldChase * 0.2;
        if (freeUrge + this.rnd() * 0.4 > 0.5) {
          if (this.tryCraftWoodForValue(host, w, stance, "fletch sell")) return;
          if (this.sellJunk(host, w)) {
            this.setStatus(host, w, stance, "sell for loot space");
            this.cool = 3;
            return;
          }
        }
      }
      if (!imminent && w.oreCount > 0 && (w.anvilNearby || ((_o = w.seen) == null ? void 0 : _o.anvil)) && (!w.hasMetalWeapon || !w.hasArmour)) {
        if (host.smithKitOnce()) {
          this.setStatus(host, w, stance, w.hasMetalWeapon ? "smith armour" : "smith wep");
          this.cool = 4;
          return;
        }
      }
      const prefer = !imminent ? this.nearestMissingNearby(host, w) : null;
      if (prefer) {
        if (w.rawFish > 0 && this.tryMeal(host, w, stance)) return;
        if (w.coins >= TOOL && host.acquireTool(prefer.tool)) {
          this.setStatus(host, w, stance, `shop for ${prefer.name}`);
          this.cool = 3;
          return;
        }
        if ((w.oreCount > 0 || w.hasLogs || w.rawFish > 0) && (this.sellJunk(host, w) || host.sellMatsForCoins(TOOL) || host.sellOreKeep(0))) {
          this.setStatus(host, w, stance, "sell for tool");
          this.cool = 3;
          return;
        }
        const owned = this.nearestOwnedNearby(host, w);
        if (owned && !this.bagFullActive() && w.gather && this.tryGather(host, w, stance, `gather ${owned.name}`)) {
          if (owned.tool === "rod") this.rememberFoodFarm(w);
          return;
        }
        if (owned && this.walkSeen(host, w, stance, owned.tile, `gather ${owned.name}`)) return;
        if (this.tryWalkLoot(host, w, stance, "loot for tool")) return;
        if (((_p = w.seen) == null ? void 0 : _p.shop) && this.walkSeen(host, w, stance, w.seen.shop, "shop")) return;
        if (this.walkHub(host, w, stance, "hub for tool")) return;
      }
      const needPick = earlyBare && !host.hasTool("pickaxe") && w.coins >= TOOL && (!prefer || prefer.tool === "pickaxe");
      if (needPick) {
        if (!meleeOnMe) {
          if (host.acquireTool("pickaxe")) {
            this.setStatus(host, w, stance, "shop for pickaxe");
            this.cool = 3;
            return;
          }
        } else {
          if (host.acquireTool("pickaxe")) {
            this.shopFireFails = 0;
            this.setStatus(host, w, stance, "shop under fire");
            this.cool = 2;
            return;
          }
          this.shopFireFails = (this.shopFireFails || 0) + 1;
          if (this.shopFireFails >= 2) {
            this.toolBlock.set("pickaxe", this.runTicks + 40);
            this.shopFireFails = 0;
            if (this.stepAway(host, w, stance, "kite shop fail")) return;
            host.clearEngage();
            host.clearWalk();
            this.setStatus(host, w, stance, "kite shop fail");
            this.cool = 3;
            return;
          }
          if (this.stepAway(host, w, stance, "kite to shop")) return;
          host.clearEngage();
          host.clearWalk();
          this.setStatus(host, w, stance, "wait for shop");
          this.cool = 1;
          return;
        }
      }
      if (!imminent && (earlyBare || w.depth <= 5 && w.healReserve <= 0)) {
        const ORE_HATCHET = 2;
        const ORE_WEP = 1;
        const ORE_ARMOUR = 5;
        const healOkPrep = w.healReserve > 0 || w.food > 0;
        const needHealPrep = !healOkPrep;
        if (!host.hasTool("pickaxe") && w.coins >= TOOL && (!prefer || prefer.tool === "pickaxe")) {
          if (host.acquireTool("pickaxe")) {
            this.setStatus(host, w, stance, "shop for pickaxe");
            this.cool = 3;
            return;
          }
        }
        if ((!prefer || prefer.tool === "pickaxe") && !host.hasTool("pickaxe") && w.coins < TOOL) {
          if (!imminent && this.tryWalkLoot(host, w, stance, "loot for pickaxe coins")) return;
          if (this.walkHub(host, w, stance, "hub for pickaxe")) return;
          if (w.explore && this.exploreOut(host, w, stance, "explore for coins")) return;
        }
        const hasPick = host.hasTool("pickaxe");
        const hasHatchet = host.hasTool("hatchet");
        const hasRod = host.hasTool("rod");
        const metalDone = w.hasMetalWeapon && w.hasArmour;
        const styleDone = w.hasStyleWeapon;
        const kitBuilt = metalDone || styleDone;
        const forgePathOpen = w.oreCount > 0 || hasPick && w.anvilNearby || !hasPick && w.coins >= TOOL;
        const shortOreNoAnvil = hasHatchet && w.oreCount > 0 && w.oreCount < ORE_WEP && !w.anvilNearby;
        const mineCool = this.runTicks < this.mineBlockUntil;
        const skipNewMine = mineCool || needHealPrep && shortOreNoAnvil;
        if (needHealPrep && (kitBuilt || !forgePathOpen || shortOreNoAnvil)) {
          this.clearAnvilStrive();
          if (this.resumeMineStrive(host, w, stance)) return;
          if (this.bagFullActive()) {
            if (this.tryBagFullRelief(host, w, stance)) return;
          } else if (this.tryMeal(host, w, stance)) {
            return;
          } else if (w.pondKnown && w.gather && this.tryGather(host, w, stance, "farm food")) {
            this.rememberFoodFarm(w);
            return;
          }
          if (!hasRod) {
            const mats = w.oreCount > 0 || w.hasLogs;
            const bagTight = w.bagFree <= 0 || this.runTicks < this.bagFullUntil;
            const short = w.coins < TOOL;
            if (short && mats || bagTight) {
              if (this.tryCraftWoodForValue(host, w, stance, "fletch sell")) return;
              if (this.sellJunk(host, w) || host.sellMatsForCoins(TOOL) || host.sellOreKeep(0)) {
                this.setStatus(host, w, stance, "sell for rod");
                this.cool = 3;
                return;
              }
            }
            if (w.coins >= TOOL && host.acquireTool("rod")) {
              this.setStatus(host, w, stance, "shop for rod");
              this.cool = 3;
              return;
            }
          }
          if (!this.bagFullActive() && hasRod && w.pondKnown && w.gather && this.tryGather(host, w, stance, "fish for food")) {
            this.rememberFoodFarm(w);
            return;
          }
          if (!imminent && this.tryWalkLoot(host, w, stance, "loot for food")) return;
          if (this.bagFullActive()) {
            this.setStatus(host, w, stance, "sell for loot space");
            this.cool = 2;
            return;
          }
          if (this.pondBreakActive()) {
            if (this.exploreOut(host, w, stance, "pond break \u2014 explore")) return;
          }
          if (this.exploreOut(host, w, stance, w.pondKnown ? "farm food" : "find pond")) return;
          this.setStatus(host, w, stance, w.pondKnown ? "farm food" : "find pond");
          this.cool = 2;
          return;
        }
        const emptyBelly = w.healReserve <= 0 && w.food <= 0 && !(w.rawFish > 0);
        if (emptyBelly && !hasHatchet && this.anvilStrive) this.clearAnvilStrive();
        if (this.anvilStrive && (healOkPrep || !kitBuilt) && !(emptyBelly && !hasHatchet)) {
          if (this.resumeAnvilStrive(host, w, stance)) return;
        }
        if (w.anvilNearby && this.stylePivot !== true) this.stylePivot = false;
        if (this.stylePivot == null && !w.anvilNearby && !kitBuilt && !w.hasMetalWeapon && this.runTicks >= 40) {
          if (needHealPrep && (hasPick || w.oreCount > 0)) {
            this.stylePivot = false;
          } else {
            const hunt = this.traits.patience * 0.55 + (1 - this.traits.risk) * 0.25;
            const pivot = (1 - this.traits.patience) * 0.45 + this.traits.risk * 0.35 + this.traits.aggression * 0.15;
            this.stylePivot = pivot + this.rnd() * 0.3 > hunt + 0.15;
          }
        }
        if (this.stylePivot === true && !hasHatchet && !kitBuilt && needHealPrep && (hasPick || w.oreCount > 0)) {
          this.stylePivot = false;
          this.clearAnvilStrive();
          this.noteAction("hatchet explore peel \u2014 mine/forge/food");
          host.log("AUTO: hatchet explore peel \u2014 mine/forge/food");
        }
        if (this.stylePivot === true && !styleDone && !w.hasMetalWeapon) {
          if (!hasHatchet) {
            if (host.acquireTool("hatchet")) {
              const lab = w.anvilNearby ? "forge hatchet" : "shop for hatchet";
              if (w.anvilNearby) this.markAnvilStrive(lab, w);
              else this.clearAnvilStrive();
              this.setStatus(host, w, stance, lab);
              this.cool = 3;
              return;
            }
            if (w.coins < TOOL && !imminent && this.tryWalkLoot(host, w, stance, "loot for hatchet")) return;
            if (w.explore) {
              host.clearEngage();
              host.walkTo(w.explore.x, w.explore.y);
              this.setStatus(host, w, stance, "explore for hatchet");
              this.cool = 3;
              return;
            }
          }
          if (hasHatchet && w.logCount < 2 && w.gather) {
            if (this.tryGather(host, w, stance, "chop for bow")) return;
          }
          if (w.logCount >= 1 && host.fletchStyleOnce()) {
            this.setStatus(host, w, stance, "fletch bow (no anvil)");
            this.cool = 3;
            return;
          }
          if (hasHatchet && w.logCount < 2) {
            if (w.explore) {
              host.clearEngage();
              host.walkTo(w.explore.x, w.explore.y);
              this.setStatus(host, w, stance, "explore trees");
              this.cool = 3;
              return;
            }
            this.setStatus(host, w, stance, "style switch");
            this.cool = 2;
            return;
          }
          if (w.logCount >= 1) {
            if (w.explore) {
              host.clearEngage();
              host.walkTo(w.explore.x, w.explore.y);
              this.setStatus(host, w, stance, "style switch");
              this.cool = 3;
              return;
            }
          }
        }
        let orePlan = 0;
        if (!this.stylePivot && !styleDone) {
          if (!hasHatchet) orePlan += ORE_HATCHET;
          if (!w.hasMetalWeapon) orePlan += ORE_WEP;
          if (!w.hasArmour) orePlan += ORE_ARMOUR;
        }
        {
          const lootUrge = this.traits.greed * 0.5 + this.traits.goldChase * 0.35 + (stance.hungry ? 0.25 : 0);
          if (w.bagFree > 0 && lootUrge + this.rnd() * 0.3 > 0.35 && this.tryWalkLoot(host, w, stance, "loot drop")) return;
        }
        if (!skipNewMine && !this.anvilStrive && !this.stylePivot && !styleDone && hasPick && !metalDone && orePlan > 0 && w.oreCount < orePlan && w.gather) {
          if (this.tryGather(host, w, stance, "mine ore")) return;
        }
        if (!this.stylePivot && !styleDone && hasPick && !hasHatchet && !emptyBelly && (w.oreCount >= ORE_HATCHET || w.coins >= TOOL || w.oreCount >= orePlan)) {
          if (host.acquireTool("hatchet")) {
            const lab = w.oreCount >= ORE_HATCHET ? "forge hatchet" : "shop for hatchet";
            if (w.oreCount >= ORE_HATCHET) this.markAnvilStrive(lab, w);
            else this.clearAnvilStrive();
            this.setStatus(host, w, stance, lab);
            this.cool = 3;
            return;
          }
          if (w.oreCount >= orePlan || w.oreCount >= ORE_HATCHET) {
            this.markAnvilStrive("forge hatchet", w);
            if (this.walkHub(host, w, stance, "hub for hatchet")) return;
            host.clearEngage();
            host.clearWalk();
            this.setStatus(host, w, stance, "wait anvil hatchet");
            this.cool = 2;
            return;
          }
          if (!skipNewMine && !this.anvilStrive && w.gather && w.oreCount < orePlan && this.tryGather(host, w, stance, "mine ore")) return;
          if (this.walkHub(host, w, stance, "hub for hatchet")) return;
        }
        if (!this.stylePivot && !styleDone && hasHatchet && !metalDone) {
          if (!w.hasMetalWeapon) {
            if (!skipNewMine && !this.anvilStrive && w.oreCount < ORE_WEP && hasPick && w.gather) {
              if (this.tryGather(host, w, stance, "mine ore")) return;
            }
            if (w.oreCount >= ORE_WEP) {
              if (host.smithKitOnce()) {
                this.markAnvilStrive("smith wep", w);
                this.setStatus(host, w, stance, "smith wep");
                this.cool = 4;
                return;
              }
              this.markAnvilStrive("smith wep", w);
              if (this.walkHub(host, w, stance, "hub to smith")) return;
              this.setStatus(host, w, stance, "wait anvil wep");
              this.cool = 2;
              return;
            }
          } else if (!w.hasArmour) {
            if (!skipNewMine && !this.anvilStrive && w.oreCount < ORE_ARMOUR && hasPick && w.gather) {
              if (this.tryGather(host, w, stance, "mine ore")) return;
            }
            if (w.oreCount >= ORE_ARMOUR) {
              if (host.smithKitOnce()) {
                this.markAnvilStrive("smith armour", w);
                this.setStatus(host, w, stance, "smith armour");
                this.cool = 4;
                return;
              }
              this.markAnvilStrive("smith armour", w);
              if (this.walkHub(host, w, stance, "hub to smith")) return;
              this.setStatus(host, w, stance, "wait anvil armour");
              this.cool = 2;
              return;
            }
          }
        }
        const postKit = metalDone || styleDone || w.kitReady;
        const foeNear = w.foes.some(
          (f) => f.alive && f.lit && f.dist <= 6 && (f.danger === "threat" || f.danger === "deadly" || f.danger === "even")
        );
        const needHeal = w.healReserve <= 0 && w.food <= 0;
        const healOk = w.healReserve > 0 || w.food > 0;
        const forgeSoftBlocked = this.runTicks < this.forgeBlockUntil;
        const eliteLit = w.foes.some(
          (f) => f.alive && f.lit && (f.elite || f.alpha || f.gold || f.danger === "threat" || f.danger === "deadly")
        );
        if (eliteLit && foeNear && (postKit || metalDone)) {
          const ek = `e:${w.foes.filter((f) => f.alive && f.lit).map((f) => `${f.x},${f.y}`).sort().join("|")}`;
          if (ek === this.eliteThrashKey) this.eliteThrash++;
          else {
            this.eliteThrashKey = ek;
            this.eliteThrash = 1;
          }
        } else if (!eliteLit) {
          this.eliteThrash = 0;
          this.eliteThrashKey = "";
        }
        const kitArmed = metalDone || styleDone || w.hasMetalWeapon && w.hasArmour;
        const forgeFunded = healOk || w.coins >= TOOL + 5 || kitArmed && w.oreCount > 0 && w.coins >= TOOL;
        if (!forgeSoftBlocked && kitArmed && w.oreCount > 0 && forgeFunded && (healOk || w.anvilNearby && this.canPayForge(w))) {
          if (eliteLit && foeNear) {
            if (w.explore) {
              host.clearEngage();
              host.walkTo(w.explore.x, w.explore.y);
              this.setStatus(host, w, stance, "explore past elite");
              this.cool = 3;
              return;
            }
            if (this.eliteThrash >= 8) {
              if (this.dashPastElite(host, w, stance)) return;
            }
          } else {
            const forged = this.canPayForge(w) && host.forgeWieldedOnce();
            if (forged) {
              this.noteImprove();
              this.setStatus(host, w, stance, "forge kit +");
              this.cool = 4;
              return;
            }
            this.noteForgeMiss(w);
            this.noteAction("forge+ soft-block (need ore?)");
          }
        }
        if (postKit && needHeal) {
          if (foeNear && !(!hasRod && w.coins >= TOOL)) {
            if (w.explore) {
              host.clearEngage();
              host.walkTo(w.explore.x, w.explore.y);
              this.setStatus(host, w, stance, "explore past elite");
              this.cool = 3;
              return;
            }
            if (this.eliteThrash >= 8) {
              if (this.dashPastElite(host, w, stance)) return;
            } else {
              if (this.stepAway(host, w, stance, "kite heal")) return;
              if (this.walkHub(host, w, stance, "hub before heal")) return;
            }
          }
          const rodFirst = !hasRod && (w.bagFree <= 0 || this.runTicks < this.bagFullUntil || w.coins < TOOL && (w.oreCount > 0 || w.hasLogs));
          if (!rodFirst && !imminent && this.tryWalkLoot(host, w, stance, "loot for food")) return;
          if (w.hasFire && w.rawFish > 0) {
            host.cookOnce();
            host.pickupLoot();
            this.setStatus(host, w, stance, "cooking");
            this.cool = 2;
            return;
          }
          if (w.rawFish > 0 && hasHatchet && w.hasLogs && !w.hasFire && !this.catchingMeal(w, stance) && host.lightFireOnce()) {
            this.setStatus(host, w, stance, "lighting fire");
            this.cool = 4;
            return;
          }
          if (!foeNear && host.craftGemRingOnce()) {
            this.noteImprove();
            this.setStatus(host, w, stance, "craft gem ring");
            this.cool = 4;
            return;
          }
          if (this.bagFullActive() && needHeal) {
            if (this.tryBagFullRelief(host, w, stance)) return;
          } else if (hasRod && w.pondKnown && w.gather && !foeNear && (w.hasFire || w.rawFish < 2)) {
            if (this.tryGather(host, w, stance, "fish for food")) return;
          }
          if (!this.bagFullActive() && hasRod && !w.pondKnown && needHeal && !foeNear) {
            if (!imminent && this.tryWalkLoot(host, w, stance, "loot for food")) return;
            if (w.explore) {
              host.clearEngage();
              host.walkTo(w.explore.x, w.explore.y);
              this.setStatus(host, w, stance, "find pond");
              this.cool = 3;
              return;
            }
          }
          if (!hasRod) {
            const mats = w.oreCount > 0 || w.hasLogs;
            const bagTight = w.bagFree <= 0 || this.runTicks < this.bagFullUntil;
            const short = w.coins < TOOL;
            if (short && mats || bagTight) {
              if (this.tryCraftWoodForValue(host, w, stance, "fletch sell")) {
                this.rodCoinMines = 0;
                return;
              }
              if (this.sellJunk(host, w) || host.sellMatsForCoins(TOOL) || host.sellOreKeep(0)) {
                this.rodCoinMines = 0;
                this.setStatus(host, w, stance, "sell for rod");
                this.cool = 3;
                return;
              }
              if (mats || bagTight) {
                if (this.walkHub(host, w, stance, "hub sell for rod")) return;
                host.clearEngage();
                this.setStatus(host, w, stance, "walk shop sell for rod");
                this.cool = 2;
                return;
              }
            }
            if (w.coins >= TOOL) {
              this.rodCoinMines = 0;
              if (bagTight && mats) {
                if (this.tryCraftWoodForValue(host, w, stance, "craft logs")) return;
                if (this.sellJunk(host, w) || host.sellOreKeep(0)) {
                  this.setStatus(host, w, stance, "sell for rod slot");
                  this.cool = 3;
                  return;
                }
              }
              if (host.acquireTool("rod")) {
                this.setStatus(host, w, stance, "shop for rod");
                this.cool = 3;
                return;
              }
              if (this.walkHub(host, w, stance, "hub for rod")) return;
              host.clearEngage();
              host.clearWalk();
              this.setStatus(host, w, stance, "need shop for rod");
              this.cool = 2;
              return;
            }
            this.rodCoinMines++;
            if (this.rodCoinMines >= 14) {
              this.rodCoinMines = 0;
              if (this.walkHub(host, w, stance, "hub for rod (cap)")) return;
            }
            if (!bagTight && hasPick && w.gather && !foeNear) {
              if (this.tryGather(host, w, stance, "mine for rod coins")) return;
            }
            if (!imminent && this.tryWalkLoot(host, w, stance, "loot for rod coins")) return;
            if (this.walkHub(host, w, stance, "hub for rod")) return;
            host.clearEngage();
            this.setStatus(host, w, stance, "need rod coins");
            this.cool = 2;
            return;
          }
          if (w.rawFish > 0 && hasHatchet && !foeNear && !w.hasLogs && !w.hasFire) {
            if (this.tryChopForCookFuel(host, w, stance)) return;
          }
        }
        if (w.kitReady && !w.stairsLit) {
          if (foeNear || imminent) {
            if (this.stepAway(host, w, stance, "kite stairs")) return;
            if (this.walkHub(host, w, stance, "hub then stairs")) return;
          } else if (healOk && w.explore) {
            host.clearEngage();
            host.walkTo(w.explore.x, w.explore.y);
            this.setStatus(host, w, stance, "find stairs");
            this.cool = 3;
            return;
          }
        }
      } else if (!earlyBare && !imminent && w.healReserve <= 0 && !host.hasTool("rod")) {
        if (host.acquireTool("rod")) {
          this.setStatus(host, w, stance, "shop for rod");
          this.cool = 3;
          return;
        }
      }
      if (!imminent) {
        const postKitE18 = w.kitReady || w.hasMetalWeapon && w.hasArmour || w.hasStyleWeapon;
        if (postKitE18) {
          const needHealE = w.healReserve <= 0 && w.food <= 0;
          const healOkE = w.healReserve > 0 || w.food > 0;
          const forgeSoftE = this.runTicks < this.forgeBlockUntil;
          const kitArmedE = w.hasMetalWeapon && w.hasArmour || w.hasStyleWeapon || w.kitReady;
          const forgeFundedE = healOkE || w.coins >= 30 + 5 || kitArmedE && w.oreCount > 0 && w.coins >= 30;
          if (host.craftGemRingOnce()) {
            this.noteImprove();
            this.setStatus(host, w, stance, "craft gem ring");
            this.cool = 4;
            return;
          }
          if (!forgeSoftE && kitArmedE && w.oreCount > 0 && forgeFundedE && (healOkE || w.anvilNearby && this.canPayForge(w))) {
            const forged = this.canPayForge(w) && host.forgeWieldedOnce();
            if (forged) {
              this.noteImprove();
              this.setStatus(host, w, stance, "forge kit +");
              this.cool = 4;
              return;
            }
            this.noteForgeMiss(w);
            this.noteAction("forge+ soft-block (need ore?)");
          }
          if (w.food < stance.minFood && w.bagFree > 0 && this.tryWalkLoot(host, w, stance, "loot for food")) return;
          if (this.farmCeiling() && w.food >= stance.minFood && healOkE && this.tryFarmCeilingMoveOn(host, w, stance)) return;
          if (healOkE && this.tryFarmCoinsForGear(host, w, stance, {
            forgeSoft: forgeSoftE,
            kitArmed: kitArmedE
          })) return;
        }
      }
      const hpPct = w.maxHp > 0 ? w.hp / w.maxHp : 1;
      const meleePress = imminent;
      const eatBelow = meleePress ? 0.75 : stance.hungry ? 0.5 : stance.stocked ? 0.35 : 0.45;
      if (hpPct < 0.95 && hpPct < eatBelow) {
        if ((_q = host.drinkOnce) == null ? void 0 : _q.call(host, "hurt")) {
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
      const emergency = w.healReserve <= 0 && hpPct < 0.4 && w.stairsLit && w.stairsOpen;
      const mayDescend = (w.kitReady || emergency) && (!this.hoarding || stance.stocked) && (!stance.hungry || w.healReserve <= 0 || emergency);
      const mayBraveElite = !stance.hungry && (stance.stocked || stance.bravery >= 0.45);
      if (host.pickupLoot()) {
        this.setStatus(host, w, stance, "looting");
        this.cool = 1;
        return;
      }
      const mealHold = this.mealOwns(w, stance);
      if (!this.chestExposed(w) && !mealHold && this.tryOpenChestOnce(host, w, stance, { needBag: false, cool: 2 })) {
        return;
      }
      if (!imminent && !mealHold && this.tryCraftWoodForValue(host, w, stance, "fletch sell")) return;
      if (!imminent && !mealHold && this.sellJunk(host, w)) {
        this.setStatus(host, w, stance, "sell unused");
        this.cool = 3;
        return;
      }
      if ((earlyBare || w.kitReady) && !imminent && this.tryWalkLoot(host, w, stance, "loot drop")) return;
      if (w.kitReady && this.stairsUsable(w) && mayDescend && !imminent) {
        if (this.walkStairsStrive(host, w, stance, "kit ready \u2014 stairs")) return;
      }
      if (w.kitReady && mayDescend && !w.stairsLit && !imminent && w.explore) {
        const press = w.foes.some(
          (f) => f.alive && f.lit && f.dist <= 6 && f.danger !== "prey"
        );
        if (press) {
          if (this.stepAway(host, w, stance, "kite stairs")) return;
          if (this.walkHub(host, w, stance, "hub then stairs")) return;
        } else if (w.healReserve > 0 || w.food > 0) {
          host.clearEngage();
          host.walkTo(w.explore.x, w.explore.y);
          this.setStatus(host, w, stance, "find stairs");
          this.cool = 3;
          return;
        }
      }
      const hurtBare = earlyBare && hpPct < 0.45;
      const noFood = w.food <= 0 && w.healReserve <= 0;
      const threat = this.pickThreat(
        w,
        mayDescend && (w.healReserve > 0 || earlyBare),
        mayBraveElite && w.healReserve > 0 && !hurtBare
      );
      const bareStarter = earlyBare && !w.hasMetalWeapon;
      const unready = needPick || !w.kitReady || noFood;
      let canChase = !!threat && !needPick && !(unready && (threat.danger === "deadly" || threat.danger === "threat")) && (w.kitReady && w.healReserve > 0 ? threat.dist <= 2 || threat.danger === "prey" : w.kitReady ? threat.danger === "prey" || threat.danger === "even" && hpPct >= 0.75 && threat.dist <= 2 || !noFood && threat.dist <= 2 && threat.danger !== "deadly" : (
        // !kitReady: prey only in melee; without pickaxe don't wander-chase for coins.
        threat.danger === "prey" && hpPct >= 0.7 && threat.dist <= (host.hasTool("pickaxe") ? 2 : 1)
      )) && !(hurtBare && threat.dist > 2 && (threat.elite || threat.alpha || threat.gold)) && !(noFood && (threat.danger === "threat" || threat.danger === "deadly") && threat.dist > 1);
      if (noFood) canChase = false;
      if (!this.wornEnough(w)) canChase = false;
      if (threat && canChase) {
        if (this.tryFunnel1v1(host, w, stance)) return;
        if (!w.hasStyleWeapon && threat.dist <= 2 && threat.danger !== "prey" && this.stepAway(host, w, stance, "melee kite")) {
          this.leaveGatherIfStarving(w);
          return;
        }
        if (w.hasStyleWeapon && threat.dist <= 2 && !threat.ranged) {
          host.engage(threat);
          if (this.stepAway(host, w, stance, "style kite")) {
            this.leaveGatherIfStarving(w);
            return;
          }
        }
        host.engage(threat);
        this.setStatus(host, w, stance, "fighting");
        this.cool = 1;
        return;
      }
      if (threat && !canChase) {
        if (w.hasStyleWeapon && threat.danger !== "deadly" && threat.dist <= 8) {
          if (!noFood && this.tryFunnel1v1(host, w, stance)) return;
          if (threat.dist <= 2) {
            host.engage(threat);
            if (this.stepAway(host, w, stance, "style kite")) {
              this.leaveGatherIfStarving(w);
              return;
            }
          }
          host.clearWalk();
          host.engage(threat);
          this.setStatus(host, w, stance, "style stand");
          this.cool = 1;
          return;
        }
        host.clearEngage();
        if (noFood || threat.danger === "deadly" || threat.danger === "threat" || !w.hasStyleWeapon && threat.dist <= 2) {
          if (threat.dist <= 2) {
            if (!noFood && this.tryFunnel1v1(host, w, stance)) return;
            if (this.stepAway(host, w, stance, "kiting toward hub")) {
              this.leaveGatherIfStarving(w);
              return;
            }
            if (unready || bareStarter) {
              const prey = !this.wornEnough(w) ? void 0 : w.foes.filter((f) => f.alive && f.lit && f.danger === "prey" && f.dist <= 1 && hpPct >= 0.7).sort((a, b) => a.dist - b.dist)[0];
              if (prey && !needPick) {
                host.engage(prey);
                this.setStatus(host, w, stance, "fight prey");
                this.cool = 1;
                return;
              }
              if (needPick && host.acquireTool("pickaxe")) {
                this.setStatus(host, w, stance, "shop under fire");
                this.cool = 2;
                return;
              }
            }
            host.engage(threat);
            this.setStatus(host, w, stance, "cornered fight");
            this.cool = 1;
            return;
          }
          if (this.walkHub(host, w, stance, "flee to hub")) return;
          if (w.kitReady && this.stairsUsable(w) && mayDescend) {
            if (this.walkStairsStrive(host, w, stance, "kiting stairs")) return;
          }
          if (w.wander) {
            host.walkTo(w.wander.x, w.wander.y);
            this.setStatus(host, w, stance, "kiting wander");
            this.cool = 2;
            return;
          }
        }
      }
      if (this.tryWalkLoot(host, w, stance, "looting")) return;
      if (this.stairsUsable(w) && mayDescend && (w.healReserve <= 0 || emergency)) {
        if (this.walkStairsStrive(host, w, stance, emergency ? "emergency stairs" : "pushing stairs")) return;
      }
      const lane = (_r = this.laneBias) != null ? _r : pickFarmLane(this.traits, stance, w.descendSafe, this.rnd);
      if ((!mayDescend || stance.hungry && w.healReserve > 0) && !this.farmCeiling()) {
        const criticalHeal = stance.ratio <= 0.35;
        if (lane === "food" || lane === "gear" && criticalHeal || lane === "resource") {
          const foodLane = lane === "food" || lane === "gear" && criticalHeal;
          if (foodLane && this.bagFullActive()) {
            if (this.tryBagFullRelief(host, w, stance)) return;
          } else if (foodLane && !w.pondKnown) {
            if (w.explore) {
              host.clearEngage();
              host.walkTo(w.explore.x, w.explore.y);
              this.setStatus(host, w, stance, "find pond");
              this.cool = 3;
              return;
            }
          } else if (w.gather && this.tryGather(
            host,
            w,
            stance,
            foodLane ? "farm food" : "farm resources"
          )) return;
        }
      }
      if (this.stairsUsable(w) && mayDescend) {
        if (this.walkStairsStrive(host, w, stance, emergency ? "emergency stairs" : "pushing stairs")) return;
      }
      const boss = w.foes.find(
        (f) => f.alive && f.lit && (f.gateBoss || f.boss) && f.danger !== "deadly" && mayDescend
      );
      if (boss) {
        host.engage(boss);
        this.setStatus(host, w, stance, "boss");
        this.cool = 2;
        return;
      }
      if (!earlyBare && w.healReserve <= 0 && w.gather && !this.farmCeiling()) {
        if (this.bagFullActive()) {
          if (this.tryBagFullRelief(host, w, stance)) return;
        } else if (host.hasTool("rod")) {
          if (w.pondKnown && this.tryGather(host, w, stance, "farm food")) return;
        } else if (this.tryGather(host, w, stance, "farm resources")) return;
      }
      const litPack = w.foes.filter((f) => f.alive && f.lit && f.dist <= 5).length;
      if (earlyBare && litPack >= 2) {
        if (this.tryFunnel1v1(host, w, stance)) return;
        const trash = w.foes.filter((f) => f.alive && f.lit && !f.gold && !f.elite && !f.alpha && !f.gateBoss && !f.boss && f.dist <= 5).sort((a, b) => a.dist - b.dist)[0];
        if (trash && this.wornEnough(w) && (trash.danger !== "deadly" || trash.dist <= 2)) {
          host.engage(trash);
          this.setStatus(host, w, stance, "fighting pack");
          this.cool = 1;
          return;
        }
        host.clearEngage();
        host.clearWalk();
        this.setStatus(host, w, stance, "pack wait");
        this.cool = 2;
        return;
      }
      if (w.explore) {
        const dangerNear = w.foes.some(
          (f) => f.alive && f.lit && (f.danger === "threat" || f.danger === "deadly") && f.dist <= 8
        );
        host.clearEngage();
        if (noFood && earlyBare && hpPct < 0.9) {
          if (this.walkHub(host, w, stance, "regen to hub")) return;
          if (w.wander) {
            host.walkTo(w.wander.x, w.wander.y);
            this.setStatus(host, w, stance, "regen wander");
            this.cool = 4;
            return;
          }
          host.clearWalk();
          this.setStatus(host, w, stance, "regen wait");
          this.cool = 6;
          return;
        }
        if (noFood && dangerNear) {
          if (this.walkHub(host, w, stance, "safe to hub")) return;
          if (w.wander) {
            host.walkTo(w.wander.x, w.wander.y);
            this.setStatus(host, w, stance, "safe wander");
            this.cool = 3;
            return;
          }
        }
        if (noFood && dangerNear) {
          host.clearWalk();
          this.setStatus(host, w, stance, "threat wait");
          this.cool = 3;
          return;
        }
        host.walkTo(w.explore.x, w.explore.y);
        const bit = lane === "gear" ? w.descendSafe ? "gear farm" : "farming" : w.descendSafe ? "exploring" : "farming";
        this.setStatus(host, w, stance, bit);
        this.cool = 2;
        return;
      }
      if (!(mayDescend && w.stairsLit) && !this.farmCeiling()) {
        if (!(lane === "food" && !w.pondKnown) && w.gather && this.tryGather(
          host,
          w,
          stance,
          lane === "food" ? "farm food" : lane === "gear" ? "farm gear mats" : "farm resources"
        )) return;
      }
      if (this.farmCeiling() && this.tryFarmCeilingMoveOn(host, w, stance)) return;
      if (w.wander) {
        host.clearEngage();
        host.walkTo(w.wander.x, w.wander.y);
        this.setStatus(host, w, stance, lane === "gear" ? "gear wander" : "wandering");
        this.cool = 6;
        return;
      }
      host.clearEngage();
      host.clearWalk();
      this.setStatus(host, w, stance, !w.descendSafe ? "farm wait" : "wait");
      this.cool = 6;
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
        host.engage(trash);
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
        host.engage(trash);
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
      const stairsOk = this.stairsUsable(w) && w.descendSafe && !emptyHeal && (w.kitReady || w.hasMetalWeapon) && hpPct >= 0.45;
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
        host.engage(trash);
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
        host.engage(push);
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
      if (this.runTicks >= this.bagFullUntil) return false;
      if (this.tryCraftWoodForValue(host, w, stance, "fletch sell")) {
        this.bagFullFails = 0;
        return true;
      }
      if (this.sellJunk(host, w) || host.sellOreKeep(0) || host.sellMatsForCoins(30)) {
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
          if (this.sellJunk(host, w) || host.sellOreKeep(0) || host.sellMatsForCoins(30)) {
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
        } else if (foe) host.engage(foe);
        else if (id.includes("enter") || id === "clear" || id === "eat_clear") {
          const t = this.pickThreat(w, w.descendSafe && !stance.hungry, !stance.hungry);
          if (t && (t.dist <= 1 || this.wornEnough(w))) host.engage(t);
        }
      }
      if (id === "ignore" || id === "flee" || id === "retreat" || id === "save") {
        const melee = w.foes.filter((f) => f.alive && f.lit && f.dist <= 2).sort((a, b) => a.dist - b.dist)[0];
        if (melee && (id === "flee" || id === "retreat" || id === "ignore") && (melee.dist <= 1 || this.wornEnough(w))) {
          host.engage(melee);
        } else {
          host.clearEngage();
          const hpPctF = w.maxHp > 0 ? w.hp / w.maxHp : 1;
          const escape = w.healReserve <= 0 && hpPctF < 0.85;
          const canStairs = !!w.stairs && w.stairsLit && w.kitReady && (w.descendSafe || escape) && (!stance.hungry || w.healReserve <= 0);
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
        const canStairs = !!w.stairs && w.stairsLit && (w.descendSafe || escape) && (!stance.hungry || w.healReserve <= 0);
        const meleeReach = this.wornEnough(w) ? 2 : 1;
        const melee = w.foes.filter((f) => f.alive && f.lit && f.dist <= meleeReach).sort((a, b) => a.dist - b.dist)[0];
        if (melee && (!canStairs || melee.danger === "deadly" || melee.danger === "threat")) {
          host.engage(melee);
        } else if (canStairs) {
          if (!this.walkStairsStrive(host, w, stance, "fork stairs")) {
            if (melee) host.engage(melee);
            else if (w.explore) {
              host.clearEngage();
              host.walkTo(w.explore.x, w.explore.y);
            }
          }
        } else if (melee) {
          host.engage(melee);
        } else if (w.explore) {
          host.clearEngage();
          host.walkTo(w.explore.x, w.explore.y);
        }
      }
      if (id === "pull") {
        const trash = w.foes.filter((f) => f.alive && f.lit && !f.gold && !f.elite && !f.alpha && !f.gateBoss && !f.boss && f.danger !== "deadly").sort((a, b) => a.dist - b.dist);
        if (trash[0] && (trash[0].dist <= 1 || this.wornEnough(w))) host.engage(trash[0]);
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
        stuckDesire: this.stuckDesireKey || "",
        pondRethinks: this.pondRethinks,
        pondBreakUntil: this.pondBreakUntil,
        chopBreakUntil: this.chopBreakUntil,
        ceilingRethinks: this.ceilingRethinks,
        hatchetRethinks: this.hatchetRethinks,
        bagFull: this.runTicks < this.bagFullUntil,
        mineBlocked: this.runTicks < this.mineBlockUntil,
        chestBlocked: this.runTicks < this.chestBlockUntil
      };
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
    /**
     * One walkable step that increases Chebyshev distance from nearby press foes,
     * biased toward hub. Returns true if a walk was issued.
     */
    stepAway(host, w, stance, label) {
      const press = w.foes.filter((f) => f.alive && f.lit && f.dist <= 2);
      if (!press.length) return false;
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
        const keep = press.slice().sort((a, b) => a.dist - b.dist)[0];
        if (keep) host.engage(keep);
        else host.clearEngage();
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
      if (/pond|fish|farm food|hoard food|enroute pond/i.test(st) && w.gather) {
        return { key: `gather:${w.gather.x},${w.gather.y}`, x: w.gather.x, y: w.gather.y };
      }
      if (/find pond/i.test(st) && !w.gather && w.explore) {
        return { key: `explore:${w.explore.x},${w.explore.y}`, x: w.explore.x, y: w.explore.y };
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
      const combatBusy = w.foes.some((f) => f.alive && f.lit && f.dist <= 2);
      const gatherBusy = this.sameTargetHits > 0 && this.cool > 0 && !!w.gather;
      const striveBusy = !!this.mineStrive || !!this.anvilStrive;
      const tile = `${w.tile.x},${w.tile.y}`;
      const gearFp = this.stuckGearFpOf(w);
      const foodFp = this.stuckFoodFpOf(w);
      const xpFp = w.xpFp || "";
      const gearProg = gearFp !== this.stuckGearFp && this.stuckGearFp !== "";
      const foodProg = foodFp !== this.stuckFoodFp && this.stuckFoodFp !== "";
      const expProg = xpFp !== this.stuckXpFp && this.stuckXpFp !== "";
      let usefulApproach = false;
      let thrashing = false;
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
          const parked = /food fell|sell for loot|fletch sell|bag stuck|wait anvil|hub for hatchet|cook fuel|dry ground|food fat|farm ceiling → next floor|stairs soft-block|hoard food|hoard fire|hoard loot|hoard explore|enroute pond|enroute gather|enroute toward gather|fish for food|open chest/i.test(stPark);
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
            thrashing = true;
          }
        }
      }
      if (!this.stuckTile && !this.stuckXpFp && !this.stuckGearFp && !this.stuckFoodFp) {
        this.stuckTile = tile;
        this.stuckGearFp = gearFp;
        this.stuckFoodFp = foodFp;
        this.stuckXpFp = xpFp;
        this.stuckTicks = 0;
        return;
      }
      if (combatBusy || gatherBusy || striveBusy || usefulApproach || gearProg || foodProg || expProg) {
        this.stuckTile = tile;
        this.stuckGearFp = gearFp;
        this.stuckFoodFp = foodFp;
        this.stuckXpFp = xpFp;
        this.stuckTicks = 0;
        if (foodProg) this.pondRethinks = 0;
        if (usefulApproach || gearProg || foodProg || expProg || combatBusy || striveBusy) {
          this.stuckRecentTiles = [];
        }
        return;
      }
      this.stuckTile = tile;
      this.stuckTicks += thrashing ? 2 : 1;
      if (this.stuckTicks < IDLE_STUCK_TICKS) return;
      const keepStairs = this.stairsStrive && /ceiling thrash|farm ceiling|food fat/i.test(this.stairsStrive.label) && (w.healReserve > 0 || w.food > 0) && w.kitReady && w.descendSafe;
      if (keepStairs) {
        this.stuckTicks = 0;
        this.noteAction("stuck rethink \u2014 keep ceiling stairs");
        return;
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
        if (w.food === 0 && w.healReserve === 0 && w.pondKnown && w.gather && this.tryGather(host, w, stance, "farm food")) {
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
      if (!starving && s.chest && !this.chestExposed(w) && this.runTicks >= this.chestBlockUntil) {
        const path = (_a = s.chestPath) != null ? _a : -1;
        if (path >= 0 && path <= 16) {
          const d = Math.max(Math.abs(s.chest.x - w.tile.x), Math.abs(s.chest.y - w.tile.y));
          if (d > 1) return this.walkSeen(host, w, stance, s.chest, "remembered chest");
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
      var _a, _b, _c;
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
        host.engage(foe);
        this.setStatus(host, w, stance, "camp fight");
        this.cool = 2;
        return true;
      }
      const owned = this.nearestOwnedNearby(host, w);
      if (owned && !this.bagFullActive()) {
        const holdOre = w.oreCount > 0 && (w.anvilNearby || !!((_b = w.seen) == null ? void 0 : _b.anvil));
        const product = !holdOre && (w.logCount > 0 || w.rawFish > 0);
        if (product && ((_c = w.seen) == null ? void 0 : _c.shop) && (host.sellMatsForCoins(w.coins + 1) || this.sellJunk(host, w))) {
          this.setStatus(host, w, stance, "camp sell");
          this.cool = 3;
          return true;
        }
        if (w.gather && this.tryGather(host, w, stance, "camp node")) return true;
        if (this.walkSeen(host, w, stance, owned.tile, "camp node")) return true;
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
      return host.sellUnusedOnce();
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
      if (this.runTicks < this.chestBlockUntil) return false;
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
        if (host.smithKitOnce()) {
          this.setStatus(host, w, stance, s.label);
          this.cool = 3;
          return true;
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
