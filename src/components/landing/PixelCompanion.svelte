<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import gsap from 'gsap';

  let companionEl: HTMLElement;
  let wrapperEl: HTMLElement;
  let isReducedMotion = false;
  let isFlipping = false;

  // 9x8 Pixel Dino Frames
  const FRAME_A = [
    '000111100',
    '000110110',
    '000111110',
    '000111000',
    '101111100',
    '111111100',
    '001111000',
    '001000100',
  ];

  const FRAME_B = [
    '000111100',
    '000110110',
    '000111110',
    '000111000',
    '101111100',
    '111111100',
    '001111000',
    '000101000',
  ];

  let currentFrame = FRAME_A;
  let runInterval: ReturnType<typeof setInterval> | null = null;
  let isScrolling = false;
  let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
  
  // High-performance scroll tracking
  let cachedScrollHeight = 0;

  function updateScrollCache() {
    cachedScrollHeight = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function doBackflip() {
    if (isFlipping || !companionEl) return;
    isFlipping = true;

    gsap.timeline({
      onComplete: () => { isFlipping = false; }
    })
      .to(companionEl, { y: '-=36', scaleX: 1.25, scaleY: 0.85, duration: 0.18, ease: 'power2.out' })
      .to(companionEl, { rotate: 360, y: '-=12', scaleX: 1, scaleY: 1, duration: 0.35, ease: 'power1.inOut' })
      .to(companionEl, { y: '+=48', rotate: 0, scaleX: 1.15, scaleY: 0.8, duration: 0.2, ease: 'bounce.out' })
      .to(companionEl, { scaleX: 1, scaleY: 1, duration: 0.15, ease: 'power1.out' });
  }

  let xTo: gsap.QuickToFunc;
  let yTo: gsap.QuickToFunc;

  function updatePosition(instant = false) {
    if (typeof window === 'undefined') return;

    if (!xTo || !yTo) {
      xTo = gsap.quickTo(wrapperEl, "x", { duration: 0.6, ease: "power3.out" });
      yTo = gsap.quickTo(wrapperEl, "y", { duration: 0.6, ease: "power3.out" });
      gsap.set(wrapperEl, { opacity: 1 });
    }

    const scrollY = window.scrollY;
    let scrollProgress = 0;
    
    if (cachedScrollHeight > 0) {
      scrollProgress = scrollY / cachedScrollHeight;
    }

    // Move dino along the right edge
    const targetX = window.innerWidth - 60;
    const targetY = 20 + scrollProgress * (window.innerHeight - 100);

    if (instant) {
      gsap.set(wrapperEl, { x: targetX, y: targetY });
    } else {
      xTo(targetX);
      yTo(targetY);
    }
  }

  onMount(() => {
    isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Cache the initial height
    updateScrollCache();

    // Running frame toggle
    runInterval = setInterval(() => {
      if (isScrolling) {
        currentFrame = currentFrame === FRAME_A ? FRAME_B : FRAME_A;
      } else {
        currentFrame = FRAME_A;
      }
    }, 110);

    // Smooth trailing scroll logic (no DOM reads!)
    const onScroll = () => {
      isScrolling = true;
      
      // Stop floating while walking
      if (!wasScrolling && idleTween) {
        wasScrolling = true;
        idleTween.pause();
        gsap.to(companionEl, { y: 0, duration: 0.1 }); // Snap feet to ground
      }

      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => { 
        isScrolling = false; 
        wasScrolling = false;
        if (idleTween) idleTween.resume();
      }, 150);
      
      updatePosition(false);
    };

    const onResize = () => {
      updateScrollCache();
      updatePosition(true);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    
    // Crucial: Update cache when ScrollTrigger pins/unpins (like the horizontal gateway section)
    if (typeof (window as any).ScrollTrigger !== 'undefined') {
        (window as any).ScrollTrigger.addEventListener('refresh', updateScrollCache);
    }

    // Idle breathing bounce
    let idleTween: gsap.core.Tween | null = null;
    if (!isReducedMotion && companionEl) {
      idleTween = gsap.fromTo(companionEl,
        { y: 0 },
        { y: -3, duration: 1.4, repeat: -1, yoyo: true, ease: 'sine.inOut' }
      );
    }

    // Scroll state tracking to stop floating when walking
    let wasScrolling = false;

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (typeof (window as any).ScrollTrigger !== 'undefined') {
          (window as any).ScrollTrigger.removeEventListener('refresh', updateScrollCache);
      }
      if (idleTween) idleTween.kill();
    };
  });

  onDestroy(() => {
    if (runInterval) clearInterval(runInterval);
    if (scrollTimeout) clearTimeout(scrollTimeout);
  });
</script>

<!-- Fixed wrapper for tracking the viewport edge -->
<aside
  bind:this={wrapperEl}
  class="flex flex-col items-center select-none pointer-events-auto"
  style="position: fixed; bottom: 24px; right: 16px; z-index: 100; opacity: 1;"
  aria-label="DevMind Pixel Companion Scroll Indicator"
>
  <!-- Clickable 8-Bit Pixel Character (No Speech Bubble!) -->
  <button
    bind:this={companionEl}
    on:click={doBackflip}
    type="button"
    title="Click me for a backflip!"
    class="relative p-2 bg-[var(--accent-yellow)] text-[#0A0A0A] border-[3px] border-[var(--page-border)] rounded-xl shadow-[5px_5px_0_0_var(--page-shadow)] hover:-translate-y-1 hover:shadow-[7px_7px_0_0_var(--page-shadow)] active:translate-y-1 active:shadow-[2px_2px_0_0_var(--page-shadow)] transition-all cursor-pointer group"
  >
    <!-- Pixel Dino Grid (9 cols x 8 rows) -->
    <div
      class="pixel-grid"
      style="display: grid; grid-template-columns: repeat(9, 3.5px); grid-template-rows: repeat(8, 3.5px); gap: 0;"
    >
      {#each currentFrame as row}
        {#each row.split('') as pixel}
          <div
            style="width: 3.5px; height: 3.5px; background-color: {pixel === '1' ? '#0A0A0A' : 'transparent'};"
          ></div>
        {/each}
      {/each}
    </div>
  </button>
</aside>

<style>
  .pixel-grid {
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  }
</style>










