# GeoSync

**Real-time collaborative map synchronization** - Share your map view with others in real-time, perfect for remote navigation assistance, collaborative exploration, and location-based coordination.

## Features

- 🗺️ **Real-time Map Sync** - Tracker's map movements instantly mirrored to tracked user
- 🔄 **Bi-directional Roles** - Switch between tracker and tracked seamlessly
- 🚀 **Low Latency** - WebSocket-based communication with optimized throttling
- 💾 **Session Persistence** - Redis-backed sessions with in-memory fallback
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🗺️ **No API Keys Required** - Uses OpenStreetMap (however, you can configure other map providers)

## Architecture

```
GeoSync
├── 📂 client/          # React + Vite frontend
│   ├── MapLibre GL     # Interactive map rendering
│   ├── Socket.io       # Real-time communication
│   └── Zustand         # State management
│
└── 📂 server/          # Node.js + Express backend
    ├── Express         # HTTP server
    ├── Socket.io       # WebSocket management
    └── Redis           # Session storage (optional)
```

## Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- **Redis** (optional - falls back to in-memory storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Adyasha56/Geo_Sync.git
   cd Geo_Sync
   ```

2. **Install dependencies**
   
   Install server dependencies:
   ```bash
   cd server
   npm install
   ```
   
   Install client dependencies:
   ```bash
   cd ../client
   npm install
   ```

3. **Configure environment variables**

   Create `.env` files based on the examples provided:
   
   **Server** (`server/.env`):
   ```bash
   cd ../server
   cp .env.example .env
   ```
   
   **Client** (`client/.env`):
   ```bash
   cd ../client
   cp .env.example .env
   ```
   
   Edit these files with your preferred settings (or keep defaults for local development).

### 🖥️ Running the Application

You'll need **two terminal windows** - one for the server and one for the client.

#### Terminal 1: Start the Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:3001` (or your configured PORT).

Output should show:
```
╔════════════════════════════════════════╗
║         GeoSync Server Running         ║
╠════════════════════════════════════════╣
║  PORT   : 3001                          ║
║  Redis  : ✓ Connected or ⚠ In-memory   ║
║  Origins: http://localhost:5173         ║
╚════════════════════════════════════════╝
Redis : Connected (or In-memory fallback)
```

#### Terminal 2: Start the Client

```bash
cd client
npm run dev
```

The client will start on `http://localhost:5173` (Vite's default port).

Open your browser to `http://localhost:5173` to access GeoSync.

## Usage

1. **Create a Session**: Click "Get Started" on the landing page
2. **Choose Your Role**:
   - **Tracker** - Your map movements will be shared
   - **Tracked** - You'll follow the tracker's movements
3. **Share the Session ID**: The tracked user needs the session ID to join
4. **Start Exploring**: Move the map (as tracker) and watch it sync!

### Controls

- **Pan**: Click and drag
- **Zoom**: Scroll wheel or pinch gesture
- **Rotate**: Right-click drag or two-finger rotate
- **Tilt**: Ctrl + drag or two-finger tilt

## Configuration

### Server Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `CLIENT_URL` | Client URL for CORS | `http://localhost:5173` |
| `REDIS_URL` | Redis connection URL (recommended for deployment) | `undefined` |
| `REDIS_HOST` | Redis server host (used if REDIS_URL not set) | `127.0.0.1` |
| `REDIS_PORT` | Redis server port (used if REDIS_URL not set) | `6379` |
| `REDIS_PASSWORD` | Redis password (used if REDIS_URL not set) | `undefined` |
| `SESSION_TTL` | Session expiry time (seconds) | `3600` (1 hour) |

> **Note**: If `REDIS_URL` is set, it takes priority over individual Redis configs (HOST, PORT, PASSWORD).

### Client Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_SERVER_URL` | Backend server URL | `http://localhost:3001` |

> **Note**: Vite environment variables must be prefixed with `VITE_` to be exposed to the client.

## 🚀 Deployment

### Deploying to Production

#### 1. Backend Deployment (Railway, Render, Heroku, etc.)

**Environment Variables:**
```bash
PORT=3001
CLIENT_URL=https://your-frontend-url.com
REDIS_URL=redis://your-redis-url  # From Upstash, Redis Cloud, etc.
SESSION_TTL=3600
```

**Build Command:** `npm install`

**Start Command:** `npm start`

**Required Services:**
- Redis (recommended: [Upstash Redis](https://upstash.com/) - free tier available)

**Tips:**
- Set `REDIS_URL` as a connection string from your Redis provider
- Update `CLIENT_URL` to match your deployed frontend domain
- Most platforms auto-detect the PORT

#### 2. Frontend Deployment (Vercel, Netlify, etc.)

**Environment Variables:**
```bash
VITE_SERVER_URL=https://your-backend-url.com
```

**Build Command:** `npm run build`

**Output Directory:** `dist`

**Tips:**
- Set `VITE_SERVER_URL` to your deployed backend URL
- Ensure CORS is configured correctly on the backend

### Example: Deploying to Railway + Vercel

#### Backend (Railway):
1. Create a new Railway project
2. Add Upstash Redis plugin or use Railway's Redis
3. Set environment variables:
   - `CLIENT_URL=https://your-app.vercel.app`
   - `REDIS_URL` (auto-set by Railway Redis plugin)
4. Deploy from GitHub

#### Frontend (Vercel):
1. Import your repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable:
   - `VITE_SERVER_URL=https://your-app.railway.app`
5. Deploy

### Local Production Build

**Build the Client:**
```bash
cd client
npm run build
```

Static files will be generated in `client/dist/`.

**Start Production Server:**
```bash
cd server
npm start
```

For self-hosted production:
- Use a process manager (PM2, systemd)
- Set up a reverse proxy (Nginx, Caddy)
- Use a managed Redis instance
- Enable HTTPS with Let's Encrypt

## Development Scripts

### Client

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Server

```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
```

## Using Different Map Providers

GeoSync uses **OpenStreetMap** by default (no API key required). To use other providers:

### Mapbox

1. Get an API key from [Mapbox](https://www.mapbox.com/)
2. Update `client/src/components/MapView.jsx`:
   ```javascript
   const MAP_STYLE = `mapbox://styles/mapbox/streets-v12?access_token=YOUR_API_KEY`;
   ```

### Maptiler

1. Get an API key from [Maptiler](https://www.maptiler.com/)
2. Update the map style URL in `MapView.jsx`

##  Troubleshooting

### Server won't start
- Check if port 3001 is already in use
- Verify Redis is running (if configured)
- Check `.env` file for typos

### Client can't connect to server
- Verify server is running
- Check `VITE_SERVER_URL` in client `.env`
- Check browser console for CORS errors

### Map not loading
- Check browser console for errors
- Verify internet connection (OSM tiles require network)
- Try a different map style/provider

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

##  License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [MapLibre GL JS](https://maplibre.org/) - Map rendering
- [Socket.io](https://socket.io/) - Real-time communication
- [OpenStreetMap](https://www.openstreetmap.org/) - Map tiles
- [React](https://react.dev/) - UI framework
- [Vite](https://vite.dev/) - Build tool

---


