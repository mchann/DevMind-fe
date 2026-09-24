<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  let sectionEl: HTMLElement;
  let headlineEl: HTMLElement;

  let copied = false;
  const installCmd = 'npx @devmind/mcp-server@latest init';

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Elastic pop-in for headline
    gsap.from(headlineEl, {
      scale: prefersReducedMotion ? 1 : 0.4,
      opacity: 0,
      duration: prefersReducedMotion ? 0.3 : 1.2,
      ease: 'elastic.out(1, 0.55)',
      scrollTrigger: {
        trigger: sectionEl,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  });

  async function copyCommand() {
    await navigator.clipboard.writeText(installCmd);
    copied = true;
    setTimeout(() => { copied = false; }, 2000);
  }
</script>

<section id="install" bind:this={sectionEl} class="py-20 lg:py-28 relative">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <div class="border-[3px] border-[var(--page-border)] bg-[var(--cta-bg)] p-8 sm:p-12 lg:p-16 rounded-lg text-[var(--cta-text)] relative overflow-hidden shadow-[8px_8px_0_0_var(--page-shadow)]">
      <div class="max-w-3xl relative z-10">
        
        <div class="inline-block px-3 py-1 bg-[var(--cta-badge-bg)] text-[var(--cta-badge-text)] border-2 border-[var(--page-border)] rounded-lg font-mono text-xs font-bold mb-6 shadow-[3px_3px_0_0_var(--page-shadow)]">
          INSTANT LOCAL SETUP — NO CLOUD REQUIRED
        </div>

        <!-- Elastic Scale-Pop Headline -->
        <h2
          bind:this={headlineEl}
          class="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[var(--cta-text)] leading-tight mb-6"
        >
          Make your engineering team's memory permanently persistent.
        </h2>

        <p class="font-mono text-base text-[var(--cta-text)] opacity-85 max-w-xl mb-10 leading-relaxed font-medium">
          Run the DevMind daemon locally on your machine or deploy an organization-wide shared instance for the whole engineering org in under 3 minutes.
        </p>

        <!-- Command Box -->
        <div class="bg-[var(--page-card-subtle)] p-4 sm:p-5 border-[3px] border-[var(--page-border)] rounded-lg max-w-xl shadow-[5px_5px_0_0_var(--page-shadow)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3 overflow-x-auto py-1">
            <span class="text-[var(--accent-coral)] font-bold select-none">$</span>
            <code class="text-[var(--page-text)] font-mono text-sm font-bold whitespace-nowrap">
              {installCmd}
            </code>
          </div>
          <button
            on:click={copyCommand}
            class="border-2 border-[var(--page-border)] bg-[var(--cta-btn-bg)] text-[var(--cta-btn-text)] px-4 py-2 rounded text-xs font-mono font-bold shrink-0 hover:opacity-90 active:translate-x-0.5 active:translate-y-0.5 transition-all shadow-[2px_2px_0_0_var(--page-shadow)]"
          >
            {copied ? 'COPIED!' : 'COPY COMMAND'}
          </button>
        </div>

        <div class="mt-6 flex flex-wrap items-center gap-6 font-mono text-xs text-[var(--cta-text)] opacity-75 font-medium">
          <span>✓ Open Source Core</span>
          <span>✓ Zero Telemetry Leak</span>
          <span>✓ Local SQLite / Remote Postgres</span>
        </div>

      </div>
    </div>

  </div>
</section>
