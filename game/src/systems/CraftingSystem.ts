import { gameState } from '../core/GameState';
import { RECIPES } from '../data/recipes';
import type { RecipeDef } from '../data/types';
import { bus } from '../core/EventBus';
import { audio } from '../core/AudioManager';

export class CraftingSystem {
  isUnlocked(recipe: RecipeDef): boolean {
    return !recipe.unlockedBy || gameState.unlockedBlueprints.has(recipe.unlockedBy);
  }

  availableAt(station: RecipeDef['station']): RecipeDef[] {
    return RECIPES.filter((r) => r.station === station || (station === 'fabricator' && r.station === 'inventory'));
  }

  canCraft(recipe: RecipeDef): boolean {
    return this.isUnlocked(recipe) && gameState.hasItems(recipe.ingredients);
  }

  craft(recipeId: string): boolean {
    const recipe = RECIPES.find((r) => r.id === recipeId);
    if (!recipe || !this.canCraft(recipe)) return false;
    gameState.consumeItems(recipe.ingredients);

    if (recipe.result === 'vehicle_scout' || recipe.result === 'vehicle_cyclops') {
      bus.emit('spawn-vehicle', recipe.result);
    } else if (recipe.result === 'cure_serum') {
      gameState.cureSynthesized = true;
      bus.emit('cure-synthesized');
    } else if (['knife', 'scanner', 'laser_cutter', 'propulsion_cannon', 'vehicle_seaglide'].includes(recipe.result)) {
      gameState.toolsOwned.add(recipe.result);
      gameState.activeTool = recipe.result;
    } else if (recipe.result.startsWith('base_')) {
      // Base parts go straight to inventory as placeable items; BuildingSystem consumes them on placement.
      gameState.addItem(recipe.result, recipe.resultQty);
    } else if (recipe.result === 'air_tank_1' || recipe.result === 'air_tank_2') {
      gameState.equippedTank = recipe.result;
    } else if (recipe.result === 'fins_1') {
      gameState.equippedFins = true;
    } else if (recipe.result === 'radiation_suit') {
      gameState.equippedRadSuit = true;
    } else if (recipe.result === 'thermal_suit') {
      gameState.equippedThermalSuit = true;
    } else {
      gameState.addItem(recipe.result, recipe.resultQty);
    }

    audio.craft();
    bus.emit('notify', { text: `Crafted ${recipe.name}`, kind: 'success' });
    bus.emit('inventory-changed');
    return true;
  }
}
