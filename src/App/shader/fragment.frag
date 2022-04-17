uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform vec2 uResolution;
uniform float uTime;

varying vec2 vUv;

void main(){
  vec4 mask=texture2D(uTexture2,vUv);
  float strength=mask.a;
  vec4 bg=texture2D(uTexture1,vUv + 0.1 - strength*0.1);
  gl_FragColor=bg;
  gl_FragColor.a*=mask.a;
}