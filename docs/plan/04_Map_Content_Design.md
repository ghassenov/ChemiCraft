# Map Content Design

This document details every piece of content for each of the 5 maps: items, recipes, quests, NPCs, resources, and buildings.

---

## Map 1: Atom Meadows (Molecular Cuisine & Chemical Attraction)

**Difficulty:** ★☆☆☆☆ | **Status:** Partially exists (needs fixes + expansion)

### Visual Theme
- **Colors:** Green grass (`#8ab04a`), brown earth (`#5a4a3a`), blue accents (`#4a7acc`)
- **Particles:** Pollen floating gently
- **Atmosphere:** Warm, sunny meadow — peaceful and inviting

### Buildings
| Building | Position | Scene | Notes |
|----------|----------|-------|-------|
| Laboratory | (4, 3) | `LabInteriorScene` | Existing — add recipe filtering |
| Library | (9, 3) | `LibraryInteriorScene` | Existing — add map-1-specific lessons |
| Shop | (14, 3) | `ShopInteriorScene` | Existing — stock basic reagents |

### NPCs
| ID | Name | Role | Position | Quests Offered |
|----|------|------|----------|---------------|
| `panting_pete` | Panting Pete | Worker | (3, 8) | `ventilation_crisis` |
| `mayor_molecule` | Mayor Molecule | Mayor | (10, 6) | `water_of_life` |
| `prof_knowitall` | Prof. Knowitall | Scholar | (15, 11) | None (teaches crafting) |
| `shopkeeper_sal` | Shopkeeper Sal | Merchant | (13, 15) | None (runs shop) |
| `lab_assistant` | Lab Assistant | Guide | (5, 14) | `methane_harvest` (NEW) |

### Items (existing + fixes)
**Fix:** Add CH₄ and NH₃ entries to `items.json`:

```json
{ "id": "CH4", "name": "Methane", "type": "molecule", "description": "A potent greenhouse gas...", "icon": "methane" },
{ "id": "NH3", "name": "Ammonia", "type": "molecule", "description": "A nitrogen-hydrogen compound...", "icon": "ammonia" }
```

### Recipes (existing)
| ID | Inputs | Output | Difficulty | Notes |
|----|--------|--------|:----------:|-------|
| `h2` | H + H | H₂ | 1 | Existing, working |
| `o2` | O + O | O₂ | 1 | Existing, working |
| `n2` | N + N | N₂ | 1 | Existing, working |
| `h2o` | H₂ + O | H₂O | 2 | Existing, working |
| `co2` | C + O + O | CO₂ | 2 | Existing, working |
| `ch4` | C + H + H + H + H | CH₄ | 3 | Exists in recipes, **fix items** |
| `nh3` | N + H + H + H | NH₃ | 3 | Exists in recipes, **fix items** |

### Quests
| ID | Name | Giver | Goal | Reward | Prereq |
|----|------|-------|------|--------|--------|
| `ventilation_crisis` | Ventilation Crisis | Panting Pete | Craft N₂ | 50 coins, 1 bonding, 5× O | None |
| `water_of_life` | Water of Life | Mayor Molecule | Craft H₂O | 75 coins, 1 bonding, 1 equation, 5× C | `ventilation_crisis` |
| `methane_harvest` | Methane Harvest | Lab Assistant | Craft CH₄ | 100 coins, 1 bonding, 3× Na | `water_of_life` |
| `ammonia_synthesis` | Ammonia Synthesis | Prof. Knowitall | Craft NH₃ | 100 coins, 1 precipitation | `methane_harvest` |
| `carbon_capture` | Carbon Capture | Mayor Molecule | Craft CO₂ + bring to mayor | 75 coins, 1 equation | `water_of_life` |

### Portal
- **Position:** (10, 2)
- **Unlock:** Complete all 5 main quests
- **Target:** `recyclingFields`
- **Visual:** Green swirling vortex

---

## Map 2: Recycling Fields (Materials & Recycling)

**Difficulty:** ★★☆☆☆ | **Status:** New

### Visual Theme
- **Colors:** Sage green (`#7c9a5e`), brown (`#5a7a3e`), amber (`#c4a040`)
- **Particles:** Falling leaves
- **Atmosphere:** Industrial-nature blend — workshops, sorting facilities, greenhouses

