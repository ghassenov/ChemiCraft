# ChemiCraft — Implementation Plan

## Overview

This plan breaks down the build into **3 phases** matching the hackathon schedule from the design doc, further subdivided into **milestone tasks**. Each task includes a deliverable and estimated effort.

---

## Phase 0 — Project Scaffolding (Pre-build)

| # | Task                          | Deliverable                                   | Est. |
|---|-------------------------------|-----------------------------------------------|------|
| 0.1 | Initialize project           | `package.json`, `index.html`, folder structure| 30m  |
| 0.2 | Install Phaser.js 3          | `npm install phaser`                          | 10m  |
| 0.3 | Install Firebase SDK         | `npm install firebase`                        | 10m  |
| 0.4 | Setup Vite (or Parcel)       | Dev server with HMR                           | 20m  |
| 0.5 | Create `src/main.js`         | Phaser game config with 800×600 canvas        | 15m  |
| 0.6 | Create BootScene             | Preload assets, show loading bar              | 20m  |
| 0.7 | Create MenuScene             | Title screen with "Play" / "Login" buttons    | 30m  |

**Total Phase 0:** ~2h

---

## Phase 1 — Core Gameplay (Day 1)

### Milestone 1.1 — Map & Movement

| # | Task                          | Deliverable                                   | Est. |
|---|-------------------------------|-----------------------------------------------|------|
| 1.1.1 | Create asset placeholders   | Placeholder tileset, simple avatar sprite     | 30m  |
| 1.1.2 | Create GameScene            | Phaser tilemap rendering, camera follow       | 1h   |
| 1.1.3 | Implement avatar movement   | WASD/arrow keys, 4-direction grid movement    | 1h   |
| 1.1.4 | Add collision detection     | Collide with trees, buildings, map edges      | 30m  |
| 1.1.5 | Add POI buildings           | Lab, Library, Shop building sprites + entry zones | 30m |

**Deliverable:** Player can move around a 20×20 tile map, bump into walls, and walk up to buildings.

### Milestone 1.2 — NPCs & Dialogue

| # | Task                          | Deliverable                                   | Est. |
|---|-------------------------------|-----------------------------------------------|------|
| 1.2.1 | Create NPC sprites           | 1–2 NPC placeholders on map                   | 20m  |
| 1.2.2 | Proximity detection          | Trigger zone within 1 tile of NPC             | 20m  |
| 1.2.3 | DialogueBox UI               | Typed-text bubble with "Accept Quest" button  | 1h   |
| 1.2.4 | QuestManager (basic)         | Track active quest, check completion          | 1h   |

**Deliverable:** Walk up to NPC → dialogue pops up → quest is accepted.

### Milestone 1.3 — Laboratory (Basic)

| # | Task                          | Deliverable                                   | Est. |
|---|-------------------------------|-----------------------------------------------|------|
| 1.3.1 | Create LabScene              | Background, reagent shelf, mixing area        | 1h   |
| 1.3.2 | Reagent shelf display        | Show available reagents (H, O, N, C)          | 30m  |
| 1.3.3 | Drag-and-drop mixing         | Drag reagent to beaker, show combined         | 1.5h |
| 1.3.4 | Chemistry solver (basic)     | Check if mixed reagents form target molecule  | 1h   |
| 1.3.5 | Quest completion trigger     | If crafted molecule matches quest → success   | 30m  |
| 1.3.6 | Reward flow                  | Show reward popup (coins, skill point)        | 30m  |

**Deliverable:** Player enters lab, mixes H+H+O → H₂O, delivers to NPC, gets reward.

---

## Phase 2 — Systems Integration (Day 2)

### Milestone 2.1 — Inventory & HUD

| # | Task                          | Deliverable                                   | Est. |
|---|-------------------------------|-----------------------------------------------|------|
| 2.1.1 | InventoryManager module      | Add/remove items, quantity tracking           | 1h   |
| 2.1.2 | InventoryScene / UI          | Grid layout, item icons, equipped tab         | 1.5h |
| 2.1.3 | HUD overlay                  | Coin counter, skills display, backpack icon   | 45m  |
| 2.1.4 | Drag inventory ↔ lab         | Use stored reagents in lab experiments        | 30m  |

**Deliverable:** Player sees coins/skills on HUD, can open backpack, reagents persist.

### Milestone 2.2 — Coin & Skill Systems

| # | Task                          | Deliverable                                   | Est. |
|---|-------------------------------|-----------------------------------------------|------|
| 2.2.1 | CoinManager                  | Add/spend coins, display animations           | 30m  |
| 2.2.2 | SkillManager                 | Track 4 skills, level-up logic                | 45m  |
| 2.2.3 | Skill effect: Bonding        | Auto-suggest bonds at level 2+                | 1h   |
| 2.2.4 | ShopScene                    | Buy items with coins, deduct from wallet      | 1h   |
| 2.2.5 | Shop inventory integration   | Purchased reagents appear in inventory        | 30m  |

