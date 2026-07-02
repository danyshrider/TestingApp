import * as THREE from 'three';
import { Engine } from '../core/Engine';
import { Player } from '../entities/Player';
import { gameState } from '../core/GameState';
import { LOGS, RADIO_SIGNALS } from '../data/logs';
import { bus } from '../core/EventBus';
import { audio } from '../core/AudioManager';
import { bearingAndDistance } from '../core/Bearing';

export interface TrackedSignal {
  id: string;
  name: string;
  distance: number;
  bearing: number; // radians, relative to player yaw: 0 = straight ahead
}

export class StorySystem {
  trackedSignalId: string | null = null;

  constructor(engine: Engine, private player: Player) {
    engine.addUpdater(() => this.update());
  }

  private update(): void {
    for (const log of LOGS) {
      if (gameState.discoveredLogs.has(log.id)) continue;
      const pos = new THREE.Vector3(...log.position);
      if (this.player.position.distanceTo(pos) <= log.triggerRadius) {
        gameState.discoveredLogs.add(log.id);
        bus.emit('log-discovered', log);
        bus.emit('notify', { text: `New PDA log: ${log.title}`, kind: 'success' });
      }
    }

    for (const sig of RADIO_SIGNALS) {
      if (gameState.discoveredSignals.has(sig.id)) continue;
      if (sig.unlocksAfterLog && !gameState.discoveredLogs.has(sig.unlocksAfterLog)) continue;
      gameState.discoveredSignals.add(sig.id);
      audio.radioSignal();
      bus.emit('notify', { text: `Radio signal received: ${sig.name}`, kind: 'info' });
    }

    if (gameState.cureSynthesized && !gameState.gameWon) {
      const distFromCenter = Math.hypot(gameState.position[0], gameState.position[2]);
      if (this.player.isAboveSurface && distFromCenter < 60) {
        gameState.gameWon = true;
        bus.emit('game-won');
      }
    }
  }

  availableSignals(): TrackedSignal[] {
    const p = this.player.position;
    return RADIO_SIGNALS.filter((s) => gameState.discoveredSignals.has(s.id)).map((s) => {
      const { distance, bearing } = bearingAndDistance(p, this.player.yaw, new THREE.Vector3(...s.position));
      return { id: s.id, name: s.name, distance, bearing };
    });
  }

  setTracked(id: string | null): void {
    this.trackedSignalId = id;
  }
}
