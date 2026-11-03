'use client';

import { useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { holdReveal } from '@/lib/pageReady';

type Props = {
  /** the hero's `.slot`: the puzzle is drawn over it and dragging it turns the puzzle */
  slotRef: RefObject<HTMLDivElement | null>;
  /** the tall pinned hero section: scrolling through it builds the puzzle */
  sectionRef: RefObject<HTMLElement | null>;
  /** called with false when WebGL is unavailable, so the hero can show a photo instead */
  onSupport: (ok: boolean) => void;
};

const WOOD = '/img/wood.jpg';
const WOOD_BUMP = '/img/wood-bump.jpg';

/* classic six-piece burr: three perpendicular pairs, cross-section 2, length 7 */
const L = 7;
const W = 2;
const DEFS: { axis: 'x' | 'y' | 'z'; pos: [number, number, number] }[] = [
  { axis: 'x', pos: [0, 0, 1] },
  { axis: 'x', pos: [0, 0, -1] },
  { axis: 'y', pos: [1, 0, 0] },
  { axis: 'y', pos: [-1, 0, 0] },
  { axis: 'z', pos: [0, 1, 0] },
  { axis: 'z', pos: [0, -1, 0] },
];
// assembly order: the burr goes together in pairs, then the key piece
const ORDER = [2, 3, 4, 0, 1, 5];
// where each piece appears from (spinner space, near the camera, alternating sides)
const ENTRIES: [number, number][] = [
  [-1.15, 0.7],
  [1.2, -0.6],
  [-0.9, -1.05],
  [1.05, 0.95],
  [-1.25, -0.25],
  [1.1, 0.4],
];
const RADIUS = 5.3; // world radius of the assembled puzzle
const DIST = 24;

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const smooth = (t: number) => t * t * (3 - 2 * t);
/** the one easing a piece follows over its whole flight: quick out of the entry, settling into the slot */
const flight = (t: number) => 1 - Math.pow(1 - t, 2.4);
/** frame-rate independent damping factor: fraction of the gap to close this frame at rate k (1/s) */
const damp = (k: number, dt: number) => 1 - Math.exp(-k * dt);
/* damping rates (1/s): higher = snappier */
const BUILD_K = 7; // scroll/intro progress → build progress
const PIECE_K = 5.5; // build progress → each piece's flight
const FOLLOW_K = 6; // puzzle follows the hero slot
const INERTIA = 0.94; // drag velocity kept per 1/60 s after release

type Piece = {
  mesh: THREE.Mesh;
  endP: THREE.Vector3;
  preP: THREE.Vector3;
  /** second Bézier handle: further out along the slot axis, so the last stretch slides straight in */
  ctlP: THREE.Vector3;
  endQ: THREE.Quaternion;
  startQ: THREE.Quaternion;
  shown: number;
};

/**
 * The six-piece wooden burr (three.js r128, same scene as the prototype). One full-screen,
 * transparent, click-through canvas; every frame the puzzle is placed over the hero's slot.
 * Scroll and pointer values live in plain variables inside the effect, never in React state.
 */
export default function BurrPuzzle({ slotRef, sectionRef, onSupport }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const support = useRef(onSupport);
  support.current = onSupport;

  useEffect(() => {
    const hostEl = host.current;
    const slot = slotRef.current;
    const section = sectionRef.current;
    if (!hostEl || !slot || !section) return;

    // keep the page-transition cover up until the first frame is drawn
    const ready = holdReveal();
    const cleanups: (() => void)[] = [ready];

    // the canvas is created here and removed on cleanup, so Strict Mode's double mount
    // never leaves two canvases (or a lost WebGL context) behind
    const canvas = document.createElement('canvas');
    canvas.className = 'mm-gl';
    canvas.setAttribute('aria-hidden', 'true');
    hostEl.appendChild(canvas);
    cleanups.push(() => canvas.remove());

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      support.current(false);
      cleanups.forEach((f) => f());
      return;
    }
    support.current(true);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.physicallyCorrectLights = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
    camera.position.set(0, 0, DIST);

    scene.add(new THREE.HemisphereLight(0xfff3e0, 0x6b4a2a, 0.75));
    const key = new THREE.DirectionalLight(0xfff1dc, 1.5);
    key.position.set(-8, 14, 12);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffe0b8, 0.5);
    rim.position.set(10, -4, -8);
    scene.add(rim);

    /* wood grain; each piece samples a different strip so no two look alike */
    const textures: THREE.Texture[] = [];
    const loader = new THREE.TextureLoader();
    const aniso = renderer.capabilities.getMaxAnisotropy();
    const woodTexture = (seed: number) => {
      const map = loader.load(WOOD);
      const bump = loader.load(WOOD_BUMP);
      [map, bump].forEach((t) => {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.anisotropy = aniso;
        t.repeat.set(0.55, 0.5);
        t.offset.set((seed * 0.173) % 1, (seed * 0.311) % 1);
        textures.push(t); // the loader flags it for upload once the image arrives
      });
      map.encoding = THREE.sRGBEncoding;
      return { map, bump };
    };

    const geo = new RoundedBoxGeometry(L, W, W, 4, 0.22);
    const AX = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) };
    const puzzle = new THREE.Group();
    const spinner = new THREE.Group();
    spinner.add(puzzle);
    scene.add(spinner);

    /* soft contact shadow under the puzzle */
    const sc = document.createElement('canvas');
    sc.width = 256;
    sc.height = 64;
    const sg = sc.getContext('2d');
    if (sg) {
      const grd = sg.createRadialGradient(128, 32, 2, 128, 32, 126);
      grd.addColorStop(0, 'rgba(0,0,0,.8)');
      grd.addColorStop(0.45, 'rgba(0,0,0,.35)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      sg.setTransform(1, 0, 0, 0.25, 0, 24);
      sg.fillStyle = grd;
      sg.fillRect(0, 0, 256, 256);
    }
    const shadowTex = new THREE.CanvasTexture(sc);
    textures.push(shadowTex);
    const shadowGeo = new THREE.PlaneGeometry(10, 2.6);
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.position.set(0, -5.4, -2.5);
    spinner.add(shadow);

    const materials: THREE.Material[] = [shadowMat];
    const pieces: Piece[] = DEFS.map((d, i) => {
      const w = woodTexture(i + 3);
      const m = new THREE.MeshStandardMaterial({
        map: w.map,
        bumpMap: w.bump,
        bumpScale: 0.012,
        color: new THREE.Color().setHSL(0.075, 0.5, 0.8 + (i % 3) * 0.025),
        roughness: 0.62,
        metalness: 0,
      });
      materials.push(m);
      const mesh = new THREE.Mesh(geo, m);
      const rot = new THREE.Euler();
      if (d.axis === 'y') rot.set(0, 0, Math.PI / 2);
      if (d.axis === 'z') rot.set(0, Math.PI / 2, 0);
      const endQ = new THREE.Quaternion().setFromEuler(rot);
      const endP = new THREE.Vector3(...d.pos);
      const sign = i % 2 ? -1 : 1;
      // lined up with its slot, ready to slide in along its own length
      const preP = endP.clone().add(AX[d.axis].clone().multiplyScalar(sign * L * 0.62));
      const tumble = new THREE.Quaternion().setFromEuler(
        new THREE.Euler((i % 2 ? 1 : -1) * 2.1, 1.2 + i * 0.9, ((i % 3) - 1) * 1.4),
      );
      const startQ = tumble.multiply(endQ.clone());
      const ctlP = preP.clone().add(preP.clone().sub(endP).multiplyScalar(0.4));
      puzzle.add(mesh);
      mesh.position.copy(endP);
      mesh.quaternion.copy(endQ);
      mesh.visible = false;
      return { mesh, endP, preP, ctlP, endQ, startQ, shown: 0 };
    });
    const N = pieces.length;

    /* drag on the slot to turn (with inertia); the mouse elsewhere tilts it slightly */
    let dragX = 0,
      dragY = 0,
      vx = 0,
      vy = 0,
      dragging = false,
      lx = 0,
      ly = 0,
      lt = 0,
      tiltX = 0,
      tiltY = 0,
      mx = 0,
      my = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      lt = e.timeStamp;
      vx = vy = 0;
      try {
        slot.setPointerCapture(e.pointerId);
      } catch {
        /* pointer already gone */
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const ddx = (e.clientX - lx) * 0.009;
      const ddy = (e.clientY - ly) * 0.009;
      dragX += ddx;
      dragY += ddy;
      // velocity in "per 1/60 s" units, whatever the pointer's event rate; lightly smoothed
      const per60 = 16.67 / Math.max(4, e.timeStamp - lt);
      vx = vx * 0.4 + ddx * per60 * 0.6;
      vy = vy * 0.4 + ddy * per60 * 0.6;
      lx = e.clientX;
      ly = e.clientY;
      lt = e.timeStamp;
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      // held still before letting go: no fling
      if (e.timeStamp - lt > 80) vx = vy = 0;
    };
    const onHover = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };
    slot.addEventListener('pointerdown', onDown);
    slot.addEventListener('pointermove', onMove);
    slot.addEventListener('pointerup', onUp);
    slot.addEventListener('pointercancel', onUp);
    window.addEventListener('pointermove', onHover, { passive: true });
    cleanups.push(() => {
      slot.removeEventListener('pointerdown', onDown);
      slot.removeEventListener('pointermove', onMove);
      slot.removeEventListener('pointerup', onUp);
      slot.removeEventListener('pointercancel', onUp);
      window.removeEventListener('pointermove', onHover);
    });

    let vw = 0,
      vh = 0,
      unit = 1;
    const resize = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      renderer.setSize(vw, vh, false);
      camera.aspect = vw / vh;
      camera.updateProjectionMatrix();
      unit = (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * DIST) / vh; // world units per css px at z=0
    };
    window.addEventListener('resize', resize);
    cleanups.push(() => window.removeEventListener('resize', resize));
    resize();

    const pos = new THREE.Vector3(),
      tgt = new THREE.Vector3(),
      far = new THREE.Vector3(),
      inv = new THREE.Quaternion();
    const ctl = new THREE.Vector3();
    let scl = 1,
      first = true,
      visible = false,
      built = 0, // damped build progress, 0…1; follows the scroll both ways
      spin = 0,
      yaw = 0,
      drawn = false,
      lastClip = '';
    canvas.style.visibility = 'hidden';
    const clock = new THREE.Clock();
    const header = slot.closest('.mm')?.querySelector('header') ?? null;

    /* where a piece is for progress t (0 = off-screen, 1 = placed). One continuous flight: a cubic
       Bézier far → ctlP → preP → endP under a single easing, so it never stops half-way. Both inner
       handles sit on the slot's axis, so the final approach slides straight in along the piece's length. */
    const place = (pc: Piece, k: number, t: number) => {
      const m = pc.mesh;
      if (t <= 0) {
        m.visible = false;
        return;
      }
      m.visible = true;
      if (t >= 1) {
        m.position.copy(pc.endP);
        m.quaternion.copy(pc.endQ);
        return;
      }
      // entry point near the camera, held fixed on screen while the puzzle turns
      const e = ENTRIES[k % ENTRIES.length];
      const zNear = Math.min(13, DIST / Math.max(scl, 0.2) - 5);
      far.set(((e[0] * vw) / vh) * 7, e[1] * 7, zNear).applyQuaternion(inv);
      const u = flight(t);
      const v = 1 - u;
      m.position
        .copy(far)
        .multiplyScalar(v * v * v)
        .add(ctl.copy(pc.ctlP).multiplyScalar(3 * v * v * u))
        .add(ctl.copy(pc.preP).multiplyScalar(3 * v * u * u))
        .add(ctl.copy(pc.endP).multiplyScalar(u * u * u));
      // the tumble unwinds over the whole flight too, mostly settled before the piece enters its slot
      m.quaternion.copy(pc.startQ).slerp(pc.endQ, 1 - Math.pow(v, 4));
    };

    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), 0.05);
      const T = clock.elapsedTime;

      // hide the canvas while the hero is off-screen (saves battery). "Off-screen" starts at
      // the header's bottom edge: once the hero has scrolled up under the sticky header, the
      // puzzle must not keep showing through it.
      const navH = header ? header.getBoundingClientRect().bottom : 0;
      const sr = section.getBoundingClientRect();
      const r = slot.getBoundingClientRect();
      if (!(sr.bottom > navH && sr.top < vh && r.bottom > navH && r.top < vh)) {
        if (visible) {
          canvas.style.visibility = 'hidden';
          visible = false;
        }
        return;
      }
      if (!visible) {
        canvas.style.visibility = 'visible';
        visible = true;
      }
      // while the hero scrolls away (its end is on screen), cut the canvas off at the header
      // so the puzzle slides under it like the rest of the page; the intro fly-in stays unclipped
      const clip = sr.bottom < vh ? `inset(${Math.round(navH)}px 0 0 0)` : 'none';
      if (clip !== lastClip) {
        canvas.style.clipPath = clip;
        lastClip = clip;
      }

      // follow the slot, whatever the layout
      tgt.set((r.left + r.width / 2 - vw / 2) * unit, -(r.top + r.height / 2 - vh / 2) * unit, 0);
      const tscl = (Math.min(r.width, r.height) * 0.5 * unit) / RADIUS;
      const k = first ? 1 : damp(FOLLOW_K, dt);
      first = false;
      pos.lerp(tgt, k);
      scl += (tscl - scl) * k;
      spinner.position.copy(pos);
      spinner.scale.setScalar(scl);

      // scroll drives the build both ways: the first piece flies in on load, the rest one by one
      // while the hero is pinned; scrolling back up takes them out again in reverse order
      const pin = Math.max(1, sr.height - (vh - navH));
      const sp = clamp((navH - sr.top) / pin, 0, 1);
      const intro = reduceMotion ? 1 : 0.17 * smooth(clamp((T - 0.35) / 1.6, 0, 1));
      // the first piece's 0.17 head start ramps in over the first bit of scroll instead of jumping
      const fromScroll = Math.min(1, sp + 0.17 * smooth(clamp(sp / 0.03, 0, 1)));
      const buildGoal = Math.max(intro, fromScroll);
      // a fast flick moves the goal in a frame or two; the build eases after it
      built = reduceMotion ? 1 : built + (buildGoal - built) * damp(BUILD_K, dt);
      const p = built;

      let placed = 0; // continuous count of placed pieces (no threshold, so nothing steps)
      ORDER.forEach((idx, n) => {
        const pc = pieces[idx];
        const goal = reduceMotion ? 1 : clamp((p - n * 0.14) / 0.17, 0, 1);
        pc.shown = reduceMotion ? 1 : pc.shown + (goal - pc.shown) * damp(PIECE_K, dt);
        placed += pc.shown;
      });
      inv.copy(puzzle.quaternion).invert();
      ORDER.forEach((idx, n) => place(pieces[idx], n, pieces[idx].shown));
      shadowMat.opacity = 0.15 + 0.55 * (placed / N);

      // motion: slow idle spin, scroll yaw, drag with inertia, mouse tilt, gentle float
      if (!dragging) {
        // same glide at 60 Hz and 120 Hz
        const f = Math.pow(INERTIA, dt * 60);
        vx *= f;
        vy *= f;
        dragX += vx * dt * 60;
        dragY += vy * dt * 60;
      }
      if (!reduceMotion) spin += dt * (0.12 + 0.16 * (placed / N));
      yaw += (p * Math.PI * 0.9 - yaw) * damp(4, dt);
      tiltX += (my * 0.3 - tiltX) * damp(3, dt);
      tiltY += (mx * 0.45 - tiltY) * damp(3, dt);
      puzzle.rotation.set(0.45 + dragY + tiltX + Math.sin(spin * 0.6) * 0.05, -0.65 + spin + dragX + tiltY + yaw, 0.1);
      puzzle.position.y = reduceMotion ? 0 : Math.sin(T * 1.1) * 0.14 * (placed / N);
      renderer.render(scene, camera);
      if (!drawn) {
        drawn = true;
        ready();
      }
    };
    raf = requestAnimationFrame(frame);
    // the hero may start off-screen (e.g. a link to #contact): release the cover anyway
    const readyTimer = window.setTimeout(ready, 400);

    cleanups.push(() => {
      cancelAnimationFrame(raf);
      window.clearTimeout(readyTimer);
      geo.dispose();
      shadowGeo.dispose();
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    });

    return () => {
      // run in reverse so the canvas is removed last
      for (let i = cleanups.length - 1; i >= 0; i--) cleanups[i]();
    };
  }, [slotRef, sectionRef]);

  return <div ref={host} className="mm-gl-host" />;
}
