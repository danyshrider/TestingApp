import { SaveSystem } from '../core/SaveSystem';
import { gameState } from '../core/GameState';
import type { Difficulty } from '../data/types';

const DIFFICULTY_INFO: Record<Difficulty, string> = {
  survival: 'Standard experience: hunger, thirst, oxygen and hazard damage all active. Death sends you back to your life pod.',
  freedom: 'Explore and build without survival pressure. Hazard damage still applies but no hunger/thirst/oxygen drain.',
  hardcore: 'Survival systems drain faster and hazards hit harder. Death is permanent — your save is deleted.',
  creative: 'No survival stats, no damage. Free exploration and building sandbox.',
};

export class MainMenu {
  private overlay: HTMLDivElement;
  private selectedDifficulty: Difficulty = 'survival';

  constructor(root: HTMLElement, private onStart: (isContinue: boolean) => void) {
    this.overlay = document.createElement('div');
    this.overlay.className = 'menu-overlay';
    root.appendChild(this.overlay);
    this.render();
  }

  private render(): void {
    this.overlay.innerHTML = '';
    const title = document.createElement('div');
    title.className = 'menu-title';
    title.textContent = 'ABYSSAL DESCENT';
    const subtitle = document.createElement('div');
    subtitle.className = 'menu-subtitle';
    subtitle.textContent = 'YOU CRASHED. SOMETHING IS IN YOUR BLOOD. THE ANSWER IS DOWN THERE.';
    this.overlay.appendChild(title);
    this.overlay.appendChild(subtitle);

    const buttons = document.createElement('div');
    buttons.className = 'menu-buttons';

    if (SaveSystem.hasSave()) {
      const cont = document.createElement('div');
      cont.className = 'menu-btn';
      cont.textContent = 'Continue';
      cont.addEventListener('click', () => {
        SaveSystem.load();
        this.hide();
        this.onStart(true);
      });
      buttons.appendChild(cont);
    }

    const newGame = document.createElement('div');
    newGame.className = 'menu-btn';
    newGame.textContent = 'New Game';
    newGame.addEventListener('click', () => {
      gameState.difficulty = this.selectedDifficulty;
      this.hide();
      this.onStart(false);
    });
    buttons.appendChild(newGame);

    this.overlay.appendChild(buttons);

    const diffRow = document.createElement('div');
    diffRow.className = 'difficulty-row';
    (['survival', 'freedom', 'hardcore', 'creative'] as Difficulty[]).forEach((d) => {
      const chip = document.createElement('div');
      chip.className = `difficulty-chip ${d === this.selectedDifficulty ? 'selected' : ''}`;
      chip.textContent = d;
      chip.addEventListener('click', () => {
        this.selectedDifficulty = d;
        this.render();
      });
      diffRow.appendChild(chip);
    });
    this.overlay.appendChild(diffRow);

    const desc = document.createElement('div');
    desc.className = 'difficulty-desc';
    desc.textContent = DIFFICULTY_INFO[this.selectedDifficulty];
    this.overlay.appendChild(desc);
  }

  show(): void {
    this.overlay.classList.remove('hidden');
    this.render();
  }

  hide(): void {
    this.overlay.classList.add('hidden');
  }
}
