// sky + clouds are drawn analytically in one fullscreen pass: no cloud textures to download,.
export const skyVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

export const skyFragment = (octaves: number, high: boolean) => /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uFade;
uniform float uPass;      // 0 = whole sky, 1 = foreground cloud bank only (drawn over the aircraft)
uniform float uAspect;
uniform float uScroll;
uniform float uFg;        // foreground bank strength
uniform vec2  uCam;
uniform vec2  uSun;
#define OCT ${octaves}
${high ? '#define HIGH' : ''}

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < OCT; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

// returns x = coverage, y = how sunlit it is
vec2 cloudLayer(vec2 p, float scale, float speed, vec2 shift, float cover, float soft, vec2 sunDir){
  vec2 q = p * scale + shift + vec2(uTime * speed, 0.0);
  float d = fbm(q);
#ifdef HIGH
  d += 0.28 * (fbm(q * 1.9 + 7.1 + uTime * speed * 0.6) - 0.5);   // light warp so the edges billow
#endif
  float dens = smoothstep(cover, cover + soft, d);
  float toward = fbm(q + sunDir * 0.10);                          // density between this point and the sun = self shadow
  float lit = clamp(0.66 + (d - toward) * 3.4, 0.0, 1.0);
  return vec2(dens, lit);
}

vec3 cloudColour(float lit, float rim, vec3 sunCol){
  vec3 shadow = vec3(0.60, 0.72, 0.90);
  vec3 bright = vec3(1.00, 0.985, 0.95);
  vec3 c = mix(shadow, bright, smoothstep(0.15, 0.95, lit));
  return c + sunCol * rim * 0.35;
}

void main(){
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(uAspect, 1.0);
  vec2 sunV = (uSun - 0.5) * vec2(uAspect, 1.0);
  vec2 sunDir = normalize(sunV + 1e-4);
  vec3 sunCol = vec3(1.0, 0.95, 0.80);

  // sky body: deeper at the top, pale and warm toward the horizon, like the invitation
  vec3 zen = vec3(0.10, 0.46, 0.86);
  vec3 mid = vec3(0.34, 0.69, 0.96);
  vec3 hor = vec3(0.84, 0.93, 1.00);
  float h = clamp(uv.y + uScroll * 0.08, 0.0, 1.0);
  vec3 sky = mix(hor, mid, smoothstep(0.0, 0.5, h));
  sky = mix(sky, zen, smoothstep(0.45, 1.05, h));
  vec3 warm = vec3(1.0, 0.86, 0.60);
  sky += warm * smoothstep(0.28, 0.0, uv.y) * 0.16;

  // sun with soft rays
  vec2 sd = (uv - uSun) * vec2(uAspect, 1.0);
  float r = length(sd);
  float ang = atan(sd.y, sd.x);
  float glow = exp(-r * 3.0) * 0.50 + exp(-r * 12.0) * 0.85 + exp(-r * 55.0) * 2.2;
  float rays = pow(noise(vec2(ang * 6.0 + uTime * 0.025, 2.0)), 3.0) * exp(-r * 2.2) * 0.55;
  sky += sunCol * (glow + rays);

  // cloud framing: dense at the sides and bottom, open in the middle where the type sits
  float edge = smoothstep(0.12, 0.98, abs(uv.x - 0.5) * 2.0);
  float bottom = smoothstep(0.50, 0.0, uv.y);
  float top = smoothstep(0.72, 1.0, uv.y) * 0.35;
  float mask = clamp(edge * 0.95 + bottom * 0.75 + top, 0.0, 1.0);
  float cover = 0.64 - mask * 0.24;

  vec2 cam = uCam;
  vec2 sc = vec2(0.0, uScroll * 0.25);

  vec3 col = sky;
  float fgAlpha = 0.0;
  vec3 fgCol = vec3(1.0);

  if (uPass < 0.5) {
#ifdef HIGH
    vec2 f = cloudLayer(p, 2.6, 0.006, cam * 0.35 + sc * 0.3 + 11.0, cover + 0.05, 0.26, sunDir);
    col = mix(col, mix(cloudColour(f.y, 0.0, sunCol), hor, 0.38), f.x * 0.72 * clamp(mask + 0.15, 0.0, 1.0));
#endif
    vec2 m = cloudLayer(p, 1.7, 0.012, cam * 0.65 + sc * 0.6 + 3.0, cover, 0.24, sunDir);
    col = mix(col, cloudColour(m.y, exp(-r * 2.0), sunCol), m.x * 0.92);
  }

  vec2 n = cloudLayer(p, 1.05, 0.020, cam * 1.0 + sc + 27.0, cover - 0.03, 0.22, sunDir);
  vec3 nc = cloudColour(n.y, exp(-r * 1.6), sunCol);
  if (uPass < 0.5) {
    col = mix(col, nc, n.x);
  } else {
    // foreground bank: bottom edge only, so the aircraft flies out from behind it
    float bank = smoothstep(0.34, 0.02, uv.y + 0.07 * sin(uv.x * 4.0 + 1.0)) * (1.0 - 0.55 * smoothstep(0.55, 1.0, uv.x));
    fgAlpha = n.x * bank * uFg;
    fgCol = nc;
  }

  if (uPass < 0.5) {
    col = mix(hor * 1.12, col, uFade);                                  // opens from a bright haze
    col *= 1.0 - 0.10 * pow(length((uv - 0.5) * vec2(1.0, 1.15)), 2.0);
    col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.012;        // dither against banding
    gl_FragColor = vec4(col, 1.0);
  } else {
    gl_FragColor = vec4(fgCol, fgAlpha * uFade);
  }
}`;

export const trailVertex = /* glsl */ `
attribute vec2 aTrail;           // x = age 0..1, y = side -1..1
varying vec2 vT;
void main(){
  vT = aTrail;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

export const trailFragment = /* glsl */ `
precision highp float;
varying vec2 vT;
uniform float uOpacity;
void main(){
  float age = vT.x;
  float side = abs(vT.y);
  float edge = 1.0 - pow(side, 2.4);
  float core = exp(-pow(side * 2.4, 2.0));
  vec3 gold = mix(vec3(1.00, 0.88, 0.52), vec3(0.96, 0.70, 0.10), clamp(age * 1.3, 0.0, 1.0));
  vec3 col = gold + vec3(0.30, 0.22, 0.05) * core * (1.0 - age);
  float a = pow(1.0 - age, 1.35) * smoothstep(0.0, 0.07, age) * edge;
  gl_FragColor = vec4(col, a * uOpacity * 0.92);
}`;
