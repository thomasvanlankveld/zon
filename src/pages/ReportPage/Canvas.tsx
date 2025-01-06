import { createSignal, onCleanup, onMount } from "solid-js";
import * as THREE from "three";

export default function Canvas() {
  const [canvas, setCanvas] = createSignal<HTMLCanvasElement>();
  const [animationRequestId, setAnimationRequestId] = createSignal<number>();

  onMount(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    const canvasVal = canvas();

    if (!canvasVal) {
      throw new Error("can't find background canvas to render into");
    }

    const renderer = new THREE.WebGLRenderer({ canvas: canvasVal });

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.set(0, 0, 30);
    camera.lookAt(0, 0, 0);

    const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff6347,
      wireframe: true,
    });
    const torus = new THREE.Mesh(geometry, material);

    scene.add(torus);

    // Loop function
    function animate() {
      renderer.render(scene, camera);

      torus.rotation.x += 0.01;
      torus.rotation.y += 0.005;
      torus.rotation.z += 0.01;

      // TODO: Move into window.addEventListener('resize', ...)
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      const requestId = requestAnimationFrame(animate);
      setAnimationRequestId(requestId);
    }

    // Start loop
    if (!animationRequestId()) {
      animate();
    }
  });

  onCleanup(() => {
    // Stop loop
    const requestId = animationRequestId();
    if (requestId) {
      cancelAnimationFrame(requestId);
    }
  });

  return (
    <canvas
      ref={setCanvas}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        "z-index": "-1",
      }}
    />
  );
}
