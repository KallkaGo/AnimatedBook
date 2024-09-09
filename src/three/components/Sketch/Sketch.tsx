import { Environment, OrbitControls, useEnvironment } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useInteractStore, useLoadedStore } from "@utils/Store";
import { useEffect, useRef } from "react";
import Book from "../Book/Book";

const Sketch = () => {
  const hdr = useEnvironment({ files: "/hdrs/studio.hdr" });

  const scene = useThree((state) => state.scene);

  const controlDom = useInteractStore((state) => state.controlDom);

  useEffect(() => {
    useLoadedStore.setState({ ready: true });
    scene.environment = hdr;
  }, []);

  return (
    <>
      <OrbitControls domElement={controlDom} />
      <ambientLight intensity={5} />
      <directionalLight
        position={[2, 5, 2]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      ></directionalLight>
      <Book />
    </>
  );
};

export default Sketch;
