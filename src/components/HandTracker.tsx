import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useStore, GestureType } from '../store/useStore';

export const HandTracker = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const setGesture = useStore((state) => state.setGesture);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        
        setLoaded(true);
        startVideo();
      } catch (error) {
        console.error("Error initializing hand tracker:", error);
      }
    };
    
    init();
    
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const startVideo = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predictWebcam);
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    }
  };

  const predictWebcam = () => {
    if (!handLandmarkerRef.current || !videoRef.current) return;
    
    const nowInMs = Date.now();
    const results = handLandmarkerRef.current.detectForVideo(videoRef.current, nowInMs);
    
    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0];
      
      // Geometric Gesture Recognition
      // Landmarks:
      // 0: Wrist
      // 4: Thumb Tip
      // 8: Index Tip
      // 12: Middle Tip
      // 16: Ring Tip
      // 20: Pinky Tip
      
      // Helper to check if finger is extended
      // Compare tip y to pip y (assuming hand is upright)
      // Better: Compare distance from wrist to tip vs wrist to pip
      
      const isExtended = (tipIdx: number, pipIdx: number) => {
        const wrist = landmarks[0];
        const tip = landmarks[tipIdx];
        const pip = landmarks[pipIdx];
        
        const dTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
        const dPip = Math.hypot(pip.x - wrist.x, pip.y - wrist.y);
        
        return dTip > dPip;
      };
      
      const thumbExtended = isExtended(4, 2);
      const indexExtended = isExtended(8, 6);
      const middleExtended = isExtended(12, 10);
      const ringExtended = isExtended(16, 14);
      const pinkyExtended = isExtended(20, 18);
      
      let gesture: GestureType = 'open'; // Default
      
      const extendedCount = [thumbExtended, indexExtended, middleExtended, ringExtended, pinkyExtended].filter(Boolean).length;
      
      if (extendedCount <= 1 && !indexExtended && !middleExtended) {
        gesture = 'closed'; // Fist
      } else if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
        gesture = 'victory'; // V Sign
      } else if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
        gesture = 'pointing'; // Pointing (Peace finger?)
      } else if (extendedCount >= 4) {
        gesture = 'open'; // Open Hand
      } else {
        // Ambiguous, keep previous or default to open
        gesture = 'open';
      }
      
      setGesture(gesture, true);
    } else {
      setGesture('none', false);
    }
    
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="fixed bottom-4 right-4 w-24 h-16 md:w-32 md:h-24 bg-black/50 rounded-lg overflow-hidden border border-white/20 z-30 pointer-events-none opacity-50 md:opacity-100 transition-opacity">
      {!loaded && <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white">Loading...</div>}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline
        muted
        className="w-full h-full object-cover opacity-80 transform scale-x-[-1]"
      />
    </div>
  );
};
