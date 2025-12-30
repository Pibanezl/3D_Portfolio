// src/components/Tech2.jsx
import React, { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { technologies } from "../constants";

const LogoExtruded = ({ icon, size = 1.2, thickness = 0.2 }) => {
  const ref = useRef();
  const groupRef = useRef();

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.6;
  });

  useEffect(() => {
    const loader = new SVGLoader();

    loader.load(
      icon,
      (data) => {
        const group = new THREE.Group();

        data.paths.forEach((path) => {
          const shapes = SVGLoader.createShapes(path);

          shapes.forEach((shape) => {
            const geometry = new THREE.ExtrudeGeometry(shape, {
              depth: thickness,
              bevelEnabled: false,
            });

            const material = new THREE.MeshStandardMaterial({
              color: path.color || "#ffffff",
              side: THREE.DoubleSide,
            });

            const mesh = new THREE.Mesh(geometry, material);
            group.add(mesh);
          });
        });

        // Corregir que el SVG viene invertido
        group.rotation.x = Math.PI;

        // Normalizar tamaño
        const scale = size / 400;
        group.scale.set(scale, scale, 1);

        // Centrar el grupo completo
        const box = new THREE.Box3().setFromObject(group);
        const center = new THREE.Vector3();
        box.getCenter(center);
        group.position.sub(center);

        groupRef.current.add(group);
      },
      undefined,
      (err) => console.error("SVG load error:", err)
    );
  }, [icon]);

  return (
    <group ref={ref}>
      <group ref={groupRef} />
    </group>
  );
};

const Tech2 = () => {
  return (
    <div className="flex flex-row flex-wrap justify-center gap-10">
      {technologies.map((tech) => (
        <div className="relative w-28 h-28" key={tech.name}>
          
          {/* ⭐ Glow detrás del logo */}
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-0">
            <div
              className="w-[100px] h-[100px] bg-[#fff] rounded-full blur-2xl opacity-20"
              style={{ transform: "translateY(10px)" }}
            />
          </div>

          {/* Canvas encima del glow */}
          <Canvas camera={{ position: [0, 0, 2.2], fov: 50 }} className="relative z-10">
            <ambientLight intensity={0.9} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />

            <Suspense fallback={null}>
              <LogoExtruded icon={tech.icon} />
            </Suspense>

            <OrbitControls enablePan={false} enableZoom={true} />
          </Canvas>
        </div>
      ))}
    </div>
  );
};

export default Tech2;