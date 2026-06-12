# ChemiCraft — A Chemistry Learning RPG

**Design Document**

Your Hackathon Team
June 1, 2026

---

## 1. Game Overview

### 1.1 Core Concept

ChemiCraft is a web-based educational role-playing game (RPG) that teaches chemistry through engaging quests, exploration, and hands-on experimentation. The player controls an avatar in a 2D map, interacting with NPCs who present chemistry-related problems (e.g., synthesizing air molecules to improve village ventilation). Each completed quest rewards the player with coins, skills, and inventory items, and unlocks progressively harder challenges across multiple themed maps.

### 1.2 Target Audience

Children and young teenagers (ages 10–16) with basic reading skills. The game adapts difficulty from simple atomic structure to complex chemical reactions and precipitation.

### 1.3 Learning Objectives

- Understand atoms, molecules, and chemical bonds.
- Learn basic and advanced chemical reactions (synthesis, decomposition, precipitation).
- Apply theoretical knowledge in a virtual lab to solve real-world problems.
- Develop systematic experimentation and critical thinking skills.

---

## 2. Core Systems

### 2.1 User Authentication

#### 2.1.1 Login / Signup Page

- Simple web form with fields: Username, Password, Email (optional).
- Password recovery via email.
- After login, the player's progress (current map, inventory, skills, coins) is loaded from a database.
- Guest mode available for quick play (progress not saved).

#### 2.1.2 Technology Suggestions

- Frontend: HTML/CSS/JS with Phaser.js for game rendering.
- Backend: Firebase Authentication (easy to integrate) or custom Node.js + Express + JWT.
- Database: Firestore or MongoDB to store user profiles.

### 2.2 Map and Avatar Movement

#### 2.2.1 Map Design

- Top-down 2D tile-based map (e.g., 20x20 tiles).
- Each map has a theme: "Atom Plains" (map 1), "Reaction Forest" (map 2), "Precipitation Peaks" (map 3).
- Points of interest (POIs):
  - Village square – where NPC quest givers stand.
  - Laboratory – enterable building for experiments.
  - Library – enterable building for learning theory.
  - Shop – purchase cosmetic items, potions, or tools.

#### 2.2.2 Avatar Movement

- Controlled via keyboard (WASD or arrow keys) or click-to-move.
- Smooth grid-based movement (8-direction sprites).
- Collision detection with trees, buildings, and NPCs.
- When the avatar approaches an NPC (within 1 tile), a dialogue bubble appears.

### 2.3 NPCs and Quests

#### 2.3.1 Quest Structure

Each NPC presents a quest — a chemistry problem wrapped in a funny, story-driven context.

```
Approach NPC → Dialog explains problem → Go to lab to solve → Deliver solution → Receive reward
```

#### 2.3.2 Example Quest – "Ventilation Crisis"

