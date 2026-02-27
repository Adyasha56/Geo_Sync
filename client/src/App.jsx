import { useState } from 'react';
import { useStore } from './store/useStore';
import LandingPage from './pages/LandingPage';
import Lobby from './components/Lobby';
import MapView from './components/MapView';


export default function App() {
  const { sessionId, role } = useStore();
  const [showLanding, setShowLanding] = useState(true);

  const isInSession = !!sessionId && !!role;

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  const handleBackToLanding = () => {
    setShowLanding(true);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {showLanding ? (
        <LandingPage onGetStarted={handleGetStarted} />
      ) : isInSession ? (
        <MapView />
      ) : (
        <Lobby onBackToLanding={handleBackToLanding} />
      )}
    </div>
  );
}