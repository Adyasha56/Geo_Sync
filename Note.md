/server
  /src
    index.js          — Express + Socket.io init
    socket/
      roomHandler.js  — join, leave, role assignment
      mapHandler.js   — map:update, broadcast logic
    services/
      redis.js        — Redis client + session helpers
    
/client
  /src
    components/
      Map.jsx         — Maplibre instance
      HUD.jsx         — floating overlay
      RoleBadge.jsx   — Tracker/Tracked indicator
    store/
      mapStore.js     — Zustand: coords, zoom, role
      socketStore.js  — Zustand: connection status
    hooks/
      useMapSync.js   — all socket emit/listen logic isolated here