"use client";

import { useRef, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";

function DottedSurface() {
    const pointsRef = useRef<THREE.Points>(null);

    const gridSize = 50;
    const spacing = 1.5;

    const { positions, color } = useMemo(() => {
        const positions = new Float32Array(gridSize * gridSize * 3);
        const color = new THREE.Color(0.08, 0.72, 0.65); // Teal

        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const index = (i * gridSize + j) * 3;
                positions[index] = (i - gridSize / 2) * spacing;
                positions[index + 1] = 0;
                positions[index + 2] = (j - gridSize / 2) * spacing;
            }
        }
        return { positions, color };
    }, [gridSize, spacing]);

    useFrame((state) => {
        if (!pointsRef.current) return;
        const time = state.clock.getElapsedTime();
        const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const index = (i * gridSize + j) * 3;
                const x = positions[index];
                const z = positions[index + 2];
                positions[index + 1] = Math.sin(x * 0.2 + time) * 2 + Math.cos(z * 0.2 + time) * 2;
            }
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                {/* @ts-expect-error - r3f type discrepancy */}
                <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.15} color={color} transparent opacity={0.6} />
        </points>
    );
}

export default function ThreeBackground() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
            <Canvas camera={{ position: [0, 15, 30], fov: 60 }}>
                <DottedSurface />
            </Canvas>
        </div>
    );
}
