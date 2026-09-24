<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  let sectionEl: HTMLElement;

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && sectionEl) {
      // The parent BlueprintGatewaySection will handle horizontal scrubbing.
      // We only do minor internal stagger reveals when this section comes into view (or we can just skip it).
    }
  });
</script>

<section id="how-it-works" bind:this={sectionEl} class="w-full py-12 lg:py-20 h-full flex items-center shrink-0">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
    
    <!-- ── Blueprint Header ────────────────────────────────────────────── -->
    <div class="blueprint-reveal mb-6">
      <div class="font-mono text-xs font-bold tracking-widest text-[var(--page-text-muted)] uppercase mb-1.5">
        DEVMIND / SYSTEM BLUEPRINT 01
      </div>
      <h2 class="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[var(--page-text)] tracking-tight mb-2">
        The developer memory for the AI era — continuous debugging loop
      </h2>
      <p class="font-mono text-xs sm:text-sm text-[var(--page-text-muted)] max-w-3xl leading-relaxed">
        Customer input and bug fixes become organizational knowledge through DevMind and MCP, then return to solve the next error.
      </p>
    </div>

    <!-- ── Header Divider Line with Section Numbers ────────────────────── -->
    <div class="blueprint-reveal border-t-[2px] border-[var(--page-border)] pt-2.5 pb-4 grid grid-cols-1 lg:grid-cols-12 gap-4 font-mono text-[11px] font-extrabold text-[var(--page-text-muted)] uppercase tracking-wider">
      <div class="lg:col-span-3">01 — ACTORS</div>
      <div class="lg:col-span-6 lg:pl-4">02 — OPERATING &amp; MEMORY LOOP</div>
      <div class="lg:col-span-3 lg:pl-4">03 — ACCUMULATION</div>
    </div>

    <!-- ── 3-Column Diagram Body ───────────────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-12 border-t lg:border-t-0 border-[var(--page-border)] pt-6 lg:pt-0 items-center">
      
      <!-- ── COLUMN 1: ACTORS (Left - No dividing lines) ─────────────── -->
      <div class="blueprint-reveal lg:col-span-3 flex flex-col justify-between space-y-6 lg:space-y-0 lg:h-[420px] lg:pr-6 lg:border-r-[2px] lg:border-[var(--page-border)]">
        
        <!-- Actor 1: DEVELOPER -->
        <div>
          <span class="text-[9px] font-mono font-extrabold text-[var(--page-text-muted)] uppercase tracking-widest block mb-1.5">DEVELOPER</span>
          <div class="flex items-center gap-3">
            <svg class="w-10 h-10 shrink-0 text-[var(--page-text)]" viewBox="0 0 16 16" fill="currentColor" shape-rendering="crispEdges">
              <path d="M7 1h2v1H7z M6 2h4v1H6z M5 4h6v6H5z M3 5h2v4H3z M11 5h2v4h-2z M6 6h1v1H6z M9 6h1v1H9z M5 10h2v1H5z M9 10h2v1H9z M5 11h6v1H5z M4 12h2v3H4z M10 12h2v3h-2z"/>
            </svg>
            <div>
              <h3 class="font-heading font-extrabold text-sm text-[var(--page-text)]">Who fixes</h3>
              <p class="font-mono text-[10px] text-[var(--page-text-muted)]">Code · Debug · Tests · Commits</p>
            </div>
          </div>
        </div>

        <!-- Actor 2: TEAM / REPO -->
        <div>
          <span class="text-[9px] font-mono font-extrabold text-[var(--page-text-muted)] uppercase tracking-widest block mb-1.5">TEAM &amp; REPO</span>
          <div class="flex items-center gap-3">
            <svg class="w-10 h-10 shrink-0 text-[var(--page-text)]" viewBox="0 0 16 16" fill="currentColor" shape-rendering="crispEdges">
              <path d="M5 2h6v2H5z M4 4h8v5H4z M2 6h2v3H2z M12 6h2v3h-2z M6 6h1v1H6z M9 6h1v1H9z M5 9h6v3H5z M4 12h3v3H4z M9 12h3v3H9z"/>
            </svg>
            <div>
              <h3 class="font-heading font-extrabold text-sm text-[var(--page-text)]">Who shares</h3>
              <p class="font-mono text-[10px] text-[var(--page-text-muted)]">Repository · PRs · Past fixes</p>
            </div>
          </div>
        </div>

        <!-- Actor 3: AI ASSISTANT -->
        <div>
          <span class="text-[9px] font-mono font-extrabold text-[var(--page-text-muted)] uppercase tracking-widest block mb-1.5">AI ASSISTANT</span>
          <div class="flex items-center gap-3">
            <svg class="w-10 h-10 shrink-0 text-[var(--page-text)]" viewBox="0 0 16 16" fill="currentColor" shape-rendering="crispEdges">
              <path d="M2 6h4v4H2z M3 4h2v2H3z M1 8h1v2H1z M5 8h1v2H5z M8 5h6v5H8z M10 3h2v2h-2z M7 7h1v3H7z M14 7h1v3h-1z M3 10h1v4H3z M9 10h2v4H9z M12 10h2v4h-2z"/>
            </svg>
            <div>
              <h3 class="font-heading font-extrabold text-sm text-[var(--page-text)]">Who queries</h3>
              <p class="font-mono text-[10px] text-[var(--page-text-muted)]">Claude · Cursor · Windsurf · MCP</p>
            </div>
          </div>
        </div>

      </div>

      <!-- ── COLUMN 2: OPERATING LOOP WITH VISIBLE CONNECTOR LINES ──────── -->
      <div class="blueprint-reveal lg:col-span-6 relative flex items-center justify-center py-8 lg:py-0">
        
        <!-- Left Horizontal Connecting Line: Column 1 into Circle -->
        <div class="hidden lg:flex absolute -left-2 xl:left-0 top-1/2 -translate-y-1/2 flex-col items-center w-[65px] xl:w-[80px] z-10">
          <div class="flex flex-col items-center text-center mb-1 pointer-events-none">
            <span class="font-heading font-extrabold text-[9px] text-[var(--page-text)] uppercase tracking-wider leading-none">EXPERIENCE</span>
            <span class="font-mono text-[8px] text-[var(--page-text-muted)] leading-tight mt-0.5 whitespace-nowrap">Becomes memory</span>
          </div>
          <div class="w-full flex items-center my-0.5">
            <div class="w-full h-[1.5px] bg-[var(--page-border)]"></div>
            <span class="text-xs font-bold text-[var(--page-border)] -ml-1 select-none">&rarr;</span>
          </div>
          <span class="font-mono text-[9px] font-bold text-[var(--page-text)] mt-0.5">drive</span>
        </div>

        <!-- Right Horizontal Connecting Line: Circle into Column 3 -->
        <div class="hidden lg:flex absolute -right-2 xl:right-0 top-1/2 -translate-y-1/2 flex-col items-center w-[65px] xl:w-[80px] z-10">
          <div class="flex flex-col items-center text-center mb-1 pointer-events-none">
            <span class="font-heading font-extrabold text-[9px] text-[var(--page-text)] uppercase tracking-wider leading-none">KNOWLEDGE</span>
            <span class="font-mono text-[8px] text-[var(--page-text-muted)] leading-tight mt-0.5 whitespace-nowrap">Becomes know-how</span>
          </div>
          <div class="w-full flex items-center my-0.5">
            <div class="w-full h-[1.5px] bg-[var(--page-border)]"></div>
            <span class="text-xs font-bold text-[var(--page-border)] -ml-1 select-none">&rarr;</span>
          </div>
          <span class="font-mono text-[9px] font-bold text-[var(--page-text)] mt-0.5 whitespace-nowrap">stacks up</span>
        </div>

        <!-- The Central Orbit Loop ("garis putus-putus muter") -->
        <div class="relative w-[340px] sm:w-[380px] h-[340px] sm:h-[380px] flex items-center justify-center">
          
          <!-- Continuous Rotating Dashed SVG Circle -->
          <svg class="absolute inset-0 w-full h-full pointer-events-none select-none orbit-rotating-wrapper" viewBox="0 0 400 400" fill="none">
            <!-- Solid outer guide circle -->
            <circle cx="200" cy="200" r="170" stroke="var(--page-border)" stroke-width="1.5" stroke-opacity="0.25" />
            
            <!-- Animated spinning dashed circle -->
            <circle
              cx="200"
              cy="200"
              r="170"
              stroke="var(--page-border)"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-dasharray="10 12"
            />
            
            <!-- Clockwise directional arrows -->
            <polygon points="200,24 206,32 194,32" fill="var(--page-border)" />
            <polygon points="376,200 368,194 368,206" fill="var(--page-border)" />
            <polygon points="200,376 194,368 206,368" fill="var(--page-border)" />
            <polygon points="24,200 32,206 32,194" fill="var(--page-border)" />
          </svg>

          <!-- Top Node: VOICE -->
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center text-center z-20">
            <span class="font-heading font-extrabold text-[10px] text-[var(--page-text)] uppercase tracking-wider">VOICE</span>
            <span class="font-mono text-[8px] text-[var(--page-text-muted)]">Bug report &amp; stack trace</span>
            <div class="w-2.5 h-2.5 bg-[var(--page-text)] border border-[var(--page-border)] rotate-45 mt-1"></div>
          </div>

          <!-- Bottom Node: DELIVERY -->
          <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center text-center z-20">
            <div class="w-2.5 h-2.5 bg-[var(--page-text)] border border-[var(--page-border)] rotate-45 mb-1"></div>
            <span class="font-heading font-extrabold text-[10px] text-[var(--page-text)] uppercase tracking-wider">DELIVERY</span>
            <span class="font-mono text-[8px] text-[var(--page-text-muted)]">Built and shipped</span>
          </div>

          <!-- Bottom-Right Node: RESOLUTION -->
          <div class="absolute right-3 bottom-5 text-right hidden sm:block z-20">
            <span class="font-heading font-extrabold text-[10px] text-[var(--page-text)] uppercase tracking-wider block">RESOLUTION</span>
            <span class="font-mono text-[8px] text-[var(--page-text-muted)] block">Feeds the next fix</span>
          </div>

          <!-- ── CENTER CARD: CLAUDE / AI PARTNER ──────────────────────── -->
          <div class="relative z-10 w-[190px] sm:w-[210px] bg-[var(--page-card)] border-[2.5px] border-[var(--page-border)] rounded-lg shadow-[5px_5px_0_0_var(--page-shadow)] overflow-hidden">
            
            <!-- Dark Upper Header Block -->
            <div class="bg-[#0A0A0A] dark:bg-[#1E232E] text-white p-3 flex flex-col items-center text-center border-b-[2.5px] border-[var(--page-border)]">
              <!-- Pixel Robot Avatar -->
              <svg class="w-7 h-7 mb-1 text-[#FFD23F]" viewBox="0 0 16 16" fill="currentColor" shape-rendering="crispEdges">
                <path d="M7 1h2v1H7z M4 3h8v1H4z M3 4h10v2H3z M2 6h12v4H2z M5 7h2v2H5z M9 7h2v2H9z M3 10h10v2H3z M4 12h2v2H4z M10 12h2v2h-2z"/>
              </svg>
              <span class="font-mono text-[8px] tracking-widest text-white/70 uppercase">CLAUDE / CURSOR</span>
              <h4 class="font-heading font-extrabold text-xs text-white tracking-tight">AI PARTNER</h4>
              <p class="font-mono text-[8px] text-white/80 mt-0.5">Analysis, generation, fix</p>
            </div>

            <!-- Lower White Block: DEVMIND / MCP -->
            <div class="p-2.5 bg-[var(--page-card)] text-center">
              <span class="font-mono text-[9px] font-extrabold text-[var(--accent-coral)] uppercase tracking-wider block">DEVMIND / MCP</span>
              <div class="font-heading font-bold text-xs text-[var(--page-text)] mt-0.5">Codified know-how</div>
              <p class="font-mono text-[8px] text-[var(--page-text-muted)] mt-1 leading-tight">Standards, diffs, history</p>
            </div>

          </div>

        </div>

      </div>

      <!-- ── COLUMN 3: ACCUMULATION (Right) ────────────────────────────── -->
      <div class="blueprint-reveal lg:col-span-3 flex flex-col justify-between space-y-6 lg:space-y-0 lg:h-[420px] lg:pl-6 lg:border-l-[2px] lg:border-[var(--page-border)]">
        
        <div>
          <h3 class="font-heading font-extrabold text-xl sm:text-2xl text-[var(--page-text)] tracking-tight mb-1.5">
            It compounds every fix
          </h3>
          <p class="font-mono text-xs text-[var(--page-text-muted)] leading-relaxed">
            The more errors your team solves, the sharper DevMind and AI fix quality become.
          </p>
        </div>

        <!-- Compounding Blocks Stack matching reference [H] -->
        <div class="flex items-end gap-5 my-auto">
          
          <div class="flex flex-col-reverse gap-2.5">
            
            <!-- Block 1 -->
            <div class="flex items-center gap-3">
              <div class="w-12 h-10 bg-[#0A0A0A] dark:bg-[#1E232E] text-white border-[2.5px] border-[var(--page-border)] rounded flex items-center justify-center font-heading font-extrabold text-base shadow-[2px_2px_0_0_var(--page-shadow)]">
                [M]
              </div>
              <span class="font-mono text-xs font-bold text-[var(--page-text-muted)]">Fix #1</span>
            </div>

            <!-- Block 2 -->
            <div class="flex items-center gap-3">
              <div class="w-12 h-10 bg-[#0A0A0A] dark:bg-[#1E232E] text-white border-[2.5px] border-[var(--page-border)] rounded flex items-center justify-center font-heading font-extrabold text-base shadow-[2px_2px_0_0_var(--page-shadow)]">
                [M]
              </div>
              <span class="font-mono text-xs font-bold text-[var(--page-text-muted)]">Fix #2</span>
            </div>

            <!-- Block 3 -->
            <div class="flex items-center gap-3">
              <div class="w-12 h-10 bg-[#0A0A0A] dark:bg-[#1E232E] text-white border-[2.5px] border-[var(--page-border)] rounded flex items-center justify-center font-heading font-extrabold text-base shadow-[2px_2px_0_0_var(--page-shadow)]">
                [M]
              </div>
              <span class="font-mono text-xs font-bold text-[var(--page-text-muted)]">Fix #3</span>
            </div>

          </div>

          <!-- Upward Growth Arrow -->
          <div class="flex flex-col items-center pb-2 text-[var(--page-text-muted)]">
            <span class="text-lg font-bold">&uarr;</span>
            <span class="font-mono text-[8px] uppercase font-bold tracking-wider">GROWTH</span>
          </div>

        </div>

        <div class="pt-3 border-t border-[var(--page-border)]/40 font-mono text-[10px] text-[var(--page-text-muted)] font-medium">
          Zero duplicate debugging across your team.
        </div>

      </div>

    </div>

    <!-- ── Blueprint Footer Divider ────────────────────────────────────── -->
    <div id="blueprint-footer-divider" class="blueprint-reveal border-t-[2px] border-[var(--page-border)] mt-10 pt-3 font-mono text-[11px] text-[var(--page-text-muted)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>Customer input and bug fixes become organizational knowledge through AI and codified memory (MCP), then return to solve the next incident.</div>
      <div class="font-bold shrink-0 text-[var(--page-text)]">[REV 1.2 — CONTINUOUS LOOP]</div>
    </div>
  </div>
</section>

<style>
  /* ── 100% Reliable Wrapper Rotation Animation for Dashed Orbit ── */
  @keyframes spinOrbitWrapper {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .orbit-rotating-wrapper {
    animation: spinOrbitWrapper 22s linear infinite;
    transform-origin: center center;
    will-change: transform;
  }

  @media (prefers-reduced-motion: reduce) {
    .orbit-rotating-wrapper {
      animation: none !important;
    }
  }
</style>