### Buildings
| Building | Position | Scene | Notes |
|----------|----------|-------|-------|
| Materials Lab | (4, 3) | `LabInteriorScene` | Craft composites, recycled materials |
| Eco Library | (9, 3) | `LibraryInteriorScene` | Lessons on material science |
| Recycling Depot | (14, 3) | `ShopInteriorScene` | Shop + sorting minigame access |

### NPCs
| ID | Name | Role | Position | Quests Offered |
|----|------|------|----------|---------------|
| `waste_manager` | Wally Waste | Manager | (3, 8) | `waste_crisis` |
| `materials_scientist` | Dr. Mat | Scientist | (10, 6) | `circular_economy`, `composite_creation` |
| `green_dealer` | Green Gary | Merchant | (13, 15) | Runs Recycling Depot shop |
| `eco_educator` | Eco Emma | Educator | (8, 14) | `know_your_materials` |

### New Items
```json
{ "id": "plastic_waste", "name": "Plastic Waste", "type": "material", "category": "plastic", "description": "Discarded plastic items..." },
{ "id": "glass_waste", "name": "Glass Waste", "type": "material", "category": "glass", "description": "Broken glass pieces..." },
{ "id": "metal_waste", "name": "Metal Waste", "type": "material", "category": "metal", "description": "Scrap metal..." },
{ "id": "paper_waste", "name": "Paper Waste", "type": "material", "category": "paper", "description": "Used paper and cardboard..." },
{ "id": "organic_waste", "name": "Organic Waste", "type": "material", "category": "organic", "description": "Food scraps and plant matter..." },
{ "id": "recycled_plastic", "name": "Recycled Plastic Pellets", "type": "molecule", "description": "Processed plastic ready for reuse..." },
{ "id": "recycled_glass", "name": "Glass Cullet", "type": "molecule", "description": "Crushed and cleaned glass..." },
{ "id": "recycled_metal", "name": "Recycled Metal Ingot", "type": "molecule", "description": "Melted and purified metal..." },
{ "id": "composite_wood", "name": "Composite Wood Board", "type": "molecule", "description": "Recycled wood fibers bonded together..." },
{ "id": "compost", "name": "Compost", "type": "molecule", "description": "Nutrient-rich organic compost..." }
```

### New Recipes
| ID | Inputs | Output | Difficulty | Notes |
|----|--------|--------|:----------:|-------|
| `recycle_plastic` | plastic_waste × 3 | recycled_plastic | 1 | Requires sorting minigame first |
| `recycle_glass` | glass_waste × 3 | recycled_glass | 1 | |
| `recycle_metal` | metal_waste × 3 | recycled_metal | 1 | |
| `composite_wood` | paper_waste + organic_waste | composite_wood | 2 | |
| `composting` | organic_waste × 2 | compost | 1 | |
| `eco_brick` | recycled_plastic + recycled_glass | eco_brick | 2 | Quest item |

### Quests
| ID | Name | Giver | Goal | Reward | Prereq |
|----|------|-------|------|--------|--------|
| `waste_crisis` | Waste Crisis | Wally Waste | Sort 10 items correctly in minigame | 75 coins, 1 recycling_mastery | Map 1 completion |
| `know_your_materials` | Know Your Materials | Eco Emma | Complete material identification quiz | 50 coins, 1 knowledge | `waste_crisis` |
| `circular_economy` | Circular Economy | Dr. Mat | Craft 1 eco_brick | 125 coins, 1 recycling_mastery, 1 bonding | `know_your_materials` |
| `composite_creation` | Composite Creation | Dr. Mat | Craft 1 composite_wood + 1 recycled_metal | 100 coins, 1 recycling_mastery | `circular_economy` |

### Portal
- **Position:** (10, 2)
- **Unlock:** Complete all 4 quests
- **Target:** `ecoVille`
- **Visual:** Amber/brown vortex with gear motifs

### Resource Nodes
| Type | Positions | Tool | Gathers |
|------|-----------|------|---------|
| Plastic pile | (6, 8), (14, 5) | Hands | 3 |
| Glass pile | (15, 7), (3, 12) | Hands | 3 |
| Metal pile | (12, 14), (5, 11) | Pickaxe | 3 |
| Paper pile | (8, 16), (16, 12) | Hands | 3 |
| Compost heap | (4, 16), (10, 15) | Flask | 3 |

