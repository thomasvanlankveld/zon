import { createSignal, onCleanup, onMount } from "solid-js";
import {
  PerspectiveCamera,
  Mesh,
  Scene,
  TorusGeometry,
  WebGLRenderer,
  AmbientLight,
  PointLight,
  MeshStandardMaterial,
  ReinhardToneMapping,
  Vector2,
} from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

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
    cameraVal.position.set(0, 0, 30);
    cameraVal.lookAt(0, 0, 0);

    setCamera(cameraVal);

    const canvasVal = canvas();

    if (!canvasVal) {
      throw new Error("can't find background canvas to render into");
    }

    const rendererVal = new WebGLRenderer({
      canvas: canvasVal,
      antialias: true,
    });
    rendererVal.setPixelRatio(window.devicePixelRatio);
    rendererVal.setSize(window.innerWidth, window.innerHeight);
    rendererVal.toneMapping = ReinhardToneMapping;
    setRenderer(rendererVal);

    window.addEventListener("resize", onWindowResize);

    const pointLight = new PointLight(0xffffff, 4000);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);
    scene.add(new AmbientLight(0xcccccc, 0.1));

    const renderScene = new RenderPass(scene, cameraVal);

    const bloomPass = new UnrealBloomPass(
      new Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85,
    );
    bloomPass.threshold = 0.2;
    bloomPass.strength = 0.25;
    bloomPass.radius = 0.1;

    const outputPass = new OutputPass();

    const composer = new EffectComposer(rendererVal);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);

    new OrbitControls(cameraVal, rendererVal.domElement);

    const geometry = new TorusGeometry(10, 3, 16, 100);
    const material = new MeshStandardMaterial({
      color: 0xff6347,
    });
    const torus = new Mesh(geometry, material);

    scene.add(torus);

    // GUI
    const gui = new GUI();
    const params = { exposure: 1 };
    const lighting = gui.addFolder("lighting");
    lighting.add(pointLight, "intensity", 0, 10000);
    const bloomFolder = gui.addFolder("bloom");
    bloomFolder.add(bloomPass, "threshold", 0.0, 0.4);
    bloomFolder.add(bloomPass, "strength", 0.0, 2.0);
    gui.add(bloomPass, "radius", 0.0, 0.5).step(0.01);
    const toneMappingFolder = gui.addFolder("tone mapping");
    toneMappingFolder.add(params, "exposure", 0.1, 2).onChange((value) => {
      rendererVal.toneMappingExposure = Math.pow(value, 4.0);
    });

    // Loop function
    function animate() {
      // rendererVal.render(scene, cameraVal);
      composer.render();

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
        // "z-index": "-1",
      }}
    />
  );
}
