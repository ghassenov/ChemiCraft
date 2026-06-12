import { RecipeData } from '../data/types';

/**
 * CraftingSystem — handles recipe matching logic.
 */
export class CraftingSystem {
  private recipes: RecipeData[] = [];

  constructor(recipeData: RecipeData[]) {
    this.recipes = recipeData;
  }

  /**
   * Attempts to craft a molecule from the given input reagents.
   * Order of inputs does not matter.
   * @param inputs Array of reagent symbols (e.g., ['H', 'H'])
   */
  craft(inputs: string[]): { success: boolean; result?: RecipeData; error?: string } {
    if (inputs.length === 0) {
      return { success: false, error: 'Add some reagents first!' };
    }

    // Sort inputs alphabetically to ensure order-independent matching
    const sortedInputs = [...inputs].sort();

    for (const recipe of this.recipes) {
      const sortedRecipeInputs = [...recipe.inputs].sort();

      // Check if lengths match
      if (sortedInputs.length !== sortedRecipeInputs.length) {
        continue;
      }

      // Check if all elements match
      let isMatch = true;
      for (let i = 0; i < sortedInputs.length; i++) {
        if (sortedInputs[i] !== sortedRecipeInputs[i]) {
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        return { success: true, result: recipe };
      }
    }

    return { 
      success: false, 
      error: 'These elements do not form a stable molecule.' 
    };
  }

  /** Gets all recipes (for library or hints) */
  getAllRecipes(): RecipeData[] {
    return this.recipes;
  }
}
