<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import InteractiveMenu3D from './InteractiveMenu3D.svelte';
  import HowItWorksSection from './HowItWorksSection.svelte';
  import { Mouse } from 'lucide-svelte';

  let gatewayEl: HTMLElement;
  let stickyContainer: HTMLElement;
  let horizontalWrapper: HTMLElement;
  let pixelWipeContainer: HTMLElement;
  let menu3D: any;
  
  let isUnlocked = false;
  let showDomDino = false;
  let domDinoEl: HTMLElement;
  let dinoX = 0;
  let dinoY = 0;
  let dinoJumpFinished = false;
  let pathLineY = -1; // Dynamically tracks where the line should be
  let dinoColor = 'var(--accent-yellow)';
  
  let scrollTriggerInstance: ScrollTrigger | null = null;
  let runInterval: ReturnType<typeof setInterval> | null = null;

  const FRAME_A = ['000111100','000110110','000111110','000111000','101111100','111111100','001111000','001000100'];
  const FRAME_B = ['000111100','000110110','000111110','000111000','101111100','111111100','001111000','000101000'];
  let currentFrame = FRAME_A;

  function updatePathLine() {
    const divider = document.getElementById('blueprint-footer-divider');
    if (divider && horizontalWrapper) {
      // Position relative to the horizontal wrapper (which is h-screen)
      const wrapperRect = horizontalWrapper.getBoundingClientRect();
      const dividerRect = divider.getBoundingClientRect();
      pathLineY = dividerRect.top - wrapperRect.top;
    } else {
      pathLineY = window.innerHeight - 120; // Fallback
    }
  }

  function handleDinoEscaped(e: CustomEvent<{ x: number, y: number }>) {
    dinoX = e.detail.x;
    
    // Dino's original spawn position from the screen
    dinoY = e.detail.y - 64; 
    
    showDomDino = true;

    // Fast leg animation for the jump out
    runInterval = setInterval(() => {
      currentFrame = currentFrame === FRAME_A ? FRAME_B : FRAME_A;
    }, 80);

    setTimeout(() => {
      if (!domDinoEl) return;
      
      // GSAP 'y' translates relative to the element's actual CSS top (which is dinoY).
      // The goal is for his feet (y+64) to touch pathLineY.
      const goalTop = pathLineY - 64;
      const targetY = goalTop - dinoY;
      
      // Jump up slightly before falling down
      const jumpPeakY = Math.min(-60, targetY - 60); 
      
      // 1. Jump out of the 3D screen and fall to the floor
      gsap.timeline()
        .to(domDinoEl, { y: jumpPeakY, x: '+=60', duration: 0.3, ease: 'power2.out' })
        .to(domDinoEl, { y: targetY, x: '+=60', duration: 0.5, ease: 'bounce.out' })
        .add(() => {
          if (runInterval) clearInterval(runInterval);
          // Standard walk speed
          runInterval = setInterval(() => {
            currentFrame = currentFrame === FRAME_A ? FRAME_B : FRAME_A;
          }, 150);

          // 2. Unlock the scroll space
          isUnlocked = true;

          // 3. Initialize the ScrollTrigger Scrub
          setTimeout(() => initScrollReveal(), 50);
        });
    }, 50);
  }

  function initScrollReveal() {
    // Clean up any existing ScrollTriggers for this section to prevent duplicates
    ScrollTrigger.getAll().forEach(t => {
      if (t.vars.id === 'horizontal-scroll' || t.vars.id === 'feature-node-popup' || t.vars.id === 'navbar-hide' || t.vars.id === 'blueprint-wipe' || t.vars.id === 'dino-reposition' || t.vars.id === 'dino-reposition-end') {
        t.kill();
      }
    });
    
    // We pin the sticky container and scrub the horizontal wrapper
    const horizontalTween = gsap.to(horizontalWrapper, {
      x: '-75%',
      ease: 'none',
      scrollTrigger: {
        id: 'horizontal-scroll',
        trigger: gatewayEl,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        pin: stickyContainer,
        onUpdate: (self) => {
          // Check boundary between Panel 1 and Panel 2 to switch Dino color
          const panel2 = document.querySelector('.panel-2-trigger');
          if (panel2) {
            const rect = panel2.getBoundingClientRect();
            // Dino is ~72px wide, so center is dinoX + 36
            if (rect.left < dinoX + 36) {
              dinoColor = 'var(--page-text)';
            } else {
              dinoColor = 'var(--accent-yellow)';
            }
          }
        },
        onLeave: () => {
          if (runInterval) clearInterval(runInterval);
        },
        onEnterBack: () => {
          if (!runInterval) {
            runInterval = setInterval(() => {
              currentFrame = currentFrame === FRAME_A ? FRAME_B : FRAME_A;
            }, 150);
          }
        }
      }
    });

    scrollTriggerInstance = horizontalTween.scrollTrigger || null;
    
    // Move Dino to a comfortable position on the right side of the screen (65%) 
    // This gives it some breathing room without making it lag behind on the left.
    const dinoPos = { x: dinoX };
    gsap.to(dinoPos, {
      x: () => window.innerWidth * 0.65,
      ease: 'power2.out',
      scrollTrigger: {
        id: 'dino-reposition',
        trigger: gatewayEl,
        start: 'top top',
        end: '+=1500',
        scrub: 1,
        invalidateOnRefresh: true
      },
      onUpdate: () => {
        dinoX = dinoPos.x;
      }
    });

    // Move Dino further right when entering Panel 3 to avoid covering the text
    gsap.fromTo(dinoPos,
      { x: () => window.innerWidth * 0.65 },
      {
        x: () => window.innerWidth * 0.85,
        ease: 'power1.inOut',
        immediateRender: false,
        scrollTrigger: {
          id: 'dino-reposition-end',
          trigger: '.panel-3-blueprint',
          containerAnimation: horizontalTween,
          start: 'left right', 
          end: 'right right',
          scrub: true,
          invalidateOnRefresh: true
        },
        onUpdate: () => {
          dinoX = dinoPos.x;
        }
      }
    );

    // Pop up the feature nodes dynamically based on Dino's exact screen position
    const nodes = document.querySelectorAll('.feature-node');
    nodes.forEach((node) => {
      // Using containerAnimation allows us to trigger animations when elements 
      // enter the viewport inside a horizontally scrolling container!
      gsap.fromTo(node,
        { y: 80, opacity: 0, scale: 0.8 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            id: 'feature-node-popup',
            trigger: node,
            containerAnimation: horizontalTween,
            // Trigger exactly when the node reaches slightly ahead of the Dino's settled 65% position
            start: "left 72%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Wipe reveal the blueprint elements from left to right ('keseret')
    const reveals = document.querySelectorAll('.blueprint-reveal');
    reveals.forEach((el) => {
      gsap.fromTo(el, 
        { clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' },
        {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          duration: 1.2,
          ease: 'power3.inOut',
          scrollTrigger: {
            id: 'blueprint-wipe',
            trigger: el,
            containerAnimation: horizontalTween,
            start: "left 85%", // Starts wiping when element enters 85% from left
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Recreate the navbar hide trigger so it correctly accounts for the new 600vh height
    createNavbarTrigger();
  }

  function createNavbarTrigger() {
    const nav = document.querySelector('.landing-nav');
    if (!nav) return;

    ScrollTrigger.create({
      id: 'navbar-hide',
      trigger: gatewayEl,
      start: 'top 20%',
      end: 'bottom 20%',
      onEnter: () => gsap.to(nav, { yPercent: -100, duration: 0.4, ease: 'power2.inOut', overwrite: 'auto' }),
      onLeave: () => gsap.to(nav, { yPercent: 0, duration: 0.4, ease: 'power2.inOut', overwrite: 'auto' }),
      onEnterBack: () => gsap.to(nav, { yPercent: -100, duration: 0.4, ease: 'power2.inOut', overwrite: 'auto' }),
      onLeaveBack: () => gsap.to(nav, { yPercent: 0, duration: 0.4, ease: 'power2.inOut', overwrite: 'auto' })
    });
  }

  function handleSkip() {
    isUnlocked = true;
    setTimeout(() => initScrollReveal(), 50);
  }

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);

    // We need to wait a tick for HowItWorksSection to mount and measure
    setTimeout(updatePathLine, 50);
    window.addEventListener('resize', updatePathLine);
    
    // Pixel Block Wipe Reveal Transition
    // We use a scrubbed timeline so scrolling up smoothly un-shatters the pixels!
    // Triggers between 50% and 10% to ensure it finishes before hitting the absolute page bottom.
    if (typeof window !== 'undefined' && pixelWipeContainer) {
      const blocks = pixelWipeContainer.querySelectorAll('.pixel-wipe-block');
      ScrollTrigger.create({
        trigger: gatewayEl,
        start: 'top 60%',
        end: 'top 10%',
        scrub: 1, // Smooth scrubbing
        animation: gsap.to(blocks, {
          scale: 0,
          opacity: 0,
          stagger: {
            amount: 1,
            grid: [20, 20],
            from: 'random'
          },
          ease: 'power1.inOut' // Better for scrubs than power2
        })
      });

      // Initial Navbar hiding logic
      createNavbarTrigger();
    }

    // Hide all sibling astro-islands below this one to physically prevent scrolling past
    const islands = Array.from(document.querySelectorAll('astro-island'));
    let hide = false;
    islands.forEach(island => {
      if (hide) (island as HTMLElement).style.display = 'none';
      if (island.contains(gatewayEl)) hide = true;
    });

    // Watch isUnlocked to re-enable scroll and show siblings
    const unsubscribe = () => {
      document.body.style.overflow = '';
    };
    return unsubscribe;
  });

  $: {
    if (isUnlocked && typeof document !== 'undefined') {
      document.body.style.overflow = '';
      
      // Restore astro-islands when unlocked
      const islands = Array.from(document.querySelectorAll('astro-island'));
      let restore = false;
      islands.forEach(island => {
        if (restore) (island as HTMLElement).style.display = '';
        if (island.contains(gatewayEl)) restore = true;
      });
    }
  }

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', updatePathLine);
      document.body.style.overflow = '';
    }
    if (runInterval) clearInterval(runInterval);
    if (scrollTriggerInstance) scrollTriggerInstance.kill();
    if (typeof window !== 'undefined') {
      ScrollTrigger.getAll().forEach(t => {
        if (t.vars.id === 'horizontal-scroll' || t.vars.id === 'feature-node-popup' || t.vars.id === 'navbar-hide' || t.vars.id === 'blueprint-wipe' || t.vars.id === 'dino-reposition' || t.vars.id === 'dino-reposition-end') t.kill();
      });
      const nav = document.querySelector('.landing-nav');
      if (nav) gsap.set(nav, { clearProps: 'yPercent' });
    }
  });
</script>

<section id="blueprint-gateway" bind:this={gatewayEl} class="relative w-full bg-[var(--page-bg)] {isUnlocked ? 'h-[600vh]' : 'h-screen'}">
  
  <div bind:this={stickyContainer} class="relative w-full h-screen overflow-hidden">
    
    <!-- Pixel Block Wipe Transition Overlay (20x20 grid = 400 pixels) -->
    <div bind:this={pixelWipeContainer} class="absolute inset-0 z-[100] pointer-events-none" style="display: grid; grid-template-columns: repeat(20, 1fr); grid-template-rows: repeat(20, 1fr);">
      {#each Array(400) as _, i}
        <div class="bg-[var(--page-bg)] pixel-wipe-block origin-center w-full h-full"></div>
      {/each}
    </div>

    <!-- Horizontal track for 3D Menu -> Journey -> Blueprint -->
    <div bind:this={horizontalWrapper} class="absolute top-0 left-0 w-[400%] h-full flex flex-row z-10">
      
      <!-- Panel 1: 3D Monitor -->
      <div class="w-1/4 h-full shrink-0 relative z-20 bg-[#0A0A0A]">
        
        <!-- The Path Line in the Dark Terminal (Panel 1) -->
        {#if pathLineY > 0}
          <div class="absolute w-full left-0 h-[4px] bg-[#F6F2E9] dark:bg-white z-10 pointer-events-none opacity-30 blur-[1px]" style="top: {pathLineY}px;"></div>
        {/if}

        <div class="relative z-20 w-full h-full">
          <!-- Render the 3D card exactly as it was -->
          <InteractiveMenu3D 
            bind:this={menu3D} 
            isGatewayMode={true} 
            on:dinoEscaped={handleDinoEscaped} 
            on:skip={handleSkip}
          />
        </div>
      </div>

      <!-- Panel 2: The Feature Journey (Double Width) -->
      <div class="panel-2-trigger w-2/4 h-full shrink-0 flex items-center justify-center relative dotted-bg-pattern">
        
        <!-- Standby Title Badge (Aligned exactly with Node 03) -->
        <div class="absolute top-12 sm:top-16 left-[41.6%] -translate-x-1/2 flex flex-col items-center pointer-events-none whitespace-nowrap z-50">
          <div class="bg-[var(--accent-pink)] border-[3px] border-[#0A0A0A] shadow-[6px_6px_0_0_var(--page-shadow)] px-8 py-3 sm:px-10 sm:py-4 rounded-xl">
            <h2 class="font-heading font-black text-2xl sm:text-4xl text-[#0A0A0A] uppercase tracking-tight">
              Devmemory Toolchain
            </h2>
          </div>
        </div>

        <!-- The Main Horizontal Path Line -->
        {#if pathLineY > 0}
          <div class="absolute w-[300vw] left-0 h-[4px] bg-[var(--page-text)] z-0 pointer-events-none" style="top: {pathLineY}px;"></div>
        {/if}
        
        <!-- Feature Nodes -->
        <div class="absolute w-full px-[8%] flex justify-between items-center z-10 pointer-events-none" style="top: {pathLineY > 0 ? pathLineY : -1000}px; transform: translateY(-50%);">
           
           {#each [
             { id: '01', title: 'GitHub Sync', desc: 'Issues and pull requests land in your dashboard automatically.', color: 'yellow', h: 'h-12' },
             { id: '02', title: 'Error Vault', desc: 'Every error tracked per project, with its full history.', color: 'pink', h: 'h-36' },
             { id: '03', title: 'Scope Control', desc: 'Keep a fix private to one project or share it globally.', color: 'teal', h: 'h-16' },
             { id: '04', title: 'MCP Server', desc: 'AI agents query past solutions before writing new code.', color: 'coral', h: 'h-40' },
             { id: '05', title: 'Team Access', desc: 'Project-based roles, from owner down to developer.', color: 'yellow', h: 'h-20' },
             { id: '06', title: 'PRD Gen', desc: 'Structured input in, formatted markdown docs out.', color: 'pink', h: 'h-32' }
           ] as feature}
             <div class="feature-node relative flex flex-col items-center">
               
               <!-- Pop-up Card -->
               <div class="absolute bottom-4 flex flex-col items-center w-56 sm:w-64">
                 <div class="bg-[var(--page-card)] border-[3px] border-[var(--page-text)] shadow-[4px_4px_0_0_var(--page-shadow)] rounded-lg p-4 mb-0 flex flex-col gap-2 relative group overflow-hidden">
                   <!-- Decorative strip -->
                   <div class="absolute top-0 left-0 w-full h-1 bg-[var(--accent-{feature.color})]"></div>
                   
                   <div class="flex items-center gap-2 mt-1">
                     <span class="bg-[var(--accent-{feature.color})] text-[#0A0A0A] font-mono font-black text-xs px-1.5 py-0.5 rounded-sm border-2 border-[var(--page-text)]">{feature.id}</span>
                     <h3 class="font-heading font-black tracking-tight text-sm sm:text-base text-[var(--page-text)]">{feature.title}</h3>
                   </div>
                   <p class="font-sans text-[13px] sm:text-sm text-[var(--page-text-muted)] font-medium leading-snug">
                     {feature.desc}
                   </p>
                 </div>
                 <!-- Staggered Stem connecting to the path -->
                 <div class="w-1.5 {feature.h} bg-[var(--page-text)] -mt-1"></div>
               </div>
               
               <!-- Node anchor point on the path -->
               <div class="w-5 h-5 rotate-45 bg-[var(--accent-{feature.color})] border-[3px] border-[var(--page-text)] z-10 shadow-[2px_2px_0_0_var(--page-shadow)]"></div>
             </div>
           {/each}

        </div>
      </div>

      <!-- Panel 3: Blueprint -->
      <div class="panel-3-blueprint w-1/4 h-full shrink-0 flex items-center justify-center relative dotted-bg-pattern fade-dots">
        <HowItWorksSection />
      </div>

    </div>

    <!-- The 2D Pixel Dino -->
    {#if showDomDino}
      <div
        bind:this={domDinoEl}
        class="absolute z-50 pointer-events-none flex flex-col items-center"
        style:left="{dinoX}px" style:top="{dinoY}px"
      >
        <!-- Keep Scroll Hint -->
        <div class="absolute -top-16 flex flex-col items-center animate-bounce">
          <span class="font-mono text-xs font-bold text-[var(--accent-teal)] bg-gray-900 px-2 py-1 rounded-md mb-1 whitespace-nowrap border border-gray-700">
            Keep Scroll
          </span>
          <Mouse class="w-5 h-5 transition-colors duration-200" style="color: {dinoColor};" />
        </div>

        <div class="pixel-grid" style="display: grid; grid-template-columns: repeat(9, 8px); grid-template-rows: repeat(8, 8px); gap: 0;">
          {#each currentFrame as row}
            {#each row.split('') as pixel}
              <div style="width: 8px; height: 8px; background-color: {pixel === '1' ? dinoColor : 'transparent'}; transition: background-color 0.2s;"></div>
            {/each}
          {/each}
        </div>
      </div>
    {/if}
  </div>

</section>

<style>
  .pixel-grid {
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  }
  
  .dotted-bg-pattern {
    position: relative;
  }
  
  .dotted-bg-pattern::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    background-image: radial-gradient(var(--page-text-muted) 1px, transparent 1px);
    background-size: 24px 24px;
    background-position: center center;
    pointer-events: none;
  }

  .fade-dots::before {
    mask-image: linear-gradient(to right, black 0%, rgba(0,0,0,0.2) 20%, rgba(0,0,0,0.2) 100%);
    -webkit-mask-image: linear-gradient(to right, black 0%, rgba(0,0,0,0.2) 20%, rgba(0,0,0,0.2) 100%);
  }
</style>



