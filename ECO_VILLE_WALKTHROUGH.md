# EcoVille Walkthrough

## Entry Requirements
- Complete **all 6 quests** in Recycling Fields (100% map completion)
- Enter via portal at **(9, 18)** in Recycling Fields
- The portal unlocks automatically once all Recycling Fields quests are done

## What to Bring from Previous Maps

Before entering EcoVille, make sure you have:

| Item | Source | Needed For |
|------|--------|------------|
| **H₂O** (Water) | Craft in Atom Meadows lab: H₂ + O | `biofuel_synthesis` |
| **C** (Carbon) | Atom Meadows reagent shelf or coal nodes | `water_filtration` |
| **recycled_plastic (🔄)** | Craft in Recycling Fields lab | `solar_craft` |
| **recycled_glass (💎)** | Craft in Recycling Fields lab | `solar_craft` |

**Pro tip:** Craft 2× H₂O, 2× recycled_plastic, and 2× recycled_glass before coming. You'll need extras for multiple crafting steps.

---

## Map Overview

```
┌──────────────────────────────────────┐
│  [Portal back to Recycling Fields]   │
│  (9, 1)                              │
│                                      │
│   ┌────────────────────┐             │
│   │   Climate Lab      │             │
│   │   (6,3)-(8,5)      │             │
│   └────────────────────┘             │
│        ☁️ pollution_vent (5,7)       │
│                                      │
│  [Zara Green]     [Eco Library]      │
│   (15,12)          (15,4)-(16,5)     │
│                                      │
│  [Green Shop]     💧 water_spring     │
│   (12,7)-(14,8)    (15,10)           │
│                                      │
│  [Dr. Kai Mate]   [Ellie Watt]       │
│   (9, 11)          (8, 14)           │
│                                      │
│  🌿 biomass_pile (7,16)              │
│                                      │
│  [Mayor Verdant]                     │
│   (10, 17)                           │
│                                      │
│  [Portal to Prism Heights]           │
│  (9, 18) — unlocks after all quests  │
└──────────────────────────────────────┘
```

## NPCs & Their Roles

| NPC | Position | Quest(s) | Role |
|-----|----------|----------|------|
| **Dr. Kai Mate** (climate_scientist) | (9, 11) | carbon_neutral → greenhouse_gases | First quest giver |
| **Mayor Verdant** (green_mayor) | (10, 17) | clean_water_quest → sustainable_city | Mid & final quest giver |
| **Ellie Watt** (energy_engineer) | (8, 14) | renewable_shift | Mid quest giver |
| **Zara Green** (eco_activist) | (15, 12) | none | Opens Eco Climate Library |

## Buildings

| Building | Position | Purpose |
|----------|----------|---------|
| **Climate Lab** | (6,3)-(8,5) | All ecoVille crafting |
| **Eco Climate Library** | (15,4)-(16,5) | 5 climate science lessons + quizzes |
| **Green Shop** | (12,7)-(14,8) | Buy/sell items |

## Resource Nodes

| Node | Position | Gathers | Tool | Drops |
|------|----------|---------|------|-------|
| **pollution_vent (☁️)** | (5, 7) | 3× | Flask | pollution_sample (☁️) |
| **clean_water_spring (💧)** | (15, 10) | ∞ | Flask | clean_water (💧) |
| **biomass_pile (🌿)** | (7, 16) | 3× | Hands | organic_waste (🌿) |

> ⚠️ The pollution_vent only has 3 gathers total. Use them wisely! The clean_water_spring is infinite — gather as much clean water as you need.

---

## Quest Chain (In Order)

### Quest 1: Carbon Neutral — Dr. Kai Mate

**Objective:** Craft 1 Biofuel

**Recipe:** `biofuel_synthesis` — organic_waste (🌿) + H₂O (H₂O)

**Steps:**
1. Gather 🌿 from biomass_pile at (7, 16) or use leftover from Recycling Fields
2. Get H₂O from inventory (crafted in Atom Meadows)
3. Enter Climate Lab, place 🌿 + H₂O on the workbench
4. Complete the crafting minigame
5. Talk to Dr. Kai Mate to complete

**Reward:** 100 coins, climate_science +1

**Learning value:** Biofuel is renewable energy made from organic matter. It's carbon-neutral because plants absorb CO₂ while growing, which offsets the CO₂ released when burning.

---

### Quest 2: Greenhouse Gases — Dr. Kai Mate

**Objective:** Craft 1 Captured CO₂ (🫧)

**Recipe:** `co2_capture` — pollution_sample (☁️) + clean_water (💧)