---

## Map 3: EcoVille (Environment & Climate Change)

**Difficulty:** ★★★☆☆ | **Status:** New

### Visual Theme
- **Colors:** Sky blue (`#4a9ac4`), teal (`#2a7a5e`), clean white (`#e8e8e8`)
- **Particles:** Wind lines / air currents
- **Atmosphere:** Bright, clean, futuristic eco-city — solar panels, wind turbines, green roofs

### Buildings
| Building | Position | Scene | Notes |
|----------|----------|-------|-------|
| Climate Lab | (4, 3) | `LabInteriorScene` | Craft biofuels, filtration systems |
| Eco Library | (9, 3) | `LibraryInteriorScene` | Climate science lessons |
| Green Shop | (14, 3) | `ShopInteriorScene` | Sell carbon credits, buy green tech |

### NPCs
| ID | Name | Role | Position | Quests Offered |
|----|------|------|----------|---------------|
| `climate_scientist` | Dr. Kai Mate | Scientist | (3, 8) | `carbon_neutral`, `greenhouse_gases` |
| `green_mayor` | Mayor Verdant | Mayor | (10, 6) | `clean_water`, `sustainable_city` |
| `energy_engineer` | Ellie Watt | Engineer | (8, 14) | `renewable_shift` |
| `eco_activist` | Alex Green | Activist | (15, 12) | `biodiversity_protect` |

### New Items
```json
{ "id": "biofuel", "name": "Biofuel", "type": "molecule", "description": "Renewable fuel from organic matter..." },
{ "id": "carbon_credit", "name": "Carbon Credit", "type": "consumable", "description": "Offset 1 ton of CO₂..." },
{ "id": "solar_panel", "name": "Solar Panel", "type": "equipment", "description": "Harness the sun's energy..." },
{ "id": "wind_turbine", "name": "Wind Turbine", "type": "equipment", "description": "Generate clean electricity..." },
{ "id": "clean_water", "name": "Clean Water", "type": "reagent", "description": "Filtered, drinkable water..." },
{ "id": "co2_captured", "name": "Captured CO₂", "type": "molecule", "description": "CO₂ removed from atmosphere..." },
{ "id": "pollution_sample", "name": "Pollution Sample", "type": "reagent", "description": "Contaminated air/water sample..." },
{ "id": "green_certificate", "name": "Green Certificate", "type": "quest", "description": "Proof of sustainable practices..." }
```

### New Recipes
| ID | Inputs | Output | Difficulty | Notes |
|----|--------|--------|:----------:|-------|
| `biofuel_synthesis` | organic_waste + H₂O | biofuel | 3 | Requires Map 2 materials |
| `co2_capture` | pollution_sample + clean_water | co2_captured | 2 | |
| `water_filtration` | pollution_sample + C (charcoal) | clean_water | 2 | |
| `solar_craft` | recycled_plastic + Si → solar_panel (placeholder) | 3 | | Quest item |
| `carbon_offset` | co2_captured × 2 | carbon_credit | 2 | |

### Quests
| ID | Name | Giver | Goal | Reward | Prereq |
|----|------|-------|------|--------|--------|
| `carbon_neutral` | Carbon Neutral | Dr. Kai Mate | Reduce city's carbon footprint by 50% via choices | 100 coins, 1 climate_science | Map 2 completion |
| `greenhouse_gases` | Greenhouse Gases | Dr. Kai Mate | Craft CO₂ and CH₄, then capture them | 125 coins, 1 climate_science, 1 bonding | `carbon_neutral` |
| `clean_water` | Clean Water | Mayor Verdant | Filter 3 pollution samples into clean water | 100 coins, 1 precipitation | `greenhouse_gases` |
| `renewable_shift` | Renewable Shift | Ellie Watt | Craft 1 solar_panel + 1 biofuel | 150 coins, 1 climate_science, 1 equation | `clean_water` |
| `sustainable_city` | Sustainable City | Mayor Verdant | Earn the Green Certificate | 200 coins, 1 all skills | `renewable_shift` |

