# Collaborative Whiteboard (Frontend)

The frontend for the collaborative whiteboard provides a real-time drawing surface with multiplayer rooms, a full toolset (pen, shapes, eraser, text), export utilities, and a polished UI that now supports synchronous dark/light theming and reliable text annotations. The production deployment runs at [whiteboard-dun-two.vercel.app](https://whiteboard-dun-two.vercel.app/).

## Features

- Real-time shared canvases powered by Socket.IO and per-room URLs
- Drawing toolkit with pen, shapes, eraser, undo/redo, export, and browser storage
- Text tool with live broadcast, configurable colors, and resizable font sizing
- Global dark/light mode toggle with local storage persistence and system-theme fallbacks
- Toast notifications, copyable room IDs, and responsive layout optimized for large canvases

## Tech Stack

- React 19 + Vite
- Tailwind CSS with shadcn/ui primitives
- Socket.IO client for realtime sync
- Lucide icons and Radix UI underpinnings

## Getting Started

```bash
cd frontend
yarn install

# start vite dev server
yarn dev

# build for production
yarn build

# preview a production build
yarn preview
```

Visit the dev server URL shown in the console (default `http://localhost:5173`). The backend must run separately and expose a Socket.IO server.

## Configuration

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_BACKEND_URL` | Base URL for the Socket.IO server | `http://localhost:8001` |

Create a `.env` (or `.env.local`) in `frontend/` to override the default.

## Dark / Light Mode

- Toggle directly from the toolbar (sun/moon icon)
- Preference persists in `localStorage` and falls back to the OS theme
- Tailwind’s class-based `dark` mode drives the palette defined in `src/index.css`

## Text Tool Tips

- Select the “Text” tool, click the canvas, type, and hit `Enter`
- Font size aligns with the stroke slider (8× the stroke width, clamped to 12px minimum)
- Text now syncs to all peers instantly and respects the selected color

## Deployment Notes

1. `yarn build`
2. Upload the `dist/` output to Vercel or your static host
3. Ensure `VITE_BACKEND_URL` points to the live backend before building

The current production build is served from Vercel at [whiteboard-dun-two.vercel.app](https://whiteboard-dun-two.vercel.app/).
