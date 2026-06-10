# ChemiCraft — Data Models

All persistent data is stored as JSON in Firestore (online) or `localStorage` (guest mode).

---

## 1. Quest Data

```json
{
  "quest_ventilation": {
    "id": "quest_ventilation",
    "npc": "panting_pete",
    "map": "atom_meadows",
    "title": "Ventilation Crisis",
    "dialogue": {
      "greeting": "*huff puff* The air in our village is so stale!",
      "problem": "We need fresh air molecules — the ones that make up 78% of our atmosphere.",
      "hint": "Nitrogen atoms love to form triple bonds. Two of them together make a very stable molecule.",
      "success": "Ahhh! Fresh air! Thank you, young chemist!"
    },
    "objective": {
      "type": "molecule",
      "target": "N2"
    },
    "required_reagents": ["N", "N"],
    "rewards": {
      "coins": 50,
      "skill": "bonding",
      "skill_points": 1,
      "unlock_reagent": "O"
    },
    "prerequisites": []
  }
}
```

---

## 2. User Progress

```json
{
  "user_id": "abc123",
  "username": "chem_master",
  "current_map": "atom_meadows",
  "unlocked_maps": ["atom_meadows"],
  "completed_quests": ["quest_ventilation"],
  "active_quests": ["quest_water_crisis"],
  "inventory": {
    "reagents": {
      "H": 5,
      "O": 3,
      "N": 1,
      "C": 2
    },
    "quest_items": [],
    "consumables": {
      "crafting_speed_potion": 2
    }
  },
  "skills": {
    "bonding": 2,
    "balancing": 0,
    "precipitation": 0,
    "acid_base": 0
  },
  "equipped_cosmetics": {
    "coat": "lab_coat_white",
    "goggles": "none",
    "hat": "none"
  },
  "coins": 120
}
```

---

## 3. Reagents

```json
{
  "H": {
    "id": "H",
    "name": "Hydrogen",
    "symbol": "H",
    "type": "element",
    "category": "basic",
    "color": 0xffffff,
    "unlock_condition": "free",
    "description": "The lightest element. Highly reactive, loves to bond."
  },
  "N": {
    "id": "N",
    "name": "Nitrogen",
    "symbol": "N",
    "type": "element",
    "category": "basic",
    "color": 0x4444ff,
    "unlock_condition": "free",
    "description": "Makes up 78% of air. Forms triple bonds."
  },
  "NaOH": {
    "id": "NaOH",
    "name": "Sodium Hydroxide",
    "symbol": "NaOH",
    "type": "compound",
    "category": "advanced",
    "color": 0xcccccc,
    "unlock_condition": { "type": "quest", "quest_id": "quest_sodium" },
    "description": "A strong base. Handle with care!"
  }
}
```

---

## 4. Reactions

```json
{
  "H2O_synthesis": {
    "id": "H2O_synthesis",
    "name": "Water Synthesis",
    "reactants": ["H", "H", "O"],
    "product": "H2O",
    "type": "synthesis",
    "description": "Two hydrogens and one oxygen make water!"
  },
  "N2_synthesis": {
    "id": "N2_synthesis",
    "name": "Nitrogen Gas Formation",
    "reactants": ["N", "N"],
    "product": "N2",
    "type": "synthesis",
    "description": "Two nitrogen atoms triple-bond to form nitrogen gas."
  }
}
```

---

## 5. Map Data

```json
{
  "atom_meadows": {
    "id": "atom_meadows",
    "name": "Atom Meadows",
    "display_name": "Atom Meadows",
    "tilemap": "tilemap_atom_meadows",
    "theme": {
      "ground": "grass",
      "water": "blue",
      "wall": "stone"
    },
    "pois": {
      "lab": { "x": 5, "y": 3, "scene": "LabScene" },
      "library": { "x": 15, "y": 3, "scene": "LibraryScene" },
      "shop": { "x": 10, "y": 1, "scene": "ShopScene" }
    },
    "npcs": [
      { "id": "panting_pete", "x": 8, "y": 15, "sprite": "npc_villager" }
    ],
    "unlock_condition": null
  }
}
```

---

## 6. Shop Items

```json
{
  "lab_coat": {
    "id": "lab_coat",
    "name": "Lab Coat",
    "type": "cosmetic",
    "slot": "coat",
    "cost": 100,
    "sprite": "cosmetic_lab_coat",
    "description": "A crisp white lab coat. Look like a real scientist!"
  },
  "crafting_speed_potion": {
    "id": "crafting_speed_potion",
    "name": "Crafting Speed Potion",
    "type": "consumable",
    "cost": 50,
    "max_uses": 3,
    "sprite": "potion_blue",
    "description": "Lab animations go 2x faster for 3 crafts."
  }
}
```
