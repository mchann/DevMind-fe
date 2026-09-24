<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import * as THREE from "three";
  import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
  import gsap from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";

  const dispatch = createEventDispatcher();

  export let hasScrolled = false;

  let containerEl: HTMLElement;

  let isLoading = true;
  let loadProgress = 0;

  // Mask coordinates for sharp screen
  let maskX = -1000;
  let maskY = -1000;
  let screenTracker: THREE.Object3D | null = null;
  let blurOverlayEl: HTMLElement;

  // 3D Screen Typewriter Log lines
  const crtLogQueue = [
    "$ devmind mcp --daemon",
    "✓ MCP stdio transport ready",
    "→ watching stack traces...",
    "✗ NULL_POINTER at auth.ts:42",
    '→ lookup_past_fix("ERR_042")',
    "✓ fix injected in 0.8s",
  ];
  let activeLogLines: string[] = ["$ devmind mcp --daemon"];
  let screenUpdateFn: ((lines: string[], scrolled: boolean) => void) | null =
    null;
  let crtInterval: ReturnType<typeof setInterval> | null = null;

  // Dinosaur Sprite for CRT Canvas
  const dinoSprite = [
    "000111100",
    "000110110",
    "000111110",
    "000111000",
    "101111100",
    "111111100",
    "001111000",
    "001000100",
  ];

  $: {
    if (screenUpdateFn) {
      screenUpdateFn(activeLogLines, hasScrolled);
    }
  }

  // Three.js instances
  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let modelGroup: THREE.Group | null = null;
  let animFrameId: number | null = null;
  let scrollTriggerInstance: ScrollTrigger | null = null;
  let scrollRotationY = 0;
  let isReducedMotion = false;
  let isIntroComplete = false;

  function createScreenTexture(): {
    texture: THREE.CanvasTexture;
    update: (lines: string[], scrolled: boolean) => void;
  } {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext("2d")!;
    const texture = new THREE.CanvasTexture(canvas);

    function update(lines: string[], scrolled: boolean) {
      // CRT dark slate backdrop
      ctx.fillStyle = "#0D1117";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // CRT scanlines
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y, canvas.width, 2);
      }

      // CRT Header bar
      ctx.fillStyle = "#161B22";
      ctx.fillRect(0, 0, canvas.width, 42);
      ctx.fillStyle = "#2DD4BF";
      ctx.font = "bold 18px monospace";
      ctx.fillText("DEVMIND // MCP LIVE MONITOR", 20, 28);

      // Render typed terminal lines
      ctx.font = "bold 17px monospace";
      lines.forEach((line, i) => {
        if (line.startsWith("✓")) ctx.fillStyle = "#2DD4BF";
        else if (line.startsWith("✗")) ctx.fillStyle = "#FF5C38";
        else if (line.startsWith("→")) ctx.fillStyle = "#FFD23F";
        else ctx.fillStyle = "#E2E8F0";
        ctx.fillText(line, 20, 78 + i * 36);
      });

      // Blinking cursor
      ctx.fillStyle = "#2DD4BF";
      const lastLine = lines[lines.length - 1] || "";
      const cursorX = 20 + lastLine.length * 10.5;
      const cursorY = 78 + (lines.length - 1) * 36 - 15;
      ctx.fillRect(cursorX, cursorY, 11, 18);

      // Draw pixel dinosaur if not scrolled
      if (!scrolled) {
        ctx.fillStyle = "#FFD23F"; // Accent yellow
        const pixelSize = 5;
        const dinoX = canvas.width - 60;
        const dinoY = canvas.height - 60;
        for (let r = 0; r < dinoSprite.length; r++) {
          for (let c = 0; c < dinoSprite[r].length; c++) {
            if (dinoSprite[r][c] === "1") {
              ctx.fillRect(
                dinoX + c * pixelSize,
                dinoY + r * pixelSize,
                pixelSize,
                pixelSize,
              );
            }
          }
        }
      }

      texture.needsUpdate = true;
    }

    update(activeLogLines, hasScrolled);
    return { texture, update };
  }

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);
    isReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // 1. Three.js Scene & Camera Setup
    scene = new THREE.Scene();
    const width = containerEl.clientWidth || window.innerWidth;
    const height = containerEl.clientHeight || window.innerHeight;

    camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    // Use original camera position so the final layout matches perfectly
    camera.position.set(2.5, 1.2, 4.0);
    camera.lookAt(0, 0, 0);

    // 2. WebGLRenderer
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerEl.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff8ee, 2.5); // Boosted lighting
    dirLight1.position.set(5, 8, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x2dd4bf, 1.2);
    dirLight2.position.set(-5, -2, -4);
    scene.add(dirLight2);

    modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Lock scroll during intro and compensate for scrollbar to prevent layout shift
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    // Initial Full-Screen Positioning for Boot Sequence
    // Placed exactly halfway on the line of sight between (0,0,0) and the camera to center it perfectly
    modelGroup.position.set(1.25, 0.35, 2.0);
    modelGroup.rotation.y = 0.56; // Faces the camera directly (atan2(2.5, 4.0))

    // 4. Create live CRT dynamic screen texture
    const { texture: screenTex, update: updateCrt } = createScreenTexture();
    screenUpdateFn = updateCrt;

    // 5. Load Real GLB Model
    const loader = new GLTFLoader();
    loader.load(
      "/models/computer.glb",
      (gltf) => {
        isLoading = false;
        const root = gltf.scene;

        // Auto-center and normalize scale correctly
        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const targetScale = 2.0 / maxDim; // Reduced zoom so monitor is visible
        root.scale.setScalar(targetScale);
        root.updateMatrixWorld(true);

        // Recompute box after scaling to find the new center
        const newBox = new THREE.Box3().setFromObject(root);
        const newCenter = newBox.getCenter(new THREE.Vector3());

        // Offset the root so its center is perfectly at 0,0,0 local to its parent
        root.position.x -= newCenter.x;
        root.position.y -= newCenter.y;
        root.position.z -= newCenter.z;

        // Apply live CRT texture to screen mesh and add tracker
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const matName = (mesh.material as THREE.Material)?.name || "";
            const nameStr = (matName + " " + mesh.name).toLowerCase();
            const isScreen =
              nameStr.includes("screen") ||
              nameStr.includes("material004") ||
              nameStr.includes("material.004") ||
              nameStr.includes("material1004") ||
              nameStr.includes("material005");

            if (isScreen) {
              mesh.material = new THREE.MeshBasicMaterial({ map: screenTex });

              // Add invisible tracker to find 2D screen coordinates
              screenTracker = new THREE.Object3D();
              mesh.geometry?.computeBoundingBox();
              if (mesh.geometry?.boundingBox) {
                mesh.geometry.boundingBox.getCenter(screenTracker.position);
              }
              mesh.add(screenTracker);
            } else {
              // Override body material so it is visible against black background
              mesh.material = new THREE.MeshStandardMaterial({
                color: 0x2a2a2e, // Dark gray
                roughness: 0.8,
                metalness: 0.2,
              });
            }
          }
        });

        modelGroup?.add(root);

        // Calculate final positions based on screen size
        const w = window.innerWidth;
        const finalX = w < 1024 ? 0 : 1.5;
        const finalY = w < 1024 ? -0.35 : 0.15;
        const finalZ = 0;
        const finalRotY = w < 1024 ? 0 : -0.25;

        const tl = gsap.timeline({
          paused: true,
          onComplete: () => {
            isIntroComplete = true;
            // Unlock scroll, remove padding, and notify parent to reveal text
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
            dispatch("introComplete");

            // Start CRT live typing loop (idle logs) after computer settles on the right
            let logStep = 1;
            crtInterval = setInterval(() => {
              if (logStep < crtLogQueue.length) {
                activeLogLines = [...activeLogLines, crtLogQueue[logStep]];
                screenUpdateFn?.(activeLogLines, hasScrolled);
                logStep++;
              } else {
                activeLogLines = [
                  "$ devmind mcp --ready",
                  "✓ listening on stdio...",
                ];
                screenUpdateFn?.(activeLogLines, hasScrolled);
                logStep = 0;
              }
            }, 1800);
          },
        });

        // 1. Wait briefly for user to read the boot text
        tl.to({}, { duration: 0.6 });

        // 3. Move and shrink to final Hero position
        tl.to(
          modelGroup!.position,
          {
            x: finalX,
            y: finalY,
            z: finalZ,
            duration: 1.2,
            ease: "power3.inOut",
          },
          "move",
        );

        tl.to(
          modelGroup!.rotation,
          {
            y: finalRotY,
            duration: 1.2,
            ease: "power3.inOut",
          },
          "move",
        );

        // 4. Synchronization Logic: Wait for Loader to finish
        const playIntro = () => {
          tl.play();

          // Type the boot text while the computer is still in the center
          setTimeout(() => {
            if (screenUpdateFn) {
              activeLogLines = [
                "$ devmind mcp --ready",
                "✓ listening on stdio...",
              ];
              screenUpdateFn?.(activeLogLines, hasScrolled);
            }
          }, 100);
        };

        if ((window as any).__devmind_loader_done) {
          playIntro();
        } else {
          window.addEventListener("devmind:loader-done", playIntro, { once: true });
        }
      },
      (xhr) => {
        if (xhr.total > 0) {
          loadProgress = Math.round((xhr.loaded / xhr.total) * 100);
        }
      },
    );

    // 6. Removed ScrollTrigger per request to prevent lag and movement on scroll

    // Reusable vector to prevent Garbage Collection pauses (tbtb ngelag)
    const screenWorldPos = new THREE.Vector3();
    let lastMaskX = -1000;
    let lastMaskY = -1000;
    let canvasW = window.innerWidth;
    let canvasH = window.innerHeight;

    // 7. Render Animation Loop
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }

      // Update CSS Mask coordinates directly on DOM node for performance
      if (screenTracker && camera && containerEl && blurOverlayEl) {
        screenTracker.getWorldPosition(screenWorldPos);
        screenWorldPos.project(camera);

        maskX = (screenWorldPos.x * 0.5 + 0.5) * canvasW;
        maskY = -(screenWorldPos.y * 0.5 - 0.5) * canvasH;

        // Skip heavy DOM writes if position hasn't meaningfully changed
        if (Math.abs(maskX - lastMaskX) < 0.1 && Math.abs(maskY - lastMaskY) < 0.1) {
          return;
        }
        
        lastMaskX = maskX;
        lastMaskY = maskY;

        // Apply dynamically to avoid Svelte re-evaluation thrashing every frame
        // Use a wide ellipse to cover the rectangular screen better so text is sharp
        const maskStr = `radial-gradient(ellipse 650px 450px at ${maskX}px ${maskY}px, transparent 20%, black 75%)`;
        blurOverlayEl.style.maskImage = maskStr;
        blurOverlayEl.style.webkitMaskImage = maskStr;
      }
    };
    animate();

    // 8. Resize Listener
    const onResize = () => {
      if (!containerEl || !renderer || !camera || !modelGroup) return;
      const w = containerEl.clientWidth;
      const h = containerEl.clientHeight;
      if (w === 0 || h === 0) return;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      canvasW = w;
      canvasH = h;

      if (isIntroComplete) {
        if (w < 1024) {
          gsap.to(modelGroup.position, { x: 0, y: -0.35, duration: 0.5 });
        } else {
          gsap.to(modelGroup.position, { x: 1.5, y: 0.15, duration: 0.5 });
        }
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  });

  onDestroy(() => {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    if (crtInterval) clearInterval(crtInterval);

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
</script>

<div
  class="absolute inset-0 w-full h-full select-none overflow-hidden bg-[#0A0A0A]"
>
  <!-- Three.js Canvas Container -->
  <div bind:this={containerEl} class="absolute inset-0 w-full h-full z-0"></div>

  <!-- Blur Overlay with Dynamic CSS Mask -->
  <div
    bind:this={blurOverlayEl}
    class="absolute inset-0 z-10 pointer-events-none transition-opacity duration-1000"
    style="
      backdrop-filter: blur(8px); 
      -webkit-backdrop-filter: blur(8px);
      background-color: rgba(10, 10, 10, 0.45);
      opacity: {isLoading ? 0 : 1};
    "
  ></div>

  <!-- Loading Overlay -->
  {#if isLoading}
    <div
      class="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-[#0A0A0A]"
    >
      <span
        class="font-mono text-xs font-bold text-white mb-4 tracking-widest animate-pulse"
        >BOOTING 3D ENVIRONMENT...</span
      >
      <div class="w-64 h-1 bg-gray-900 rounded overflow-hidden">
        <div
          class="h-full bg-[var(--accent-teal)] transition-all duration-150"
          style="width: {loadProgress}%;"
        ></div>
      </div>
    </div>
  {/if}
</div>
