import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';

// Helper function to delay between tests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
  console.log('\n Starting GeoSync Endpoint Tests\n');

  // Test 1: Health Check
  console.log('─'.repeat(60));
  console.log('TEST 1: Health Check (REST)');
  console.log('─'.repeat(60));
  try {
    const healthRes = await fetch(`${SERVER_URL}/health`);
    const healthData = await healthRes.json();
    console.log('GET /health');
    console.log('Response:', JSON.stringify(healthData, null, 2));
  } catch (err) {
    console.error(' Health check failed:', err.message);
    return;
  }

  await delay(1000);

  // Test 2: Create Session
  console.log('\n' + '─'.repeat(60));
  console.log('TEST 2: Create Session (Socket.io)');
  console.log('─'.repeat(60));

  const socket1 = io(SERVER_URL);
  let sessionId = null;

  await new Promise((resolve) => {
    socket1.on('connect', () => {
      console.log(' Socket 1 Connected:', socket1.id);
      
      socket1.emit('session:create', (response) => {
        console.log(' session:create event');
        console.log('Response:', JSON.stringify(response, null, 2));
        sessionId = response.sessionId;
        resolve();
      });
    });
  });

  await delay(1000);

  // Test 3: Check Session Exists (REST)
  console.log('\n' + '─'.repeat(60));
  console.log('TEST 3: Check Session Exists (REST)');
  console.log('─'.repeat(60));
  try {
    const sessionRes = await fetch(`${SERVER_URL}/api/session/${sessionId}`);
    const sessionData = await sessionRes.json();
    console.log(` GET /api/session/${sessionId}`);
    console.log('Response:', JSON.stringify(sessionData, null, 2));
  } catch (err) {
    console.error(' Session check failed:', err.message);
  }

  await delay(1000);

  // Test 4: Join Session as Tracker
  console.log('\n' + '─'.repeat(60));
  console.log('TEST 4: Join Session as Tracker');
  console.log('─'.repeat(60));

  await new Promise((resolve) => {
    socket1.emit('session:join',
      { sessionId, preferredRole: 'tracker' },
      (response) => {
        console.log('session:join event (Tracker)');
        console.log('Response:', JSON.stringify(response, null, 2));
        resolve();
      }
    );
  });

  await delay(1000);

  // Test 5: Connect second socket and join as Tracked
  console.log('\n' + '─'.repeat(60));
  console.log('TEST 5: Join Same Session as Tracked (Socket 2)');
  console.log('─'.repeat(60));

  const socket2 = io(SERVER_URL);

  await new Promise((resolve) => {
    socket2.on('connect', () => {
      console.log('Socket 2 Connected:', socket2.id);
      
      socket2.emit('session:join',
        { sessionId, preferredRole: 'tracked' },
        (response) => {
          console.log('session:join event (Tracked)');
          console.log('Response:', JSON.stringify(response, null, 2));
          resolve();
        }
      );
    });
  });

  await delay(1000);

  // Test 6: Listen for peer joined event
  console.log('\n' + '─'.repeat(60));
  console.log('TEST 6: Peer Joined Event');
  console.log('─'.repeat(60));

  socket1.on('session:peer_joined', (data) => {
    console.log('session:peer_joined event received on Socket 1');
    console.log('Data:', JSON.stringify(data, null, 2));
  });

  socket2.on('session:peer_joined', (data) => {
    console.log('session:peer_joined event received on Socket 2');
    console.log('Data:', JSON.stringify(data, null, 2));
  });

  await delay(1000);

  // Test 7: Tracker broadcasts map update
  console.log('\n' + '─'.repeat(60));
  console.log('TEST 7: Map Update (Tracker broadcasts)');
  console.log('─'.repeat(60));

  const mapState = {
    lat: 40.7128,
    lng: -74.0060,
    zoom: 14.5,
    bearing: 45,
    pitch: 30,
  };

  socket2.on('map:sync', (data) => {
    console.log('map:sync event received on Socket 2 (Tracked)');
    console.log('Map State:', JSON.stringify(data, null, 2));
  });

  await new Promise((resolve) => {
    socket1.emit('map:update', mapState, (response) => {
      console.log('map:update event emitted from Socket 1 (Tracker)');
      console.log('Payload:', JSON.stringify(mapState, null, 2));
      console.log('Server Response:', JSON.stringify(response, null, 2));
      resolve();
    });
  });

  await delay(1000);

  // Test 8: Tracked requests sync
  console.log('\n' + '─'.repeat(60));
  console.log('TEST 8: Map Request Sync (Tracked requests)');
  console.log('─'.repeat(60));

  await new Promise((resolve) => {
    socket2.emit('map:request_sync', (response) => {
      console.log('map:request_sync event emitted from Socket 2');
      console.log('Response:', JSON.stringify(response, null, 2));
      resolve();
    });
  });

  await delay(1000);

  // Test 9: Leave Session
  console.log('\n' + '─'.repeat(60));
  console.log('TEST 9: Leave Session');
  console.log('─'.repeat(60));

  socket2.on('session:peer_disconnected', (data) => {
    console.log('session:peer_disconnected event received on Socket 1');
    console.log('Data:', JSON.stringify(data, null, 2));
  });

  await new Promise((resolve) => {
    socket2.emit('session:leave', (response) => {
      console.log('session:leave event from Socket 2');
      console.log('Response:', JSON.stringify(response, null, 2));
      resolve();
    });
  });

  await delay(1000);

  // Cleanup
  socket1.disconnect();
  socket2.disconnect();

  console.log('\n' + '─'.repeat(60));
  console.log('All tests completed!');
  console.log('─'.repeat(60) + '\n');

  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
