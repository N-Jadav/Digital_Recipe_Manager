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

  /**
   * Searches for recipes based on a criteria and query string.
   * @param {string} criteria - The criteria to search by ('recipeid' or 'name').
   * @param {string} query - The search query (case-insensitive substring match).
   * @returns {Object[]} An array of matched recipe objects: { id, name, ingredients, steps }.
   */
  searchRecipes(criteria, query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    for (const [id, recipe] of this.recipes.entries()) {
      if (criteria === 'recipeid') {
        if (id.toLowerCase().includes(lowerQuery)) {
          results.push({ id, ...recipe });
        }
      } else if (criteria === 'name') {
        if (recipe.name.toLowerCase().includes(lowerQuery)) {
          results.push({ id, ...recipe });
        }
      }
    }

    return results;
  }

  /**
   * Sorts the recipes based on the provided criteria.
   * @param {string} criteria - The criteria to sort by ('recipeid' or 'name').
   * @returns {Object[]} An array of sorted recipe objects: { id, name, ingredients, steps }.
   */
  sortRecipes(criteria) {
    const allRecipes = [];
    for (const [id, recipe] of this.recipes.entries()) {
      allRecipes.push({ id, ...recipe });
    }

    if (criteria === 'recipeid') {
      allRecipes.sort((a, b) => {
        // Extract numeric part of id assuming format is "recipe<number>"
        const numA = parseInt(a.id.replace('recipe', ''), 10);
        const numB = parseInt(b.id.replace('recipe', ''), 10);
        
        // Handle cases where parsing fails if id doesn't match standard format
        if (isNaN(numA) && isNaN(numB)) return a.id.localeCompare(b.id);
        if (isNaN(numA)) return 1;
        if (isNaN(numB)) return -1;
        
        return numA - numB;
      });
    } else if (criteria === 'name') {
      allRecipes.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    }

    return allRecipes;
  }
}

module.exports = DigitalManager;
