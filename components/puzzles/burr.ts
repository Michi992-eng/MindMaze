import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { prefersReducedMotion } from '@/lib/motion';

export const WOOD = '/media/0ef1b9b909cdeb26bf3adac2c221435c.jpg';
export const WOOD_BUMP = '/media/f555b2b82596755f3aba452e29a2ca85.jpg';

/** Classic six-piece burr: three perpendicular pairs, cross-section 2, length 7. */
export const BURR_PIECES: { axis: 'x' | 'y' | 'z'; pos: [number, number, number] }[] = [
  { axis: 'x', pos: [0, 0, 1] },
  { axis: 'x', pos: [0, 0, -1] },
  { axis: 'y', pos: [1, 0, 0] },
  { axis: 'y', pos: [-1, 0, 0] },
  { axis: 'z', pos: [0, 1, 0] },
  { axis: 'z', pos: [0, -1, 0] },
];
/** Assembly order: the burr goes together in pairs, then the key piece. */
export const BURR_ORDER = [2, 3, 4, 0, 1, 5];

/** One wooden piece; each samples a different strip of the same board so no two look alike. */
export function burrMaterial(loader: THREE.TextureLoader, seed: number, maxAniso: number, shade: number) {
  const map = loader.load(WOOD);
  const bump = loader.load(WOOD_BUMP);
  [map, bump].forEach((t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = maxAniso;
    t.repeat.set(0.55, 0.5);
    t.offset.set((seed * 0.173) % 1, (seed * 0.311) % 1);
  });
  map.encoding = THREE.sRGBEncoding;
  return new THREE.MeshStandardMaterial({
    map,
    bumpMap: bump,
    bumpScale: 0.012,
    color: new THREE.Color().setHSL(0.075, 0.5, shade),
    roughness: 0.62,
    metalness: 0,
  });
}

/** Warm studio lights used for the burr. */
export function addBurrLights(scene: THREE.Scene) {
  scene.add(new THREE.HemisphereLight(0xfff3e0, 0x6b4a2a, 0.75));
  const key = new THREE.DirectionalLight(0xfff1dc, 1.5);
  key.position.set(-8, 14, 12);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffe0b8, 0.5);
  rim.position.set(10, -4, -8);
  scene.add(rim);
}

type Elements = {
  canvas: HTMLCanvasElement;
  section: HTMLElement;
  floor: HTMLElement;
  count: HTMLElement;
  bar: HTMLElement;
};

/**
 * Part 01 of the puzzle site: the six pieces fly in and lock together as you scroll through
 * the pinned stage; drag to turn the puzzle. Returns a function that tears everything down.
 */
