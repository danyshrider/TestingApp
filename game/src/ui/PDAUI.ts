import { gameState } from '../core/GameState';
import { LOGS } from '../data/logs';
import { BLUEPRINTS } from '../data/blueprints';
import { StorySystem } from '../systems/StorySystem';
import { BeaconSystem } from '../systems/BeaconSystem';

export class PDAUI {
  private overlay: HTMLDivElement;
  visible = false;
  private tab: 'logs' | 'blueprints' | 'signals' = 'logs';

  constructor(root: HTMLElement, private story: StorySystem, private beacons: BeaconSystem) {
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
      <h2>PDA</h2>
      <div class="panel-tabs">
        <div class="panel-tab ${this.tab === 'logs' ? 'active' : ''}" data-tab="logs">Logs (${gameState.discoveredLogs.size}/${LOGS.length})</div>
        <div class="panel-tab ${this.tab === 'blueprints' ? 'active' : ''}" data-tab="blueprints">Blueprints (${gameState.unlockedBlueprints.size}/${BLUEPRINTS.length})</div>
        <div class="panel-tab ${this.tab === 'signals' ? 'active' : ''}" data-tab="signals">Signals &amp; Beacons</div>
      </div>
      <div class="body"></div>
      <div class="panel-close-hint">[Tab] to close</div>
    `;
    this.overlay.appendChild(panel);
    panel.querySelectorAll('.panel-tab').forEach((el) => {
      el.addEventListener('click', () => {
        this.tab = (el as HTMLElement).dataset.tab as typeof this.tab;
        this.render();
      });
    });
    const body = panel.querySelector('.body')!;
    if (this.tab === 'logs') body.appendChild(this.renderLogs());
    else if (this.tab === 'blueprints') body.appendChild(this.renderBlueprints());
    else body.appendChild(this.renderSignals());
  }

  private renderLogs(): HTMLElement {
    const frag = document.createElement('div');
    frag.className = 'log-list';
    const discovered = LOGS.filter((l) => gameState.discoveredLogs.has(l.id));
    if (discovered.length === 0) {
      frag.innerHTML = '<p class="recipe-ing">No logs recovered yet. Explore wrecks and listen for radio signals.</p>';
    }
    for (const log of discovered) {
      const el = document.createElement('div');
      el.className = 'log-entry';
      el.innerHTML = `<h4>${log.title}</h4><p>${log.body}</p>`;
      frag.appendChild(el);
    }
    return frag;
  }

  private renderBlueprints(): HTMLElement {
    const frag = document.createElement('div');
    frag.className = 'blueprint-list';
    for (const bp of BLUEPRINTS) {
      const unlocked = gameState.unlockedBlueprints.has(bp.id);
      const el = document.createElement('div');
      el.className = 'log-entry';
      el.style.opacity = unlocked ? '1' : '0.4';
      el.innerHTML = `<h4>${unlocked ? bp.name : '??? Unidentified Schematic'}</h4><p>${unlocked ? bp.description : 'Scan the associated wreck or fragment to unlock.'}</p>`;
      frag.appendChild(el);
    }
    return frag;
  }

  private renderSignals(): HTMLElement {
    const frag = document.createElement('div');
    const placeBtn = document.createElement('div');
    placeBtn.className = 'menu-btn';
    placeBtn.style.marginBottom = '14px';
    placeBtn.textContent = 'Drop Beacon Here [M]';
    placeBtn.addEventListener('click', () => {
      this.beacons.placeBeacon();
      this.render();
    });
    frag.appendChild(placeBtn);

    const sigTitle = document.createElement('div');
    sigTitle.className = 'recipe-ing';
    sigTitle.style.marginBottom = '6px';
    sigTitle.textContent = 'Radio Signals';
    frag.appendChild(sigTitle);
    const sigList = document.createElement('div');
    sigList.className = 'signal-list';
    for (const s of this.story.availableSignals()) {
      const row = document.createElement('div');
      row.className = 'signal-row';
      row.innerHTML = `<span>${s.name}</span><span>${Math.round(s.distance)}m</span>`;
      sigList.appendChild(row);
    }
    if (this.story.availableSignals().length === 0) {
      sigList.innerHTML = '<p class="recipe-ing">No active signals. Discover logs to unlock more.</p>';
    }
    frag.appendChild(sigList);

    const beaconTitle = document.createElement('div');
    beaconTitle.className = 'recipe-ing';
    beaconTitle.style.margin = '14px 0 6px 0';
    beaconTitle.textContent = 'Your Beacons';
    frag.appendChild(beaconTitle);
    const beaconList = document.createElement('div');
    beaconList.className = 'beacon-list';
    for (const b of this.beacons.bearingsAndDistances()) {
      const row = document.createElement('div');
      row.className = 'beacon-row';
      row.innerHTML = `<span style="color:${b.color}">${b.label}</span><span>${Math.round(b.distance)}m</span>`;
      beaconList.appendChild(row);
    }
    frag.appendChild(beaconList);
    return frag;
  }
}
