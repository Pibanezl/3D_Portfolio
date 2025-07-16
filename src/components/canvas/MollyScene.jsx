// src/components/canvas/MollyScene.jsx
import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import CanvasLoader from "../Loader";

const MollyModel = () => {
  const ref = useRef();
  const { scene } = useGLTF('/molly/scene.gltf');
  console.log('🐈 Model Loaded!')
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.002 // speed
    }
  });
  return (
    <primitive
      ref={ref}
      object={scene}
      scale={8}
      position={[0, -.4, 0]}
      rotation={[0.2, 0, 0]}
    />
  );
};

const MollyScene = () => {
  return (
    <div className="w-full h-screen">
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-0">
        <div className="w-[300px] h-[300px] bg-[#faf8e1] rounded-full blur-3xl opacity-20" style={{ transform: "translateY(100px)" }}/>
      </div>
      <Canvas camera={{ position: [-5, 0, 5], fov: 45 }}>
        <Suspense fallback={<CanvasLoader />}>
          <ambientLight intensity={3} />
          {/* <directionalLight position={[5, 5, 10]} intensity={2.5} /> */}
          <OrbitControls
            enableZoom={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
            target={[0, 0.4, 0]} />
          <MollyModel />
        </Suspense>

      </Canvas>

    </div>
  );
};

export default MollyScene;