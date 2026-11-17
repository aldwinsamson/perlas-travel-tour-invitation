import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { flightTiming } from '../../utils/intro';
import { skyVertex, skyFragment, trailVertex, trailFragment } from './shaders';

export interface SkyOptions {
  canvas: HTMLCanvasElement;
  lowPower: boolean;
  compact: boolean;
  animated: boolean;
  onReveal?: () => void;
  onComplete?: () => void;
  onModelError?: (e: unknown) => void;
  onContextLost?: () => void;
}

const MODEL_LENGTH = 62; // metres in the glb
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOutSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;
const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const flightEase = (x: number) => 0.55 * easeInOutCubic(x) + 0.45 * easeInOutSine(x);

class Trail {
  readonly mesh: THREE.Mesh;
  readonly material: THREE.ShaderMaterial;
  private hist: { p: THREE.Vector3; t: number }[] = [];
  private readonly pos: Float32Array;
  private readonly tr: Float32Array;
  private readonly geo = new THREE.BufferGeometry();
  private readonly tmpT = new THREE.Vector3();
  private readonly tmpV = new THREE.Vector3();
  private readonly tmpS = new THREE.Vector3();

  constructor(private readonly max = 160) {
    this.pos = new Float32Array(max * 2 * 3);
    this.tr = new Float32Array(max * 2 * 2);
    const idx: number[] = [];
    for (let i = 0; i < max - 1; i++) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    this.geo.setIndex(idx);
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.geo.setAttribute('aTrail', new THREE.BufferAttribute(this.tr, 2));
    this.geo.setDrawRange(0, 0);
    this.material = new THREE.ShaderMaterial({
      vertexShader: trailVertex,
      fragmentShader: trailFragment,
      uniforms: { uOpacity: { value: 1 } },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(this.geo, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 5;
  }

  push(p: THREE.Vector3, t: number) {
    this.hist.push({ p: p.clone(), t });
    if (this.hist.length > this.max) this.hist.shift();
  }

  clear() {
    this.hist = [];
    this.geo.setDrawRange(0, 0);
  }

  update(now: number, life: number, width: number, cam: THREE.Camera) {
    while (this.hist.length && now - this.hist[0].t > life) this.hist.shift();
    const n = this.hist.length;
    if (n < 2) {
      this.geo.setDrawRange(0, 0);
      return;
    }
    for (let i = 0; i < n; i++) {
      const cur = this.hist[i].p;
      const prev = this.hist[Math.max(0, i - 1)].p;
      const next = this.hist[Math.min(n - 1, i + 1)].p;
      this.tmpT.subVectors(next, prev).normalize();
      this.tmpV.subVectors(cam.position, cur).normalize();
      this.tmpS.crossVectors(this.tmpT, this.tmpV).normalize();
      const age = clamp01((now - this.hist[i].t) / life);
      const w = width * (0.16 + 0.84 * smooth(0, 0.35, age)) * (1 - 0.65 * smooth(0.65, 1, age));
      const o = i * 6;
      this.pos[o] = cur.x - this.tmpS.x * w;
      this.pos[o + 1] = cur.y - this.tmpS.y * w;
      this.pos[o + 2] = cur.z - this.tmpS.z * w;
      this.pos[o + 3] = cur.x + this.tmpS.x * w;
      this.pos[o + 4] = cur.y + this.tmpS.y * w;
      this.pos[o + 5] = cur.z + this.tmpS.z * w;
      const q = i * 4;
      this.tr[q] = age;
      this.tr[q + 1] = -1;
      this.tr[q + 2] = age;
      this.tr[q + 3] = 1;
    }
    (this.geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (this.geo.attributes.aTrail as THREE.BufferAttribute).needsUpdate = true;
    this.geo.setDrawRange(0, (n - 1) * 6);
  }

  dispose() {
    this.geo.dispose();
    this.material.dispose();
  }
}

export class SkyScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly cam = new THREE.PerspectiveCamera(32, 1, 0.5, 600);
  private readonly skyU: Record<string, THREE.IUniform>;
  private readonly skyMats: THREE.ShaderMaterial[] = [];
  private readonly skyGeo = new THREE.PlaneGeometry(2, 2);
  private readonly sun = new THREE.DirectionalLight(0xfff1d6, 3.0);
  private readonly pmrem: THREE.PMREMGenerator;
  private env: THREE.Texture | null = null;
  private readonly trail = new Trail();

  private readonly flight = new THREE.Group(); // follows the path
  private model: THREE.Group | null = null;
  private tail = new THREE.Object3D();
  private fans: THREE.Object3D[] = [];
  private strobes: THREE.Object3D[] = [];
  private beacons: THREE.Object3D[] = [];
  private curve: THREE.CubicBezierCurve3 | null = null;
  private bankSign = 1;

  private mode: 'idle' | 'intro' | 'ambient' = 'idle';
  private raf = 0;
  private last = 0;
  private clock = 0; 
  private t = 0; 
  private revealed = false;
  private active = true;
  private disposed = false;
  private frames = 0;
  private dpr = 1;
  private dprSteps = 0;
  private winSum = 0;
  private winN = 0;
  private readonly vA = new THREE.Vector3();
  private readonly vB = new THREE.Vector3();
  private readonly vC = new THREE.Vector3();
  private readonly qA = new THREE.Quaternion();
  private readonly qB = new THREE.Quaternion();
  private readonly zAxis = new THREE.Vector3(0, 0, 1);

  private readonly T_START: number;
  private readonly T_FLIGHT: number;
  private readonly T_REVEAL: number;
  private readonly T_END: number;

  constructor(private readonly o: SkyOptions) {
    const hi = !o.lowPower && !o.compact;
    const ft = flightTiming();
    this.T_START = ft.start;
    this.T_FLIGHT = ft.flight;
    this.T_REVEAL = ft.revealAt;
    this.T_END = ft.end;

    this.renderer = new THREE.WebGLRenderer({
      canvas: o.canvas,
      antialias: true, 
      alpha: false,
      powerPreference: 'high-performance',
    });
    const dprCap = hi ? 1.5 : o.compact ? 1.25 : 1.0;
    this.dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    o.canvas.addEventListener('webglcontextlost', this.onLost as EventListener);

    const octaves = hi ? 6 : o.compact ? 3 : 4;
    this.skyU = {
      uTime: { value: 0 },
      uFade: { value: o.animated ? 0 : 1 },
      uPass: { value: 0 },
      uAspect: { value: 1.6 },
      uScroll: { value: 0 },
      uFg: { value: o.animated ? 1 : 0.8 },
      uCam: { value: new THREE.Vector2() },
      uSun: { value: new THREE.Vector2(o.compact ? 0.2 : 0.17, 0.87) },
    };
    for (const pass of [0, 1]) {
      const m = new THREE.ShaderMaterial({
        vertexShader: skyVertex,
        fragmentShader: skyFragment(octaves, hi),
        uniforms: { ...this.skyU, uPass: { value: pass } },
        depthTest: false,
        depthWrite: false,
        transparent: pass === 1,
      });
      const mesh = new THREE.Mesh(this.skyGeo, m);
      mesh.frustumCulled = false;
      mesh.renderOrder = pass === 0 ? -10 : 10;
      this.scene.add(mesh);
      this.skyMats.push(m);
    }

    this.sun.position.set(-30, 34, 22);
    this.scene.add(this.sun);
    this.scene.add(this.flight, this.trail.mesh);
    this.flight.visible = false;
    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    this.buildEnv();
    this.resize();
  }

  private buildEnv() {
    const s = new THREE.Scene();
    const g = new THREE.SphereGeometry(50, 40, 20);
    const top = new THREE.Color('#2f7fd6');
    const hor = new THREE.Color('#cfe6fb');
    const bot = new THREE.Color('#e9d9b8');
    const col: number[] = [];
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i) / 50;
      const c = y > 0 ? hor.clone().lerp(top, Math.pow(y, 0.55)) : hor.clone().lerp(bot, Math.pow(-y, 0.6));
      col.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    s.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    const sunDisc = new THREE.Mesh(
      new THREE.SphereGeometry(4, 16, 8),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(14, 12, 9) }),
    );
    sunDisc.position.set(-30, 34, 20);
    s.add(sunDisc);
    const next = this.pmrem.fromScene(s, 0.02).texture;
    this.env?.dispose();
    this.env = next;
    this.scene.environment = next;
    g.dispose();
    (sunDisc.geometry as THREE.BufferGeometry).dispose();
  }

