<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import gsap from 'gsap';

  const dispatch = createEventDispatcher<{ done: void }>();

  // ── Palette CSS Variables ──────────────────────────────────────────────────
  // Exposed via root classes or style:
  // --cream: #F6F2E9, --ink: #0A0A0A, --coral: #FF5C38, --teal: #2DD4BF, --pink: #F472B6, --yellow: #FFD23F

  // ── Component State & DOM Refs ─────────────────────────────────────────────
  let isVisible = true;
  let trackEl: HTMLElement;
  let spriteJumpEl: HTMLElement;
  let loaderContentEl: HTMLElement;
  let wordmarkLetterEls: HTMLElement[] = [];
  let chipEls: HTMLElement[] = [];

  let progressDisplay = '00';
  let statusMessage = 'connecting to memory index…';
  let isGlitching = false;

  // ── 9x8 Pixel Dino Frames (0 = transparent, 1 = ink pixel) ────────────────
  const FRAME_A = [
    '000111100', // row 0: head top
    '000110110', // row 1: eye at col 5
    '000111110', // row 2: snout
    '000111000', // row 3: open jaw / neck
    '101111100', // row 4: body & arms
    '111111100', // row 5: belly
    '001111000', // row 6: lower torso
    '001000100', // row 7: legs frame A
  ];

  const FRAME_B = [
    '000111100',
    '000110110',
    '000111110',
    '000111000',
    '101111100',
    '111111100',
    '001111000',
    '000101000', // row 7: legs frame B
  ];

  let currentFrame = FRAME_A;
  let frameInterval: ReturnType<typeof setInterval> | null = null;

  // ── Obstacles & Checkpoints ────────────────────────────────────────────────
  const obstacles = [
    { pct: 18, label: 'SEGFAULT', varKey: 'coral', jumped: false },
    { pct: 38, label: 'NULL_REF', varKey: 'yellow', jumped: false },
    { pct: 58, label: 'ERR_500',  varKey: 'teal', jumped: false },
    { pct: 80, label: 'TYPE_ERR', varKey: 'pink', jumped: false },
  ];

  const checkpoints = [0, 25, 50, 75, 100];
  let passedCheckpoints: number[] = [0];

  // ── Floating Decorative Chips ──────────────────────────────────────────────
  const codeChips = [
    { symbol: '{ }', top: '14%', left: '10%', rotate: -8, varKey: 'yellow' },
    { symbol: '</>', top: '18%', right: '12%', rotate: 10, varKey: 'teal' },
    { symbol: '01',  bottom: '18%', left: '12%', rotate: 6,  varKey: 'pink' },
    { symbol: ';',   bottom: '16%', right: '14%', rotate: -12, varKey: 'coral' },
  ];

  // ── GSAP Instances (for cleanup) ───────────────────────────────────────────
  let ctx: gsap.Context | null = null;
  let mainProgressTween: gsap.core.Tween | null = null;

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  onMount(() => {
    // Lock body scroll while loader is visible
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = 'hidden';
    }

    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Running frame toggle
    frameInterval = setInterval(() => {
      currentFrame = currentFrame === FRAME_A ? FRAME_B : FRAME_A;
    }, 110);

    ctx = gsap.context(() => {
      // 1. Reveal Wordmark letter-by-letter
      gsap.fromTo(
        wordmarkLetterEls,
        { opacity: 0, scale: 0.4, y: '0.4em', rotate: -6 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          rotate: 0,
          stagger: 0.09,
          duration: prefersReducedMotion ? 0.1 : 0.45,
          ease: 'back.out(3)',
        }
      );

      // 2. Gentle vertical floating for scattered code chips
      chipEls.forEach((chip, idx) => {
        if (!chip) return;
        gsap.to(chip, {
          y: -10,
          duration: 1.8 + idx * 0.35,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });

      // 3. Single Source-of-Truth Progress Tween
      const progressObj = { value: 0 };
      const duration = prefersReducedMotion ? 0.8 : 3.2;

      mainProgressTween = gsap.to(progressObj, {
        value: 100,
        duration,
        ease: 'power1.inOut',
        onUpdate: () => {
          const val = Math.round(progressObj.value);
          progressDisplay = String(val).padStart(2, '0');

          // Trigger brief glitch pulse on number update
          isGlitching = true;
          setTimeout(() => { isGlitching = false; }, 60);

          // Update status message
          if (val < 20) {
            statusMessage = 'connecting to memory index…';
          } else if (val < 40) {
            statusMessage = 'loading neural vector graph…';
          } else if (val < 60) {
            statusMessage = 'waking up MCP server…';
          } else if (val < 80) {
            statusMessage = 'indexing past bug resolutions…';
          } else if (val < 100) {
            statusMessage = 'optimizing context cache…';
          } else {
            statusMessage = 'ready.';
          }

          // Checkpoints update
          checkpoints.forEach((cp) => {
            if (val >= cp && !passedCheckpoints.includes(cp)) {
              passedCheckpoints = [...passedCheckpoints, cp];
            }
          });

          // Move dino horizontally
          if (trackEl && spriteJumpEl) {
            const trackWidth = trackEl.clientWidth;
            const spriteWidth = 40; // ~40px wide sprite box
            const xPos = (progressObj.value / 100) * (trackWidth - spriteWidth);
            spriteJumpEl.parentElement!.style.transform = `translateX(${xPos}px)`;
          }

          // Check obstacles jump triggers
          obstacles.forEach((obs) => {
            if (progressObj.value >= obs.pct && !obs.jumped) {
              obs.jumped = true;
              if (!prefersReducedMotion && spriteJumpEl) {
                gsap.timeline()
                  .to(spriteJumpEl, { y: -34, duration: 0.16, ease: 'power2.out' })
                  .to(spriteJumpEl, { y: 0, duration: 0.22, ease: 'power2.in' });
              }
            }
          });
        },
        onComplete: () => {
          handleCompletion(prefersReducedMotion);
        },
      });
    }, loaderContentEl);
  });

  function handleCompletion(reducedMotion: boolean) {
    if (frameInterval) {
      clearInterval(frameInterval);
      frameInterval = null;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        isVisible = false;
        if (typeof document !== 'undefined' && document.body) {
          document.body.style.overflow = '';
        }
        dispatch('done');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('devmind:loader-done'));
          (window as any).__devmind_loader_done = true;
        }
      },
    });

    if (!reducedMotion && spriteJumpEl) {
      // Small celebratory hop
      tl.to(spriteJumpEl, { y: -16, duration: 0.12, ease: 'power2.out' })
        .to(spriteJumpEl, { y: 0, duration: 0.16, ease: 'power2.in' });
    }

    // Dismiss overlay upward
    tl.to(loaderContentEl, {
      y: -40,
      opacity: 0,
      duration: reducedMotion ? 0.2 : 0.45,
      ease: 'power4.in',
    });
  }

  onDestroy(() => {
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = '';
    }
    if (frameInterval) clearInterval(frameInterval);
    if (mainProgressTween) mainProgressTween.kill();
    if (ctx) ctx.revert();
  });
