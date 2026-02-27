import { useStore } from './store/useStore';
import Lobby from './components/Lobby';
import MapView from './components/MapView';


export default function App() {
  const { sessionId, role } = useStore();

  const isInSession = !!sessionId && !!role;

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {isInSession ? <MapView /> : <Lobby />}
    </div>
  );
}