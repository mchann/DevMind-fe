<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import { CustomEase } from 'gsap/CustomEase';

  gsap.registerPlugin(CustomEase);

  // ── 6 clip-path polygons matching SVG crack lines exactly ─────────────────
  // Cracks radiate from Dev|Mind junction O = (42%, 50%).
  // 6 main cracks → 6 polygon regions tiling the full brand div.
  //
  //   A=(8,0)  B=(62,0)   on top edge
  //   C=(0,28)            on left edge
  //   D=(100,18)          on right edge
  //   E=(20,100) F=(74,100) on bottom edge
  //
  //   Region 0: TL corner   — O,A,TL,C
  //   Region 1: top triangle — A,B,O
  //   Region 2: TR corner   — B,TR,D,O
  //   Region 3: left strip  — C,O,E,BL
  //   Region 4: bot triangle — O,E,F
  //   Region 5: right strip — O,D,BR,F
  const SHARD_POLYGONS = [
    'polygon(0% 0%, 8% 0%, 42% 50%, 0% 28%)',          // 0: top-left corner
    'polygon(8% 0%, 62% 0%, 42% 50%)',                  // 1: top-center triangle
    'polygon(62% 0%, 100% 0%, 100% 18%, 42% 50%)',      // 2: top-right corner
    'polygon(0% 28%, 42% 50%, 20% 100%, 0% 100%)',      // 3: left strip
    'polygon(42% 50%, 20% 100%, 74% 100%)',              // 4: bottom-center triangle
    'polygon(42% 50%, 100% 18%, 100% 100%, 74% 100%)',  // 5: right strip
  ];

  // Phase A: spread direction = centroid of each shard → away from O(42,50)
  const SHARD_SPREADS = [
    { x:  -26, y: -22, r: -6 },   // 0 top-left corner   → up-left
    { x:   -4, y: -34, r:  4 },   // 1 top-center tri    → up
    { x:   28, y: -26, r:  7 },   // 2 top-right corner  → up-right
    { x:  -30, y:  18, r: -5 },   // 3 left strip        → left-down
    { x:    3, y:  32, r:  2 },   // 4 bottom-center tri → down
    { x:   32, y:  18, r:  6 },   // 5 right strip       → right-down
  ];


  // Phase B: gravity fall — all down, gentle slow-mo
  const SHARD_FALLS = [
    { x: -110, y: 560, r: -38 },   // 0
    { x:   -8, y: 640, r:   9 },   // 1
    { x:  118, y: 575, r:  40 },   // 2
    { x:  -88, y: 530, r: -46 },   // 3
    { x:    8, y: 610, r:  10 },   // 4
    { x:  108, y: 540, r:  50 },   // 5
  ];

  // ── DOM refs ──────────────────────────────────────────────────────────────
  let rootEl;
  let devEl;
  let mindEl;
  let counterWrapEl;
  let ringEl;
  let dotEl;
  let cracksEl;

  let shardEls = [];  // bound via {#each}

  // ── State ─────────────────────────────────────────────────────────────────
  let displayPercent = 0;

  // ── Constants ─────────────────────────────────────────────────────────────
  const CONVERGE_DUR = 1.55;
  const SHAKE_DUR    = 0.50;
  const SHAKE_PX     = 16;
  const RING_DUR     = 0.48;
  const SPREAD_DUR   = 0.32;  // Phase A: outward spread
  const FALL_DUR     = 1.10;  // Phase B: gravity fall (slow-mo feel)

  // ── Phase 1 ───────────────────────────────────────────────────────────────
  function buildConverge(tl) {
    tl.addLabel('converge', 0);

    tl.fromTo(devEl,
      { x: '-110vw', opacity: 1 },
      { x: 0, duration: CONVERGE_DUR, ease: 'power3.out' },
      'converge'
    );
    tl.fromTo(mindEl,
      { x: '110vw', opacity: 1 },
      { x: 0, duration: CONVERGE_DUR, ease: 'power3.out' },
      'converge'
    );

    const counter = { value: 0 };
    tl.to(counter, {
      value: 100,
      duration: CONVERGE_DUR * 0.88,
      ease: 'power2.inOut',
      onUpdate() { displayPercent = Math.round(counter.value); },
    }, 'converge');
  }

  // ── Phase 2 ───────────────────────────────────────────────────────────────
  function buildImpact(tl) {
    tl.addLabel('impact', `converge+=${CONVERGE_DUR * 0.93}`);
    tl.add(() => { displayPercent = 100; }, 'impact');

    tl.to(devEl, {
      keyframes: [
        { x: -SHAKE_PX,        duration: SHAKE_DUR * 0.17 },
        { x:  SHAKE_PX * 0.6,  duration: SHAKE_DUR * 0.17 },
        { x: -SHAKE_PX * 0.35, duration: SHAKE_DUR * 0.16 },
        { x:  SHAKE_PX * 0.18, duration: SHAKE_DUR * 0.15 },
        { x: -SHAKE_PX * 0.08, duration: SHAKE_DUR * 0.15 },
        { x: 0,                duration: SHAKE_DUR * 0.20 },
      ],
      ease: 'none',
    }, 'impact');

    tl.to(mindEl, {
      keyframes: [
        { x:  SHAKE_PX,        duration: SHAKE_DUR * 0.17 },
        { x: -SHAKE_PX * 0.6,  duration: SHAKE_DUR * 0.17 },
        { x:  SHAKE_PX * 0.35, duration: SHAKE_DUR * 0.16 },
        { x: -SHAKE_PX * 0.18, duration: SHAKE_DUR * 0.15 },
        { x:  SHAKE_PX * 0.08, duration: SHAKE_DUR * 0.15 },
        { x: 0,                duration: SHAKE_DUR * 0.20 },
      ],
      ease: 'none',
    }, 'impact');

    // Ring burst
    tl.fromTo(ringEl,
      { scale: 0, opacity: 0.9 },
      { scale: 1, opacity: 0, duration: RING_DUR, ease: 'power2.out' },
      'impact'
    );
    tl.fromTo(dotEl,
      { scale: 0, opacity: 1 },
      { scale: 3.5, opacity: 0, duration: RING_DUR * 0.6, ease: 'power3.out' },
      'impact+=0.04'
    );

    // Crack lines appear suddenly at collision
    tl.to(cracksEl, {
      opacity: 0.65,
      duration: 0.04,
      ease: 'none',
    }, `impact+=${SHAKE_DUR * 0.3}`);
  }

  // ── Phase 3: glass shatter — spread → fall ────────────────────────────────
  function buildShatter(tl) {
    tl.addLabel('shatter', `impact+=${SHAKE_DUR + 0.06}`);

    // Hide originals + crack lines, reveal shards
    tl.add(() => {
      gsap.set([devEl, mindEl], { opacity: 0 });
      gsap.set(cracksEl,         { opacity: 0 });
      gsap.set(shardEls,         { opacity: 1 });

      shardEls.forEach((el, i) => {
        const sp = SHARD_SPREADS[i];
        const fl = SHARD_FALLS[i];

        gsap.timeline({ delay: i * 0.04 })
          .to(el, {
            // Phase A: spread outward like breaking glass
            x: sp.x, y: sp.y, rotation: sp.r,
            duration: SPREAD_DUR,
            ease: 'power2.out',
          })
          .to(el, {
            // Phase B: gravity fall
            x: fl.x, y: fl.y, rotation: fl.r,
            opacity: 0,
            duration: FALL_DUR,
            ease: 'power1.in',  // gentle gravity — slow-mo feel
          }, `-=${SPREAD_DUR * 0.08}`);
      });
    }, 'shatter');

    // Counter fades with the shatter
    tl.to(counterWrapEl, {
      opacity: 0, y: 18,
      duration: 0.32, ease: 'power2.in',
    }, 'shatter');

    // ── Phase 4: slide the entire preloader UP ────────────────────────────
    // Starts while shards are still mid-fall (cinematic overlap).
    // Landing page is revealed from below as preloader launches upward.
    const slideAt = `shatter+=${SPREAD_DUR + 0.20}`;
    tl.to(rootEl, {
      y: '-100vh',
      duration: 1.0,
      ease: 'power3.inOut',
      onStart() {
        try {
          sessionStorage.setItem('devmind_preloader_seen', 'true');
        } catch (_) {}
      },
      onComplete() {
        if (rootEl) rootEl.style.display = 'none';
        try {
          document.documentElement.dataset.preloader = 'done';
        } catch (_) {}
      },
    }, slideAt);
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  onMount(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const forceReplay = params.has('replay') || params.has('preview');
      if (!forceReplay && sessionStorage.getItem('devmind_preloader_seen')) {
        if (rootEl) rootEl.style.display = 'none';
        return;
      }
    } catch (_) {}

    const ctx = gsap.context(() => {
      gsap.set(devEl,          { x: '-110vw', opacity: 1 });
      gsap.set(mindEl,         { x:  '110vw', opacity: 1 });
      gsap.set(ringEl,         { scale: 0, opacity: 0 });
      gsap.set(dotEl,          { scale: 0, opacity: 0 });
      gsap.set(cracksEl,  { opacity: 0 });
      gsap.set(shardEls,  { opacity: 0 });

      const master = gsap.timeline({ defaults: { overwrite: 'auto' } });
      buildConverge(master);
      buildImpact(master);
      buildShatter(master);
    }, rootEl);

    return () => ctx.revert();
  });
