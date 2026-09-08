import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useStore, PatternType } from '../store/useStore';

const COUNT = 15000;

// Helper to generate text points
const getTextPoints = (text: string, count: number) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return new Float32Array(count * 3);

  // Increased canvas width to fit long text
  canvas.width = 1200;
  canvas.height = 300;
  
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = 'white';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  const validPixels: {x: number, y: number}[] = [];
  
  for (let y = 0; y < canvas.height; y += 2) {
    for (let x = 0; x < canvas.width; x += 2) {
      const i = (y * canvas.width + x) * 4;
      if (data[i] > 128) { // If pixel is bright
        // Scale down significantly to fit screen
        // Canvas width 1200 -> Target width ~8 units (increased from 6)
        // Scale factor ~150 (was 200)
        validPixels.push({
          x: (x - canvas.width / 2) / 150, 
          y: -(y - canvas.height / 2) / 150
        });
      }
    }
  }
  
  const positions = new Float32Array(count * 3);
  
  if (validPixels.length === 0) return positions;

  for (let i = 0; i < count; i++) {
    const pixel = validPixels[i % validPixels.length];
    const i3 = i * 3;
    
    // Add some depth and jitter
    positions[i3] = pixel.x + (Math.random() - 0.5) * 0.05;
    positions[i3 + 1] = pixel.y + (Math.random() - 0.5) * 0.05;
    positions[i3 + 2] = (Math.random() - 0.5) * 0.2; // Reduced depth
  }
  
  return positions;
};

const getPatternPositions = (type: PatternType, count: number) => {
  const positions = new Float32Array(count * 3);
  
  if (type === 'text') {
    return getTextPoints("HAII NIKII CANTIKKK", count);
  }

  for (let i = 0; i < count; i++) {
    let x, y, z;
    const i3 = i * 3;
    
    if (type === 'heart') {
      // Heart shape
      const t = Math.random() * 2 * Math.PI;
      const r = Math.sqrt(Math.random()); // Volume
      
      // Base heart curve
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
      
      // Scale down significantly (0.3 -> 0.12)
      const s = 0.12;
      
      x = hx * s * r;
      y = hy * s * r;
      z = (Math.random() - 0.5) * 2 * r; // Reduced thickness
      
    } else if (type === 'saturn') {
      // Saturn: Sphere + Ring
      const isRing = Math.random() > 0.6; 
      
      if (isRing) {
        // Ring
        const angle = Math.random() * 2 * Math.PI;
        const dist = 2.5 + Math.random() * 1.5; // Reduced radius (2.5-4)
        x = Math.cos(angle) * dist;
        z = Math.sin(angle) * dist;
        y = (Math.random() - 0.5) * 0.1; 
      } else {
        // Planet
        const r = 1.5 * Math.cbrt(Math.random()); // Reduced radius
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
      }
      
      // Tilt Saturn
      const tilt = 0.4; 
      const yNew = y * Math.cos(tilt) - z * Math.sin(tilt);
      const zNew = y * Math.sin(tilt) + z * Math.cos(tilt);
      y = yNew;
      z = zNew;

    } else { // random / open
      // Cloud / Galaxy mix
      const r = 4 * Math.cbrt(Math.random()); // Reduced radius (10 -> 4)
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      x = r * Math.sin(phi) * Math.cos(theta);
      y = r * Math.sin(phi) * Math.sin(theta);
      z = r * Math.cos(phi);
    }
    
    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
  }
  return positions;
};

export const Particles = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const { pattern, color } = useStore();
  
  // Current positions (state)
  const currentPositions = useMemo(() => new Float32Array(COUNT * 3), []);
  // Target positions (based on pattern)
  const targetPositions = useMemo(() => getPatternPositions(pattern, COUNT), [pattern]);
  
  // Colors
  const colors = useMemo(() => new Float32Array(COUNT * 3), []);
  
  // Initialize
  useEffect(() => {
    const start = getPatternPositions('random', COUNT);
    currentPositions.set(start);
  }, []);

  // Update target when pattern changes
  useEffect(() => {
    const newTargets = getPatternPositions(pattern, COUNT);
    targetPositions.set(newTargets);
  }, [pattern]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const colorAttribute = pointsRef.current.geometry.attributes.color;
    const time = state.clock.getElapsedTime();
    
    // Color Logic
    const targetColor = new THREE.Color();
    
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      
      // Movement
      const tx = targetPositions[i3];
      const ty = targetPositions[i3 + 1];
      const tz = targetPositions[i3 + 2];
      
      // Noise
      const noise = Math.sin(time + i) * 0.05;
      
      // Lerp position
      positions[i3] += (tx - positions[i3]) * 2 * delta;
      positions[i3 + 1] += (ty - positions[i3 + 1]) * 2 * delta;
      positions[i3 + 2] += (tz - positions[i3 + 2]) * 2 * delta;
      
      // Color
      if (color === 'random') {
        // Rainbow based on position or index
        targetColor.setHSL((i / COUNT + time * 0.1) % 1, 0.8, 0.6);
      } else {
        targetColor.set(color);
      }
      
      // Lerp color (simple approach: direct set for responsiveness)
      colors[i3] = targetColor.r;
      colors[i3 + 1] = targetColor.g;
      colors[i3 + 2] = targetColor.b;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    colorAttribute.needsUpdate = true;
    
    // Rotate - Disabled
    // pointsRef.current.rotation.y = time * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={currentPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={COUNT}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
