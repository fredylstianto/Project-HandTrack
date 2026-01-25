import { create } from 'zustand';

export type GestureType = 'open' | 'closed' | 'victory' | 'pointing' | 'none';
export type PatternType = 'random' | 'saturn' | 'heart' | 'text';

interface AppState {
  // Gesture State
  gesture: GestureType;
  handPresent: boolean;
  
  // Visual State
  pattern: PatternType;
  color: string;
  isFullscreen: boolean;
  
  // Actions
  setGesture: (gesture: GestureType, present: boolean) => void;
  toggleFullscreen: () => void;
}

export const useStore = create<AppState>((set) => ({
  gesture: 'none',
  handPresent: false,
  pattern: 'random',
  color: '#ffffff',
  isFullscreen: false,
  
  setGesture: (gesture, present) => set((state) => {
    // Map gesture to pattern and color
    let pattern: PatternType = state.pattern;
    let color = state.color;

    if (present) {
      switch (gesture) {
        case 'open':
          pattern = 'random';
          color = 'random'; 
          break;
        case 'closed': // Fist
          pattern = 'saturn';
          color = '#00ffff'; // Cyan
          break;
        case 'victory': // V sign -> Text (Swapped)
          pattern = 'text';
          color = '#f5f5dc'; // Cream (Beige)
          break;
        case 'pointing': // Pointing -> Heart (Swapped)
          pattern = 'heart';
          color = '#ff69b4'; // Pink (HotPink)
          break;
      }
    }

    return { gesture, handPresent: present, pattern, color };
  }),
  
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
}));
