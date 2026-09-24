<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Lenis from 'lenis';
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import 'lenis/dist/lenis.css';

  let lenis: Lenis | null = null;
  let tickerFn: ((time: number) => void) | null = null;

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis with inertia smooth momentum
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    // Expose lenis instance globally for smooth programmatic navigation
    (window as any).__lenis = lenis;

    // 1. Synchronize Lenis scroll with GSAP ScrollTrigger updates
    lenis.on('scroll', ScrollTrigger.update);

    // 2. Drive Lenis via GSAP ticker for unified 60fps frame loop
    tickerFn = (time: number) => {
      lenis?.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);

    // 3. Disable lag smoothing to prevent stutters/jumps during inertia scrolling
    gsap.ticker.lagSmoothing(0);

    // Refresh ScrollTrigger calculations
    ScrollTrigger.refresh();

    // Listen for loader completion to refresh scroll heights & positions
    const onLoaderDone = () => {
      lenis?.resize();
      ScrollTrigger.refresh();
    };
    window.addEventListener('devmind:loader-done', onLoaderDone);

    // Intercept in-page hash anchors for smooth inertia scroll gliding
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        const el = document.querySelector(href);
        if (el) {
          e.preventDefault();
          lenis?.scrollTo(el as HTMLElement, {
            offset: -75,
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      }
    };
    document.addEventListener('click', handleAnchorClick);

    return () => {
      window.removeEventListener('devmind:loader-done', onLoaderDone);
      document.removeEventListener('click', handleAnchorClick);
    };
  });

  onDestroy(() => {
    if (tickerFn) {
      gsap.ticker.remove(tickerFn);
    }
    if (lenis) {
      lenis.destroy();
      lenis = null;
    }
    if (typeof window !== 'undefined') {
      delete (window as any).__lenis;
    }
  });
</script>

<style>
  :global(html.lenis) {
    scroll-behavior: auto !important;
  }
</style>