  async load(bytes: ArrayBuffer): Promise<void> {
    if (this.model) return;
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const gltf = await loader.parseAsync(bytes, '');
    if (this.disposed) return;
    const m = gltf.scene;
    m.traverse((n) => {
      if (n.name.startsWith('FanRotor')) this.fans.push(n);
      if (n.name.startsWith('Strobe')) this.strobes.push(n);
      if (n.name.startsWith('Beacon') || n.name === 'TailLight_White') this.beacons.push(n);
    });
    this.tail.position.set(0, 1.2, -31);
    m.add(this.tail);
    this.model = m;
    this.flight.add(m);
    m.traverse((n) => {
      const mesh = n as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of mats) for (const v of Object.values(mat)) if (v instanceof THREE.Texture) this.renderer.initTexture(v);
    });
    this.flight.position.copy(this.at(0, 0, 40));
    this.flight.visible = true;
    this.flight.updateMatrixWorld(true);
    this.renderer.compile(this.scene, this.cam);
    this.renderer.render(this.scene, this.cam);
    this.flight.visible = false;
  }

  resize() {
    const c = this.renderer.domElement;
    const w = Math.max(1, c.clientWidth || window.innerWidth);
    const h = Math.max(1, c.clientHeight || window.innerHeight);
    this.renderer.setSize(w, h, false);
    this.cam.aspect = w / h;
    this.cam.updateProjectionMatrix();
    this.cam.updateMatrixWorld();
    this.skyU.uAspect.value = w / h;
    this.buildPath();
    if (!this.o.animated || this.mode !== 'intro') this.renderOnce();
  }

  private at(ndcX: number, ndcY: number, depth: number) {
    const v = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(this.cam).sub(this.cam.position).normalize();
    return v.multiplyScalar(depth / -v.z);
  }

  private buildPath() {
    const portrait = this.cam.aspect < 0.9;
    const p0 = this.at(portrait ? -1.18 : -1.12, -1.08, 13);
    const p1 = this.at(portrait ? -0.45 : -0.35, -0.8, 22);
    const p2 = this.at(portrait ? 0.3 : 0.35, portrait ? -0.1 : -0.05, 50);
    const p3 = this.at(portrait ? 1.7 : 1.45, portrait ? 1.25 : 1.35, 105);
    this.curve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);

    const hh = Math.tan(THREE.MathUtils.degToRad(this.cam.fov / 2)) * 13;
    const diag = Math.hypot(hh * 2, hh * 2 * this.cam.aspect);
    const len = diag * (portrait ? 1.0 : 0.62);
    this.flight.scale.setScalar(len / MODEL_LENGTH);
    this.trailWidth = len * 0.045;

    const pt = this.curve.getPoint(0.3);
    const tan = this.curve.getTangent(0.3);
    const belly = new THREE.Vector3(0, -1, 0).applyQuaternion(this.orientation(tan, 0.4));
    const belly2 = new THREE.Vector3(0, -1, 0).applyQuaternion(this.orientation(tan, -0.4));
    const toCam = this.cam.position.clone().sub(pt).normalize();
    this.bankSign = belly.dot(toCam) >= belly2.dot(toCam) ? 1 : -1;
  }
  private trailWidth = 0.4;
  private readonly tp = new THREE.Vector3();

  private readonly mx = new THREE.Matrix4();
  private orientation(tangent: THREE.Vector3, bank: number) {
    const z = this.vA.copy(tangent).normalize();
    const x = this.vB.set(0, 1, 0).cross(z).normalize();
    const y = this.vC.copy(z).cross(x).normalize();
    this.mx.makeBasis(x, y, z);
    this.qA.setFromRotationMatrix(this.mx);
    return this.qA.multiply(this.qB.setFromAxisAngle(this.zAxis, bank));
  }

  setScroll(v: number) {
    this.skyU.uScroll.value = v;
    if (!this.o.animated) this.renderOnce();
  }

  setActive(a: boolean) {
    if (a === this.active) return;
    this.active = a;
    if (a) this.start();
    else cancelAnimationFrame(this.raf);
  }

  renderOnce() {
    if (this.disposed) return;
    this.renderer.render(this.scene, this.cam);
  }

  play() {
    if (!this.model || !this.o.animated) {
      this.finish(false);
      return;
    }
    this.mode = 'intro';
    this.t = 0;
    this.revealed = false;
    this.frames = 0;
    this.winSum = this.winN = 0;
    this.trail.clear();
    this.flight.visible = false;
    this.skyU.uFade.value = 0;
    this.skyU.uFg.value = 1;
    this.start();
  }

  skip() {
    if (this.mode === 'intro') this.finish(true);
  }

  ambient() {
    this.mode = 'ambient';
    this.flight.visible = false;
    this.skyU.uFade.value = 1;
    this.skyU.uFg.value = 0.85;
    if (this.o.animated) this.start();
    else this.renderOnce();
  }

  private finish(skipped: boolean) {
    if (!this.revealed) {
      this.revealed = true;
      this.o.onReveal?.();
    }
    this.mode = 'ambient';
    this.flight.visible = false;
    this.trail.clear();
    this.skyU.uFade.value = 1;
    this.skyU.uFg.value = 0.85;
    this.skyU.uCam.value.set(0, 0);
    this.cam.rotation.set(0, 0, 0);
    this.o.onComplete?.();
    if (!this.o.animated) this.renderOnce();
    else this.start();
    void skipped;
  }

  start() {
    cancelAnimationFrame(this.raf);
    this.last = performance.now();
    if (this.o.animated || this.mode === 'intro') this.raf = requestAnimationFrame(this.loop);
  }

  private readonly loop = (now: number) => {
    if (this.disposed) return;
    const minGap = this.mode === 'intro' ? 0 : 33; 
    if (now - this.last < minGap) {
      this.raf = requestAnimationFrame(this.loop);
      return;
    }
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this.clock += dt;
    this.skyU.uTime.value = this.clock;

    if (this.mode === 'intro') this.stepIntro(dt);
    this.renderer.render(this.scene, this.cam);
    if (this.active && !document.hidden) this.raf = requestAnimationFrame(this.loop);
    else if (document.hidden) {
      const resume = () => {
        if (!document.hidden) {
          document.removeEventListener('visibilitychange', resume);
          this.start();
        }
      };
      document.addEventListener('visibilitychange', resume);
    }
  };

  private adaptResolution(dt: number) {
    if (this.frames < 6) return; 
    this.winSum += dt;
    this.winN++;
    if (this.winN < 10) return;
    const avg = this.winSum / this.winN;
    this.winSum = this.winN = 0;
    if (avg > 0.023 && this.dprSteps < 4 && this.dpr > 0.55) {
      this.dprSteps++;
      this.dpr = Math.max(0.55, this.dpr * 0.82);
      this.renderer.setPixelRatio(this.dpr);
      this.renderer.setSize(this.renderer.domElement.clientWidth, this.renderer.domElement.clientHeight, false);
    }
  }

  private stepIntro(dt: number) {
    this.t += dt;
    const t = this.t;
    this.frames++;
    this.adaptResolution(dt);

    this.skyU.uFade.value = smooth(0, 0.7, t);
    const x = clamp01((t - this.T_START) / this.T_FLIGHT);
    const p = flightEase(x);
    const curve = this.curve;
    if (curve && this.model) {
      const pos = curve.getPoint(p);
      const tan = curve.getTangent(clamp01(p));
      this.flight.position.copy(pos);
      const sway = Math.sin(t * 1.3) * 0.035;
      const bank = this.bankSign * (0.34 + 0.16 * Math.sin(p * Math.PI) + sway);
      this.flight.quaternion.copy(this.orientation(tan, bank));
      this.flight.visible = x > 0 && x < 1;

      const yaw = -0.05 * p;
      const pitch = 0.035 * p;
      this.cam.rotation.set(pitch, yaw, 0);
      (this.skyU.uCam.value as THREE.Vector2).set(yaw * 2.2, -pitch * 2.2);

      for (const f of this.fans) f.rotation.z += dt * 14;
      const blink = (t * 1.1) % 1;
      for (const s of this.strobes) s.visible = blink < 0.08 || (blink > 0.16 && blink < 0.22);
      for (const b of this.beacons) b.visible = (t * 0.8) % 1 < 0.55;

      if (this.flight.visible) {
        this.flight.updateMatrixWorld(true);
        this.tail.getWorldPosition(this.tp);
        this.trail.push(this.tp, t);
      }
    }
    const fade = 1 - smooth(this.T_START + this.T_FLIGHT * 0.78, this.T_REVEAL - 0.05, t);
    this.trail.material.uniforms.uOpacity.value = fade;
    this.trail.update(t, 1.9, this.trailWidth, this.cam);

    if (!this.revealed && t >= this.T_REVEAL) {
      this.revealed = true;
      this.o.onReveal?.();
    }
    this.skyU.uFg.value = 1 - 0.15 * smooth(this.T_REVEAL, this.T_END, t);
    if (t >= this.T_END) this.finish(false);
  }

  private readonly onLost = (e: Event) => {
    e.preventDefault();
    this.o.onContextLost?.();
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.o.canvas.removeEventListener('webglcontextlost', this.onLost as EventListener);
    this.trail.dispose();
    this.skyGeo.dispose();
    this.skyMats.forEach((m) => m.dispose());
    this.env?.dispose();
    this.pmrem.dispose();
    this.flight.traverse((n) => {
      const mesh = n as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mat) => {
          for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose();
          mat.dispose();
        });
      }
    });
    this.renderer.dispose();
  }
}
