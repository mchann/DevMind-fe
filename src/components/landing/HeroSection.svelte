<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { isIntroComplete as introStore } from '../../stores/introStore';
  import Hero3D from './Hero3D.svelte';
  import MarqueeTicker from './MarqueeTicker.svelte';

  let scrollY = 0;
  $: hasScrolled = scrollY > 50;

  let heroRootEl: HTMLElement;
  let contentContainerEl: HTMLElement;
  let badgeEl: HTMLElement;
  let headlineLines: HTMLElement[] = [];
  let subheadEl: HTMLElement;
  let actionsEl: HTMLElement;

  let copied = false;
  const installCmd = 'npx @devmind/mcp-server@latest init';

  const errorTickerItems = [
    'ECONNREFUSED: 127.0.0.1:5432',
    'TypeError: Cannot read properties of undefined (reading "headers")',
    'CORS_POLICY_VIOLATION: Missing Allow-Origin',
    'ERR_SSL_PROTOCOL_ERROR [Handshake failed]',
    'Hydration failed because initial UI does not match HTML',
    'Process terminated: OOM_KILLED (exit status 137)',
    'JWT_EXPIRED: Token signature invalid',
    'UnhandledSchemeError: Reading from "node:crypto" is not handled',
  ];

  let introComplete = false;
  let heroTimeline: gsap.core.Timeline;

  onMount(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Lock scroll while intro plays
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const ctx = gsap.context(() => {
      heroTimeline = gsap.timeline({
        defaults: { ease: prefersReducedMotion ? 'power1.out' : 'power4.out' },
        paused: true // Wait for 3D intro to finish!
      });

      // (Navbar animation moved to handleIntroComplete to prevent hydration race condition)

      // Badge drop-in with overshoot
      heroTimeline.from(badgeEl, {
        y: -60,
        rotation: prefersReducedMotion ? 0 : -8,
        opacity: 0,
        duration: prefersReducedMotion ? 0.2 : 0.75,
        ease: 'back.out(2.0)',
      }, 0.1);

      // Staggered headline lines slam-in
      heroTimeline.from(headlineLines, {
        yPercent: 120,
        opacity: 0,
        duration: prefersReducedMotion ? 0.3 : 0.85,
        stagger: 0.14,
        ease: 'power4.out',
      }, 0.25);

      // Subhead and action buttons
      heroTimeline.from([subheadEl, actionsEl], {
        y: 35,
        opacity: 0,
        duration: prefersReducedMotion ? 0.2 : 0.6,
        stagger: 0.12,
        ease: 'power3.out',
      }, 0.6);
    }, heroRootEl);

    // GSAP has now applied initial opacity: 0 to all children via .from(). 
    // It's now safe to reveal the parent container to avoid FOUC.
    if (contentContainerEl) {
      contentContainerEl.classList.remove('opacity-0');
    }

    return () => ctx.revert();
  });

  function handleIntroComplete() {
    introComplete = true; // Drops HeroSection to z-10, exposing the navbar

    // Unlock scroll now that intro is done
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    
    // Update Svelte store so LandingNav can show reactively
    introStore.set(true);

    if (heroTimeline) heroTimeline.play();
  }

  async function copyCommand() {
    await navigator.clipboard.writeText(installCmd);
    copied = true;
    setTimeout(() => { copied = false; }, 2000);
  }
</script>

<svelte:window bind:scrollY />