**Deliverable:** Skills level up, coins work end-to-end, shop functional.

### Milestone 2.3 — Library

| # | Task                          | Deliverable                                   | Est. |
|---|-------------------------------|-----------------------------------------------|------|
| 2.3.1 | Create LibraryScene          | Bookshelves, Librarian NPC                    | 45m  |
| 2.3.2 | Topic selection UI           | Clickable topics, Librarian responds          | 45m  |
| 2.3.3 | Interactive book (1)         | Simple drag-to-match or multiple-choice quiz  | 1.5h |
| 2.3.4 | Hint system                  | Progressive hints per active quest            | 30m  |

**Deliverable:** Player reads a book, gets a hint, earns knowledge points.

### Milestone 2.4 — Firebase Integration

| # | Task                          | Deliverable                                   | Est. |
|---|-------------------------------|-----------------------------------------------|------|
| 2.4.1 | Firebase project setup       | Create project, enable Auth + Firestore       | 30m  |
| 2.4.2 | AuthManager                  | Signup, login, logout, guest mode              | 1h   |
| 2.4.3 | Firestore service            | Save/load UserProgress document                | 1.5h |
| 2.4.4 | Auto-save system             | Periodic save + save on key actions            | 30m  |
| 2.4.5 | AuthScene / Login UI         | Login/signup form, username/password fields    | 1h   |

**Deliverable:** User can sign up, log in, play, close browser → progress persists.

---

## Phase 3 — Content & Polish (Day 3)

### Milestone 3.1 — Multiple Maps

| # | Task                          | Deliverable                                   | Est. |
|---|-------------------------------|-----------------------------------------------|------|
| 3.1.1 | Map 2 tilemap (Reaction Ravine) | New tileset, layout, POIs                  | 1h   |
| 3.1.2 | MapManager (transitions)     | Portal/bridge appears → scene transition      | 45m  |
| 3.1.3 | Map 3 & 4 tilemaps (basic)   | Placeholder layouts, unique themes            | 1.5h |
| 3.1.4 | Map-specific content         | Different NPCs, quests, reagents per map      | 2h   |

**Deliverable:** Player progresses through 2+ maps.

### Milestone 3.2 — More Quests

| # | Task                          | Deliverable                                   | Est. |
|---|-------------------------------|-----------------------------------------------|------|
| 3.2.1 | Quest data (5+ quests)       | JSON entries covering all 4 chemistry topics  | 1.5h |
| 3.2.2 | Quest chain logic            | Prerequisites, sequential quests               | 30m  |
| 3.2.3 | Quest journal UI             | Active/completed quests list (optional)       | 45m  |

**Deliverable:** 5+ playable quests spanning maps 1–2.

### Milestone 3.3 — Shop Items & Cosmetics

| # | Task                          | Deliverable                                   | Est. |
|---|-------------------------------|-----------------------------------------------|------|
| 3.3.1 | 5+ shop items                | Cosmetics, reagents, potions                  | 30m  |
| 3.3.2 | Avatar customization         | Equip cosmetics → sprite changes on map       | 1h   |
| 3.3.3 | Consumable effects           | Speed potion shortens lab animations          | 30m  |

**Deliverable:** Shop fully functional, avatar can wear lab coat.

### Milestone 3.4 — Audio & Polish

| # | Task                          | Deliverable                                   | Est. |
|---|-------------------------------|-----------------------------------------------|------|
| 3.4.1 | Add background music         | BGM plays in GameScene, fades on transitions  | 30m  |
| 3.4.2 | Sound effects                | Crafting, coin collect, dialogue blips        | 30m  |
| 3.4.3 | Animations & particles       | Crafting bubbles, coin sparkle, portal glow   | 1h   |
| 3.4.4 | Loading screen               | Asset preload progress bar                    | 30m  |
| 3.4.5 | Bug fixing & testing         | Playthrough all quests, edge cases            | 2h   |

**Deliverable:** Polished demo-ready build.

---

## Summary Timeline

| Phase | Duration | Key Deliverables                          |
|-------|----------|-------------------------------------------|
| 0     | 2h       | Project scaffold, Phaser + Firebase setup |
| 1     | 8–10h    | Map, movement, NPCs, lab, first quest     |
| 2     | 10–12h   | Inventory, skills, coins, shop, library, auth |
| 3     | 10–12h   | More maps/quests, cosmetics, audio, polish |
| **Total** | **30–36h** | **Playable MVP with 2 maps, 5+ quests**  |

---

## Priority Order (If Time-Constrained)

If running short on time during the hackathon, drop in this order:

1. **Library** — the hint system can be handled by NPC dialogue directly
2. **Multiple maps** — focus on 1 great map with 3 quests
3. **Cosmetics** — functional over fancy
4. **Audio** — nice-to-have, not blocking gameplay
5. **Skill effects** — track levels but skip special effects

**Never drop:** Map + movement, NPCs + quests (at least 1), Lab (core gameplay loop), Inventory, Coins.
