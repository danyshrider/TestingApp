export class InputManager {
  private keys = new Set<string>();
  private justPressed = new Set<string>();
  mouseDX = 0;
  mouseDY = 0;
  mouseDown = false;
  rightMouseDown = false;
  scrollDelta = 0;
  pointerLocked = false;

  constructor(domElement: HTMLElement) {
    window.addEventListener('keydown', (e) => {
      if (!this.keys.has(e.code)) this.justPressed.add(e.code);
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    domElement.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.mouseDown = true;
      if (e.button === 2) this.rightMouseDown = true;
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouseDown = false;
      if (e.button === 2) this.rightMouseDown = false;
    });
    domElement.addEventListener('contextmenu', (e) => e.preventDefault());
    domElement.addEventListener('click', () => {
      if (!this.pointerLocked) domElement.requestPointerLock?.();
    });
    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === domElement;
    });
    document.addEventListener('mousemove', (e) => {
      if (this.pointerLocked) {
        this.mouseDX += e.movementX;
        this.mouseDY += e.movementY;
      }
    });
    domElement.addEventListener('wheel', (e) => {
      this.scrollDelta += e.deltaY;
    });
  }

  isDown(code: string): boolean {
    return this.keys.has(code);
  }

  wasJustPressed(code: string): boolean {
    return this.justPressed.has(code);
  }

  consumeMouseDelta(): { dx: number; dy: number } {
    const d = { dx: this.mouseDX, dy: this.mouseDY };
    this.mouseDX = 0;
    this.mouseDY = 0;
    return d;
  }

  consumeScroll(): number {
    const s = this.scrollDelta;
    this.scrollDelta = 0;
    return s;
  }

  endFrame(): void {
    this.justPressed.clear();
  }
}
