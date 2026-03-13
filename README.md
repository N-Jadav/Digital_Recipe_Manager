# Digital Recipe Manager

A Node.js application to manage recipes. This project provides a `DigitalManager` class with functionalities to add, retrieve, update, and delete recipes.

## Features

- **Add Recipes**: Add new recipes with a name, ingredients, and steps. Automatically generates a unique `recipeId` and prevents duplicate recipes with the same name (case-insensitive).
- **Retrieve Recipes**: Fetch a recipe's details by its ID.
- **Update Recipes**: Modify an existing recipe's name, ingredients, or steps. Ensures the new name doesn't conflict with existing recipes.
- **Delete Recipes**: Remove a recipe by its ID.

## Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.
- npm (Node Package Manager)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/N-Jadav/Digital_Recipe_Manager.git
   ```
2. Navigate into the project directory:
   ```bash
   cd Digital_Recipe_Manager
   ```
3. Install dependencies (e.g., Jest for testing):
   ```bash
   npm install
   ```

## Usage

You can import and use the `DigitalManager` class in your own JavaScript files:

```javascript
const DigitalManager = require('./DigitalManager');

const manager = new DigitalManager();

// Add a new recipe
const recipeId = manager.addRecipe(
  'Pancakes', 
  ['Flour', 'Milk', 'Eggs', 'Sugar'], 
  ['Mix dry ingredients', 'Add wet ingredients', 'Cook on a hot pan']
);
console.log(`Added recipe with ID: ${recipeId}`);

// Get recipe details
const recipeInfo = manager.getRecipe(recipeId);
console.log('Recipe Info:', recipeInfo);

// Update recipe
manager.updateRecipe(
  recipeId, 
  'Blueberry Pancakes', 
  ['Flour', 'Milk', 'Eggs', 'Sugar', 'Blueberries'], 
  ['Mix ingredients', 'Add blueberries', 'Cook']
);

// Delete recipe
manager.deleteRecipe(recipeId);
```

## Running Tests

This project uses [Jest](https://jestjs.io/) for unit testing. To run the test suite, execute the following command:

```bash
npm test
```

## License

ISC License
