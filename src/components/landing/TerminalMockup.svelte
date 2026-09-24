<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';

  let terminalEl: HTMLElement;
  let typedEl: HTMLElement;
  let cursorEl: HTMLElement;

  const terminalOutput = 
`[14:22:01] ⚡ MCP query: "lookup_past_fix(code='ECONNREFUSED', port=5432)"
[14:22:01] ✓ Match found in team graph (resolved by @sarah on Nov 12)
[14:22:02] → Root Cause: Postgres replica bind address defaulted to 127.0.0.1 inside container network.
[14:22:02] → Injected Fix: "POSTGRES_HOST=postgres-db in .env.test"
[14:22:02] 🎉 Verified patch served to Claude context.`;

  onMount(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Entrance animation
    gsap.from(terminalEl, {
      x: prefersReducedMotion ? 0 : 70,
      opacity: 0,
      duration: prefersReducedMotion ? 0.3 : 0.9,
      ease: 'back.out(1.5)',
      delay: 0.45,
      onComplete: () => {
        startTypewriter(prefersReducedMotion ? 8 : 18);
      }
    });
  });

  function startTypewriter(speedMs: number) {
    if (!typedEl) return;
    let charIndex = 0;
    typedEl.textContent = '';

    const timer = setInterval(() => {
      if (charIndex < terminalOutput.length) {
        typedEl.textContent += terminalOutput.charAt(charIndex);
        charIndex++;
      } else {
        clearInterval(timer);
      }
    }, speedMs);
  }
</script>

<div
  bind:this={terminalEl}
  class="w-full bg-[#121316] text-[#F3F4F6] border-[3px] border-[var(--page-border)] rounded-lg shadow-[8px_8px_0_0_var(--page-shadow)] overflow-hidden"
>
  <!-- Window Header -->
  <div class="bg-[#1F242D] px-4 py-3 border-b-[3px] border-[var(--page-border)] flex items-center justify-between">
    <div class="flex items-center gap-2">
      <span class="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border-2 border-[#0A0A0A]"></span>
      <span class="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border-2 border-[#0A0A0A]"></span>
      <span class="w-3.5 h-3.5 rounded-full bg-[#27C93F] border-2 border-[#0A0A0A]"></span>
    </div>
    <span class="font-mono text-xs text-gray-400 font-bold tracking-tight">
      devmind-daemon // port:8787 [MCP Active]
    </span>
    <div class="w-4" aria-hidden="true"></div>
  </div>

  <!-- Terminal Body -->
  <div class="p-5 font-mono text-xs leading-relaxed min-h-[360px] flex flex-col justify-between select-text">
    <div>
      <div class="flex items-center gap-2 text-gray-400 mb-2">
        <span class="text-emerald-400 font-bold">dan@workstation</span>
        <span>in</span>
        <span class="text-cyan-400">~/repo/auth-core</span>
        <span>on</span>
        <span class="text-[#F472B6] font-bold">git:main*</span>
      </div>
      <div class="text-gray-200 mb-3">
        <span class="text-gray-500">$</span> pnpm test:integration
      </div>
      
      <div class="bg-red-950/50 border-l-4 border-red-500 p-3 rounded-r mb-4 text-red-200 font-mono text-[11px]">
        <div class="font-bold text-red-400 flex items-center gap-1.5">
          <span>[FAIL]</span> Error: Connection refused to 127.0.0.1:5432
        </div>
        <div class="text-gray-400 mt-1">
          code: 'ECONNREFUSED', syscall: 'connect', address: '127.0.0.1'
        </div>
        <div class="text-gray-500 text-[10px] mt-0.5">
          at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1606:16)
        </div>
      </div>
    </div>

    <!-- Live MCP Typing Area -->
    <div class="mt-2 pt-3 border-t border-gray-800">
      <div class="text-xs font-bold text-[#2DD4BF] mb-1 flex items-center gap-2">
        <span class="inline-block w-2 h-2 bg-[#2DD4BF] rounded-full animate-pulse"></span>
        MCP PROMPT CONTEXT INJECTOR
      </div>
      <div bind:this={typedEl} class="text-gray-300 whitespace-pre-wrap font-mono text-[11.5px] leading-relaxed"></div>
      <span bind:this={cursorEl} class="inline-block w-2 h-4 bg-[#FFD23F] align-middle cursor-blink"></span>
    </div>

    <!-- Status Bar -->
    <div class="mt-4 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[10px] text-gray-400">
      <span>Claude 3.7 Sonnet + DevMind MCP</span>
      <span class="text-emerald-400 font-bold">100% MATCH CONFIDENCE</span>
    </div>
  </div>
</div>

<style>
  @keyframes blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  .cursor-blink {
    animation: blink 0.9s infinite;
  }
</style>
