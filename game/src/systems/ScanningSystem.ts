import { gameState } from '../core/GameState';
import { blueprintByScanTarget } from '../data/blueprints';
import { bus } from '../core/EventBus';
import { audio } from '../core/AudioManager';

export class ScanningSystem {
  holdProgressFrac = 0;
  activeLabel: string | null = null;

  isScanned(scanTargetId: string): boolean {
    const bp = blueprintByScanTarget(scanTargetId);
    if (!bp) return true; // no blueprint tied to this target: nothing left to unlock
    return gameState.unlockedBlueprints.has(bp.id);
  }

  onProgress(scanTargetId: string, frac: number): void {
    this.holdProgressFrac = frac;
    const bp = blueprintByScanTarget(scanTargetId);
    this.activeLabel = bp?.name ?? null;
  }

  onCancel(): void {
    this.holdProgressFrac = 0;
    this.activeLabel = null;
  }

  completeScan(scanTargetId: string): void {
    this.holdProgressFrac = 0;
    this.activeLabel = null;
    const bp = blueprintByScanTarget(scanTargetId);
    if (!bp || gameState.unlockedBlueprints.has(bp.id)) return;
    gameState.unlockedBlueprints.add(bp.id);
    audio.blueprintUnlock();
    bus.emit('blueprint-unlocked', bp);
    bus.emit('notify', { text: `Blueprint unlocked: ${bp.name}`, kind: 'success' });
  }
}
