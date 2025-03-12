import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, AfterViewInit, PLATFORM_ID, HostListener } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-home',
  standalone: true, // ✅ Ensure this property exists
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  private condenser!: HTMLElement;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private model!: THREE.Object3D;

  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.instance();
    }
  }

  private instance(): void {
    this.condenser = this.el.nativeElement.querySelector('.scene');

    // Create Scene
    this.scene = new THREE.Scene();

    // Camera Setup
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 1.5, 5);

    // Lights Setup
    const ambientLight = new THREE.AmbientLight(0x404040, 3);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(2, 2, 2);
    this.scene.add(directionalLight);

    // Renderer Setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.condenser.appendChild(this.renderer.domElement);

    // Loading Manager
    const loadingManager = new THREE.LoadingManager(() => {
      document.getElementById('loading-screen')?.classList.add('finished');
      document.body.classList.add('ready');
    });

    // Load Model
    const loader = new GLTFLoader(loadingManager);
    loader.load('assets/images/robo.gltf', (gltf) => {
      this.model = gltf.scene;
      this.model.scale.set(1, 1, 1);
      this.scene.add(this.model);

      this.animate();
      this.setupScrollAnimations();
    });

    // Handle Window Resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private setupScrollAnimations(): void {
    if (!this.model) return;

    gsap.to(this.model.rotation, {
      y: '+=6.3',
      ease: 'none',
      scrollTrigger: {
        trigger: '.sec-1',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    });

    gsap.to(this.model.position, {
      z: '+=2',
      ease: 'none',
      scrollTrigger: {
        trigger: '.sec-2',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    });
  }

  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    this.renderer.render(this.scene, this.camera);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
