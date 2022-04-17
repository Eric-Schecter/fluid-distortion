import React, { useRef, useEffect } from 'react';
import styles from './index.module.scss';
import {
  Mesh, Scene, ShaderMaterial, WebGLRenderer, WebGLRenderTarget,
  Vector2, AdditiveBlending, OrthographicCamera, PlaneBufferGeometry, MeshBasicMaterial, TextureLoader,
} from 'three';
import fragment from './shader/fragment.frag';
import vertex from './shader/vertex.vert';

class World {
  private scene: Scene;
  private scene1: Scene;
  private camera: OrthographicCamera;
  private timer = 0;
  private renderer: WebGLRenderer;
  private material: ShaderMaterial;
  private textureLoader = new TextureLoader();
  private mouse = new Vector2();
  private blobs: Mesh[] = [];
  private renderTarget: WebGLRenderTarget;
  constructor(container: HTMLDivElement) {
    const { offsetWidth: width, offsetHeight: height } = container;
    this.renderer = new WebGLRenderer({
      alpha: true,
    });
    this.renderer.setClearColor(0x222222);
    this.renderer.setClearAlpha(0);
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setSize(width, height);
    container.append(this.renderer.domElement);

    this.renderTarget = new WebGLRenderTarget(width, height);

    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    this.camera.position.set(0, 0, 1);
    this.scene = new Scene();
    this.scene1 = new Scene();

    this.addBlobs();

    const geometry = new PlaneBufferGeometry(2, 2);
    this.material = new ShaderMaterial({
      uniforms: {
        uTexture1: { value: this.textureLoader.load('001.jpg') },
        uTexture2: { value: this.textureLoader.load('blob.png') },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
    });
    const mesh = new Mesh(geometry, this.material);
    mesh.position.z = 0.1;
    this.scene.add(mesh);

    const geo = new PlaneBufferGeometry(2, 2);
    const mat = new MeshBasicMaterial({
      map: this.textureLoader.load('002.jpg'),
    });
    const mesh1 = new Mesh(geo, mat);
    this.scene.add(mesh1);
  }
  private randomBetween = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  }
  private initParams = (m: Mesh) => {
    const r = this.randomBetween(0.2, 0.3);
    const theta = this.randomBetween(0, Math.PI * 2);
    m.position.x = r * Math.sin(theta) / 2;
    m.position.y = r * Math.cos(theta) / 2;
    m.position.z = 0.01;
    m.userData.life = this.randomBetween(0, Math.PI * 4);
  }
  private addBlobs = () => {
    const length = 50;
    const geometry = new PlaneBufferGeometry(0.5, 0.5);
    const material = new MeshBasicMaterial({
      map: this.textureLoader.load('blob.png'),
      blending: AdditiveBlending,
      transparent: true,
      opacity: 0.9,
      depthTest: false,
      depthWrite: false,
    })
    const mesh = new Mesh(geometry, material);
    for (let i = 0; i < length; i++) {
      const m = mesh.clone() as Mesh;
      this.initParams(m);
      this.blobs.push(m);
      this.scene1.add(m);
    }
  }
  private updateBlobs = () => {
    this.blobs.forEach(blob => {
      blob.userData.life += 0.1;
      blob.scale.setScalar(Math.sin(blob.userData.life * 0.5));
      if (blob.userData.life > Math.PI * 2) {
        this.initParams(blob)
        blob.position.x += this.mouse.x;
        blob.position.y += this.mouse.y;
      }
    })
  }
  public draw = () => {
    this.updateBlobs();
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.scene1, this.camera);
    this.material.uniforms.uTexture2.value = this.renderTarget.texture;
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);
    this.timer = requestAnimationFrame(this.draw);
  }
  public move = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    this.mouse.x = (clientX / this.renderer.domElement.clientWidth - 0.5) * 2;
    this.mouse.y = -(clientY / this.renderer.domElement.clientHeight - 0.5) * 2;
  }
  public dispose = () => {
    cancelAnimationFrame(this.timer);
  }
}

export const App = () => {
  const ref = useRef<HTMLDivElement>(null);
  const refWorld = useRef<World>();
  useEffect(() => {
    if (!ref.current) { return }
    const container = ref.current;
    refWorld.current = new World(container);
    refWorld.current.draw();
    return () => refWorld.current?.dispose();
  }, [ref])


  return <div
    className={styles.main}
    onMouseMove={e => refWorld.current?.move(e)}
  >
    <div
      ref={ref}
      className={styles.container}
    />
  </div>
}