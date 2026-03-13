const DigitalManager = require('./DigitalManager');

describe('DigitalManager', () => {
  let manager;

  beforeEach(() => {
    // Re-instantiate the manager before each test to ensure a clean state
    manager = new DigitalManager();
  });

  describe('addRecipe()', () => {
    it('should add a new recipe and return its formatted recipe_id', () => {
      const id1 = manager.addRecipe("Spaghetti", ["Pasta", "Tomato Sauce"], ["Boil pasta", "Add sauce"]);
      expect(id1).toBe("recipe1");

      const id2 = manager.addRecipe("Salad", ["Lettuce", "Tomato"], ["Chop", "Mix"]);
      expect(id2).toBe("recipe2");
    });

    it('should return null if a recipe with the same name already exists', () => {
      manager.addRecipe("Pancakes", ["Flour", "Milk"], ["Mix", "Cook"]);
      const result = manager.addRecipe("pancakes", ["Different", "Ingredients"], ["Different", "Steps"]);

      expect(result).toBeNull();
    });
  });

  describe('getRecipe()', () => {
    it('should retrieve a recipe by its ID with formatted strings', () => {
      const id = manager.addRecipe("Cake", ["Flour", "Sugar", "Eggs"], ["Mix", "Bake"]);

      // We haven't implemented getRecipe yet, so this will fail initially
      const recipe = manager.getRecipe(id);

      // getRecipe is expected to return: [name, ingredients_as_string, steps_as_string]
      expect(recipe).toEqual(["Cake", "Flour,Sugar,Eggs", "Mix,Bake"]);
    });

    it('should return an empty array if the recipe does not exist', () => {
      const recipe = manager.getRecipe("recipe999");
      expect(recipe).toEqual([]);
    });
  });

  describe('updateRecipe()', () => {
    it('should successfully update an existing recipe and return true', () => {
      const id = manager.addRecipe("Toast", ["Bread"], ["Toast it"]);

      // We haven't implemented updateRecipe yet, so this will fail initially
      const success = manager.updateRecipe(id, "Buttered Toast", ["Bread", "Butter"], ["Toast it", "Add Butter"]);

      expect(success).toBe(true);

      // Let's also verify it actually updated (this relies on getRecipe working)
      // const updatedRecipe = manager.getRecipe(id);
      // expect(updatedRecipe).toEqual(["Buttered Toast", "Bread,Butter", "Toast it,Add Butter"]);
    });

    it('should return false if the recipe does not exist', () => {
      const success = manager.updateRecipe("recipe999", "Ghost Recipe", [], []);
      expect(success).toBe(false);
    });

    it('should return false if the new name conflicts with an existing recipe', () => {
      manager.addRecipe("Burger", ["Bun", "Patty"], ["Grill", "Assemble"]);
      const id2 = manager.addRecipe("Hotdog", ["Bun", "Sausage"], ["Boil", "Assemble"]);

      const success = manager.updateRecipe(id2, "burger", ["Bun", "Sausage"], ["Boil", "Assemble"]);
      expect(success).toBe(false);
    });
  });

  describe('deleteRecipe()', () => {
    it('should delete an existing recipe and return true', () => {
      const id = manager.addRecipe("Soup", ["Water", "Vegetables"], ["Boil"]);

      // We haven't implemented deleteRecipe yet, so this will fail initially
      const success = manager.deleteRecipe(id);
      expect(success).toBe(true);

      // Verify it's actually gone
      const recipe = manager.getRecipe(id);
      expect(recipe).toEqual([]);
    });

    it('should return false if trying to delete a non-existent recipe', () => {
      const success = manager.deleteRecipe("recipe999");
      expect(success).toBe(false);
    });
  });

  describe('searchRecipes()', () => {
    it('should search recipes by name using case-insensitive partial match', () => {
      manager.addRecipe("Chocolate Cake", ["Flour", "Cocoa", "Sugar"], ["Mix", "Bake"]);
      manager.addRecipe("Vanilla Cake", ["Flour", "Vanilla", "Sugar"], ["Mix", "Bake"]);
      manager.addRecipe("Salad", ["Lettuce", "Tomato"], ["Chop", "Mix"]);

      const results = manager.searchRecipes('name', 'cake');
      expect(results).toHaveLength(2);
      expect(results[0].name).toBe("Chocolate Cake");
      expect(results[1].name).toBe("Vanilla Cake");

      const noResults = manager.searchRecipes('name', 'pizza');
      expect(noResults).toHaveLength(0);
    });

    it('should search recipes by recipeid', () => {
      manager.addRecipe("Pasta", ["Pasta", "Water"], ["Boil"]);
      manager.addRecipe("Pizza", ["Dough", "Cheese"], ["Bake"]);

      const results = manager.searchRecipes('recipeid', 'recipe1');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Pasta");
    });
  });

  describe('sortRecipes()', () => {
    it('should sort recipes alphabetically by name', () => {
      manager.addRecipe("Zebra Cake", ["Flour"], ["Bake"]);
      manager.addRecipe("Apple Pie", ["Apples"], ["Bake"]);
      manager.addRecipe("Banana Bread", ["Bananas"], ["Bake"]);

      const sorted = manager.sortRecipes('name');
      expect(sorted[0].name).toBe("Apple Pie");
      expect(sorted[1].name).toBe("Banana Bread");
      expect(sorted[2].name).toBe("Zebra Cake");
    });

    it('should sort recipes numerically by recipeid', () => {
      // Simulate adding many recipes to test id sorting like recipe2 vs recipe10
      for (let i = 0; i < 11; i++) {
        manager.addRecipe(`Recipe ${i}`, [], []);
      }

      // Normally recipe10 would come before recipe2 in string sort
      const sorted = manager.sortRecipes('recipeid');
      
      expect(sorted[1].id).toBe("recipe2");
      expect(sorted[9].id).toBe("recipe10");
      expect(sorted[10].id).toBe("recipe11");
    });
  });
});
