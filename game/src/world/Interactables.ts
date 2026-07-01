import * as THREE from 'three';
import { Player } from '../entities/Player';

export type InteractKind = 'resource' | 'flora' | 'wreck' | 'fragment' | 'vehicle' | 'basepart' | 'beacon';

export interface Interactable {
  id: string;
  object3d: THREE.Object3D;
  kind: InteractKind;
  radius: number;
  getPrompt: () => string | null; // null = not currently interactable (e.g. depleted)
  onInteract: () => void;
  holdDuration?: number; // if set, requires holding E for this many seconds
  onHoldProgress?: (frac: number) => void;
  onHoldCancel?: () => void;
}

export class InteractionSystem {
  private items = new Map<string, Interactable>();
  private nearest: Interactable | null = null;
  private holding = false;
  private holdElapsed = 0;

  constructor(private player: Player) {}

  register(item: Interactable): void {
    this.items.set(item.id, item);
  }

  unregister(id: string): void {
    this.items.delete(id);
  }

  update(dt: number, fDown: boolean, fJustPressed: boolean): void {
    let best: Interactable | null = null;
    let bestDist = Infinity;
    const p = this.player.position;
    for (const item of this.items.values()) {
      const d = p.distanceTo(item.object3d.position);
      if (d <= item.radius && item.getPrompt() !== null && d < bestDist) {
        best = item;
        bestDist = d;
      }
    }
    if (best !== this.nearest) {
      this.holding = false;
      this.holdElapsed = 0;
      this.nearest?.onHoldCancel?.();
    }
    this.nearest = best;

    if (!best) return;

    if (best.holdDuration) {
      if (fDown) {
        this.holding = true;
        this.holdElapsed += dt;
        best.onHoldProgress?.(Math.min(1, this.holdElapsed / best.holdDuration));
        if (this.holdElapsed >= best.holdDuration) {
          best.onInteract();
          this.holdElapsed = 0;
          this.holding = false;
        }
      } else if (this.holding) {
        this.holding = false;
        this.holdElapsed = 0;
        best.onHoldCancel?.();
      }
    } else if (fJustPressed) {
      best.onInteract();
    }
  }

  currentPrompt(): { text: string; holdFrac: number | null } | null {
    if (!this.nearest) return null;
    const text = this.nearest.getPrompt();
    if (text === null) return null;
    return { text, holdFrac: this.nearest.holdDuration ? this.holdElapsed / this.nearest.holdDuration : null };
  }
}
