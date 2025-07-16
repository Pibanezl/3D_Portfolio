// src/components/canvas/TestScene.jsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const TestCube = () => {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
};

const TestScene = () => {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 1, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <OrbitControls />
        <TestCube />
      </Canvas>
    </div>
  );
};

export default TestScene;