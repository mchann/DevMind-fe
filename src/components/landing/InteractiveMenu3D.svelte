<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  export let isGatewayMode = false;

  const dispatch = createEventDispatcher();

  let containerEl: HTMLElement;
  let isLoading = true;
  let loadProgress = 0;
  let blurOverlayEl: HTMLElement;

  let screenTracker: THREE.Object3D | null = null;
  let screenUpdateFn: (() => void) | null = null;

  // Interaction State
  let isActive = false;
  let selectedOption = 0; // 0 = View Blueprint, 1 = Skip
  let isEscaping = false;
  let escapeDinoX = 20; // Pixel coordinate on the canvas (0-512)
  
  // Raycaster state for mouse interaction
  let screenMesh: THREE.Mesh | null = null;
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  
  // Dinosaur Sprite (Same 9x8 grid, scaled)
  const dinoSprite = [
    '000111100',
    '000110110',
    '000111110',
    '000111000',
    '101111100',
    '111111100',
    '001111000',
    '001000100',
  ];
  let currentFrame = 0;

  // Three.js instances
  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let modelGroup: THREE.Group | null = null;
  let animFrameId: number | null = null;
  let scrollTriggerInstance: ScrollTrigger | null = null;

  function createScreenTexture(): { texture: THREE.CanvasTexture; update: () => void } {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext('2d')!;
    const texture = new THREE.CanvasTexture(canvas);

    function update() {
      // CRT dark slate backdrop
      ctx.fillStyle = '#0D1117';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // CRT scanlines
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y, canvas.width, 2);
      }

      // CRT Header bar
      ctx.fillStyle = '#161B22';
      ctx.fillRect(0, 0, canvas.width, 42);
      ctx.fillStyle = '#2DD4BF';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('DEVMIND // SYSTEM GATEWAY', 20, 28);

      if (isEscaping) {
        // Draw just the running Dino
        ctx.fillStyle = '#FFD23F';
        const pixelSize = 8;
        const dinoY = canvas.height / 2 - 32;
        
        // Simple leg animation hack based on X position
        const frameToggle = (Math.floor(escapeDinoX / 10) % 2 === 0);
        
        for (let r = 0; r < dinoSprite.length; r++) {
          for (let c = 0; c < dinoSprite[r].length; c++) {
            let pixel = dinoSprite[r][c];
            // Animate legs
            if (r === 7 && pixel === '1') {
                if (frameToggle && c === 2) pixel = '0'; // Hide left leg
                if (!frameToggle && c === 6) pixel = '0'; // Hide right leg
            }
            if (pixel === '1') {
              ctx.fillRect(escapeDinoX + c * pixelSize, dinoY + r * pixelSize, pixelSize, pixelSize);
            }
          }
        }
      } else {
        // Render Menu
        ctx.fillStyle = '#E2E8F0';
        ctx.font = 'bold 18px monospace';
        ctx.fillText('ACCESS REQUIRED TO PROCEED.', 20, 90);
        ctx.fillText('Select Action:', 20, 130);

        const options = ['DevMind Access System', 'Read Documentation'];
        
        options.forEach((opt, i) => {
          if (i === selectedOption) {
            ctx.fillStyle = '#FFD23F';
            ctx.fillText(`> [ ${opt} ]`, 20, 180 + i * 40);
          } else {
            ctx.fillStyle = 'rgba(226, 232, 240, 0.5)';
            ctx.fillText(`  [ ${opt} ]`, 20, 180 + i * 40);
          }
        });

        // Blinking cursor hint
        const time = Date.now() / 500;
        if (time % 2 < 1) {
          ctx.fillStyle = '#2DD4BF';
          ctx.fillRect(20, 280, 12, 20);
        }
      }

      texture.needsUpdate = true;
    }

    update();
    return { texture, update };
  }

  function escapeLoop() {
    if (!isEscaping) return;
    escapeDinoX += 8; // Move right
    
    if (screenUpdateFn) screenUpdateFn();

    if (escapeDinoX > 512) {
      // DINO HAS ESCAPED THE SCREEN!
      // Send the absolute world position of the screen to spawn the DOM Dino
      if (screenTracker && camera && containerEl) {
        const vec = new THREE.Vector3();
        screenTracker.getWorldPosition(vec);
        vec.project(camera);
        
        const rect = containerEl.getBoundingClientRect();
        const screenX = (vec.x * 0.5 + 0.5) * rect.width + rect.left;
        const screenY = -(vec.y * 0.5 - 0.5) * rect.height + rect.top;
        
        // Let the parent component handle the DOM spawn and transition
        dispatch('dinoEscaped', { x: screenX, y: screenY });
      }
      isEscaping = false; // Stop loop
    } else {
      requestAnimationFrame(escapeLoop);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!isActive || isEscaping) return;

    if (e.key === 'ArrowUp' || e.key === 'w') {
      e.preventDefault();
      selectedOption = Math.max(0, selectedOption - 1);
      if (screenUpdateFn) screenUpdateFn();
    }
    if (e.key === 'ArrowDown' || e.key === 's') {
      e.preventDefault();
      selectedOption = Math.min(1, selectedOption + 1);
      if (screenUpdateFn) screenUpdateFn();
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (selectedOption === 0) {
        isEscaping = true;
        requestAnimationFrame(escapeLoop);
      } else {
        dispatch('skip');
      }
    }
  }

  function getIntersectedOption(event: MouseEvent): number {
    if (!screenMesh || !camera || !containerEl || !isActive || isEscaping) return -1;
    
    const rect = containerEl.getBoundingClientRect();
    // Normalize mouse coordinates (-1 to +1) relative to container
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(screenMesh);
    
    if (intersects.length > 0 && intersects[0].uv) {
      const uv = intersects[0].uv;
      const px = uv.x * 512;
      const py = (1 - uv.y) * 384;
      
      // Hit boxes for options on the 512x384 canvas
      // Option 0: Y = 180 (baseline). Box approx Y: 160-195
      // Option 1: Y = 220 (baseline). Box approx Y: 200-235
      if (px > 20 && px < 400 && py > 155 && py < 195) {
        return 0; // Option 0
      } else if (px > 20 && px < 400 && py > 195 && py < 235) {
        return 1; // Option 1
      }
    }
    return -1;
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isActive || isEscaping) return;
    const opt = getIntersectedOption(e);
    if (opt !== -1) {
      document.body.style.cursor = 'pointer';
      if (selectedOption !== opt) {
        selectedOption = opt;
        if (screenUpdateFn) screenUpdateFn();
      }
    } else {
      document.body.style.cursor = 'default';
    }
  }

  function handleMouseClick(e: MouseEvent) {
    if (!isActive || isEscaping) return;
    const opt = getIntersectedOption(e);
    if (opt !== -1) {
      // Simulate Enter
      if (opt === 0) {
        isEscaping = true;
        document.body.style.cursor = 'default';
        requestAnimationFrame(escapeLoop);
      } else {
        document.body.style.cursor = 'default';
        dispatch('skip');
      }
    }
  }

  function resetCursor() {
    document.body.style.cursor = 'default';
  }

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);

    window.addEventListener('keydown', handleKeyDown);
    if (containerEl) {
      containerEl.addEventListener('mousemove', handleMouseMove);
      containerEl.addEventListener('click', handleMouseClick);
      containerEl.addEventListener('mouseleave', resetCursor);
    }

    // 1. Three.js Scene & Camera Setup — defer until layout is painted
    scene = new THREE.Scene();
    const width = containerEl.getBoundingClientRect().width || window.innerWidth;
    const height = containerEl.getBoundingClientRect().height || window.innerHeight;

    camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    // Adjusted camera distance for a comfortable zoom (not too close)
    camera.position.set(0, 0.4, 4.0); 
    camera.lookAt(0, 0.2, 0);

    // 2. WebGLRenderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerEl.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff8ee, 2.5);
    dirLight1.position.set(5, 8, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x2dd4bf, 1.2);
    dirLight2.position.set(-5, -2, -4);
    scene.add(dirLight2);

    modelGroup = new THREE.Group();
    scene.add(modelGroup);
    
    // Position slightly higher so the bottom bezel is fully visible
    modelGroup.position.set(0, -0.2, 0);

    // 4. Create live CRT dynamic screen texture
    const { texture: screenTex, update: updateCrt } = createScreenTexture();
    screenUpdateFn = updateCrt;

    // 5. Load Real GLB Model
    const loader = new GLTFLoader();
    loader.load(
      '/models/computer.glb',
      (gltf) => {
        isLoading = false;
        const root = gltf.scene;

        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        // Balanced scale so it's readable but not overwhelmingly huge
        const targetScale = 3.2 / maxDim; 
        root.scale.setScalar(targetScale);
        root.updateMatrixWorld(true);

        const newBox = new THREE.Box3().setFromObject(root);
        const newCenter = newBox.getCenter(new THREE.Vector3());
        
        root.position.x -= newCenter.x;
        root.position.y -= newCenter.y;
        root.position.z -= newCenter.z;

        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const matName = (mesh.material as THREE.Material)?.name || '';
            const nameStr = (matName + ' ' + mesh.name).toLowerCase();
            const isScreen = nameStr.includes('screen') || 
                             nameStr.includes('material004') || 
                             nameStr.includes('material.004') ||
                             nameStr.includes('material1004') ||
                             nameStr.includes('material005');
                             
            if (isScreen) {
              screenMesh = mesh;
              mesh.material = new THREE.MeshBasicMaterial({ map: screenTex });
              
              // Invisible tracker for the Dino escape coordinate!
              screenTracker = new THREE.Object3D();
              mesh.geometry?.computeBoundingBox();
              if (mesh.geometry?.boundingBox) {
                // Attach tracker slightly to the right to simulate escape edge
                const center = new THREE.Vector3();
                mesh.geometry.boundingBox.getCenter(center);
                // Move tracker to the bottom-right edge of the screen!
                center.x += (mesh.geometry.boundingBox.max.x - center.x) * 0.95;
                center.y -= (center.y - mesh.geometry.boundingBox.min.y) * 0.85;
                screenTracker.position.copy(center);
              }
              mesh.add(screenTracker);
            } else {
              mesh.material = new THREE.MeshStandardMaterial({
                color: 0x2A2A2E, // Dark gray
                roughness: 0.8,
                metalness: 0.2
              });
            }
          }
        });

        modelGroup?.add(root);
        
        // Removed hover animation as requested
      },
      (xhr) => {
        if (xhr.total > 0) {
          loadProgress = Math.round((xhr.loaded / xhr.total) * 100);
        }
      }
    );

    // 6. Intersection Observer for Activity
    ScrollTrigger.create({
      trigger: containerEl,
      start: 'top 80%',
      end: 'bottom 20%',
      onEnter: () => isActive = true,
      onLeave: () => isActive = false,
      onEnterBack: () => isActive = true,
      onLeaveBack: () => isActive = false
    });

    // 7. Render Animation Loop
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      
      // Update cursor blink if not escaping
      if (!isEscaping && screenUpdateFn) {
        screenUpdateFn();
      }
      
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };
    animate();

    // 8. Resize Listener
    const onResize = () => {
      if (!containerEl || !renderer || !camera) return;
      const { width: w, height: h } = containerEl.getBoundingClientRect();
      if (w === 0 || h === 0) return;
      
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', onResize);
      if (containerEl) {
        containerEl.removeEventListener('mousemove', handleMouseMove);
        containerEl.removeEventListener('click', handleMouseClick);
        containerEl.removeEventListener('mouseleave', resetCursor);
      }
      resetCursor();
    };
  });

  onDestroy(() => {
    resetCursor();
    if (animFrameId) cancelAnimationFrame(animFrameId);
    ScrollTrigger.getAll().forEach(t => t.vars.trigger === containerEl && t.kill());

    if (scene) {
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });
    }

    if (renderer) {
      renderer.dispose();
      renderer.domElement?.remove();
    }
  });

  // Expose function for parent to slide the 3D model out
  export function slideOut() {
    if (modelGroup) {
      gsap.to(modelGroup.position, { x: -5, duration: 1.5, ease: 'power2.inOut' });
    }
  }