export function startBurr({ canvas, section, floor, count, bar }: Elements): () => void {
  const reduce = prefersReducedMotion();
  const off: (() => void)[] = [];

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
  camera.position.set(0, 0, 30);
  addBurrLights(scene);

  const loader = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const L = 7;
  const W = 2;
  const geo = new RoundedBoxGeometry(L, W, W, 4, 0.22);
  const puzzle = new THREE.Group();
  scene.add(puzzle);
  const materials: THREE.MeshStandardMaterial[] = [];
  const pieces = BURR_PIECES.map((d, i) => {
    const m = burrMaterial(loader, i + 3, maxAniso, 0.8 + (i % 3) * 0.025);
    materials.push(m);
    const mesh = new THREE.Mesh(geo, m);
    const rot = new THREE.Euler();
    if (d.axis === 'y') rot.set(0, 0, Math.PI / 2);
    if (d.axis === 'z') rot.set(0, Math.PI / 2, 0);
    const endQ = new THREE.Quaternion().setFromEuler(rot);
    const endP = new THREE.Vector3(...d.pos);
    // fly in along its own long axis from far away, pairs from opposite sides, with a tumble
    const dir = new THREE.Vector3(d.axis === 'x' ? 1 : 0, d.axis === 'y' ? 1 : 0, d.axis === 'z' ? 1 : 0).multiplyScalar(i % 2 ? -1 : 1);
    dir.add(new THREE.Vector3(...d.pos).multiplyScalar(0.35)).normalize();
    const startP = endP.clone().add(dir.multiplyScalar(22));
    const startQ = new THREE.Quaternion()
      .setFromEuler(new THREE.Euler(endQ.x + 1.8 * (i % 2 ? 1 : -1), 0.9 + i * 0.7, -1.2 + i * 0.5))
      .multiply(endQ);
    puzzle.add(mesh);
    return { mesh, startP, endP, startQ, endQ };
  });

  const ease = (t: number) => 1 - Math.pow(1 - t, 3);
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
  let progress = reduce ? 1 : 0;
  let shown = progress;

  const readScroll = () => {
    const r = section.getBoundingClientRect();
    const span = r.height - innerHeight;
    progress = reduce ? 1 : clamp(-r.top / span, 0, 1);
    const doc = document.documentElement;
    bar.style.width = (scrollY / (doc.scrollHeight - innerHeight)) * 100 + '%';
  };
  addEventListener('scroll', readScroll, { passive: true });
  off.push(() => removeEventListener('scroll', readScroll));

  // drag to turn
  let dragX = 0;
  let dragY = 0;
  let vx = 0;
  let vy = 0;
  let dragging = false;
  let lx = 0;
  let ly = 0;
  const down = (e: PointerEvent) => {
    dragging = true;
    lx = e.clientX;
    ly = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent) => {
    if (!dragging) return;
    vx = (e.clientX - lx) * 0.008;
    vy = (e.clientY - ly) * 0.008;
    dragX += vx;
    dragY += vy;
    lx = e.clientX;
    ly = e.clientY;
  };
  const up = () => {
    dragging = false;
  };
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  off.push(() => {
    canvas.removeEventListener('pointerdown', down);
    canvas.removeEventListener('pointermove', move);
    canvas.removeEventListener('pointerup', up);
    canvas.removeEventListener('pointercancel', up);
  });

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const mobile = w <= 960;
    camera.position.z = mobile ? 40 : 30;
    // shift the object right of the copy on desktop, below it on mobile
    camera.setViewOffset(w, h, mobile ? 0 : -w * 0.08, mobile ? -h * 0.14 : 0, w, h);
    camera.updateProjectionMatrix();
  };
  addEventListener('resize', resize);
  off.push(() => removeEventListener('resize', resize));

  const clock = new THREE.Clock();
  let spin = 0;
  let raf = 0;
  const frame = () => {
    const dt = Math.min(clock.getDelta(), 0.05);
    shown += (progress - shown) * Math.min(1, dt * 7);
    const p = shown;
    let placed = 0;
    BURR_ORDER.forEach((idx, k) => {
      const pc = pieces[idx];
      const t0 = k * 0.1;
      const t = ease(clamp((p - t0) / 0.32, 0, 1));
      if (t > 0.995) placed++;
      pc.mesh.position.lerpVectors(pc.startP, pc.endP, t);
      pc.mesh.quaternion.copy(pc.startQ).slerp(pc.endQ, t);
    });
    count.textContent = placed + ' / 6';
    const assembled = clamp((p - 0.6) / 0.4, 0, 1);
    floor.style.opacity = (0.25 + 0.75 * ease(assembled)).toFixed(2);
    if (!dragging) {
      vx *= 0.94;
      vy *= 0.94;
      dragX += vx;
      dragY += vy;
    }
    if (!reduce) spin += dt * 0.18 * (0.3 + assembled);
    puzzle.rotation.set(0.5 + dragY + Math.sin(spin * 0.7) * 0.05, -0.65 + p * Math.PI * 1.1 + spin + dragX, 0.08);
    puzzle.position.y = Math.sin(clock.elapsedTime * 1.2) * 0.18 * assembled;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  };
  resize();
  readScroll();
  frame();

  return () => {
    cancelAnimationFrame(raf);
    off.forEach((f) => f());
    geo.dispose();
    materials.forEach((m) => {
      m.map?.dispose();
      m.bumpMap?.dispose();
      m.dispose();
    });
    renderer.dispose();
    renderer.forceContextLoss();
  };
}
