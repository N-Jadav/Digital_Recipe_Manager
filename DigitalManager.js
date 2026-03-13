class DigitalManager {
  constructor() {
    // Initialize necessary state variables here
    // For example, to keep track of recipes and the next available ID
    this.recipes = new Map();
    this.nextId = 1;

  }

  /**
   * Adds a new recipe.
   * @param {string} name - The name of the recipe.
   * @param {string[]} ingredients - An array of ingredients.
   * @param {string[]} steps - An array of steps to prepare the recipe.
   * @returns {string|null} The new recipe_id (e.g., "recipe1"), or null if a recipe with the same name already exists.
   */
  addRecipe(name, ingredients, steps) {
    const lowerName = name.toLowerCase();
    // Check if a recipe with the same name (case-insensitive) already exists
    for (const recipe of this.recipes.values()) {
      if (lowerName === recipe.name.toLowerCase()) {
        return null;
      }
    }


    // Generate the new recipe ID
    const recipeId = "recipe" + this.nextId;
    this.nextId++;

    // Store the recipe in the map
    this.recipes.set(recipeId, {
      name: name,
      ingredients: ingredients,
      steps: steps
    });

    return recipeId;
  }

  /**
   * Retrieves a recipe by its ID.
   * @param {string} recipeId - The ID of the recipe to retrieve.
   * @returns {string[]} An array containing [name, ingredients_as_string, steps_as_string], 
   *                     or an empty array if the recipe does not exist.
   */
  getRecipe(recipeId) {
    // TODO: Implement logic to get a recipe
    for (const recipe of this.recipes.keys()) {
      if (recipe === recipeId) {
        return [this.recipes.get(recipeId).name, this.recipes.get(recipeId).ingredients.join(","), this.recipes.get(recipeId).steps.join(",")]
      }
    }
    return [];
  }

  /**
   * Updates an existing recipe.
   * @param {string} recipeId - The ID of the recipe to update.
   * @param {string} name - The new name of the recipe.
   * @param {string[]} ingredients - The new array of ingredients.
   * @param {string[]} steps - The new array of steps.
   * @returns {boolean} true if successful, false if the recipe doesn't exist or if there's a name conflict.
   */
  updateRecipe(recipeId, name, ingredients, steps) {
    // Check if a recipe with the same name (case-insensitive) already exists
    for (const recipe of this.recipes.values()) {
      if (name.toLowerCase() === recipe.name.toLowerCase()) {
        return false;
      }
    }

    for (const recipe of this.recipes.keys()) {
      if (recipe === recipeId) {
        this.recipes.set(recipeId, { name: name, ingredients: ingredients, steps: steps })
        return true;
      }
    }

    return false;
  }

  /**
   * Deletes a recipe by its ID.
   * @param {string} recipeId - The ID of the recipe to delete.
   * @returns {boolean} true if the recipe existed and was deleted, false otherwise.
   */
  deleteRecipe(recipeId) {
    // TODO: Implement logic to delete a recipe
    for (const recipe of this.recipes.keys()) {
      if (recipe === recipeId) {
        this.recipes.delete(recipeId)
        return true;
      }
    }
    return false;
  }
}

module.exports = DigitalManager;
