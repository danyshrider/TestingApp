import { gameState } from '../core/GameState';
import { Player } from '../entities/Player';
import { World } from '../world/World';
import { InteractionSystem } from '../world/Interactables';
import { StorySystem } from '../systems/StorySystem';
import { BeaconSystem } from '../systems/BeaconSystem';
import { BuildingSystem } from '../systems/BuildingSystem';
import { ITEMS } from '../data/items';

export class HUD {
  private root: HTMLDivElement;
  private healthFill: HTMLDivElement;
  private oxygenFill: HTMLDivElement;
  private hungerFill: HTMLDivElement;
  private thirstFill: HTMLDivElement;
  private poisonBar: HTMLDivElement;
  private poisonFill: HTMLDivElement;
  private radiationBar: HTMLDivElement;
  private radiationFill: HTMLDivElement;
  private depthEl: HTMLDivElement;
  private biomeEl: HTMLDivElement;
  private compass: HTMLDivElement;
  private promptEl: HTMLDivElement;
  private promptProgress: HTMLDivElement;
  private hotbar: HTMLDivElement;
  private powerEl: HTMLDivElement;
  private buildHint: HTMLDivElement;

  constructor(
    root: HTMLElement,
    private player: Player,
    private world: World,
    private interactions: InteractionSystem,
    private story: StorySystem,
    private beacons: BeaconSystem,
    private building: BuildingSystem,
  ) {
    this.root = document.createElement('div');
    this.root.id = 'hud';
    root.appendChild(this.root);

    this.root.innerHTML = `
      <div class="crosshair"></div>
      <div class="depth-readout">
        <div class="biome"></div>
        <div class="depth"></div>
      </div>
      <div class="compass"></div>
      <div class="stat-bars">
        <div class="stat-bar"><div class="stat-bar-fill fill-health"></div><div class="stat-bar-label health-label"></div></div>
        <div class="stat-bar"><div class="stat-bar-fill fill-oxygen"></div><div class="stat-bar-label oxygen-label"></div></div>
        <div class="stat-bar"><div class="stat-bar-fill fill-hunger"></div><div class="stat-bar-label hunger-label"></div></div>
        <div class="stat-bar"><div class="stat-bar-fill fill-thirst"></div><div class="stat-bar-label thirst-label"></div></div>
        <div class="stat-bar poison-bar hidden"><div class="stat-bar-fill fill-poison"></div><div class="stat-bar-label">POISON</div></div>
        <div class="stat-bar radiation-bar hidden"><div class="stat-bar-fill fill-radiation"></div><div class="stat-bar-label">RADIATION</div></div>
      </div>
      <div class="power-readout"></div>
      <div class="interact-prompt hidden"></div>
      <div class="build-hint hidden">Build mode: Left-click place · Q/E rotate · Right-click cancel</div>
      <div class="hotbar"></div>
    `;

    this.healthFill = this.root.querySelector('.fill-health')!;
    this.oxygenFill = this.root.querySelector('.fill-oxygen')!;
    this.hungerFill = this.root.querySelector('.fill-hunger')!;
    this.thirstFill = this.root.querySelector('.fill-thirst')!;
    this.poisonBar = this.root.querySelector('.poison-bar')!;
    this.poisonFill = this.root.querySelector('.fill-poison')!;
    this.radiationBar = this.root.querySelector('.radiation-bar')!;
    this.radiationFill = this.root.querySelector('.fill-radiation')!;
    this.depthEl = this.root.querySelector('.depth')!;
    this.biomeEl = this.root.querySelector('.biome')!;
    this.compass = this.root.querySelector('.compass')!;
    this.promptEl = this.root.querySelector('.interact-prompt')!;
    this.hotbar = this.root.querySelector('.hotbar')!;
    this.powerEl = this.root.querySelector('.power-readout')!;
    this.buildHint = this.root.querySelector('.build-hint')!;

    this.promptProgress = document.createElement('div');
    this.promptProgress.className = 'interact-progress';
    this.promptProgress.innerHTML = '<div class="interact-progress-fill"></div>';
  }