- **NPC:** Panting Pete (a villager who can't breathe).
- **Dialogue:** "*huff puff* The air in our village is so stale! We need fresh air molecules — you know, the ones that make up 78% of our atmosphere. Can you craft some for me?"
- **Objective:** Synthesize dinitrogen (N₂) molecule in the lab.
- **Hint from Librarian:** "Nitrogen atoms love to form triple bonds. Two of them together make a very stable molecule."
- **Solution:** Combine two nitrogen atoms (available as reagents in the lab).
- **Reward:** 50 coins, +1 "Bonding" skill point, unlock "Oxygen" reagent.

#### 2.3.3 Quest Difficulty Progression

Quests become harder within the same map and across maps.

| Map     | Topic              | Example Quest                    |
|---------|--------------------|----------------------------------|
| Map 1   | Atoms & Molecules  | Build H₂O, CO₂, N₂              |
| Map 2   | Simple Reactions   | Combustion of methane            |
| Map 3   | Precipitation      | Make lead iodide (yellow precipitate) |
| Map 4   | Acid-Base          | Neutralize a toxic spill         |

### 2.4 Multiple Maps and Difficulty Tiers

- Players start on Map 1 (Atom Meadows) — only accessible until they complete all main quests.
- After finishing the last quest on a map, a portal or bridge appears leading to the next map.
- Map 2: Reaction Ravine — introduces chemical equations and balancing.
- Map 3: Precipitation Plateau — focuses on solubility rules and double displacement.
- Map 4: Acid-Base Atoll — pH, neutralisation, and indicators.
- Each map has its own unique Lab, Library, and Shop (different available reagents and items).

### 2.5 Laboratory (Lab)

#### 2.5.1 Purpose

The lab is where players experiment to find the solution required by an NPC's quest.

#### 2.5.2 Lab Interface

A separate scene/screen with:
- **Reagents shelf:** shows all available chemical elements or compounds (unlocked via progress or bought in shop).
- **Mixing area:** drag-and-drop reagents into a beaker or reaction chamber.
- **Observation panel:** displays result (e.g., "You formed water (H₂O)", "A yellow precipitate appears").
- **Craft button:** commits the synthesis; if matches quest objective, quest completes.

#### 2.5.3 Unlocking Reagents

- Basic elements (H, O, N, C) are free.
- More advanced reagents (NaOH, HCl, Pb(NO₃)₂) are unlocked after completing certain quests or bought with coins.

### 2.6 Library and the Librarian NPC

#### 2.6.1 Library Interface

- Entering the library opens a separate screen with bookshelves and the Librarian.
- Librarian: A wise old man with a long white beard (named "Professor Knowitall").
- Players can ask questions via a text box or choose from a list of topics:
  - "What is an atom?"
  - "How do covalent bonds work?"
  - "What is a precipitation reaction?"
- The Librarian responds with concise, playful explanations and directs the player to specific "books" (interactive mini-lessons).

#### 2.6.2 Interactive Books

- Each book is a short interactive tutorial (e.g., drag to match atomic symbols, multiple-choice quiz, or animated diagram).
- Completing a book awards a small number of coins and a "knowledge" skill point.

### 2.7 Inventory System

#### 2.7.1 What Can Be Stored

- **Reagents:** Extracted from lab experiments or bought from shop.
- **Quest items:** Special molecules crafted for NPCs (stored until delivered).
- **Consumables:** E.g., "Lab coat" (cosmetic), "Faster mixing" (temporary speed in lab).

#### 2.7.2 Inventory UI

- Accessible via a backpack icon on the HUD.
- Grid layout (e.g., 4x6 slots) with item icons and quantity.
- Drag-and-drop from inventory to lab mixing area.

### 2.8 Skills System

#### 2.8.1 Skill Categories

- **Bonding:** Reduces time/effort to create molecules (or auto-suggests correct bonds).
- **Equation Balancing:** Reveals hints for balancing chemical equations.
- **Precipitation Mastery:** Highlights which reagents form precipitates.
- **Acid-Base Sense:** Shows approximate pH of mixtures.

#### 2.8.2 Gaining Skill Points

- After completing a quest, the player chooses one skill to upgrade (or receives a fixed skill point per quest).
- Each skill has 5 levels. Higher levels unlock more detailed hints or laboratory shortcuts.

### 2.9 Coin System and Shop

#### 2.9.1 Coin Economy

- Coins earned from quests, library tutorials, and discovering hidden treasures on the map.
- Coins are displayed at the top of the screen.

#### 2.9.2 Shop Items

The shop is a building on the map. The shopkeeper sells:

| Item                     | Cost (coins) | Effect                              |
|--------------------------|--------------|-------------------------------------|
| Lab Coat (cosmetic)      | 100          | Changes avatar appearance           |
| Goggles                  | 150          | +5% lab success (visual only)       |
| Extra Reagent: Sodium    | 200          | Unlocks Na for experiments          |
| Crafting Speed Potion    | 50           | 3 uses — lab animations faster      |
| Mystery Molecule         | 500          | Gives a random new reagent          |

### 2.10 Visual Progression

- Avatar customization: Change clothes, hat, or lab coat using coins.
- Map completion badge: When all quests on a map are done, a medal appears on the map selection screen.

---

## 3. Technical Implementation Plan

### 3.1 Technology Stack

- **Game Engine:** Phaser.js 3 (2D, excellent for maps, NPCs, and UI).
- **Frontend Framework:** Plain HTML5/CSS3 + JavaScript (or Vue.js for reactivity).
- **Backend:** Firebase (Auth + Firestore) — quick to set up for hackathon.
- **Graphics:** Tilesets from Kenney.nl, custom sprites for avatar and NPCs.
- **Sound:** Free sound effects from SoundBible, background music from Audionautix.

### 3.2 Data Structures (JSON examples)

#### 3.2.1 Quest Data

```json
{
  "id": "quest_ventilation",
  "npc": "panting_pete",
  "map": "atom_meadows",
  "objective": {
    "type": "molecule",
    "target": "N2"
  },
  "reward_coins": 50,
  "reward_skill": "bonding",
  "required_reagents": ["N", "N"]
}
```

#### 3.2.2 User Progress

```json
{
  "user_id": "abc123",
  "current_map": "atom_meadows",
  "completed_quests": ["quest_ventilation"],
  "inventory": [{ "item": "N", "qty": 3 }],
  "skills": { "bonding": 1, "balancing": 0 },
  "coins": 120
}
```

---

## 4. Art and Audio Assets (Free Sources)

- 2D tilesets and sprites: Kenney.nl (public domain).
- Character sprites: OpenGameArt.org (search "RPG character").
- UI icons: Game-icons.net (CC BY).
- Laboratory equipment: Free vector art from Freepik (with attribution).
- Music: Audionautix.com (royalty-free).
- Sound effects: SoundBible.com or Freesound.org (check licenses).

---

## 5. Development Roadmap for Hackathon

### 5.1 Day 1 (Setup & Core)

- Set up Phaser.js project, basic map and avatar movement.
- Implement simple NPC interaction (dialogue box).
- Create one quest (e.g., N₂ molecule) with lab interface.

### 5.2 Day 2 (Systems Integration)

- Add inventory, coin display, and skill system (basic).
- Implement library with one interactive book.
- Integrate Firebase authentication and save/load progress.

### 5.3 Day 3 (Polish & Content)

- Add second map, more quests (3–5 total).
- Implement shop with a few items.
- Add sound effects and background music.
- Test, fix bugs, prepare presentation/demo.

---

## 6. Future Expansions (Post-Hackathon)

- Multiplayer mode: see other players on the map, trade reagents.
- Dynamic quest generation: random combinations of reactants.
- Mini-games inside lab (e.g., titration timing game).
- VR support using Three.js + WebXR.

---

## 7. Conclusion

ChemiCraft transforms chemistry learning into an engaging, story-driven RPG where experimentation and discovery are rewarded. With a clear map progression, interactive lab and library, persistent player progression (skills, coins, inventory), and humorous NPCs, this game will captivate young learners while teaching essential chemistry concepts. The proposed tech stack (Phaser.js + Firebase) is hackathon-feasible yet extensible for a full product.
