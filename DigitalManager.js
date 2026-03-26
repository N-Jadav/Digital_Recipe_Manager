/**
 * DigitalManager - A recipe management class with user accounts and permissions.
 *
 * ## Roles
 *   - 'admin'  : full access (add, get, update, delete, manage users)
 *   - 'editor' : can add and update recipes, and read recipes
 *   - 'viewer' : read-only access (get, search, sort)
 *
 * ## Auth flow
 *   1. registerUser(username, password, role) → true | null
 *   2. login(username, password)              → sessionToken | null
 *   3. Pass sessionToken as the last argument to any guarded method.
 *   4. logout(sessionToken)                   → true | false
 */

class DigitalManager {
  constructor() {
    // ── Recipe storage ─────────────────────────────────────────────────────
    this.recipes = new Map(); // recipeId → { name, ingredients, steps }
    this.nextId  = 1;

    // ── User storage ───────────────────────────────────────────────────────
    // username → { passwordHash, role, editCount }
    this.users = new Map();

    // ── Session storage ────────────────────────────────────────────────────
    // token → username
    this.sessions = new Map();

    // Seed a default admin so the system is usable out of the box.
    this._createUser('admin', 'admin123', 'admin');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Private helpers
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Minimal, dependency-free password "hash" (XOR + base-64 encoding).
   * NOT cryptographically secure — suitable for an in-memory demo/CLI only.
   * @private
   */
  _hashPassword(password) {
    const salt = 'drm_salt_v1';
    let result = '';
    for (let i = 0; i < password.length; i++) {
      result += String.fromCharCode(
        password.charCodeAt(i) ^ salt.charCodeAt(i % salt.length)
      );
    }
    return Buffer.from(result).toString('base64');
  }

  /**
   * Generates a pseudo-random session token (no external deps).
   * @private
   */
  _generateToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * Internal helper to create a user without permission checks (used by constructor).
   * @private
   */
  _createUser(username, password, role) {
    this.users.set(username, {
      passwordHash: this._hashPassword(password),
      role,
      editCount: 0,
    });
  }

  /**
   * Resolves a session token to its user object, or null if invalid.
   * @private
   */
  _getUserFromToken(token) {
    const username = this.sessions.get(token);
    if (!username) return null;
    return this.users.get(username) || null;
  }

  /**
   * Checks whether the user associated with a token has at least the required role.
   * Role hierarchy: admin > editor > viewer
   * @private
   */
  _hasPermission(token, requiredRole) {
    const user = this._getUserFromToken(token);
    if (!user) return false;

    const hierarchy = { viewer: 1, editor: 2, admin: 3 };
    return (hierarchy[user.role] || 0) >= (hierarchy[requiredRole] || 99);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // User account management
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Registers a new user. Only an admin (via token) can register other admins.
   * Viewers and editors can self-register without a token.
   *
   * @param {string} username  - Desired username (must be unique).
   * @param {string} password  - Plain-text password.
   * @param {string} [role]    - 'viewer' | 'editor' | 'admin'. Defaults to 'viewer'.
   * @param {string} [token]   - Session token of the caller (required to create admins).
   * @returns {boolean|null}   - true on success, null if username taken or unauthorised.
   */
  registerUser(username, password, role = 'viewer', token = null) {
    if (this.users.has(username)) return null;       // username already taken

    const validRoles = ['viewer', 'editor', 'admin'];
    if (!validRoles.includes(role)) return null;

    // Creating an admin account requires the caller to be an admin themselves.
    if (role === 'admin' && !this._hasPermission(token, 'admin')) return null;

    this._createUser(username, password, role);
    return true;
  }

  /**
   * Authenticates a user and returns a session token.
   *
   * @param {string} username
   * @param {string} password
   * @returns {string|null} Session token, or null if credentials are wrong.
   */
  login(username, password) {
    const user = this.users.get(username);
    if (!user) return null;
    if (user.passwordHash !== this._hashPassword(password)) return null;

    const token = this._generateToken();
    this.sessions.set(token, username);
    return token;
  }

  /**
   * Invalidates a session token (logs the user out).
   *
   * @param {string} token - The session token to invalidate.
   * @returns {boolean} true if the token existed and was removed, false otherwise.
   */
  logout(token) {
    return this.sessions.delete(token);
  }

  /**
   * Returns public profile information for a user.
   *
   * @param {string} username
   * @param {string} token    - Must belong to an admin OR the user themselves.
   * @returns {Object|null}   - { username, role, editCount } or null if not found / unauthorised.
   */
  getUserInfo(username, token) {
    const caller = this._getUserFromToken(token);
    if (!caller) return null;

    const callerUsername = this.sessions.get(token);
    const isAdmin  = caller.role === 'admin';
    const isSelf   = callerUsername === username;

    if (!isAdmin && !isSelf) return null;

    const user = this.users.get(username);
    if (!user) return null;

    return { username, role: user.role, editCount: user.editCount };
  }

  /**
   * Returns a list of all users (admin only).
   *
   * @param {string} token  - Must belong to an admin.
   * @returns {Object[]|null} Array of { username, role, editCount }, or null if unauthorised.
   */
  listUsers(token) {
    if (!this._hasPermission(token, 'admin')) return null;

    const result = [];
    for (const [username, user] of this.users.entries()) {
      result.push({ username, role: user.role, editCount: user.editCount });
    }
    return result;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Recipe operations  (token is optional for backward-compat on read ops;
  //                     write ops that receive a token enforce permissions)
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Adds a new recipe.
   *
   * @param {string}   name
   * @param {string[]} ingredients
   * @param {string[]} steps
   * @param {string}   [token] - Session token. If supplied, caller must be editor or admin.
   * @returns {string|null} The new recipe_id (e.g. "recipe1"), or null on failure.
   */
  addRecipe(name, ingredients, steps, token = null) {
    // Enforce auth only when a token is provided.
    if (token !== null && !this._hasPermission(token, 'editor')) return null;

    const lowerName = name.toLowerCase();
    for (const recipe of this.recipes.values()) {
      if (lowerName === recipe.name.toLowerCase()) return null;
    }

    const recipeId = 'recipe' + this.nextId++;
    this.recipes.set(recipeId, { name, ingredients, steps });
    return recipeId;
  }

  /**
   * Retrieves a recipe by its ID.
   *
   * @param {string} recipeId
   * @returns {string[]} [name, ingredients_as_string, steps_as_string], or [] if not found.
   */
  getRecipe(recipeId) {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) return [];
    return [recipe.name, recipe.ingredients.join(','), recipe.steps.join(',')];
  }

  /**
   * Updates an existing recipe and increments the caller's edit count.
   *
   * @param {string}   recipeId
   * @param {string}   name
   * @param {string[]} ingredients
   * @param {string[]} steps
   * @param {string}   [token] - Session token. If supplied, caller must be editor or admin.
   * @returns {boolean} true on success, false otherwise.
   */
  updateRecipe(recipeId, name, ingredients, steps, token = null) {
    // Enforce auth only when a token is provided.
    if (token !== null && !this._hasPermission(token, 'editor')) return false;

    if (!this.recipes.has(recipeId)) return false;

    // Name conflict check (skip the recipe being updated itself).
    const lowerName = name.toLowerCase();
    for (const [id, recipe] of this.recipes.entries()) {
      if (id !== recipeId && lowerName === recipe.name.toLowerCase()) return false;
    }

    this.recipes.set(recipeId, { name, ingredients, steps });

    // Track the edit if a valid session was provided.
    if (token !== null) {
      const username = this.sessions.get(token);
      if (username) {
        const user = this.users.get(username);
        if (user) user.editCount++;
      }
    }

    return true;
  }

  /**
   * Deletes a recipe by its ID.
   *
   * @param {string} recipeId
   * @param {string} [token] - Session token. If supplied, caller must be admin.
   * @returns {boolean} true if deleted, false otherwise.
   */
  deleteRecipe(recipeId, token = null) {
    // Enforce auth only when a token is provided.
    if (token !== null && !this._hasPermission(token, 'admin')) return false;

    return this.recipes.delete(recipeId);
  }

  /**
   * Searches for recipes by criteria and query (case-insensitive substring match).
   *
   * @param {string} criteria - 'recipeid' | 'name'
   * @param {string} query
   * @returns {Object[]} Matched recipes: [{ id, name, ingredients, steps }]
   */
  searchRecipes(criteria, query) {
    const results   = [];
    const lowerQuery = query.toLowerCase();

    for (const [id, recipe] of this.recipes.entries()) {
      if (criteria === 'recipeid' && id.toLowerCase().includes(lowerQuery)) {
        results.push({ id, ...recipe });
      } else if (criteria === 'name' && recipe.name.toLowerCase().includes(lowerQuery)) {
        results.push({ id, ...recipe });
      }
    }
    return results;
  }

  /**
   * Sorts the recipes by the provided criteria.
   *
   * @param {string} criteria - 'recipeid' | 'name'
   * @returns {Object[]} Sorted recipes: [{ id, name, ingredients, steps }]
   */
  sortRecipes(criteria) {
    const all = [];
    for (const [id, recipe] of this.recipes.entries()) {
      all.push({ id, ...recipe });
    }

    if (criteria === 'recipeid') {
      all.sort((a, b) => {
        const numA = parseInt(a.id.replace('recipe', ''), 10);
        const numB = parseInt(b.id.replace('recipe', ''), 10);
        if (isNaN(numA) && isNaN(numB)) return a.id.localeCompare(b.id);
        if (isNaN(numA)) return 1;
        if (isNaN(numB)) return -1;
        return numA - numB;
      });
    } else if (criteria === 'name') {
      all.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    }

    return all;
  }
}

module.exports = DigitalManager;
