// Based on: https://github.com/mrdoob/three.js/blob/master/examples/webgpu_postprocessing_bloom_selective.html
// This code results in the following warnings:
// [Warning] THREE.Renderer: .render() called before the backend is initialized. Try using .renderAsync() instead. (chunk-7S5D7JM3.js, line 22481)
// [Warning] THREE.WebGPURenderer: WebGPU is not available, running under WebGL2 backend. (chunk-7S5D7JM3.js, line 32455)

import { createSignal, onCleanup, onMount } from "solid-js";
import {
  PerspectiveCamera,
  Mesh,
  MeshBasicMaterial,
  Scene,
  TorusGeometry,
  NeutralToneMapping,
  // WebGLRenderer,
} from "three";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";
import { float, mrt, output, pass, uniform } from "three/tsl";
import {
  MeshBasicNodeMaterial,
  PostProcessing,
  WebGPURenderer,
} from "three/webgpu";

export default function Canvas() {
  const [canvas, setCanvas] = createSignal<HTMLCanvasElement>();
  const [camera, setCamera] = createSignal<PerspectiveCamera>();
  // const [renderer, setRenderer] = createSignal<WebGLRenderer>();
  const [renderer, setRenderer] = createSignal<WebGPURenderer>();
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

    // Basic renderer
    // const rendererVal = new WebGLRenderer({ canvas: canvasVal });

    // Bloom renderer
    const rendererVal = new WebGPURenderer();
    setRenderer(rendererVal);

    rendererVal.setPixelRatio(window.devicePixelRatio);
    rendererVal.setSize(window.innerWidth, window.innerHeight);
    rendererVal.toneMapping = NeutralToneMapping;

    window.addEventListener("resize", onWindowResize);

    cameraVal.position.set(0, 0, 30);
    cameraVal.lookAt(0, 0, 0);

    const geometry = new TorusGeometry(10, 3, 16, 100);
    // // Basic material
    // const material = new MeshBasicMaterial({ color: 0xff6347 });

    // Bloom material
    const bloomIntensity = uniform(1);
    const material = new MeshBasicNodeMaterial({ color: 0xff6347 });
    material.mrtNode = mrt({ bloomIntensity });

    const torus = new Mesh(geometry, material);

    scene.add(torus);

    // Post processing (Not sure what this does)
    const scenePass = pass(scene, cameraVal);
    scenePass.setMRT(mrt({ output, bloomIntensity: float(0) }));
    const outputPass = scenePass.getTextureNode();
    const bloomIntensityPass = scenePass.getTextureNode("bloomIntensity");
    const bloomPass = bloom(outputPass.mul(bloomIntensityPass));
    const postProcessing = new PostProcessing(rendererVal);
    postProcessing.outputColorTransform = false;
    postProcessing.outputNode = outputPass.add(bloomPass).renderOutput();

    // Loop function
    function animate() {
      rendererVal
        .render(scene, cameraVal)
        ?.catch((error) => console.error(error));

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
