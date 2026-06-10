# ChemiCraft — Player Systems

## 1. User Authentication

### Login / Signup
- Simple web form: **Username, Password, Email** (optional)
- **Password recovery** via email
- On login, player progress loads from Firestore (current map, inventory, skills, coins)
- **Guest mode:** Quick play without account — progress saved to `localStorage` but lost on browser close

### Session Management
- JWT or Firebase session token stored in `sessionStorage`
- Auto-save to Firestore every 30 seconds and on critical actions (quest complete, purchase)
- Guest mode: save to `localStorage` on same interval

---

## 2. Inventory System

### Storable Items
| Category     | Examples                          | Source                |
|--------------|-----------------------------------|-----------------------|
| Reagents     | H, O, N, C, Na, Cl, NaOH, HCl    | Lab extraction / shop |
| Quest Items  | Custom molecules for NPCs         | Lab crafting          |
| Consumables  | Crafting Speed Potion             | Shop / rewards        |
| Cosmetics    | Lab Coat, Goggles, Hat            | Shop                  |

### Inventory UI
- Accessible via **backpack icon** on the HUD
- **Grid layout** (e.g., 4×6 slots) with item icons and quantity badges
- **Drag-and-drop** from inventory to lab mixing area

### Limits
- Max 99 of any single reagent
- Max 20 unique quest items
- Cosmetics don't consume inventory slots (equipped directly)

---

## 3. Skills System

### Skill Categories
| Skill               | Effect                                              |
|---------------------|-----------------------------------------------------|
| Bonding             | Auto-suggests correct bonds, reduces craft time     |
| Equation Balancing  | Reveals balancing hints for equations               |
| Precipitation       | Highlights which reagent pairs form precipitates    |
| Acid-Base Sense     | Shows approximate pH of mixtures                    |

### Progression
- Each skill has **5 levels**
- Quest completion awards 1 skill point (player chooses which skill to upgrade)
- Library books award "knowledge" points (auto-assigned to Bonding)
- Higher levels unlock stronger hints and lab shortcuts

### Skill Level Effects
| Level | Bonding                          | Balancing                  |
|-------|----------------------------------|----------------------------|
| 1     | No help                          | No help                    |
| 2     | Highlights 1 correct bond        | Shows if equation is off  |
| 3     | Shows all possible bonds         | Suggests coefficient       |
| 4     | Auto-corrects invalid mixes      | Shows full balanced eq     |
| 5     | Auto-craft common molecules      | Auto-balance any equation  |

---

## 4. Coin System

### Display
- Coin count shown **permanently at top-right of HUD**
- Animated increment/decrement on changes

### Economy Balance
| Action                | Cost / Reward |
|-----------------------|---------------|
| Quest (Map 1)         | +30–50 coins  |
| Quest (Map 2)         | +60–100 coins |
| Quest (Map 3-4)       | +100–200 coins|
| Library book          | +10–20 coins  |
| Hidden treasure       | +25–50 coins  |
| Shop: cosmetic        | −100–150     |
| Shop: reagent         | −200–500     |
| Shop: consumable      | −50          |

---

## 5. Visual Progression

### Avatar Customization
- **Base avatar** (default sprite)
- **Equippable cosmetics:** Lab coat, goggles, hat, shoes
- Cosmetics purchased from shop and equipped in inventory screen
- Changes reflected immediately on the map sprite

### Map Completion
- When all quests on a map are complete, a **medal/badge** appears on the map selection UI
- Portal to next map unlocks

### HUD Elements
```
┌─────────────────────────────────────────────────┐
│  [Map Name]               [🪙 120] [🎒] [⚙]   │
│                                                   │
│           ┌─── 2D Game Map  ───┐                 │
│           │   Avatar (🧑)      │                 │
│           │   NPCs (👤)        │                 │
│           │   Buildings (🏛)   │                 │
│           └────────────────────┘                 │
│                                                   │
│  [Skills: Bonding ██░░░ 2/5]                     │
└─────────────────────────────────────────────────┘
```
