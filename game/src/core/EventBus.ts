type Listener<T> = (payload: T) => void;

export class EventBus {
  private listeners = new Map<string, Set<Listener<any>>>();

  on<T = any>(event: string, fn: Listener<T>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn);
    return () => this.off(event, fn);
  }

  off<T = any>(event: string, fn: Listener<T>): void {
    this.listeners.get(event)?.delete(fn);
  }

  emit<T = any>(event: string, payload?: T): void {
    this.listeners.get(event)?.forEach((fn) => fn(payload as T));
  }
}

export const bus = new EventBus();
