# ChemiCraft — Core Systems

## 1. Map & Avatar Movement

### Map Design
- Top-down 2D **tile-based** maps (e.g., 20×20 tiles)
- Each map has a distinct theme (Atom Meadows, Reaction Ravine, etc.)
- **Points of Interest (POIs):**
  - Village square — NPC quest-givers
  - Laboratory — enterable building for experiments
  - Library — enterable building for learning
  - Shop — purchase items

### Avatar Movement
- **Controls:** WASD or arrow keys (smooth grid-based, 8-direction sprites)
- **Click-to-move** alternative
- **Collision detection** with trees, buildings, NPCs, map boundaries
- **NPC interaction trigger** — dialogue bubble appears when within 1 tile of an NPC

### Map Transitions
- After completing all main quests on a map, a portal/bridge appears to the next map
- Each map has its own Lab, Library, and Shop (different reagents/items available)

---

## 2. NPCs & Quests

### Quest Flow
```
Approach NPC → Dialogue explains problem → Go to lab → Craft solution → Deliver → Receive reward
```

### Quest Structure
- Each NPC presents a chemistry problem wrapped in a story-driven context
- **Example — Panting Pete ("Ventilation Crisis"):**
  - "The air is stale! We need N₂ molecules (78% of our atmosphere)."
  - Hint: "Nitrogen atoms love triple bonds — two together make a stable molecule."
  - Solution: Combine 2× Nitrogen in the lab
  - Reward: 50 coins, +1 Bonding skill, unlock Oxygen reagent

### Quest Properties
| Field             | Description                                        |
|-------------------|----------------------------------------------------|
| id                | Unique identifier                                  |
| npc               | NPC ID who gives the quest                         |
| map               | Which map the quest belongs to                     |
| objective         | Target molecule or reaction to produce             |
| required_reagents | List of reagents needed                            |
| reward_coins      | Coin reward                                        |
| reward_skill      | Skill point awarded                                |
| unlock_reagent    | Optional new reagent unlocked on completion        |
| prerequisite      | Previous quest ID required (if any)                |

### Difficulty Progression
- Quests get harder within a map and across maps
- Map 1: Simple molecules (H₂O, CO₂, N₂)
- Map 2: Balanced equations (methane combustion)
- Map 3: Precipitation reactions (lead iodide)
- Map 4: Acid-base neutralization

---

## 3. Laboratory (Lab)

### Purpose
The virtual lab is where players experiment to find the solution required by an NPC's quest.

### Interface
- **Separate scene/screen** opened when avatar enters the lab building
- **Reagents shelf:** Lists all available elements/compounds (unlocked via progress or shop)
- **Mixing area:** Drag-and-drop reagents into a beaker/reaction chamber
- **Observation panel:** Shows results ("You formed H₂O", "Yellow precipitate appears")
- **Craft button:** Commits synthesis — if it matches quest objective, quest completes

### Unlocking Reagents
| Reagent        | How to Unlock                          |
|----------------|----------------------------------------|
| H, O, N, C     | Free (starter)                         |
| Na, Cl, Fe     | Complete certain quests                |
| NaOH, HCl      | Map 2+ quests                          |
| Pb(NO₃)₂       | Map 3+ quests or shop purchase        |

---

## 4. Library & Librarian NPC

### Purpose
The library provides theoretical knowledge and hints to help players solve quests.

### Interface
- **Separate scene** opened when avatar enters the library
- **Librarian NPC ("Professor Knowitall"):** Wise old man with a long white beard
- Players can ask questions via text or topic list:
  - "What is an atom?"
  - "How do covalent bonds work?"
  - "What is a precipitation reaction?"

### Interactive Books
- Each book is a short interactive tutorial:
  - Drag-to-match atomic symbols
  - Multiple-choice quiz
  - Animated diagrams
- Completing a book awards coins + a "knowledge" skill point

### Hint System
- If a player is stuck on a quest, the Librarian provides progressive hints
- First hint: vague clue — Last hint: nearly the full solution
- Cost: free (but limited number per quest to encourage thinking)

---

## 5. Shop & Coin Economy

### Coin Economy
| Source                        | Coins Earned       |
|-------------------------------|--------------------|
| Quest completion              | 30–200 (per quest) |
| Library books completed       | 10–20              |
| Hidden treasure (map secrets) | 25–50              |

### Shop Items
| Item                      | Cost | Effect                                   |
|---------------------------|------|------------------------------------------|
| Lab Coat (cosmetic)       | 100  | Changes avatar appearance                |
| Goggles                   | 150  | +5% lab success (visual only)            |
| Extra Reagent: Sodium     | 200  | Unlocks Na for experiments               |
| Crafting Speed Potion     | 50   | 3 uses — lab animations faster           |
| Mystery Molecule          | 500  | Gives a random new reagent               |

---

## 6. Visual Progression

- **Avatar customization:** Change clothes, hat, lab coat using coins
- **Map completion badge:** Medal appears on map selection screen when all quests done
- **Skill level indicators:** Shown on HUD with progress bars