**Steps:**
1. Gather ☁️ from pollution_vent at (5, 7) with flask equipped
2. Gather 💧 from clean_water_spring at (15, 10)
3. Craft at Climate Lab
4. Talk to Dr. Kai Mate

**Reward:** 125 coins, climate_science +1, bonding +1

**Learning value:** Carbon capture traps CO₂ before it reaches the atmosphere. Combining polluted air with water dissolves CO₂ into carbonic acid — a real-world carbon capture method.

---

### Quest 3: Clean Water — Mayor Verdant

**Objective:** Craft 3 Clean Water (💧) — repeat `water_filtration` 3 times

**Recipe:** `water_filtration` — pollution_sample (☁️) + C (C, carbon reagent)

**Steps:**
1. This quest requires 3× the recipe, which means 3× ☁️ + 3× C
2. The pollution_vent gives 3 gathers total — just enough!
3. Use C from inventory (Atom Meadows)
4. Craft 3× at Climate Lab
5. Talk to Mayor Verdant (all 3 are consumed at once)

**Reward:** 100 coins, precipitation +1

**Learning value:** Activated carbon (charcoal) filtration removes contaminants from water through adsorption. This is how many real-world water filters work.

---

### Quest 4: Renewable Shift — Ellie Watt

**Objective:** Craft 1 Solar Panel (☀️)

**Recipe:** `solar_craft` — recycled_plastic (🔄) + recycled_glass (💎)

**Steps:**
1. Get 🔄 and 💎 from Recycling Fields (craft them there, then travel back)
2. Craft at Climate Lab
3. Talk to Ellie Watt

**Reward:** 150 coins, climate_science +1, equation_balancing +1, **+1 Biofuel** (⛽)

**Learning value:** Solar panels use photovoltaic cells to convert sunlight into electricity. Using recycled materials reduces the carbon footprint of manufacturing.

---

### Quest 5: Sustainable City — Mayor Verdant (FINAL)

**Objective:** Craft 1 Green Certificate (🏆)

**Recipe:** `green_certificate_craft` — biofuel (⛽) + solar_panel (☀️) + carbon_credit (🌍)

**Sub-recipes needed:**
- **carbon_credit (🌍):** Combine 2× captured CO₂ (🫧 + 🫧) via `carbon_offset` recipe
- **biofuel (⛽):** Should be in your inventory as a reward from Quest 4
- **solar_panel (☀️):** Should be in your inventory from Quest 4

**Steps:**
1. Craft 2× captured CO₂ (🫧) if you don't have them — gather more pollution_sample + clean_water
2. Craft carbon_credit from 2× 🫧 at Climate Lab
3. Combine biofuel + solar_panel + carbon_credit at Climate Lab
4. Talk to Mayor Verdant to claim Green Certificate

**Reward:** 200 coins, climate_science +1, bonding +1, recycling_mastery +1

**Learning value:** Carbon neutrality means emissions released = emissions removed. Carbon credits represent verified CO₂ removal, and are traded on real carbon markets.

---

## Crafting Dependency Tree

```
                ┌─────────────────────┐
                │ pollution_sample ☁️  │ ← vent (3×)
                └──────────┬──────────┘
                           │
     ┌─────────────────────┼─────────────────────┐
     │                     │                     │
     ▼                     ▼                     ▼
  ┌──────┐           ┌──────────┐           ┌──────────┐
  │  C   │           │ clean_   │           │ clean_   │
  │  (C) │           │ water 💧 │           │ water 💧 │
  └──┬───┘           └────┬─────┘           └────┬─────┘
     │                    │                      │
     ▼                    ▼                      ▼
  ┌──────────────────┐ ┌───────────────────┐ ┌──────────────────┐
  │ water_filtration  │ │   co2_capture     │ │  co2_capture     │
  │ ☁️ + C → 💧      │ │ ☁️ + 💧 → 🫧     │ │ ☁️ + 💧 → 🫧    │
  └────────┬─────────┘ └────────┬──────────┘ └───────┬──────────┘
           │                    │                     │
           ▼                    ▼                     ▼
     clean_water (💧)      captured CO₂ (🫧)     captured CO₂ (🫧)
     (3× for quest 3)          │                     │
                               └─────────┬───────────┘
                                         ▼
                                  ┌────────────────┐
                                  │ carbon_offset   │
                                  │ 🫧+🫧 → 🌍     │
                                  └───────┬────────┘
                                          │
                                    carbon_credit (🌍)

  ┌──────────┐  ┌──────────────┐
  │ 🌿       │  │  H₂O         │
  │organic_  │  │  (Water)     │
  │waste     │  │              │
  └────┬─────┘  └──────┬───────┘
       │               │
       ▼               ▼
  ┌─────────────────────────┐
  │  biofuel_synthesis      │
  │  🌿 + H₂O → ⛽          │
  └──────────┬──────────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
  biofuel (⛽)   [Quest 4 reward]

  ┌────────┐  ┌────────┐
  │ 🔄     │  │ 💎     │
  │recycled│  │recycled│
  │plastic │  │ glass  │
  └───┬────┘  └───┬────┘
      │           │
      ▼           ▼
  ┌─────────────────────┐
  │   solar_craft        │
  │  🔄 + 💎 → ☀️       │
  └──────────┬──────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
  solar_panel (☀️)  [Quest 4 target]

  ┌──────────┬─────────────┬──────────┐
  │          │             │          │
  ▼          ▼             ▼          ▼
  ⛽        ☀️             🌍
biofuel  solar_panel   carbon_credit
  │          │             │
  └──────────┼─────────────┘
             ▼
  ┌──────────────────────────────┐
  │ green_certificate_craft       │
  │ ⛽ + ☀️ + 🌍 → 🏆             │
  └──────────┬───────────────────┘
             │
      ┌──────┴──────┐
      ▼             ▼
  green_certificate (🏆) → Portal to Prism Heights unlocked!
```

