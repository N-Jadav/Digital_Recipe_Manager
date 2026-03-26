const DigitalManager = require('./DigitalManager');

describe('DigitalManager', () => {
  let manager;

  beforeEach(() => {
    // Re-instantiate the manager before each test to ensure a clean state
    manager = new DigitalManager();
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Original recipe tests (unchanged – backward-compat check)
  // ══════════════════════════════════════════════════════════════════════════

  describe('addRecipe()', () => {
    it('should add a new recipe and return its formatted recipe_id', () => {
      const id1 = manager.addRecipe('Spaghetti', ['Pasta', 'Tomato Sauce'], ['Boil pasta', 'Add sauce']);
      expect(id1).toBe('recipe1');

      const id2 = manager.addRecipe('Salad', ['Lettuce', 'Tomato'], ['Chop', 'Mix']);
      expect(id2).toBe('recipe2');
    });

    it('should return null if a recipe with the same name already exists', () => {
      manager.addRecipe('Pancakes', ['Flour', 'Milk'], ['Mix', 'Cook']);
      const result = manager.addRecipe('pancakes', ['Different', 'Ingredients'], ['Different', 'Steps']);
      expect(result).toBeNull();
    });
  });

  describe('getRecipe()', () => {
    it('should retrieve a recipe by its ID with formatted strings', () => {
      const id = manager.addRecipe('Cake', ['Flour', 'Sugar', 'Eggs'], ['Mix', 'Bake']);
      const recipe = manager.getRecipe(id);
      expect(recipe).toEqual(['Cake', 'Flour,Sugar,Eggs', 'Mix,Bake']);
    });

    it('should return an empty array if the recipe does not exist', () => {
      expect(manager.getRecipe('recipe999')).toEqual([]);
    });
  });

  describe('updateRecipe()', () => {
    it('should successfully update an existing recipe and return true', () => {
      const id = manager.addRecipe('Toast', ['Bread'], ['Toast it']);
      const success = manager.updateRecipe(id, 'Buttered Toast', ['Bread', 'Butter'], ['Toast it', 'Add Butter']);
      expect(success).toBe(true);
    });

    it('should return false if the recipe does not exist', () => {
      expect(manager.updateRecipe('recipe999', 'Ghost Recipe', [], [])).toBe(false);
    });

    it('should return false if the new name conflicts with an existing recipe', () => {
      manager.addRecipe('Burger', ['Bun', 'Patty'], ['Grill', 'Assemble']);
      const id2 = manager.addRecipe('Hotdog', ['Bun', 'Sausage'], ['Boil', 'Assemble']);
      expect(manager.updateRecipe(id2, 'burger', ['Bun', 'Sausage'], ['Boil', 'Assemble'])).toBe(false);
    });
  });

  describe('deleteRecipe()', () => {
    it('should delete an existing recipe and return true', () => {
      const id = manager.addRecipe('Soup', ['Water', 'Vegetables'], ['Boil']);
      expect(manager.deleteRecipe(id)).toBe(true);
      expect(manager.getRecipe(id)).toEqual([]);
    });

    it('should return false if trying to delete a non-existent recipe', () => {
      expect(manager.deleteRecipe('recipe999')).toBe(false);
    });
  });

  describe('searchRecipes()', () => {
    it('should search recipes by name using case-insensitive partial match', () => {
      manager.addRecipe('Chocolate Cake', ['Flour', 'Cocoa', 'Sugar'], ['Mix', 'Bake']);
      manager.addRecipe('Vanilla Cake', ['Flour', 'Vanilla', 'Sugar'], ['Mix', 'Bake']);
      manager.addRecipe('Salad', ['Lettuce', 'Tomato'], ['Chop', 'Mix']);

      const results = manager.searchRecipes('name', 'cake');
      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Chocolate Cake');
      expect(results[1].name).toBe('Vanilla Cake');

      expect(manager.searchRecipes('name', 'pizza')).toHaveLength(0);
    });

    it('should search recipes by recipeid', () => {
      manager.addRecipe('Pasta', ['Pasta', 'Water'], ['Boil']);
      manager.addRecipe('Pizza', ['Dough', 'Cheese'], ['Bake']);

      const results = manager.searchRecipes('recipeid', 'recipe1');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Pasta');
    });
  });

  describe('sortRecipes()', () => {
    it('should sort recipes alphabetically by name', () => {
      manager.addRecipe('Zebra Cake', ['Flour'], ['Bake']);
      manager.addRecipe('Apple Pie', ['Apples'], ['Bake']);
      manager.addRecipe('Banana Bread', ['Bananas'], ['Bake']);

      const sorted = manager.sortRecipes('name');
      expect(sorted[0].name).toBe('Apple Pie');
      expect(sorted[1].name).toBe('Banana Bread');
      expect(sorted[2].name).toBe('Zebra Cake');
    });

    it('should sort recipes numerically by recipeid', () => {
      for (let i = 0; i < 11; i++) {
        manager.addRecipe(`Recipe ${i}`, [], []);
      }

      const sorted = manager.sortRecipes('recipeid');
      expect(sorted[1].id).toBe('recipe2');
      expect(sorted[9].id).toBe('recipe10');
      expect(sorted[10].id).toBe('recipe11');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // User accounts & authentication
  // ══════════════════════════════════════════════════════════════════════════

  describe('registerUser()', () => {
    it('should register a viewer by default and return true', () => {
      expect(manager.registerUser('alice', 'pass1')).toBe(true);
    });

    it('should register an editor without a token', () => {
      expect(manager.registerUser('bob', 'pass2', 'editor')).toBe(true);
    });

    it('should return null if the username is already taken', () => {
      manager.registerUser('alice', 'pass1');
      expect(manager.registerUser('alice', 'pass1')).toBeNull();
    });

    it('should return null when registering an admin without an admin token', () => {
      // No token supplied
      expect(manager.registerUser('badAdmin', 'pw', 'admin')).toBeNull();
      // Token for a non-admin
      manager.registerUser('editor1', 'pw', 'editor');
      const editorToken = manager.login('editor1', 'pw');
      expect(manager.registerUser('badAdmin2', 'pw', 'admin', editorToken)).toBeNull();
    });

    it('should allow an admin to create another admin account', () => {
      const adminToken = manager.login('admin', 'admin123');
      expect(manager.registerUser('superAdmin', 'pw', 'admin', adminToken)).toBe(true);
    });

    it('should return null for an invalid role', () => {
      expect(manager.registerUser('alice', 'pw', 'superuser')).toBeNull();
    });
  });

  describe('login() / logout()', () => {
    beforeEach(() => manager.registerUser('alice', 'pass1', 'viewer'));

    it('should return a session token on valid credentials', () => {
      const token = manager.login('alice', 'pass1');
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should return null for a wrong password', () => {
      expect(manager.login('alice', 'wrong')).toBeNull();
    });

    it('should return null for an unknown username', () => {
      expect(manager.login('nobody', 'pass')).toBeNull();
    });

    it('should invalidate the session on logout', () => {
      const token = manager.login('alice', 'pass1');
      expect(manager.logout(token)).toBe(true);
      // After logout the token should not grant any access
      expect(manager.listUsers(token)).toBeNull();
    });

    it('should return false when logging out with an invalid token', () => {
      expect(manager.logout('made-up-token')).toBe(false);
    });
  });

  describe('getUserInfo()', () => {
    let aliceToken;

    beforeEach(() => {
      manager.registerUser('alice', 'pass1', 'editor');
      aliceToken = manager.login('alice', 'pass1');
    });

    it('should allow a user to view their own profile', () => {
      const info = manager.getUserInfo('alice', aliceToken);
      expect(info).toEqual({ username: 'alice', role: 'editor', editCount: 0 });
    });

    it('should allow an admin to view any profile', () => {
      const adminToken = manager.login('admin', 'admin123');
      const info = manager.getUserInfo('alice', adminToken);
      expect(info).toEqual({ username: 'alice', role: 'editor', editCount: 0 });
    });

    it('should return null when a non-admin tries to view another user', () => {
      manager.registerUser('bob', 'pass2', 'viewer');
      const bobToken = manager.login('bob', 'pass2');
      expect(manager.getUserInfo('alice', bobToken)).toBeNull();
    });

    it('should return null for an invalid token', () => {
      expect(manager.getUserInfo('alice', 'bad-token')).toBeNull();
    });
  });

  describe('listUsers()', () => {
    it('should return all users when called with an admin token', () => {
      manager.registerUser('charlie', 'pw', 'viewer');
      const adminToken = manager.login('admin', 'admin123');
      const users = manager.listUsers(adminToken);
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThanOrEqual(2); // admin + charlie
      const names = users.map(u => u.username);
      expect(names).toContain('admin');
      expect(names).toContain('charlie');
    });

    it('should return null for a non-admin token', () => {
      manager.registerUser('viewer1', 'pw', 'viewer');
      const viewerToken = manager.login('viewer1', 'pw');
      expect(manager.listUsers(viewerToken)).toBeNull();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Permission enforcement on recipe operations
  // ══════════════════════════════════════════════════════════════════════════

  describe('Permission enforcement', () => {
    let viewerToken, editorToken, adminToken;

    beforeEach(() => {
      manager.registerUser('viewer1', 'pw', 'viewer');
      manager.registerUser('editor1', 'pw', 'editor');
      viewerToken = manager.login('viewer1', 'pw');
      editorToken = manager.login('editor1', 'pw');
      adminToken  = manager.login('admin', 'admin123');
    });

    describe('addRecipe with token', () => {
      it('should allow an editor to add a recipe', () => {
        const id = manager.addRecipe('Omelette', ['Eggs', 'Butter'], ['Whisk', 'Cook'], editorToken);
        expect(id).toBe('recipe1');
      });

      it('should allow an admin to add a recipe', () => {
        const id = manager.addRecipe('Pancake', ['Flour', 'Milk'], ['Mix', 'Cook'], adminToken);
        expect(id).toBe('recipe1');
      });

      it('should reject a viewer trying to add a recipe', () => {
        expect(manager.addRecipe('Omelette', ['Eggs'], ['Cook'], viewerToken)).toBeNull();
      });
    });

    describe('updateRecipe with token', () => {
      let recipeId;

      beforeEach(() => {
        recipeId = manager.addRecipe('Pasta', ['Pasta', 'Water'], ['Boil']);
      });

      it('should allow an editor to update a recipe', () => {
        expect(manager.updateRecipe(recipeId, 'Pasta Bolognese', ['Pasta', 'Sauce'], ['Boil', 'Mix'], editorToken)).toBe(true);
      });

      it('should reject a viewer trying to update a recipe', () => {
        expect(manager.updateRecipe(recipeId, 'New Pasta', ['Pasta'], ['Boil'], viewerToken)).toBe(false);
      });
    });

    describe('deleteRecipe with token', () => {
      let recipeId;

      beforeEach(() => {
        recipeId = manager.addRecipe('Soup', ['Water', 'Veg'], ['Boil']);
      });

      it('should allow an admin to delete a recipe', () => {
        expect(manager.deleteRecipe(recipeId, adminToken)).toBe(true);
      });

      it('should reject an editor trying to delete a recipe', () => {
        expect(manager.deleteRecipe(recipeId, editorToken)).toBe(false);
        // Recipe should still be there
        expect(manager.getRecipe(recipeId)).not.toEqual([]);
      });

      it('should reject a viewer trying to delete a recipe', () => {
        expect(manager.deleteRecipe(recipeId, viewerToken)).toBe(false);
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Edit count tracking
  // ══════════════════════════════════════════════════════════════════════════

  describe('Edit count tracking', () => {
    let editorToken;

    beforeEach(() => {
      manager.registerUser('editor1', 'pw', 'editor');
      editorToken = manager.login('editor1', 'pw');
    });

    it('should start with an editCount of 0', () => {
      const info = manager.getUserInfo('editor1', editorToken);
      expect(info.editCount).toBe(0);
    });

    it('should increment editCount each time updateRecipe succeeds', () => {
      const id = manager.addRecipe('Pasta', ['Pasta', 'Water'], ['Boil']);

      manager.updateRecipe(id, 'Pasta v2', ['Pasta', 'Water', 'Salt'], ['Boil', 'Season'], editorToken);
      expect(manager.getUserInfo('editor1', editorToken).editCount).toBe(1);

      manager.updateRecipe(id, 'Pasta v3', ['Pasta', 'Water', 'Salt', 'Pepper'], ['Boil', 'Season', 'Serve'], editorToken);
      expect(manager.getUserInfo('editor1', editorToken).editCount).toBe(2);
    });

    it('should NOT increment editCount when updateRecipe fails', () => {
      const id = manager.addRecipe('Pasta', ['Pasta', 'Water'], ['Boil']);
      // Try to update non-existent recipe
      manager.updateRecipe('recipe999', 'Ghost', [], [], editorToken);
      expect(manager.getUserInfo('editor1', editorToken).editCount).toBe(0);
    });

    it('should NOT increment editCount when called without a token', () => {
      // Backward-compat: token-less updates do not touch any user's editCount
      const adminToken = manager.login('admin', 'admin123');
      const id = manager.addRecipe('Pasta', ['Pasta', 'Water'], ['Boil']);
      manager.updateRecipe(id, 'Pasta v2', ['Pasta', 'Water', 'Salt'], ['Boil', 'Season']); // no token
      expect(manager.getUserInfo('admin', adminToken).editCount).toBe(0);
    });

    it('should track edits independently per user', () => {
      manager.registerUser('editor2', 'pw2', 'editor');
      const editor2Token = manager.login('editor2', 'pw2');

      const id = manager.addRecipe('Soup', ['Water', 'Veg'], ['Boil']);

      manager.updateRecipe(id, 'Soup v2', ['Water', 'Veg', 'Salt'], ['Boil', 'Season'], editorToken);
      manager.updateRecipe(id, 'Soup v3', ['Water', 'Veg', 'Salt', 'Pepper'], ['Boil', 'Season', 'Serve'], editor2Token);
      manager.updateRecipe(id, 'Soup v4', ['Water', 'Veg', 'Salt', 'Pepper', 'Herbs'], ['Boil', 'Season', 'Serve', 'Garnish'], editorToken);

      expect(manager.getUserInfo('editor1', editorToken).editCount).toBe(2);
      expect(manager.getUserInfo('editor2', editor2Token).editCount).toBe(1);
    });
  });
});