</script>

<div bind:this={rootEl} class="preloader" role="status" aria-label="Loading DevMind">



  <div class="ring-wrap" aria-hidden="true">
    <div bind:this={ringEl} class="ring"></div>
    <div bind:this={dotEl}  class="dot"></div>
  </div>

  <!--
    .brand is position:relative — shards use absolute inside it.
    clip-path % on shards is relative to brand's own size → perfect alignment.
  -->
  <div class="brand" aria-label="DevMind" aria-hidden="true">

    <!-- Glass crack lines (SVG, appears at impact) -->
    <svg
      bind:this={cracksEl}
      class="cracks"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <!-- 6 main cracks matching polygon boundaries exactly -->
      <!-- All radiate from O(42,50) = Dev|Mind junction -->
      <line x1="42" y1="50" x2="8"   y2="0"   />  <!-- OA: top-left boundary -->
      <line x1="42" y1="50" x2="62"  y2="0"   />  <!-- OB: top-center boundary -->
      <line x1="42" y1="50" x2="0"   y2="28"  />  <!-- OC: left boundary -->
      <line x1="42" y1="50" x2="100" y2="18"  />  <!-- OD: right boundary -->
      <line x1="42" y1="50" x2="20"  y2="100" />  <!-- OE: bottom-left boundary -->
      <line x1="42" y1="50" x2="74"  y2="100" />  <!-- OF: bottom-right boundary -->
      <!-- Secondary micro-cracks for realism -->
      <line x1="8"  y1="0"  x2="0"   y2="14"  />  <!-- branch near A -->
      <line x1="62" y1="0"  x2="78"  y2="6"   />  <!-- branch near B -->
      <line x1="20" y1="100" x2="9"  y2="78"  />  <!-- branch near E -->
    </svg>

    <!-- 6 glass shards (hidden until shatter) -->
    {#each SHARD_POLYGONS as poly, i}
      <div
        class="shard"
        style="clip-path: {poly}"
        bind:this={shardEls[i]}
      >
        <span class="half half--dev">Dev</span><span class="half half--mind">Mind</span>
      </div>
    {/each}

    <!-- Original text -->
    <span bind:this={devEl}  class="half half--dev">Dev</span>
    <span bind:this={mindEl} class="half half--mind">Mind</span>
  </div>

  <div bind:this={counterWrapEl} class="counter" aria-live="polite">
    <span class="counter__value">{displayPercent}</span><span class="counter__pct">%</span>
  </div>

</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&display=swap');

  :global(:root) {
    /* Neo-Brutalist preloader — uses project design system colors */
    --pl-bg:     #0d0d0d;
    --pl-fg:     #F0EEE8;   /* project's cream (neoDark base-content) */
    --pl-accent: #FFDC5A;  /* project's warning yellow */
  }

  :global(html[data-preloader='done'] .preloader) {
    display: none !important;
  }

  .preloader {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2.5rem;
    overflow: hidden;
    background-color: var(--pl-bg);
    color: var(--pl-fg);
  }



  .ring-wrap {
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -52%;
    z-index: 5;
    pointer-events: none;
  }

  .ring {
    width: clamp(260px, 40vw, 540px);
    height: clamp(260px, 40vw, 540px);
    border-radius: 50%;
    border: 2px solid var(--pl-accent);  /* thinner & cleaner — not overly bold */
    opacity: 0;
    transform: scale(0);
    will-change: transform, opacity;
  }

  .dot {
    position: absolute;
    inset: 0;
    margin: auto;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--pl-accent);
    opacity: 0;
    transform: scale(0);
    will-change: transform, opacity;
  }

  /* CRITICAL: position:relative so shards (absolute, inset:0) are clipped to brand bounds */
  .brand {
    position: relative;
    display: flex;
    align-items: baseline;
    justify-content: flex-start;
    gap: 0;
    white-space: nowrap;
    user-select: none;
    z-index: 1;
  }

  /* SVG crack lines overlay — covers full brand div (hidden until impact) */
  .cracks {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 3;
    opacity: 0;
  }

  .cracks line {
    stroke: var(--pl-accent);    /* yellow crack lines — match accent */
    stroke-width: 0.5;
    stroke-linecap: round;
  }

  /* Each shard covers brand div exactly; clip-path shows its polygon slice */
  .shard {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: baseline;
    justify-content: flex-start;
    gap: 0;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    will-change: transform, opacity;
  }

  .shard .half {
    transform: none;
  }

  /* Shared typography — Pixelify Sans uppercase, enlarged size */
  .half {
    display: inline-block;
    font-family: 'Pixelify Sans', 'Space Grotesk', sans-serif;
    font-size: clamp(5.5rem, 15vw, 13.5rem);
    font-weight: 700;
    letter-spacing: 0.02em;
    line-height: 1;
    text-transform: uppercase;
    will-change: transform, opacity;
  }

  /* Initial off-screen positions for original halves to prevent flash on refresh */
  .brand > .half--dev {
    transform: translateX(-110vw);
  }
  .brand > .half--mind {
    transform: translateX(110vw);
  }

  /* DEV — outline text (transparent fill + stroke) = iconic neo-brutalist */
  .half--dev {
    color: transparent;
    -webkit-text-stroke: 3px var(--pl-fg);
  }

  /* MIND — solid yellow fill */
  .half--mind { color: var(--pl-accent); }

  .counter {
    display: flex;
    align-items: baseline;
    gap: 0.1em;
    z-index: 1;
    will-change: opacity, transform;
  }

  .counter__value,
  .counter__pct {
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(0.7rem, 1.4vw, 1.05rem);
    font-weight: 600;
    letter-spacing: 0.28em;
    color: var(--pl-fg);
    text-transform: uppercase;
    opacity: 0.65;
  }
</style>
