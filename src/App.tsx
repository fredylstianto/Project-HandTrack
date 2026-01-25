import { Scene } from './components/Scene';
import { UI } from './components/UI';
import { HandTracker } from './components/HandTracker';
import { useStore } from './store/useStore';
import { useEffect } from 'react';

function App() {
  const isFullscreen = useStore((state) => state.isFullscreen);

  useEffect(() => {
    if (isFullscreen) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error("Fullscreen failed:", e);
      });
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((e) => {
          console.error("Exit fullscreen failed:", e);
        });
      }
    }
  }, [isFullscreen]);

  return (
    <div className="relative w-full h-dvh overflow-hidden bg-black text-white font-sans selection:bg-cyan-500/30 touch-none">
      <Scene />
      <UI />
      <HandTracker />
    </div>
  );
}

export default App;