<section bind:this={heroRootEl} class="hero-section relative w-full min-h-[100svh] flex flex-col overflow-hidden bg-[#0A0A0A] dark:bg-[#0A0A0A] neo-bg-pattern -mt-20 {introComplete ? 'z-10' : 'z-[60]'}">
  <!-- Background 3D Model -->
  <div class="absolute inset-0 z-0 overflow-hidden">
    <Hero3D {hasScrolled} on:introComplete={handleIntroComplete} />
  </div>

  <!-- Foreground Main Content -->
  <div class="relative z-10 flex-grow flex items-center pt-32 pb-12 w-full">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pointer-events-none">
      
      <!-- Content restricted to left side -->
      <div bind:this={contentContainerEl} class="max-w-2xl flex flex-col items-start pointer-events-auto opacity-0 transition-opacity duration-300">
        
        <!-- Badge -->
        <div
          bind:this={badgeEl}
          class="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[var(--accent-pink)] text-[#0A0A0A] border-[3px] border-[var(--hero-border)] hero-shadow-dynamic rounded-lg font-mono text-xs font-bold uppercase mb-6"
        >
          <span class="w-2 h-2 bg-current rounded-full"></span>
          NOW SPEAKS MCP
        </div>

        <!-- Giant 3-stacked slab headline -->
        <h1 class="relative z-20 font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5rem] leading-[0.95] tracking-tight text-white mb-8">
          <span class="block overflow-hidden">
            <span bind:this={headlineLines[0]} class="block">STOP SOLVING</span>
          </span>
          <span class="block overflow-hidden mt-1">
            <span bind:this={headlineLines[1]} class="block">THE SAME <span class="font-pixel text-[var(--accent-teal)]">BUG</span></span>
          </span>
          <span class="block mt-2">
            <span bind:this={headlineLines[2]} class="inline-block bg-[var(--accent-coral)] text-[#0A0A0A] px-5 py-1.5 border-[3px] border-[var(--hero-border)] hero-shadow-dynamic rounded-lg -rotate-2">
              TWICE.
            </span>
          </span>
        </h1>

        <!-- Subhead -->
        <p bind:this={subheadEl} class="font-heading text-lg sm:text-xl text-gray-200 max-w-xl mb-10 leading-relaxed font-medium">
          DevMind watches every error you kill, every fix that worked, and every stack trace you cursed at — then hands the answer back the instant it happens again.
        </p>

        <!-- Actions -->
        <div bind:this={actionsEl} class="flex w-full sm:w-auto mt-4">
          <a
            href="#install"
            class="hero-doc-btn group flex items-center justify-center gap-3 border-[3px] bg-[#0A0A0A] px-8 py-4 rounded-lg font-mono font-bold text-lg hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all"
          >
            Read Documentation 
            <span class="text-2xl group-hover:translate-x-1 transition-transform">&rarr;</span>
          </a>
        </div>



      </div>
    </div>
  </div>

  <!-- Marquee Ticker -->
  <div class="relative z-10 mt-auto w-full pb-8 pointer-events-auto transition-opacity duration-700 delay-500" class:opacity-0={!introComplete}>
    <MarqueeTicker items={errorTickerItems} duration={24} />
  </div>
</section>

<style>
  .hero-section {
    --hero-border: #0A0A0A;
    --hero-shadow: #0A0A0A;
    --hero-btn-border: #F0EFE9;
    --hero-btn-shadow: #F0EFE9;
    --hero-btn-text: #F0EFE9;
  }
  
  :global([data-theme='neoDark']) .hero-section,
  :global(.dark) .hero-section {
    --hero-border: #2E323D; /* Graphite gray border */
    --hero-shadow: #000000; /* Dark shadow */
    --hero-btn-border: #2E323D;
    --hero-btn-shadow: #2E323D;
    --hero-btn-text: #E2E8F0; /* Softer white text */
  }

  .neo-bg-pattern {
    background-image: radial-gradient(var(--page-text-muted) 1px, transparent 1px);
    background-size: 32px 32px;
    background-position: center center;
  }

  .font-pixel {
    font-family: 'Pixelify Sans', 'Space Grotesk', sans-serif;
    letter-spacing: 0.05em;
  }

  .hero-shadow-dynamic {
    box-shadow: 4px 4px 0px 0px var(--hero-shadow);
  }

  .hero-doc-btn {
    border-color: var(--hero-btn-border);
    color: var(--hero-btn-text);
    box-shadow: 6px 6px 0 0 var(--hero-btn-shadow);
  }
  
  .hero-doc-btn:hover {
    box-shadow: 8px 8px 0 0 var(--hero-btn-shadow);
  }
  
  .hero-doc-btn:active {
    box-shadow: 2px 2px 0 0 var(--hero-btn-shadow);
  }
</style>





