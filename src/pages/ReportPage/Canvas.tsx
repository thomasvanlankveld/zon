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
  PlaneGeometry,
} from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

import { Size } from "../../primitives/createElementSize";

type CanvasProps = {
  chartSize: Size;
};

const FIELD_OF_VIEW = 22; // Degrees vertically, from top to bottom of the screen

function cot(x: number) {
  return Math.cos(x) / Math.sin(x);
}

function getCameraZ(screenHeight: number) {
  return 0.5 * screenHeight * cot(0.5 * FIELD_OF_VIEW * (Math.PI / 180));
}

export default function Canvas(props: CanvasProps) {
  const [canvas, setCanvas] = createSignal<HTMLCanvasElement>();
  const [camera, setCamera] = createSignal<PerspectiveCamera>();
  const [renderer, setRenderer] = createSignal<WebGLRenderer>();
  const [animationRequestId, setAnimationRequestId] = createSignal<number>();

  function onWindowResize() {
    const [cameraVal, rendererVal] = [camera(), renderer()];

    if (cameraVal && rendererVal) {
      const [width, height] = [window.innerWidth, window.innerHeight];
      const cameraZ = getCameraZ(height);

      cameraVal.aspect = width / height;
      cameraVal.position.set(width / 2, -height / 2, cameraZ);
      cameraVal.lookAt(width / 2, -height / 2, 0);
      cameraVal.updateProjectionMatrix();

      rendererVal.setSize(width, height);
    }
  }

  // Loop function
  function createAnimation(
    composer: EffectComposer,
    torus0: Mesh,
    torus1: Mesh,
  ) {
    function animate() {
      torus0.rotation.x += 0.01;
      torus0.rotation.y += 0.005;
      torus0.rotation.z += 0.01;

      torus1.rotation.x += 0.005;
      torus1.rotation.y += 0.01;
      torus1.rotation.z += 0.015;

      composer.render();

      const requestId = requestAnimationFrame(animate);
      setAnimationRequestId(requestId);
    }

    return animate;
  }

  onMount(() => {
    const [width, height] = [window.innerWidth, window.innerHeight];

    const scene = new Scene();
    const cameraVal = new PerspectiveCamera(
      FIELD_OF_VIEW,
      width / height,
      10,
      100_000,
    );

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

    const pointLight = new PointLight(0xffffff, 400_000_000);
    pointLight.position.set(10_000, 10_000, 10_000);
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
    bloomPass.strength = 0.3;
    bloomPass.radius = 0.2;

    const outputPass = new OutputPass();

    const composer = new EffectComposer(rendererVal);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);

    new OrbitControls(cameraVal, rendererVal.domElement);

    console.log({
      x: props.chartSize.x(),
      y: props.chartSize.y(),
      height: props.chartSize.height(),
      width: props.chartSize.width(),
    });

    // Orange torus
    const geometry0 = new TorusGeometry(0.4, 0.1, 16, 100);
    const material0 = new MeshStandardMaterial({
      color: 0xff6347,
    });
    const torus0 = new Mesh(geometry0, material0);
    torus0.position.x = props.chartSize.x() + props.chartSize.width() / 2;
    torus0.position.y = -props.chartSize.y() - props.chartSize.height() / 2;
    const scale = Math.min(props.chartSize.height(), props.chartSize.width());
    torus0.scale.set(scale, scale, scale);
    scene.add(torus0);

    // Plane representing the entire window
    const plane1Geometry = new PlaneGeometry(
      window.innerWidth,
      window.innerHeight,
    );
    const plane1Material = new MeshStandardMaterial({
      color: 0xcccccc,
    });
    const plane1 = new Mesh(plane1Geometry, plane1Material);
    plane1.position.x = 0 + window.innerWidth / 2;
    plane1.position.y = 0 - window.innerHeight / 2;
    plane1.position.z = -0.1;
    scene.add(plane1);

    // Plane representing the space occupied by the chart
    const plane0Geometry = new PlaneGeometry(
      props.chartSize.width(),
      props.chartSize.height(),
    );
    const plane0Material = new MeshStandardMaterial({
      color: 0x888888,
    });
    const plane0 = new Mesh(plane0Geometry, plane0Material);
    plane0.position.x = props.chartSize.x() + props.chartSize.width() / 2;
    plane0.position.y = -props.chartSize.y() - props.chartSize.height() / 2;
    scene.add(plane0);

    // Teal torus
    const geometry1 = new TorusGeometry(20, 2, 16, 100);
    const material1 = new MeshStandardMaterial({
      color: 0x00b3b3,
    });
    const torus1 = new Mesh(geometry1, material1);
    scene.add(torus1);

    // GUI
    const gui = new GUI();
    const params = { exposure: 1 };
    const lighting = gui.addFolder("lighting");
    lighting.add(pointLight, "intensity", 0, 10_0000_000);
    const bloomFolder = gui.addFolder("bloom");
    bloomFolder.add(bloomPass, "threshold", 0.0, 0.4);
    bloomFolder.add(bloomPass, "strength", 0.0, 2.0);
    gui.add(bloomPass, "radius", 0.0, 0.5).step(0.01);
    const toneMappingFolder = gui.addFolder("tone mapping");
    toneMappingFolder.add(params, "exposure", 0.1, 2).onChange((value) => {
      rendererVal.toneMappingExposure = Math.pow(value, 4.0);
    });

    // Start loop
    if (!animationRequestId()) {
      onWindowResize();
      const animate = createAnimation(composer, torus0, torus1);
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
