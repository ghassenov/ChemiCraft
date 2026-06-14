# Logic Issues in Map Scenes

## 1. Incomplete cleanup in `clearRecyclingNodes()`
**File:** `BaseGameScene.ts:897-903`

The method destroys only the `prompt` containers stored in `binZones`, but the bin **graphics** (Graphics objects, Circle) created in `createDecorations()` are never cleaned up. After completing `waste_crisis`, bins remain visually on screen but are non-interactive.

```ts
protected clearRecyclingNodes() {
    if (this.mapData.key !== 'recyclingFields') return;
    for (const zone of this.binZones) {
      zone.prompt.destroy();   // only cleans prompts
    }
    this.binZones = [];
    // BUG: bin Graphics objects are orphaned
  }
```

---

## 2. Redundant `clearRecyclingNodes()` calls
**File:** `BaseGameScene.ts:859,865` and `RecyclingFieldsScene.ts:33`

`clearRecyclingNodes` is called:
- Via the `GameEvents.QuestCompleted` event → `onQuestCompleteHook()` (event-driven)
- Directly in `handleInteraction()` after `completeQuest()` (manual)

The direct calls at lines 859 and 865 are redundant because the event handler already triggers the cleanup. Surplus calls are harmless due to the guard (`this.mapData.key !== 'recyclingFields'`) but indicate inconsistent control flow.

---

## 3. Missing tint for tile value 6 (portal tiles)
**File:** `BaseGameScene.ts:597-621` (buildMap) and `applyTileTint` at line 635

`buildMap()` assigns texture `'tile_portal'` for `tileVal === 6`, but `applyTileTint` has no case for `tileVal === 6`. Portal tiles remain untinted while all other tile values (0, 1, 2-5) are color-coded.

---

## 4. Duplicated `applyTileTint` across 4 scenes
**Files:** `ecoVille/EcoVilleScene.ts:13-23`, `magnetCore/MagnetCoreScene.ts:13-23`, `prismHeights/PrismHeightsScene.ts:13-23`, `recyclingFields/RecyclingFieldsScene.ts:13-23`

The identical tinting logic is copy-pasted in 4 files. `BaseGameScene` already defines an empty virtual `applyTileTint` — the common implementation should be moved there instead.

---

## 5. `player.y += 10` entrance hack
**File:** `BaseGameScene.ts:190-198`

When the player stands on a building entrance tile and faces up, the player's y-position is hard-adjusted by +10 to prevent re-triggering during the scene transition. This is a fragile workaround that can cause visible position glitches.

```ts
if (this.player.facing === Direction.Up) {
  this.player.y += 10;  // fragile hack
  SceneTransition.fadeOutIn(this, b.sceneKey);
}
```

---

## 6. Portal auto-triggers on proximity
**File:** `BaseGameScene.ts:200-213`

Portal transitions trigger automatically when `distToPortal < 30`, without requiring any player input. This can cause accidental map warping just from walking near a portal.

```ts
if (distToPortal < 30) {
  this.portalPrompt.setAlpha(0);
  this.unlockAndTravel(/*...*/);  // no player confirmation
  break;
}
```

---

## 7. Flower placement inefficiency
**File:** `atomMeadows/AtomMeadowsScene.ts:17-28`

The `createMapDecorations` loop runs exactly 25 attempts but never retries on blocked positions. On maps with dense building coverage, the resulting flower count can be significantly lower than expected with no warning.

---

## 8. Interaction direction requirement is finicky
**File:** `BaseGameScene.ts:748-754`

`handleInteraction` requires the player to be facing the exact direction toward the NPC (e.g., `dy < 0` for Up, `dx > 0` for Right). If the player is slightly off-center, the interaction silently fails. Combine this with the ±20px tolerance threshold, and some valid interactions may be missed.

```ts
if (this.player.facing === Direction.Up && dy < 0 && Math.abs(dx) < 20) valid = true;
else if (this.player.facing === Direction.Down && dy > 0 && Math.abs(dx) < 20) valid = true;
// ...
```

---

## 9. Resource node interaction shadows NPC interaction
**File:** `BaseGameScene.ts:804-809`

If a player is near both a resource node and an NPC, pressing E handles the resource interaction and **returns early**, never reaching the NPC handler. This priority order may surprise players.

```ts
interactedNode = true;
break;  // returns before NPC check
```

---

## 10. Quest completion may trigger multiple times
**File:** `BaseGameScene.ts:852-868`

`completeQuest()` is called in `handleInteraction` without checking if the quest is already completed. If the event handler doesn't guard against duplicate completions, the cleanup logic could run multiple times, and duplicate notifications may fire.