---

## Eco Climate Library — Lessons & Quizzes

The library at (15,4)-(16,5) contains 5 educational lessons. Talking to **Zara Green** inside the library opens the lesson selector.

| Lesson | Description | Reward | Skill |
|--------|-------------|--------|-------|
| **Climate Science Basics** | Greenhouse effect, CO₂, CH₄ | 15 coins | climate_science |
| **The Carbon Cycle** | Atmospheric CO₂, Keeling Curve | 15 coins | climate_science |
| **Carbon Capture Tech** | Pollution filtration, carbon credits | 20 coins | climate_science |
| **Renewable Energy** | Solar, biofuel, cross-map materials | 20 coins | climate_science |
| **Sustainable Cities** | Carbon neutrality, Green Certificate | 25 coins | climate_science |

**Per-lesson reward:** coins + 1 climate_science skill point
**All lessons completed:** +20 bonus coins

### Quiz Topics Per Lesson

| Lesson | Quiz Topics |
|--------|-------------|
| Climate Science Basics | Greenhouse gases ranking, human activities, CO₂ concentration |
| The Carbon Cycle | Ocean acidification, deforestation, photosynthesis, Keeling Curve |
| Carbon Capture Tech | Activated carbon filtration, in-game capture mechanics |
| Renewable Energy | Solar PV, biofuel carbon neutrality, hydropower |
| Sustainable Cities | Carbon neutrality definition, Green Certificate recipe, cross-map materials |

---

## Learning Value Summary

| Quest | Real-World Concept | Game Mechanic |
|-------|-------------------|---------------|
| **Carbon Neutral** | Biofuel = renewable, carbon-neutral energy | Crafting: organic_waste + H₂O → biofuel |
| **Greenhouse Gases** | Carbon capture technology | Crafting: pollution_sample + clean_water → captured CO₂ |
| **Clean Water** | Activated carbon water filtration | Crafting: pollution_sample + C → clean_water |
| **Renewable Shift** | Solar energy from recycled materials | Crafting: recycled_plastic + glass → solar_panel |
| **Sustainable City** | Carbon offsets & carbon neutrality | Multiple crafting chains → Green Certificate |
| **Library lessons** | Climate science theory | Quizzes reinforce real science |
| **Pollution vent** | Industrial pollution & sampling | Resource node with limited gathers |
| **Clean water spring** | Natural freshwater resources | Infinite resource node |
| **Biomass pile** | Organic waste as resource | Resource node, feeds biofuel crafting |

---

## Tips & Tricks

1. **Gather all 3 pollution_samples first** — the vent is the only source and has limited uses
2. **Carbon credits need 2× captured CO₂** — save one for the carbon_offset recipe
3. **Bring extra recycled materials** — solar panels need recycled_plastic + recycled_glass from Recycling Fields
4. **Talk to Zara Green** to enter the Eco Climate Library for helpful tutorials
5. **The clean_water_spring is infinite** — gather as much clean water as needed
6. **Quest 3 consumes all 3 clean water at once** — craft exactly 3, no more, no less
7. **The portal to Prism Heights** only unlocks after completing ALL 5 ecoVille quests
