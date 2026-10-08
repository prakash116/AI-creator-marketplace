'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/** Lightweight particle orb + rings. ~2.4k points, no textures, no post-processing. */
function ParticleOrb() {
  const group = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 2400;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const violet = new THREE.Color('#8b5cf6');
    const cyan = new THREE.Color('#22d3ee');
    for (let i = 0; i < count; i++) {
      // Fibonacci sphere with slight radial noise
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = Math.PI * (3 - Math.sqrt(5)) * i;
      const radius = 2.1 + (Math.random() - 0.5) * 0.18;
      positions[i * 3] = Math.cos(theta) * r * radius;
      positions[i * 3 + 1] = y * radius;
      positions[i * 3 + 2] = Math.sin(theta) * r * radius;
      const c = violet.clone().lerp(cyan, (y + 1) / 2);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.08;
    const { x, y } = state.pointer;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, y * 0.25, 0.04);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, -x * 0.15, 0.04);
    if (points.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.015;
      points.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={group}>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.022} vertexColors transparent opacity={0.85} sizeAttenuation depthWrite={false} />
      </points>
      {[2.9, 3.4].map((r, i) => (
        <mesh key={r} rotation={[Math.PI / 2.2 + i * 0.3, i * 0.4, 0]}>
          <torusGeometry args={[r, 0.004, 8, 160]} />
          <meshBasicMaterial color={i ? '#22d3ee' : '#8b5cf6'} transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      style={{ pointerEvents: 'none' }}
    >
      <ParticleOrb />
    </Canvas>
  );
}
