import { createSignal, onCleanup, onMount } from "solid-js";
import {
  PerspectiveCamera,
  Mesh,
  MeshBasicMaterial,
  Scene,
  TorusGeometry,
  WebGLRenderer,
} from "three";

export default function Canvas() {
  const [canvas, setCanvas] = createSignal<HTMLCanvasElement>();
  const [camera, setCamera] = createSignal<PerspectiveCamera>();
  const [renderer, setRenderer] = createSignal<WebGLRenderer>();
  const [animationRequestId, setAnimationRequestId] = createSignal<number>();

  function onWindowResize() {
    const [cameraVal, rendererVal] = [camera(), renderer()];

    if (cameraVal && rendererVal) {
      const width = window.innerWidth;
      const height = window.innerHeight;

      cameraVal.aspect = width / height;
      cameraVal.updateProjectionMatrix();

      rendererVal.setSize(width, height);
    }
  }

  onMount(() => {
    const scene = new Scene();
    const cameraVal = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    setCamera(cameraVal);

    const canvasVal = canvas();

    if (!canvasVal) {
      throw new Error("can't find background canvas to render into");
    }

    const rendererVal = new WebGLRenderer({ canvas: canvasVal });
    setRenderer(rendererVal);

    rendererVal.setSize(window.innerWidth, window.innerHeight);

    window.addEventListener("resize", onWindowResize);

    cameraVal.position.set(0, 0, 30);
    cameraVal.lookAt(0, 0, 0);

    const geometry = new TorusGeometry(10, 3, 16, 100);
    const material = new MeshBasicMaterial({
      color: 0xff6347,
      wireframe: true,
    });
    const torus = new Mesh(geometry, material);

    scene.add(torus);

    // Loop function
    function animate() {
      rendererVal.render(scene, cameraVal);

      torus.rotation.x += 0.01;
      torus.rotation.y += 0.005;
      torus.rotation.z += 0.01;

      // TODO: Move into window.addEventListener('resize', ...)
      rendererVal.setSize(window.innerWidth, window.innerHeight);
      cameraVal.aspect = window.innerWidth / window.innerHeight;
      cameraVal.updateProjectionMatrix();

      const requestId = requestAnimationFrame(animate);
      setAnimationRequestId(requestId);
    }

    // Start loop
    if (!animationRequestId()) {
      animate();
    }
  });

  onCleanup(() => {
    window.addEventListener("resize", onWindowResize);

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