### The Climate Calculator (New Mechanic)
A quest-integrated tool where players make decisions for a virtual city:
- Choose energy sources (coal, solar, wind, hydro)
- See real-time CO₂ output, cost, and public approval
- Target: balance budget + low emissions + happy citizens
- Success: complete "Carbon Neutral" quest

### Portal
- **Position:** (10, 2)
- **Unlock:** Complete all 5 quests
- **Target:** `prismHeights`
- **Visual:** Blue/white shimmer with leaf particles

### Resource Nodes
| Type | Positions | Tool | Gathers |
|------|-----------|------|---------|
| Pollution vent | (5, 7), (13, 5) | Flask | 3 |
| Clean water spring | (8, 13), (15, 10) | Flask | Infinite |
| Solar flare (energy) | (4, 14), (12, 16) | Pickaxe | 3 |
| Biomass pile | (7, 16), (14, 14) | Hands | 3 |

---

## Map 4: Prism Heights (Optics & Colors)

**Difficulty:** ★★★★☆ | **Status:** New

### Visual Theme
- **Colors:** Lavender (`#c4b0e8`), purple (`#8a7ac4`), silver (`#c0c0c0`)
- **Particles:** Sparkles / light orbs
- **Atmosphere:** Twilight, mystical — prismatic light beams, crystalline structures

### Buildings
| Building | Position | Scene | Notes |
|----------|----------|-------|-------|
| Light Lab | (4, 3) | `LabInteriorScene` | Craft lenses, combine colors |
| Optics Library | (9, 3) | `LibraryInteriorScene` | Light and color theory |
| Prism Shop | (14, 3) | `ShopInteriorScene` | Buy filters, prisms, lenses |

### NPCs
| ID | Name | Role | Position | Quests Offered |
|----|------|------|----------|---------------|
| `optician` | Prism Patel | Optician | (3, 8) | `split_the_light`, `rainbow_bridge` |
| `light_researcher` | Dr. Ray Sunshine | Scientist | (10, 6) | `invisible_spectrum`, `light_puzzle_master` |
| `color_artist` | Chroma | Artist | (8, 14) | `color_mixing` |
| `lens_crafter` | Focus Frank | Craftsman | (14, 12) | `lens_creation` |

### New Items
```json
{ "id": "prism", "name": "Prism", "type": "reagent", "description": "Splits white light into colors..." },
{ "id": "red_filter", "name": "Red Filter", "type": "reagent", "description": "Only passes red light..." },
{ "id": "blue_filter", "name": "Blue Filter", "type": "reagent", "description": "Only passes blue light..." },
{ "id": "green_filter", "name": "Green Filter", "type": "reagent", "description": "Only passes green light..." },
{ "id": "yellow_filter", "name": "Yellow Filter", "type": "reagent", "description": "Only passes yellow light..." },
{ "id": "convex_lens", "name": "Convex Lens", "type": "equipment", "description": "Focuses light to a point..." },
{ "id": "concave_lens", "name": "Concave Lens", "type": "equipment", "description": "Spreads light outward..." },
{ "id": "rainbow_gem", "name": "Rainbow Gem", "type": "quest", "description": "A gem that shines with all colors..." },
{ "id": "white_light", "name": "White Light", "type": "reagent", "description": "Full-spectrum light..." },
{ "id": "invisible_ink", "name": "Invisible Ink", "type": "consumable", "description": "Revealed only under UV light..." }
```

### New Recipes
| ID | Inputs | Output | Difficulty | Notes |
|----|--------|--------|:----------:|-------|
| `split_light` | white_light + prism | rainbow_gem | 2 | Quest recipe |
| `red_mix` | red_filter + white_light | red_light | 1 | |
| `blue_mix` | blue_filter + white_light | blue_light | 1 | |
| `green_mix` | green_filter + white_light | green_light | 1 | |
| `yellow_mix` | red_filter + green_filter | yellow_light | 2 | Color mixing |
| `cyan_mix` | blue_filter + green_filter | cyan_light | 2 | |
| `magenta_mix` | red_filter + blue_filter | magenta_light | 2 | |
| `craft_convex` | recycled_glass + prism | convex_lens | 3 | Requires Map 2 materials |
| `craft_concave` | recycled_glass + prism | concave_lens | 3 | |
| `invisible_ink_craft` | C + H₂O + prism | invisible_ink | 3 | |

