<script lang="ts">
  import MarqueeTicker from './MarqueeTicker.svelte';

  const footerTickerItems = [
    'DEVMIND // THE MODEL CONTEXT PROTOCOL BUG SOLVER',
    'ZERO TRIBAL KNOWLEDGE LOSS',
    'WORKS WITH CLAUDE, CURSOR, ROO-CODE & VS-CODE',
    'PERSISTENT ERROR RESOLUTION GRAPH',
    'MCP COMPLIANT // SERVER SPEC v1.2',
    'LOCAL SQLITE OR SHARED POSTGRES',
  ];
</script>

<footer class="bg-[#0A0A0A] text-[#F6F2E9] border-t-[3px] border-[var(--page-border)] pt-8 pb-12">
  
  <!-- Running Footer Marquee -->
  <div class="mb-12">
    <MarqueeTicker
      items={footerTickerItems}
      bgClass="bg-[var(--accent-yellow)]"
      textClass="text-[var(--accent-yellow-text)]"
      duration={26}
    />
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-xs text-gray-400">
    
    <div class="flex items-center gap-2">
      <div class="w-7 h-7 bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)] border-[2px] border-[var(--page-border)] rounded flex items-center justify-center font-bold text-xs">
        DM
      </div>
      <span class="text-white font-bold text-sm">DevMind</span>
      <span class="text-gray-500">— MCP Compliant Memory System</span>
    </div>

    <div class="flex items-center gap-6">
      <a href="#problems" class="hover:text-white transition-colors">Problems</a>
      <a href="#how-it-works" class="hover:text-white transition-colors">MCP Protocol</a>
      <a href="#stack" class="hover:text-white transition-colors">Bento Stack</a>
      <a href="#install" class="hover:text-white transition-colors">Install</a>
    </div>

    <div>
      Built with Neo-Brutalism &amp; GSAP Motion.
    </div>

  </div>
</footer>
