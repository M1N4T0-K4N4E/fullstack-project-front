export const OGLDefaultVertex = /* glsl */ `attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 0, 1);
}
`;

export const OGLDefaultFragment = /* glsl */ `precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform float uCells; // min:2 max:20 default:8 step:1
uniform float uSpeed; // min:0 max:3 default:0.8 step:0.05
uniform vec3 uBaseColor; // color default:#257cff
uniform vec3 uEdgeColor; // color default:#ffffff
uniform float uEdgeWidth; // min:0.01 max:0.3 default:0.05 step:0.005

vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  uv.x *= uResolution.x / uResolution.y;
  vec2 p = uv * uCells;
  vec2 ip = floor(p);
  vec2 fp = fract(p);

  float d1 = 10.0, d2 = 10.0;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 point = hash(ip + neighbor);
      point = 0.5 + 0.5 * sin(uTime * uSpeed + 6.2831 * point);
      float d = length(neighbor + point - fp);
      if (d < d1) { d2 = d1; d1 = d; }
      else if (d < d2) { d2 = d; }
    }
  }

  float edge = smoothstep(0.0, uEdgeWidth, d2 - d1);
  vec3 col = mix(uEdgeColor, uBaseColor, edge);
  gl_FragColor = vec4(col, 1.0);
}
`;