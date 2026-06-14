# Prism Heights Walkthrough

## Entry Requirements
- Complete all 5 EcoVille main quests: `carbon_neutral` → `greenhouse_gases` → `clean_water_quest` → `renewable_shift` → `sustainable_city`
- Enter through the portal at the bottom of EcoVille

## Map Legend

| Emoji | Meaning |
|---|---|
| 💎 | Crystal Cluster — yields prisms (🔷) |
| 💡 | Light Well — yields white light (infinite) |
| 🔷 | Prism Shard — yields prisms (🔷) |
| 🟣 (tint) | Path walls — follow the grid |
| 🔄 Glowing motes | Light motes — ambient particles |
| 💠 (portal) | Portal to Magnet Core (requires all quests) |

## NPCs & Quest Givers

| NPC | Role | Quest |
|---|---|---|
| Prism Patel (optician) | Quest giver (outdoor) | `split_the_light`, `rainbow_bridge` |
| Lena Lens (lens_crafter) | Quest giver (outdoor) | `lens_creation` |
| Chroma (color_artist) | Quest giver (outdoor) | `color_mixing` |
| Dr. Ray Sunshine (light_researcher) | Quest giver (outdoor) | `invisible_spectrum` |
| Spectra (optics_librarian) | Library contact — no quest | Opens Optics Library lessons |

## Resource Nodes

| Type | Drops | Gathers |
|---|---|---|
| `crystal_cluster` | 🔷 prism | 3× per node |
| `light_well` | 💡 white_light | Infinite |
| `prism_shard` | 🔷 prism | 3× per node |

## Buildings

| Building | Location | Purpose |
|---|---|---|
| Light Lab (8,5) | Craft optics items, use Light Puzzle terminal | Inside: shelf + workbench + light table |
| Optics Library (14,5) | Study optics lessons, earn skill points | Inside: Spectra NPC + portraits + bookshelves |
| Prism Shop (13,8) | Buy filters and equipment | Shopkeeper sells 🔴🟢🔵 filters |

## Quest Chain

```
split_the_light ──→ color_mixing ──→ lens_creation ──→ invisible_spectrum ──→ rainbow_bridge
     │                   │                │                    │                    │
     ▼                   ▼                ▼                    ▼                    ▼
 rainbow_gem      color_filter_set    convex_lens        2× rainbow_gem        2× convex_lens
```

> **Note:** `rainbow_bridge` is the final main quest. Completing it unlocks the portal to Magnet Core.

## Step-by-Step

### 1. Talk to Prism Patel (optician) — `split_the_light`
- Location: center of the map at (9,11)
- Quest: Craft 1 Rainbow Gem
- Craft: 💡 + 🔷 = 🌈 at the Light Lab workbench
- Hint: Gather prisms from crystal clusters, white light from light wells

### 2. Talk to Chroma (color_artist) — `color_mixing`
- Location: (8,14) near the southwest area
- Quest: Craft 1 Color Filter Set
- Craft: 🔴 + 🟢 + 🔵 = 🎨 at the Light Lab workbench
- Hint: Buy filters from the Prism Shop (🔴30 coins each)

### 3. Talk to Lena Lens (lens_crafter) — `lens_creation`
- Location: (14,12) near the southeast area
- Quest: Craft 1 Convex Lens
- Craft: 🔷 + 💎 = 🔍 at the Light Lab workbench
- Hint: Recycled glass (💎) comes from Recycling Fields via the greenhouse waste piles

### 4. Talk to Dr. Ray Sunshine (light_researcher) — `invisible_spectrum`
- Location: (10,17) near the south portal
- Quest: Craft 2 Rainbow Gems
- Each needs: 💡 + 🔷 = 🌈
- Hint: Light well is infinite; gather 2 prisms from crystal clusters

### 5. Talk to Prism Patel again — `rainbow_bridge`
- Quest: Collect 2 Convex Lenses
- Each needs: 🔷 + 💎 = 🔍
- Hint: May need to farm crystal clusters after they replenish

### 6. All quests done!
- Portal to Magnet Core unlocks at the bottom of the map (9,18)

## Light Puzzle Levels (Optional)

The Light Table in the Lab offers a click-to-place ray puzzle. Each level rewards the same items as crafting:

| Level | Name | Solution | Reward |
|---|---|---|---|
| 1 | Split the Light | [`prism`] \_ \_ | `rainbow_gem` |
| 2 | Color Mixing | [`red_filter` \| `green_filter` \| `blue_filter`] \_ \_ | `color_filter_set` |
| 3 | Lens Creation | [`convex_lens`] \_ \_ | `convex_lens` |
| 4 | Full Spectrum | [`prism`] [`red_filter`] \_ | `rainbow_gem` ×2 |
| 5 | Rainbow Bridge | [`prism`] \_ [`color_filter_set`] | Flag (completion) |

**How to play:**
1. Click a component from the bottom tray to select it (highlighted in purple)
2. Click any of the 3 middle slots to place it
3. Click an occupied slot to remove the component
4. Click [TEST BEAM] to check your solution
5. Click [RESET] to clear all slots

## Library Lessons (Optics Mastery)

The Optics Library (14,5) has 5 lessons that award the `optics_mastery` skill:

| Lesson | Coins per Quiz | Content |
|---|---|---|
| The Nature of Light | 15 | Wave-particle duality, speed of light, EM spectrum |
| Refraction & Prisms | 15 | Snell's law, dispersion, rainbow formation |
| Lenses & Focusing | 20 | Convex/concave, focal point, telescopes |
| Color & the Spectrum | 20 | Additive vs subtractive, RGB, complementary colors |
| Optics in Technology | 25 | Microscopes, fiber optics, lasers, cameras |

Portraits: Isaac Newton (optics), Ibn al-Haytham (father of optics), James Clerk Maxwell (EM theory).

## Crafting Dependency Tree

```
prismHeights resources:
  💡 (white_light) — gathered from light wells
  🔷 (prism) — gathered from crystal clusters and prism shards

From Recycling Fields:
  💎 (recycled_glass) — gathered from greenhouse waste piles, crafted from 3× 🪟

From Prism Shop:
  🔴 (red_filter) — 30 coins
  🟢 (green_filter) — 30 coins
  🔵 (blue_filter) — 30 coins

Recipes:
  🌈 (rainbow_gem) = 💡 + 🔷
  🎨 (color_filter_set) = 🔴 + 🟢 + 🔵
  🔍 (convex_lens) = 🔷 + 💎
```

## Learning Value

- **Dispersion**: A prism splits white light because different wavelengths refract at different angles
- **Color mixing**: Additive color (RGB) works differently from subtractive (paint)
- **Lenses**: Convex lenses focus light, concave lenses spread it — the foundation of telescopes and microscopes
- **Filters**: Each color filter only passes its own wavelength, blocking others
- **Recombination**: A Color Filter Set can recombine RGB into white light — the opposite of a prism
- **Cross-map logistics**: Recycled glass (💎) must be brought from Recycling Fields, teaching resource management across zones
