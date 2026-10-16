/* Three.js cube disintegration for the landing cubes. ES module.
   index.js imports this on the first hover or focus of a lens, so Three.js
   is never fetched on page load. play() draws the clicked cube as a grid of
   fragments in one InstancedMesh and blows it outward from the clicked face. */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js";

const DEG = Math.PI / 180;

// Outward normal of each CSS face, in Three's y-up space
const FACE_NORMALS = {
  front: [0, 0, 1], back: [0, 0, -1],
  right: [1, 0, 0], left: [-1, 0, 0],
  top: [0, 1, 0], bottom: [0, -1, 0],
};

let stage = null; // { renderer, scene, camera, mesh, geometry, material, frame }

export function supported() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) {
    return false;
  }
}

function parseColour(css) {
  const m = css.match(/rgba?\(([^)]+)\)/);
  if (!m) return { rgb: [130, 170, 255], a: 0.92 };
  const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
  return { rgb: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 };
}

// The CSS cube's current rotation (includes the float animation), converted to y-up
function cubeQuaternion(cubeEl) {
  const q = new THREE.Quaternion();
  const m = getComputedStyle(cubeEl).transform.match(/matrix3d\(([^)]+)\)/);
  if (!m) return q.setFromEuler(new THREE.Euler(18 * DEG, 28 * DEG, 0, "XYZ"));
  const css = new THREE.Matrix4().fromArray(m[1].split(",").map(Number)); // both column-major
  const flip = new THREE.Matrix4().makeScale(1, -1, 1);
  const yUp = flip.clone().multiply(css).multiply(flip);
  yUp.decompose(new THREE.Vector3(), q, new THREE.Vector3());
  return q;
}

// Centre of the drawn cube on screen: the union of its face boxes
function cubeCentre(cubeEl) {
  let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
  cubeEl.querySelectorAll(".face").forEach(f => {
    const rc = f.getBoundingClientRect();
    l = Math.min(l, rc.left); t = Math.min(t, rc.top);
    r = Math.max(r, rc.right); b = Math.max(b, rc.bottom);
  });
  return { x: (l + r) / 2, y: (t + b) / 2 };
}

const VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }`;
const FRAG = `
  uniform vec3 uColor;
  uniform float uFade;
  varying vec2 vUv;
  void main() {
    float e = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
    float edge = 1.0 - smoothstep(0.035, 0.075, e);
    vec3 c = mix(uColor, vec3(1.0), edge * 0.75);
    float a = mix(0.34, 0.8, edge);
    gl_FragColor = vec4(c, a * uFade);
  }`;

export function dispose() {
  if (!stage) return;
  cancelAnimationFrame(stage.frame);
  stage.geometry.dispose();
  stage.material.dispose();
  stage.renderer.dispose();
  stage.renderer.domElement.remove();
  stage = null;
}

/* opts: { cubeEl, accent, face, n, scale, duration }
   Starts the burst now; the caller handles the CSS cube, warp and navigation. */
export function play({ cubeEl, accent, face = "front", n = 4, scale = 1, duration = 400 }) {
  dispose();
  const W = window.innerWidth, H = window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(W, H);
  Object.assign(renderer.domElement.style, {
    position: "fixed", inset: "0", width: "100vw", height: "100vh",
    pointerEvents: "none", zIndex: "75",
  });
  renderer.domElement.setAttribute("aria-hidden", "true");
  document.body.appendChild(renderer.domElement);

  // One unit = one CSS pixel, origin at the screen centre, y up
  const camera = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, -4000, 4000);
  const scene = new THREE.Scene();

  const size = cubeEl.offsetWidth * scale;
  const cell = size / n;
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const { rgb } = parseColour(accent);
  const material = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255) }, uFade: { value: 1 } },
  });
  const count = n * n * n;
  const mesh = new THREE.InstancedMesh(geometry, material, count);

  const group = new THREE.Group();
  const c = cubeCentre(cubeEl);
  group.position.set(c.x - W / 2, H / 2 - c.y, 0);
  group.quaternion.copy(cubeQuaternion(cubeEl));
  group.add(mesh);
  scene.add(group);

  const normal = new THREE.Vector3(...(FACE_NORMALS[face] || FACE_NORMALS.front));
  const frags = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) {
    const pos = new THREE.Vector3(i + 0.5, j + 0.5, k + 0.5).multiplyScalar(cell).subScalar(size / 2);
    const dir = normal.clone()
      .add(pos.clone().normalize().multiplyScalar(0.8))
      .add(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(0.8))
      .normalize();
    frags.push({
      pos, vel: dir.multiplyScalar(0.7 + Math.random() * 0.8), // px per ms
      rot: new THREE.Quaternion(),
      axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
      spin: (Math.random() * 2 - 1) * 0.012, // rad per ms
    });
  }

  const dummy = new THREE.Object3D();
  const step = new THREE.Quaternion();
  const start = performance.now();
  let last = start;
  stage = { renderer, scene, camera, mesh, geometry, material, frame: 0 };

  function frame(now) {
    if (!stage) return;
    const dt = Math.min(40, now - last); last = now;
    const p = Math.min(1, (now - start) / duration);
    const drag = Math.pow(0.996, dt);
    const s = cell * 0.92 * (1 - 0.7 * p);
    frags.forEach((f, idx) => {
      f.vel.multiplyScalar(drag);
      f.pos.addScaledVector(f.vel, dt);
      f.rot.multiply(step.setFromAxisAngle(f.axis, f.spin * dt));
      dummy.position.copy(f.pos);
      dummy.quaternion.copy(f.rot);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    material.uniforms.uFade.value = 1 - p * p;
    renderer.render(scene, camera);
    if (p < 1) stage.frame = requestAnimationFrame(frame);
  }
  frame(start);
}