  update(): void {
    this.healthFill.style.width = `${gameState.health}%`;
    this.root.querySelector('.health-label')!.textContent = `${Math.ceil(gameState.health)} HP`;
    this.oxygenFill.style.width = `${(gameState.oxygen / gameState.maxOxygen) * 100}%`;
    this.root.querySelector('.oxygen-label')!.textContent = `${Math.ceil(gameState.oxygen)}s O2`;
    this.hungerFill.style.width = `${gameState.hunger}%`;
    this.root.querySelector('.hunger-label')!.textContent = `Food ${Math.ceil(gameState.hunger)}`;
    this.thirstFill.style.width = `${gameState.thirst}%`;
    this.root.querySelector('.thirst-label')!.textContent = `Water ${Math.ceil(gameState.thirst)}`;

    this.poisonBar.classList.toggle('hidden', gameState.poison <= 0);
    this.poisonFill.style.width = `${gameState.poison}%`;
    this.radiationBar.classList.toggle('hidden', gameState.radiation <= 0);
    this.radiationFill.style.width = `${gameState.radiation}%`;

    const biome = this.world.currentBiome();
    this.biomeEl.textContent = biome.name;
    this.depthEl.textContent = `${Math.round(this.player.depth)}m`;

    this.powerEl.textContent = gameState.basePieces.length
      ? `Base power: ${this.building.totalPower.toFixed(1)} kW · Hull: ${Math.round(this.building.hullIntegrity)}%`
      : '';

    this.updateCompass();
    this.updatePrompt();
    this.updateHotbar();

    this.buildHint.classList.toggle('hidden', !this.building.buildModeActive);
  }

  private updateCompass(): void {
    this.compass.innerHTML = '';
    const signals = this.story.availableSignals();
    const beaconList = this.beacons.bearingsAndDistances();
    const FOV = Math.PI * 0.9;
    const width = 340;
    for (const s of signals) {
      if (Math.abs(s.bearing) > FOV / 2) continue;
      const x = width / 2 + (s.bearing / (FOV / 2)) * (width / 2);
      const el = document.createElement('div');
      el.className = 'compass-marker';
      el.style.left = `${x}px`;
      el.style.color = '#8ee8ff';
      el.textContent = `${s.name} ${Math.round(s.distance)}m`;
      this.compass.appendChild(el);
    }
    for (const b of beaconList) {
      if (Math.abs(b.bearing) > FOV / 2) continue;
      const x = width / 2 + (b.bearing / (FOV / 2)) * (width / 2);
      const el = document.createElement('div');
      el.className = 'compass-marker';
      el.style.left = `${x}px`;
      el.style.color = b.color;
      el.textContent = `${b.label} ${Math.round(b.distance)}m`;
      this.compass.appendChild(el);
    }
  }

  private updatePrompt(): void {
    const prompt = this.interactions.currentPrompt();
    if (!prompt) {
      this.promptEl.classList.add('hidden');
      return;
    }
    this.promptEl.classList.remove('hidden');
    this.promptEl.textContent = prompt.text;
    if (prompt.holdFrac !== null) {
      this.promptEl.appendChild(this.promptProgress);
      (this.promptProgress.querySelector('.interact-progress-fill') as HTMLDivElement).style.width = `${prompt.holdFrac * 100}%`;
    }
  }

  private updateHotbar(): void {
    this.hotbar.innerHTML = '';
    const tools = [...gameState.toolsOwned];
    tools.forEach((tool, i) => {
      const el = document.createElement('div');
      el.className = `hotbar-slot ${gameState.activeTool === tool ? 'active' : ''}`;
      el.innerHTML = `<span class="key">${i + 1}</span>${ITEMS[tool]?.name ?? tool}`;
      this.hotbar.appendChild(el);
    });
  }
}
