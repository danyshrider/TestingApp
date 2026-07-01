import { gameState } from '../core/GameState';
import { ITEMS } from '../data/items';
import { CraftingSystem } from '../systems/CraftingSystem';
import { BuildingSystem } from '../systems/BuildingSystem';
import { SurvivalSystem } from '../systems/SurvivalSystem';
import { bus } from '../core/EventBus';
import { audio } from '../core/AudioManager';

const ITEM_COLORS: Record<string, string> = {
  raw: '#8a9aa0', material: '#5fa0d0', food: '#e0a83e', water: '#4ab0d0',
  tool: '#c05fd0', equipment: '#55d68a', 'blueprint-fragment': '#e05fd0', 'base-part': '#a0805a', misc: '#8ee8ff',
};

export class InventoryUI {
  private overlay: HTMLDivElement;
  visible = false;
  private tab: 'inventory' | 'craft' = 'inventory';

  constructor(
    root: HTMLElement,
    private crafting: CraftingSystem,
    private building: BuildingSystem,
    private survival: SurvivalSystem,
  ) {
    this.overlay = document.createElement('div');
    this.overlay.className = 'panel-overlay hidden';
    root.appendChild(this.overlay);
    bus.on('inventory-changed', () => {
      if (this.visible) this.render();
    });
  }

  toggle(): void {
    this.visible = !this.visible;
    this.overlay.classList.toggle('hidden', !this.visible);
    if (this.visible) this.render();
  }

  close(): void {
    this.visible = false;
    this.overlay.classList.add('hidden');
  }

  private setTool(itemId: string): void {
    gameState.activeTool = itemId;
    this.render();
  }

  private useItem(idx: number): void {
    const slot = gameState.inventory[idx];
    if (!slot) return;
    const def = ITEMS[slot.id];
    if (!def) return;
    if (def.category === 'tool') {
      this.setTool(slot.id);
      return;
    }
    if (def.edible) {
      this.survival.eat(def.edible.food, def.edible.water, def.edible.poison);
      gameState.removeItem(slot.id, 1);
      audio.pickupItem();
      this.render();
    }
  }

  private render(): void {
    this.overlay.innerHTML = '';
    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.innerHTML = `
      <h2>Inventory &amp; Fabrication</h2>
      <div class="panel-tabs">
        <div class="panel-tab ${this.tab === 'inventory' ? 'active' : ''}" data-tab="inventory">Inventory</div>
        <div class="panel-tab ${this.tab === 'craft' ? 'active' : ''}" data-tab="craft">Fabricate</div>
      </div>
      <div class="body"></div>
      <div class="panel-close-hint">[I] to close</div>
    `;
    this.overlay.appendChild(panel);
    panel.querySelectorAll('.panel-tab').forEach((el) => {
      el.addEventListener('click', () => {
        this.tab = (el as HTMLElement).dataset.tab as 'inventory' | 'craft';
        this.render();
      });
    });
    const body = panel.querySelector('.body')!;
    if (this.tab === 'inventory') body.appendChild(this.renderInventory());
    else body.appendChild(this.renderCraft());
  }

  private renderInventory(): HTMLElement {
    const frag = document.createElement('div');

    const equipRow = document.createElement('div');
    equipRow.className = 'equip-row';
    const chips = [
      { label: `Tank: ${gameState.equippedTank === 'none' ? 'Standard (built-in)' : ITEMS[gameState.equippedTank].name}`, on: true },
      { label: 'Fins', on: gameState.equippedFins },
      { label: 'Radiation Suit', on: gameState.equippedRadSuit },
      { label: 'Thermal Suit', on: gameState.equippedThermalSuit },
    ];
    for (const c of chips) {
      const chip = document.createElement('div');
      chip.className = `equip-chip ${c.on ? 'on' : ''}`;
      chip.textContent = c.label;
      equipRow.appendChild(chip);
    }
    frag.appendChild(equipRow);

    const grid = document.createElement('div');
    grid.className = 'inv-grid';
    const capacity = 30 + this.building.storageCapacityBonus();
    for (let i = 0; i < capacity; i++) {
      const slotEl = document.createElement('div');
      slotEl.className = 'inv-slot';
      const stack = gameState.inventory[i];
      if (stack) {
        const def = ITEMS[stack.id];
        slotEl.innerHTML = `<div class="swatch" style="background:${ITEM_COLORS[def?.category ?? 'misc']}"></div>${def?.name ?? stack.id}<span class="qty">${stack.qty > 1 ? stack.qty : ''}</span>`;
        slotEl.title = def?.description ?? '';
        slotEl.addEventListener('click', () => this.useItem(i));
      }
      grid.appendChild(slotEl);
    }
    frag.appendChild(grid);
    return frag;
  }

  private renderCraft(): HTMLElement {
    const frag = document.createElement('div');
    const nearFab = this.building.nearestFabricatorInRange();
    if (!nearFab) {
      const warn = document.createElement('div');
      warn.className = 'recipe-ing';
      warn.style.marginBottom = '10px';
      warn.textContent = 'No Fabricator in range — build or find one to craft.';
      frag.appendChild(warn);
    }
    const list = document.createElement('div');
    list.className = 'recipe-list';
    for (const recipe of this.crafting.availableAt('fabricator')) {
      const unlocked = this.crafting.isUnlocked(recipe);
      const hasItems = gameState.hasItems(recipe.ingredients);
      const row = document.createElement('div');
      row.className = `recipe-row ${unlocked ? '' : 'locked'}`;
      const ingText = recipe.ingredients.map((i) => `${ITEMS[i.id]?.name ?? i.id} x${i.qty}`).join(', ');
      row.innerHTML = `
        <div>
          <div>${recipe.name} ${unlocked ? '' : '(blueprint required)'}</div>
          <div class="recipe-ing">${ingText}</div>
        </div>
        <button ${!unlocked || !hasItems || !nearFab ? 'disabled' : ''}>Craft</button>
      `;
      row.querySelector('button')!.addEventListener('click', () => {
        this.crafting.craft(recipe.id);
        this.render();
      });
      list.appendChild(row);
    }
    frag.appendChild(list);
    return frag;
  }
}
