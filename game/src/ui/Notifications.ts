import { bus } from '../core/EventBus';

export interface NotifyPayload {
  text: string;
  kind: 'info' | 'success' | 'warning';
}

export class Notifications {
  private container: HTMLDivElement;

  constructor(root: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'toast-stack';
    root.appendChild(this.container);
    bus.on<NotifyPayload>('notify', (p) => this.push(p));
  }

  private push(payload: NotifyPayload): void {
    const el = document.createElement('div');
    el.className = `toast ${payload.kind}`;
    el.textContent = payload.text;
    this.container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.4s';
      setTimeout(() => el.remove(), 400);
    }, 3200);
    while (this.container.children.length > 6) {
      this.container.removeChild(this.container.firstChild!);
    }
  }
}
