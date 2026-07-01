# Abyssal Descent

A browser-based underwater survival/crafting game in the spirit of Subnautica, built with Three.js + TypeScript. All visuals are procedural (no external art/audio assets) — geometry is primitive-based low-poly, and sound is synthesized with the Web Audio API.

## Running it

```bash
npm install
npm run dev
```

Open the printed local URL. Click the canvas once to enable audio and mouse-look (pointer lock).

## Controls

- `WASD` — swim
- `Space` / `Ctrl` — ascend / descend
- `Shift` — sprint
- Mouse — look
- `F` — interact / mine / harvest / scan (hold near wrecks) / enter-exit vehicles
- Left click — attack with knife (when equipped) / place base part (in build mode)
- `1`-`9` — switch equipped tool
- `I` — inventory & fabrication
- `Tab` — PDA (logs, blueprints, radio signals & beacons)
- `B` — base construction menu
- `M` — drop a navigation beacon at your position
- `Q` / `E` — rotate a base-part ghost while placing
- `Esc` — close menus / cancel placement

## Feature overview

- **Survival**: oxygen (tanks refill at the surface, in a vehicle, or docked), hunger/thirst, health, poison, radiation, temperature, and depth/pressure limits gated by tank tier.
- **Progression**: scan wrecks and fragments with the Scanner to unlock fabrication blueprints — no XP levels.
- **Crafting**: grid inventory, tiered recipes, and a Fabricator (the life pod has one built in; build more anywhere).
- **Base building**: place corridors, rooms, hatches, windows, solar/thermal/bioreactor/nuclear power, storage, grow beds, a moonpool, and a water filtration machine. Hull integrity degrades if you build too deep without reinforcement.
- **Vehicles**: build a Scout Sub or the larger Abyss-Class Submarine at a moonpool; dock to recharge and repair.
- **World**: six biomes arranged by depth/distance from your life pod (Safe Shallows → Kelp Forest → Coral Reef → Grand Reef → Abyssal Trench → Lava Zone), a day/night cycle, and depth-based fog/lighting.
- **Ecosystem**: passive/edible/predator fauna with patrol, flee, and hunt AI, plus leviathan-class apex predators guarding the deeper biomes.
- **Story**: PDA logs discovered by exploring wrecks, radio signals that guide you (bearing + distance only — there is no map), and a main mystery objective ending in a synthesized cure.
- **Save/difficulty**: autosaves to `localStorage`; choose Survival, Freedom, Hardcore (permadeath), or Creative from the main menu.