### Light Puzzle Engine (New Mechanic)
A grid-based puzzle where players:
1. Place prisms, filters, and lenses on a grid
2. Shoot a white light beam from a source
3. Guide the beam through obstacles to reach targets
4. Each prism bends the beam, each filter changes color
5. Targets require specific colors to activate

**Progression:**
- Puzzle 1: Simple beam bending (1 prism)
- Puzzle 2: Color filtering (filter to change beam color)
- Puzzle 3: Split beam (split into multiple targets)
- Puzzle 4: Lens focusing (magnify/diminish beam strength)

### Quests
| ID | Name | Giver | Goal | Reward | Prereq |
|----|------|-------|------|--------|--------|
| `split_the_light` | Split the Light | Prism Patel | Solve light puzzle 1 + craft rainbow gem | 125 coins, 1 optics_mastery | Map 3 completion |
| `color_mixing` | Color Mixing | Chroma | Create yellow, cyan, and magenta light | 100 coins, 1 optics_mastery | `split_the_light` |
| `lens_creation` | Lens Creation | Focus Frank | Craft 1 convex + 1 concave lens | 150 coins, 1 bonding | `color_mixing` |
| `invisible_spectrum` | The Invisible Spectrum | Dr. Ray Sunshine | Solve light puzzle 4 + craft invisible ink | 175 coins, 1 optics_mastery, 1 equation | `lens_creation` |
| `rainbow_bridge` | Rainbow Bridge | Prism Patel | Complete all light puzzles + craft all 6 light colors | 250 coins, 2 optics_mastery | `invisible_spectrum` |

### Portal
- **Position:** (10, 2)
- **Unlock:** Complete all 5 quests
- **Target:** `magnetCore`
- **Visual:** Rainbow prismatic portal with animated light rays

### Resource Nodes
| Type | Positions | Tool | Gathers |
|------|-----------|------|---------|
| Crystal cluster | (6, 6), (14, 4), (9, 13) | Pickaxe | 3 |
| Light well (white_light) | (4, 10), (12, 8), (16, 14) | Flask | Infinite |
| Prism shard | (7, 15), (13, 11) | Pickaxe | 3 |

---

## Map 5: Magnet Core (Magnetism & Motion)

**Difficulty:** ★★★★★ | **Status:** New

### Visual Theme
- **Colors:** Rust red (`#c04a4a`), steel blue (`#3a3a6a`), electric yellow (`#e8c040`)
- **Particles:** Embers / electric sparks
- **Atmosphere:** Dark industrial core — glowing magnetic fields, sparking machinery, metallic surfaces

### Buildings
| Building | Position | Scene | Notes |
|----------|----------|-------|-------|
| Physics Lab | (4, 3) | `LabInteriorScene` | Craft electromagnets, alloys |
| Engineering Library | (9, 3) | `LibraryInteriorScene` | Physics lessons |
| Core Shop | (14, 3) | `ShopInteriorScene` | Buy magnetic components |

### NPCs
| ID | Name | Role | Position | Quests Offered |
|----|------|------|----------|---------------|
| `physicist` | Dr. Max Well | Physicist | (3, 8) | `polar_attraction`, `magnetic_fields` |
| `rocket_engineer` | Rocket Rob | Engineer | (10, 6) | `perfect_trajectory`, `propulsion` |
| `magnetic_artist` | Lorena Lines | Artist | (8, 14) | `field_art` |
| `core_guardian` | Guardian Gauss | Guardian | (15, 12) | `core_stabilization` |

### New Items
```json
{ "id": "magnet_n", "name": "North Magnet", "type": "reagent", "description": "Magnetic pole (north)..." },
{ "id": "magnet_s", "name": "South Magnet", "type": "reagent", "description": "Magnetic pole (south)..." },
{ "id": "iron_filings", "name": "Iron Filings", "type": "reagent", "description": "Fine iron particles..." },
{ "id": "compass", "name": "Compass", "type": "equipment", "description": "Points to magnetic north..." },
{ "id": "electromagnet", "name": "Electromagnet", "type": "equipment", "description": "Magnet controlled by electricity..." },
{ "id": "propulsion_device", "name": "Propulsion Device", "type": "equipment", "description": "Generates thrust via magnetic fields..." },
{ "id": "magnetic_shield", "name": "Magnetic Shield", "type": "equipment", "description": "Deflects magnetic interference..." },
{ "id": "steel_alloy", "name": "Steel Alloy", "type": "molecule", "description": "Strong iron-carbon alloy..." },
{ "id": "core_crystal", "name": "Core Crystal", "type": "quest", "description": "The heart of Magnet Core..." },
{ "id": "speed_booster", "name": "Speed Booster", "type": "consumable", "description": "Temporary speed boost for trajectory puzzles..." }
```

