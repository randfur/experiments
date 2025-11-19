# 3D Nasturtium Environment Walkthrough

I have created a static 3D environment using Three.js to simulate the nasturtium patch.

## Features
- **Procedural Generation**: Each reload creates a slightly different arrangement of stems, leaves, and flowers.
- **Nasturtium Geometry**:
    - **Leaves**: Peltate (shield-shaped) circles attached to winding stems.
    - **Flowers**: 5-petaled orange flowers with a spur.
- **Environment**:
    - Dark organic ground.
    - Background fence with vertical bars.
- **Lighting**:
    - Directional sunlight casting shadows.
    - Ambient light for fill.
- **Animation**:
    - Subtle wind animation affecting the plants.

## How to Run
1.  Navigate to the project folder: `c:\Users\BSP\repos\nasturtium`
2.  Open `index.html` in your web browser.
    - **Note**: If you see CORS errors (unlikely with this setup as no external textures are loaded, but possible depending on browser strictness), you may need to run a local server.
    - Python: `python -m http.server`
    - Node: `npx http-server` (if you had npm)
    - VS Code: "Live Server" extension.

## Files
- `index.html`: Entry point.
- `style.css`: Styling.
- `src/main.js`: Scene setup.
- `src/environment.js`: Ground and fence.
- `src/nasturtium.js`: Plant generation logic.