</script>

<div class="relative w-full min-h-screen select-none overflow-hidden {isGatewayMode ? 'bg-transparent' : 'bg-[#0A0A0A]'} flex flex-col items-center justify-center border-b-[3px] border-[var(--page-border)]">
  
  <!-- Interactive hint -->
  <div class="absolute top-12 z-20 text-center pointer-events-none transition-opacity duration-300" class:opacity-0={!isActive || isEscaping}>
    <p class="font-mono text-sm text-[var(--accent-teal)] font-bold mb-2 uppercase tracking-widest">Interactive Terminal</p>
    <p class="font-sans text-gray-400 text-xs">Use <span class="px-1.5 py-0.5 bg-gray-800 rounded text-white font-mono mx-1">&uarr; &darr;</span> or <span class="px-1.5 py-0.5 bg-gray-800 rounded text-white font-mono mx-1">CLICK</span> to choose</p>
  </div>

  <!-- Three.js Canvas Container -->
  <div bind:this={containerEl} class="absolute inset-0 w-full h-full z-0 cursor-pointer" on:click={() => { if (!isEscaping) handleKeyDown(new KeyboardEvent('keydown', { key: 'Enter' })) }}></div>

  <!-- Loading Overlay -->
  {#if isLoading}
    <div class="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-[#0A0A0A]">
      <span class="font-mono text-xs font-bold text-white mb-4 tracking-widest animate-pulse">CONNECTING TO GATEWAY...</span>
      <div class="w-64 h-1 bg-gray-900 rounded overflow-hidden">
        <div class="h-full bg-[var(--accent-teal)] transition-all duration-150" style="width: {loadProgress}%;"></div>
      </div>
    </div>
  {/if}
</div>