### New Recipes
| ID | Inputs | Output | Difficulty | Notes |
|----|--------|--------|:----------:|-------|
| `steel_alloy` | metal_waste + C | steel_alloy | 3 | Requires Map 2 materials |
| `electromagnet` | steel_alloy + copper_wire | electromagnet | 4 | |
| `compass_craft` | magnet_n + magnet_s + steel_alloy | compass | 3 | |
| `propulsion_device` | electromagnet + steel_alloy + biofuel | propulsion_device | 5 | Requires Map 3 materials |
| `magnetic_shield` | steel_alloy × 2 + magnet_n + magnet_s | magnetic_shield | 4 | |
| `speed_booster_craft` | H₂O + biofuel + C | speed_booster | 3 | |

### Trajectory Puzzle Engine (New Mechanic)
A projectile-launching puzzle where players:
1. Place magnets on a 2D grid
2. Adjust launch angle (0°–90°) and velocity (1–10)
3. Fire a metallic projectile
4. Magnets attract/repel the projectile, altering its path
5. Goal: reach the target while avoiding obstacles

**Progression:**
- Puzzle 1: Simple angle calculation (no magnets)
- Puzzle 2: Single magnet (attract to reach target)
- Puzzle 3: Multiple magnets (plan a path through field)
- Puzzle 4: Repulsion magnets (push away from obstacles)
- Puzzle 5: Time-limited challenge (combine all mechanics)

### Magnetic Field Navigator (New Mechanic)
A navigation puzzle where players walk through invisible magnetic fields:
- Map displays field lines (visualized as ambient particles)
- Walking along field lines = faster movement
- Crossing field lines = slowed / pushed
- Goal: navigate from start to exit efficiently

### Quests
| ID | Name | Giver | Goal | Reward | Prereq |
|----|------|-------|------|--------|--------|
| `polar_attraction` | Polar Attraction | Dr. Max Well | Solve trajectory puzzle 1 + craft compass | 150 coins, 1 magnetism_mastery | Map 4 completion |
| `magnetic_fields` | Magnetic Fields | Dr. Max Well | Navigate magnetic field puzzle + craft electromagnet | 175 coins, 1 magnetism_mastery, 1 bonding | `polar_attraction` |
| `field_art` | Field Art | Lorena Lines | Create a visible magnetic field pattern with iron filings | 125 coins, 1 magnetism_mastery | `magnetic_fields` |
| `perfect_trajectory` | Perfect Trajectory | Rocket Rob | Solve trajectory puzzle 4 + craft propulsion device | 225 coins, 1 magnetism_mastery, 1 equation | `field_art` |
| `core_stabilization` | Core Stabilization | Guardian Gauss | Craft magnetic shield + solve all puzzles | 300 coins, 2 magnetism_mastery, 1 all skills | `perfect_trajectory` |
| `master_physicist` | Master Physicist | Dr. Max Well | Complete all 5 maps — final challenge quest | 500 coins, 5 all skills | All previous maps completed |

### Portal
- **Position:** (10, 2)
- **Unlock:** Complete all 6 quests
- **Target:** None (this is the final map — returns to main menu with "You Win!" screen)
- **Visual:** Red/blue electric arc portal with spark particles

### Resource Nodes
| Type | Positions | Tool | Gathers |
|------|-----------|------|---------|
| Iron vein | (5, 5), (13, 4), (8, 13) | Pickaxe | 3 |
| Magnetic crystal | (4, 11), (12, 9), (16, 14), (7, 15) | Pickaxe | 3 |
| Copper wire spool | (6, 16), (14, 13) | Hands | 3 |
| Energy geyser | (10, 16), (3, 14) | Flask | 3 |
