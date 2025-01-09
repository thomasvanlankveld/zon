import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
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
  Group,
} from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

import { Size } from "../../primitives/createElementSize";
// import { SunburstNode } from "./Sunburst/types";

type CanvasProps = {
  chartSize: Size;
  // visibleNodes: SunburstNode[];
  // maxRadius: number;
};

const FIELD_OF_VIEW = 22; // Degrees vertically, from top to bottom of the screen

function cot(x: number) {
  return Math.cos(x) / Math.sin(x);
}

function getCameraZ(screenHeight: number) {
  return 0.5 * screenHeight * cot(0.5 * FIELD_OF_VIEW * (Math.PI / 180));
}

export default function Canvas(props: CanvasProps) {
  const chartX = () => props.chartSize.x();
  const chartY = () => props.chartSize.y();
  const chartHeight = () => props.chartSize.height();
  const chartWidth = () => props.chartSize.width();

  const [canvas, setCanvas] = createSignal<HTMLCanvasElement>();
  const [camera, setCamera] = createSignal<PerspectiveCamera>();
  const [renderer, setRenderer] = createSignal<WebGLRenderer>();
  const [composer, setComposer] = createSignal<EffectComposer>();
  const chartGroup = new Group();

  // createEffect(() => console.log(props.visibleNodes));
  // createEffect(() => console.log(props.maxRadius));

  function onChartResize() {
    const [cameraVal, rendererVal] = [camera(), renderer()];

    if (!chartGroup || !cameraVal || !rendererVal) {
      return;
    }

    chartGroup.position.x = chartX() + chartWidth() / 2;
    chartGroup.position.y = -chartY() - chartHeight() / 2;
    const torusScale = Math.min(chartHeight(), chartWidth());
    chartGroup.scale.set(torusScale, torusScale, torusScale);

    const [windowWidth, windowHeight] = [window.innerWidth, window.innerHeight];
    const cameraZ = getCameraZ(windowHeight);

    cameraVal.aspect = windowWidth / windowHeight;
    cameraVal.position.set(windowWidth / 2, -windowHeight / 2, cameraZ);
    cameraVal.lookAt(windowWidth / 2, -windowHeight / 2, 0);
    cameraVal.updateProjectionMatrix();

    rendererVal.setSize(windowWidth, windowHeight);
  }

  createEffect(onChartResize);

  // Loop function
  function animate() {
    const composerVal = composer();

    if (!chartGroup || !composerVal) {
      return;
    }

    chartGroup.rotation.x += 0.01;
    chartGroup.rotation.y += 0.005;
    chartGroup.rotation.z += 0.01;

    composerVal.render();
  }

  onMount(() => {
    const [width, height] = [window.innerWidth, window.innerHeight];

    const scene = new Scene();
    const cameraVal = new PerspectiveCamera(
      FIELD_OF_VIEW,
      width / height,
      1000,
      4000,
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
    rendererVal.setAnimationLoop(animate);
    setRenderer(rendererVal);

    const pointLight = new PointLight(0xffffff, 750_000_000);
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
    bloomPass.strength = 0.4;
    bloomPass.radius = 0.3;

    const outputPass = new OutputPass();

    const composerVal = new EffectComposer(rendererVal);
    composerVal.addPass(renderScene);
    composerVal.addPass(bloomPass);
    composerVal.addPass(outputPass);
    setComposer(composerVal);

    new OrbitControls(cameraVal, rendererVal.domElement);

    // Orange toruses
    const toruses = Array.from({ length: 4 }, () => {
      const torusGeometry = new TorusGeometry(0.4, 0.1, 16, 100);
      const torusMaterial = new MeshStandardMaterial({ color: 0xff6347 });

      torusGeometry.scale(0.5, 0.5, 0.5);

      return new Mesh(torusGeometry, torusMaterial);
    });
    toruses[0].position.x = -0.25;
    toruses[0].position.y = -0.25;
    toruses[1].position.x = -0.25;
    toruses[1].position.y = 0.25;
    toruses[2].position.x = 0.25;
    toruses[2].position.y = -0.25;
    toruses[3].position.x = 0.25;
    toruses[3].position.y = 0.25;
    toruses.forEach((torus) => chartGroup.add(torus));
    scene.add(chartGroup);

    // GUI
    const gui = new GUI();
    const params = { exposure: 1 };
    const lighting = gui.addFolder("lighting");
    lighting.add(pointLight, "intensity", 0, 100_0000_000);
    const bloomFolder = gui.addFolder("bloom");
    bloomFolder.add(bloomPass, "threshold", 0.0, 0.4);
    bloomFolder.add(bloomPass, "strength", 0.0, 2.0);
    gui.add(bloomPass, "radius", 0.0, 0.5).step(0.01);
    const toneMappingFolder = gui.addFolder("tone mapping");
    toneMappingFolder.add(params, "exposure", 0.1, 2).onChange((value) => {
      rendererVal.toneMappingExposure = Math.pow(value, 4.0);
    });

    // Run resize logic before starting the animation
    onChartResize();
  });

  onCleanup(() => {
    renderer()?.setAnimationLoop(null);
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
