import './style.css';
import { Engine } from './core/Engine';
import { InputManager } from './core/InputManager';
import { gameState } from './core/GameState';
import { SaveSystem } from './core/SaveSystem';
import { audio } from './core/AudioManager';
import { bus } from './core/EventBus';
import { World } from './world/World';
import { Player } from './entities/Player';
import { InteractionSystem } from './world/Interactables';
import { WorldGen } from './world/WorldGen';
import { SurvivalSystem } from './systems/SurvivalSystem';
import { EcosystemSystem } from './systems/EcosystemSystem';
import { CraftingSystem } from './systems/CraftingSystem';
import { ScanningSystem } from './systems/ScanningSystem';
import { BuildingSystem } from './systems/BuildingSystem';
import { VehicleSystem } from './systems/VehicleSystem';
import { StorySystem } from './systems/StorySystem';
import { BeaconSystem } from './systems/BeaconSystem';
import { HUD } from './ui/HUD';
import { InventoryUI } from './ui/InventoryUI';
import { PDAUI } from './ui/PDAUI';
import { BuildMenuUI } from './ui/BuildMenuUI';
import { MainMenu } from './ui/MainMenu';
import { Notifications } from './ui/Notifications';

const appRoot = document.querySelector<HTMLDivElement>('#app')!;

const viewport = document.createElement('div');
viewport.style.position = 'absolute';
viewport.style.inset = '0';
appRoot.appendChild(viewport);

new Notifications(appRoot);

let started = false;

function grantStartingKit(): void {
  gameState.addItem('titanium', 4);
  gameState.addItem('quartz', 3);
  gameState.addItem('copper_ore', 2);
  gameState.addItem('kelp_sample', 2);
  // The life pod itself acts as the player's first fabricator.
  gameState.basePieces.push({
    id: 'lifepod_fabricator',
    partType: 'base_fabricator',
    position: [3, -1.2, 6],
    rotationY: 0,
  });
  // Permanent home marker so the starting fabricator is always findable.
  gameState.beacons.push({
    id: 'beacon_lifepod',
    label: 'Life Pod',
    color: '#ffb400',
    position: [3, -1.2, 6],
  });
}

function boot(isContinue: boolean): void {
  if (started) return;
  started = true;

  if (!isContinue) grantStartingKit();

  // Older saves predate the Life Pod home beacon - patch it in.
  const lifepod = gameState.basePieces.find((p) => p.id === 'lifepod_fabricator');
  if (lifepod && !gameState.beacons.some((b) => b.id === 'beacon_lifepod')) {
    gameState.beacons.push({ id: 'beacon_lifepod', label: 'Life Pod', color: '#ffb400', position: lifepod.position });
  }

  const engine = new Engine(viewport);
  const input = new InputManager(viewport);
  const world = new World(engine);
  const player = new Player(engine, input, world);
  player.yaw = gameState.rotationY;
  player.position.set(...gameState.position);

  const interactions = new InteractionSystem(player);
  const scanning = new ScanningSystem();
  const worldGen = new WorldGen(engine, world.terrain, interactions, scanning);
  worldGen.generate();

  const survival = new SurvivalSystem(engine, player, world);
  const crafting = new CraftingSystem();
  const building = new BuildingSystem(engine, player, input, world);
  new VehicleSystem(engine, player, input, world, interactions);
  new EcosystemSystem(engine, player, world, input, survival);
  const story = new StorySystem(engine, player);
  const beacons = new BeaconSystem(engine, player);

  const hud = new HUD(appRoot, player, world, interactions, story, beacons, building, worldGen);
  const inventoryUI = new InventoryUI(appRoot, crafting, building, survival);
  const pdaUI = new PDAUI(appRoot, story, beacons);
  const buildMenuUI = new BuildMenuUI(appRoot, building);

  const deathOverlay = document.createElement('div');
  deathOverlay.className = 'death-overlay hidden';
  deathOverlay.innerHTML = '<h1>CONSCIOUSNESS FADING...</h1>';
  appRoot.appendChild(deathOverlay);

  const winOverlay = document.createElement('div');
  winOverlay.className = 'win-overlay hidden';
  winOverlay.innerHTML = `
    <h1>THE SERUM WORKS</h1>
    <p>The infection recedes as the sun breaks the surface. Whatever built that containment site down there
    will keep its secrets a while longer. You signal every passing frequency you can reach, and wait for a ride home.</p>
    <p style="margin-top:18px;opacity:0.6">Thanks for playing Abyssal Descent.</p>
  `;
  appRoot.appendChild(winOverlay);

  bus.on('player-died', () => deathOverlay.classList.remove('hidden'));
  bus.on('player-respawned', () => deathOverlay.classList.add('hidden'));
  bus.on('game-won', () => {
    winOverlay.classList.remove('hidden');
    document.exitPointerLock?.();
  });

  function anyPanelOpen(): boolean {
    return inventoryUI.visible || pdaUI.visible || buildMenuUI.visible;
  }

  function closeAllPanels(): void {
    if (inventoryUI.visible) inventoryUI.toggle();
    if (pdaUI.visible) pdaUI.toggle();
    if (buildMenuUI.visible) buildMenuUI.toggle();
  }

  viewport.addEventListener('click', () => audio.resume());

  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyI') {
      if (pdaUI.visible) pdaUI.toggle();
      if (buildMenuUI.visible) buildMenuUI.toggle();
      inventoryUI.toggle();
    } else if (e.code === 'Tab') {
      e.preventDefault();
      if (inventoryUI.visible) inventoryUI.toggle();
      if (buildMenuUI.visible) buildMenuUI.toggle();
      pdaUI.toggle();
    } else if (e.code === 'KeyB') {
      if (building.buildModeActive) {
        building.exitBuildMode();
        return;
      }
      if (inventoryUI.visible) inventoryUI.toggle();
      if (pdaUI.visible) pdaUI.toggle();
      buildMenuUI.toggle();
    } else if (e.code === 'KeyM' && !anyPanelOpen()) {
      beacons.placeBeacon();
    } else if (e.code === 'Escape') {
      if (building.buildModeActive) building.exitBuildMode();
      else closeAllPanels();
    } else if (/^Digit[1-9]$/.test(e.code)) {
      const idx = parseInt(e.code.replace('Digit', ''), 10) - 1;
      const tools = [...gameState.toolsOwned];
      if (tools[idx]) gameState.activeTool = tools[idx];
    }
  });

  engine.addUpdater((dt) => {
    interactions.update(dt, input.isDown('KeyF'), input.wasJustPressed('KeyF'));
    hud.update();
    input.endFrame();
  });

  setInterval(() => SaveSystem.save(), 8000);
  window.addEventListener('beforeunload', () => SaveSystem.save());

  engine.start();

  if (import.meta.env.DEV) {
    (window as unknown as { __debug: unknown }).__debug = { gameState, player, input, world, crafting, building };
  }
}

new MainMenu(appRoot, (isContinue) => boot(isContinue));
