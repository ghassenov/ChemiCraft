# ChemiCraft — Architecture

## Technology Stack

| Layer         | Technology                          | Purpose                                |
|---------------|-------------------------------------|----------------------------------------|
| Game Engine   | Phaser.js 3                         | 2D rendering, scenes, input, physics  |
| Frontend      | HTML5 / CSS3 / JavaScript (ES6+)   | UI overlay, HUD, menus                 |
| Backend       | Firebase Auth + Firestore           | Authentication, data persistence       |
| Hosting       | Firebase Hosting or Vercel          | Deployment                             |
| Graphics      | Kenney.nl, OpenGameArt.org          | Tilesets, sprites                      |
| Audio         | SoundBible, Audionautix             | SFX + background music                 |

---

## Folder Structure

```
chemicaft/
├── index.html                  # Entry point
├── package.json
├── public/
│   ├── assets/
│   │   ├── images/             # Sprites, tilesets, icons
│   │   │   ├── tilesets/
│   │   │   ├── characters/
│   │   │   ├── items/
│   │   │   └── ui/
│   │   └── audio/              # Sound effects and music
│   │       ├── sfx/
│   │       └── music/
│   └── lib/                    # External libraries (Phaser, Firebase SDK)
├── src/
│   ├── main.js                 # Phaser game config & boot
│   ├── scenes/                 # Phaser scenes
│   │   ├── BootScene.js
│   │   ├── MenuScene.js
│   │   ├── AuthScene.js
│   │   ├── GameScene.js        # Main map & avatar movement
│   │   ├── LabScene.js         # Laboratory interface
│   │   ├── LibraryScene.js     # Library & books
│   │   ├── ShopScene.js
│   │   └── InventoryScene.js
│   ├── systems/                # Game logic modules
│   │   ├── AuthManager.js      # Firebase Auth wrapper
│   │   ├── QuestManager.js     # Quest state & progression
│   │   ├── LabManager.js       # Reaction logic & validation
│   │   ├── InventoryManager.js # Inventory CRUD
│   │   ├── SkillManager.js     # Skill levels & effects
│   │   ├── CoinManager.js      # Coin economy
│   │   └── MapManager.js       # Map transitions & POIs
│   ├── data/                   # Static game data (JSON)
│   │   ├── quests.json
│   │   ├── reagents.json
│   │   ├── reactions.json
│   │   ├── maps.json
│   │   ├── shop.json
│   │   └── books.json
│   ├── ui/                     # HUD & UI components
│   │   ├── HUD.js              # Coins, skills, inventory icon
│   │   ├── DialogueBox.js      # NPC speech bubbles
│   │   └── Button.js
│   └── utils/                  # Helpers
│       ├── chemistry.js        # Reaction solver
│       └── storage.js          # LocalStorage (guest mode)
└── docs/                       # Documentation
```

---

## Data Flow

```
User Input (keyboard/click)
    ↓
Phaser Scene (input handler)
    ↓
System Module (e.g., QuestManager)
    ↓
Firestore (persist) ←→ Local State (runtime)
    ↓
UI Update (HUD, scene re-render)
```

- **Online mode:** All progress synced to Firestore on every state change
- **Guest mode:** Progress saved to `localStorage`, discarded on browser close

---

## Scene Transitions

```
BootScene → MenuScene ─→ AuthScene
                  │            │
                  │            ↓
                  └────→ GameScene ─→ LabScene
                            │           LibraryScene
                            │           ShopScene
                            │           InventoryScene
                            ↓
                        (next map via MapManager)
```
