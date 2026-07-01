import { gameState } from '../core/GameState';
import { ITEMS } from '../data/items';
import { BuildingSystem } from '../systems/BuildingSystem';

const BASE_PART_IDS = [
  'base_corridor', 'base_room', 'base_hatch', 'base_window', 'base_solar', 'base_thermal',
  'base_bioreactor', 'base_nuclear', 'base_fabricator', 'base_storage', 'base_growbed',
  'base_moonpool', 'base_filtration',
];

export class BuildMenuUI {
  private overlay: HTMLDivElement;
  visible = false;

  constructor(root: HTMLElement, private building: BuildingSystem) {
    this.overlay = document.createElement('div');
    this.overlay.className = 'panel-overlay hidden';
    root.appendChild(this.overlay);
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

  private render(): void {
    this.overlay.innerHTML = '';
    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.innerHTML = `
      <h2>Base Construction</h2>
      <p class="recipe-ing" style="margin-bottom:10px">Select a part (must be fabricated first), then place it in the world.</p>
      <div class="build-list"></div>
      <div class="panel-close-hint">[B] to close</div>
    `;
    this.overlay.appendChild(panel);
    const list = panel.querySelector('.build-list')!;
    for (const id of BASE_PART_IDS) {
      const count = gameState.countItem(id);
      const item = document.createElement('div');
      item.className = 'build-item';
      item.innerHTML = `<div>${ITEMS[id].name}</div><div class="count">x${count}</div>`;
      if (count > 0) {
        item.addEventListener('click', () => {
          this.building.enterBuildMode(id);
          this.close();
        });
      } else {
        item.style.opacity = '0.4';
      }
      list.appendChild(item);
    }
  }
}
