import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stars } from '@react-three/drei';
import { Particles } from './Particles';
import { Suspense } from 'react';

export const Scene = () => {
  return (
    <div className="absolute inset-0 bg-[#050505]">
      <Canvas camera={{ position: [0, 0, 12], fov: 50 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Particles />
          <OrbitControls 
            makeDefault
            enableZoom={false} 
            enablePan={false} 
            enableRotate={false}
            autoRotate={false}
            minDistance={2}
            maxDistance={50}
          />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
};