</script>

{#if isVisible}
  <aside
    class="devmind-loader"
    role="status"
    aria-live="polite"
    aria-label="Loading DevMind"
    aria-hidden="false"
  >
    <!-- Background Texture Noise Grid -->
    <div class="loader-backdrop"></div>

    <!-- Floating Decorative Code Chips -->
    {#each codeChips as chip, i}
      <div
        bind:this={chipEls[i]}
        class="code-chip select-none"
        style="
          top: {chip.top || 'auto'};
          bottom: {chip.bottom || 'auto'};
          left: {chip.left || 'auto'};
          right: {chip.right || 'auto'};
          background-color: var(--loader-{chip.varKey});
          transform: rotate({chip.rotate}deg);
        "
        aria-hidden="true"
      >
        {chip.symbol}
      </div>
    {/each}

    <!-- Main Centered Loader Box -->
    <div bind:this={loaderContentEl} class="loader-content">
      
      <!-- 1. Wordmark with Pink Offset Shadow & Blinking Underscore -->
      <div class="wordmark-container">
        <h1 class="wordmark" aria-label="DEVMIND">
          {#each 'DEVMIND'.split('') as letter, i}
            <span bind:this={wordmarkLetterEls[i]} class="wordmark-letter">{letter}</span>
          {/each}
          <span class="blinking-cursor">_</span>
        </h1>
      </div>

      <!-- 2 & 3. Progress Track & Dino Runner -->
      <div class="track-wrapper">
        <div bind:this={trackEl} class="track">
          
          <!-- Running Dino Sprite Wrapper -->
          <div class="sprite-track-positioner">
            <div bind:this={spriteJumpEl} class="sprite-jump-box">
              <div class="pixel-dino" aria-hidden="true">
                {#each currentFrame as row}
                  <div class="dino-row">
                    {#each row.split('') as bit}
                      <span class="pixel {bit === '1' ? 'pixel--solid' : ''}"></span>
                    {/each}
                  </div>
                {/each}
              </div>
            </div>
          </div>

          <!-- Obstacles -->
          {#each obstacles as obs}
            <div class="obstacle-node" style="left: {obs.pct}%;">
              <div class="obstacle-chip" style="background-color: var(--loader-{obs.varKey});">
                {obs.label}
              </div>
              <div class="obstacle-bar" style="background-color: var(--loader-{obs.varKey});"></div>
            </div>
          {/each}

          <!-- Ground Baseline -->
          <div class="ground-line"></div>

          <!-- 5 Diamond Checkpoint Markers -->
          <div class="checkpoints-row">
            {#each checkpoints as cp}
              <div
                class="checkpoint-diamond {passedCheckpoints.includes(cp) ? 'checkpoint--active' : ''}"
                style="left: {cp}%;"
                title="{cp}%"
              ></div>
            {/each}
          </div>

        </div>
      </div>

      <!-- 4. Readout: Counter & Terminal Boot Log -->
      <div class="readout-box">
        <div class="percentage-display {isGlitching ? 'glitch-shake' : ''}">
          {progressDisplay}<span class="pct-sign">%</span>
        </div>

        <div class="status-line font-mono">
          <span class="prompt-symbol">$</span>
          <span class="status-text">{statusMessage}</span>
          <span class="terminal-cursor">_</span>
        </div>
      </div>

    </div>
  </aside>
{/if}

<style>
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=JetBrains+Mono:wght@500;700;800&display=swap');

  /* ── Design System Variables ────────────────────────────────────────────── */
  .devmind-loader {
    --loader-bg:          #F6F2E9;
    --loader-ink:         #0A0A0A;
    --loader-border:      #0A0A0A;
    --loader-shadow:      #0A0A0A;
    --loader-card-bg:     #FFFFFF;
    --loader-dot:         rgba(10, 10, 10, 0.75);
    --loader-wm-shadow:   #F472B6;
    --loader-coral:       #FF5C38;
    --loader-teal:        #2DD4BF;
    --loader-pink:        #F472B6;
    --loader-yellow:      #FFD23F;
    --loader-dino:        #0A0A0A;
    --loader-ground:      #0A0A0A;
    --loader-chip-text:   #0A0A0A;
    --loader-chip-border: #0A0A0A;
    --loader-chip-shadow: #0A0A0A;
    --loader-obs-text:    #0A0A0A;

    position: fixed;
    inset: 0;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--loader-bg);
    color: var(--loader-ink);
    user-select: none;
    overflow: hidden;
    transition: background-color 0.25s ease, color 0.25s ease;
  }

  :global([data-theme='neoDark']) .devmind-loader,
  :global(.dark) .devmind-loader {
    --loader-bg:          #121316;              /* Matches global.css --bg-main */
    --loader-ink:         #D1D5DB;              /* Soft calm light gray */
    --loader-border:      #2E323D;              /* Graphite gray border - zero white borders */
    --loader-shadow:      #000000;              /* Pure black shadow - zero white outline */
    --loader-card-bg:     #1A1D24;              /* Matches global.css --bg-card-main */
    --loader-dot:         rgba(255, 255, 255, 0.05); /* Faint matte noise dots */
    --loader-wm-shadow:   #702D47;              /* Deep matte dusty mulberry shadow */
    --loader-coral:       #A33928;              /* Matte terracotta */
    --loader-teal:        #167C74;              /* Matte deep teal */
    --loader-pink:        #8C385B;              /* Matte dusty rose */
    --loader-yellow:      #C9972E;              /* Matte warm amber */
    --loader-dino:        #CBD5E1;              /* Soft chalk-slate dino */
    --loader-ground:      #2E323D;              /* Dark graphite ground bar */
    --loader-chip-text:   #F8FAFC;              /* Crisp readable chip text */
    --loader-chip-border: #2E323D;              /* Graphite border */
    --loader-chip-shadow: #000000;              /* Black shadow */
    --loader-obs-text:    #F8FAFC;              /* Clean readable obstacle label */
  }

  .loader-backdrop {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(var(--loader-dot) 1.2px, transparent 1.2px);
    background-size: 26px 26px;
  }

  /* ── Decorative Code Chips ──────────────────────────────────────────────── */
  .code-chip {
    position: absolute;
    z-index: 1;
    padding: 0.35rem 0.75rem;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 800;
    font-size: 0.85rem;
    color: var(--loader-chip-text);
    border: 2px solid var(--loader-chip-border);
    border-radius: 6px;
    box-shadow: 3px 3px 0 0 var(--loader-chip-shadow);
    pointer-events: none;
    transition: background-color 0.25s ease, border-color 0.25s ease;
  }

  /* ── Center Content Box ─────────────────────────────────────────────────── */
  .loader-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 680px;
    padding: 2rem 1.5rem;
  }

  /* ── 1. Wordmark ────────────────────────────────────────────────────────── */
  .wordmark-container {
    margin-bottom: 2.8rem;
    text-align: center;
  }

  .wordmark {
    font-family: 'Press Start 2P', monospace;
    font-size: clamp(1.5rem, 5.6vw, 3rem);
    line-height: 1.1;
    color: var(--loader-ink);
    text-shadow: 4px 4px 0 var(--loader-wm-shadow);
    letter-spacing: 0.08em;
    margin: 0;
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    transition: color 0.25s ease, text-shadow 0.25s ease;
  }

  .wordmark-letter {
    display: inline-block;
    will-change: transform, opacity;
  }

  .blinking-cursor {
    display: inline-block;
    color: var(--loader-pink);
    margin-left: 0.15em;
    animation: cursorBlink 0.8s steps(1) infinite;
  }

  @keyframes cursorBlink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }

  /* ── 2 & 3. Progress Track & Dino ───────────────────────────────────────── */
  .track-wrapper {
    width: 100%;
    margin-bottom: 2rem;
  }

  .track {
    position: relative;
    width: 100%;
    height: 72px;
  }

  /* Dino positioning */
  .sprite-track-positioner {
    position: absolute;
    bottom: 8px; /* sits right on ground line */
    left: 0;
    will-change: transform;
    z-index: 4;
  }

  .sprite-jump-box {
    will-change: transform;
  }

  /* 9x8 Pixel Dino Grid */
  .pixel-dino {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 2px;
  }

  .dino-row {
    display: flex;
    gap: 0;
  }

  .pixel {
    width: 4px;
    height: 4px;
    background: transparent;
  }

  .pixel--solid {
    background-color: var(--loader-dino);
    transition: background-color 0.25s ease;
  }

  /* Ground Line */
  .ground-line {
    position: absolute;
    bottom: 8px;
    left: 0;
    right: 0;
    height: 4px;
    background-color: var(--loader-ground);
    border-radius: 2px;
    z-index: 2;
    transition: background-color 0.25s ease;
  }

  /* Obstacles */
  .obstacle-node {
    position: absolute;
    bottom: 8px;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 3;
    pointer-events: none;
  }

  .obstacle-chip {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    font-weight: 800;
    color: var(--loader-obs-text);
    border: 2px solid var(--loader-border);
    border-radius: 3px;
    padding: 0.1rem 0.35rem;
    margin-bottom: 3px;
    white-space: nowrap;
    box-shadow: 2px 2px 0 0 var(--loader-shadow);
    transition: background-color 0.25s ease, border-color 0.25s ease;
  }

  .obstacle-bar {
    width: 14px;
    height: 20px;
    border: 2.5px solid var(--loader-border);
    border-radius: 3px 3px 0 0;
    box-shadow: 2px 0 0 0 var(--loader-shadow);
    transition: background-color 0.25s ease, border-color 0.25s ease;
  }

  /* Checkpoints */
  .checkpoints-row {
    position: absolute;
    bottom: 2px;
    left: 0;
    right: 0;
    height: 16px;
    pointer-events: none;
    z-index: 2;
  }

  .checkpoint-diamond {
    position: absolute;
    bottom: 0;
    width: 12px;
    height: 12px;
    background-color: var(--loader-bg);
    border: 2.5px solid var(--loader-border);
    transform: translateX(-50%) rotate(45deg);
    transition: background-color 0.2s ease, transform 0.2s ease, border-color 0.25s ease;
  }

  .checkpoint--active {
    background-color: var(--loader-yellow);
    transform: translateX(-50%) rotate(45deg) scale(1.15);
  }

  /* ── 4. Readout ─────────────────────────────────────────────────────────── */
  .readout-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
  }

  .percentage-display {
    font-family: 'JetBrains Mono', monospace;
    font-size: clamp(2.5rem, 6.5vw, 4rem);
    font-weight: 800;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    color: var(--loader-ink);
    letter-spacing: -0.04em;
    display: flex;
    align-items: baseline;
    transition: color 0.25s ease;
  }

  .pct-sign {
    font-size: 0.48em;
    margin-left: 0.1em;
    color: var(--loader-coral);
    transition: color 0.25s ease;
  }

  .glitch-shake {
    transform: translate(0.8px, -0.8px);
  }

  .status-line {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--loader-ink);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--loader-card-bg);
    border: 2.5px solid var(--loader-border);
    border-radius: 6px;
    padding: 0.45rem 1rem;
    box-shadow: 3px 3px 0 0 var(--loader-shadow);
    max-width: 90%;
    transition: background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease;
  }

  .prompt-symbol {
    color: var(--loader-pink);
    font-weight: 800;
  }

  .status-text {
    color: var(--loader-ink);
    letter-spacing: -0.01em;
  }

  .terminal-cursor {
    color: var(--loader-teal);
    font-weight: 800;
    animation: cursorBlink 0.6s steps(1) infinite;
  }
</style>
