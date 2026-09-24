<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  let gridEl: HTMLElement;

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ScrollTrigger.batch for punch-scale entrance
    ScrollTrigger.batch('.bento-item', {
      start: 'top 85%',
      once: true,
      onEnter: (elements) => {
        gsap.fromTo(elements,
          {
            scale: prefersReducedMotion ? 1 : 0.6,
            rotation: prefersReducedMotion ? 0 : -6,
            opacity: 0,
          },
          {
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: prefersReducedMotion ? 0.3 : 0.8,
            ease: 'back.out(2.2)',
            stagger: 0.12,
          }
        );
      },
    });

    // Hover effect
    if (!prefersReducedMotion) {
      document.querySelectorAll('.bento-item').forEach((item) => {
        item.addEventListener('mouseenter', () => {
          gsap.to(item, {
            rotation: 1.5,
            y: -5,
            duration: 0.22,
            ease: 'power1.out',
            boxShadow: '9px 9px 0 0 var(--page-shadow)',
            overwrite: 'auto',
          });
        });
        item.addEventListener('mouseleave', () => {
          gsap.to(item, {
            rotation: 0,
            y: 0,
            duration: 0.65,
            ease: 'elastic.out(1, 0.4)',
            boxShadow: '6px 6px 0 0 var(--page-shadow)',
            overwrite: 'auto',
          });
        });
      });
    }
  });
</script>

<section id="stack" class="py-20 lg:py-28 relative">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <div class="max-w-2xl mb-14">
      <h2 class="font-heading font-extrabold text-4xl sm:text-5xl text-[var(--page-text)]">
        Ecosystem Integrations
      </h2>
      <p class="font-mono text-sm text-[var(--page-text-muted)] mt-3 font-medium">
        DevMind bridges your IDE, continuous integration pipelines, terminal tools, and AI clients through zero-configuration connectors.
      </p>
    </div>

    <!-- Asymmetric Bento Grid -->
    <div bind:this={gridEl} class="grid grid-cols-1 md:grid-cols-12 gap-6">
      
      <!-- Cell 1: Cursor & VS Code (7 cols) -->
      <div class="bento-item md:col-span-7 border-[3px] border-[var(--page-border)] rounded-lg shadow-[6px_6px_0_0_var(--page-shadow)] p-8 bg-[var(--bento-teal-bg)] text-[var(--bento-teal-text)] flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-6">
            <span class="px-3 py-1 bg-[var(--page-card-subtle)] border border-[var(--page-border)] rounded font-mono text-xs font-bold text-[var(--page-text)]">
              PRIMARY IDE EXTENSION
            </span>
            <span class="font-mono text-xs font-bold text-[var(--page-text-muted)]">v2.4.0</span>
          </div>
          <h3 class="font-heading font-extrabold text-3xl mb-3">
            VS Code & Cursor Native Sidecar
          </h3>
          <p class="font-mono text-sm opacity-85 leading-relaxed max-w-lg mb-6">
            Injects contextual error resolution directly into Cursor composer windows and VS Code Copilot chats. Watches terminal output automatically for stack traces.
          </p>
        </div>
        <div class="bg-[var(--page-card-subtle)] p-4 border-2 border-[var(--page-border)] rounded-lg font-mono text-xs shadow-[3px_3px_0_0_var(--page-shadow)] text-[var(--page-text)]">
          <span class="opacity-60">// In cursor settings.json</span><br />
          <span class="text-indigo-400">"mcpServers"</span>: &#123; <span class="text-amber-400">"devmind"</span>: &#123; <span class="text-indigo-400">"command"</span>: <span class="text-emerald-400">"devmind-mcp"</span> &#125; &#125;
        </div>
      </div>

      <!-- Cell 2: Terminal CLI (5 cols) -->
      <div class="bento-item md:col-span-5 border-[3px] border-[var(--page-border)] rounded-lg shadow-[6px_6px_0_0_var(--page-shadow)] p-8 bg-[var(--bento-yellow-bg)] text-[var(--bento-yellow-text)] flex flex-col justify-between">
        <div>
          <span class="px-3 py-1 bg-[var(--page-card-subtle)] border border-[var(--page-border)] rounded font-mono text-xs font-bold inline-block mb-6 text-[var(--page-text)]">
            HEADLESS CLI
          </span>
          <h3 class="font-heading font-extrabold text-2xl mb-2">
            Terminal Memory Daemon
          </h3>
          <p class="font-mono text-xs opacity-85 leading-relaxed mb-4">
            Run <code class="font-bold bg-[var(--page-card-subtle)] px-1.5 py-0.5 rounded border border-[var(--page-border)]">devmind capture</code> right in your bash or zsh session. Intercepts non-zero process exits.
          </p>
        </div>
        <div class="bg-[var(--page-card-subtle)] text-[var(--accent-teal)] p-3 rounded border-2 border-[var(--page-border)] font-mono text-[11px]">
          $ devmind log --last-error<br />
          <span class="text-[var(--page-text)]">&gt; Indexed commit 4b29f0 as fix</span>
        </div>
      </div>

      <!-- Cell 3: MCP Server Native (8 cols) -->
      <div class="bento-item md:col-span-8 border-[3px] border-[var(--page-border)] rounded-lg shadow-[6px_6px_0_0_var(--page-shadow)] p-8 bg-[var(--bento-pink-bg)] text-[var(--bento-pink-text)] flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4">
            <span class="px-3 py-1 bg-[var(--page-card-subtle)] border border-[var(--page-border)] rounded font-mono text-xs font-bold text-[var(--page-text)]">
              OPEN PROTOCOL
            </span>
            <span class="font-mono text-xs font-bold bg-[var(--page-card-subtle)] text-[var(--page-text-muted)] border border-[var(--page-border)] px-2 py-0.5 rounded">
              Anthropic MCP Spec
            </span>
          </div>
          <h3 class="font-heading font-extrabold text-3xl mb-3">
            Model Context Protocol (MCP) Standard Server
          </h3>
          <p class="font-mono text-sm opacity-85 leading-relaxed max-w-xl">
            Fully compliant with the Anthropic Model Context Protocol. Works out-of-the-box with Claude Desktop, Cline, Roo Code, LibreChat, and custom enterprise agentic frameworks.
          </p>
        </div>
        <div class="grid grid-cols-3 gap-3 mt-6">
          <div class="bg-[var(--page-card-subtle)] p-3 border-2 border-[var(--page-border)] rounded text-center font-mono text-xs font-bold text-[var(--page-text)]">
            Tool Calling
          </div>
          <div class="bg-[var(--page-card-subtle)] p-3 border-2 border-[var(--page-border)] rounded text-center font-mono text-xs font-bold text-[var(--page-text)]">
            Context Prompts
          </div>
          <div class="bg-[var(--page-card-subtle)] p-3 border-2 border-[var(--page-border)] rounded text-center font-mono text-xs font-bold text-[var(--page-text)]">
            Dynamic Resources
          </div>
        </div>
      </div>

      <!-- Cell 4: Slack Bot (4 cols) -->
      <div class="bento-item md:col-span-4 border-[3px] border-[var(--page-border)] rounded-lg shadow-[6px_6px_0_0_var(--page-shadow)] p-8 bg-[var(--page-card)] flex flex-col justify-between">
        <div>
          <span class="px-3 py-1 bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)] border border-[var(--page-border)] rounded font-mono text-xs font-bold inline-block mb-4">
            COLLABORATION
          </span>
          <h3 class="font-heading font-bold text-2xl text-[var(--page-text)] mb-2">
            Slack / Incident Bot
          </h3>
          <p class="font-mono text-xs text-[var(--page-text-muted)] leading-relaxed">
            Paste a traceback in #dev-ops. DevMind responds in the thread with who fixed it previously, the link to the PR, and the diff.
          </p>
        </div>
        <div class="mt-4 p-2 bg-[var(--page-card-subtle)] border-2 border-[var(--page-border)] rounded font-mono text-[11px] text-[var(--page-text)] font-semibold">
          @devmind explain C-1049
        </div>
      </div>

      <!-- Cell 5: GitHub Actions (6 cols) -->
      <div class="bento-item md:col-span-6 border-[3px] border-[var(--page-border)] rounded-lg shadow-[6px_6px_0_0_var(--page-shadow)] p-8 bg-[var(--page-card)] flex flex-col justify-between">
        <div>
          <span class="px-3 py-1 bg-[var(--accent-teal)] text-[var(--accent-teal-text)] border border-[var(--page-border)] rounded font-mono text-xs font-bold inline-block mb-4">
            CI / CD WORKFLOWS
          </span>
          <h3 class="font-heading font-bold text-2xl text-[var(--page-text)] mb-2">
            GitHub Actions & PR Reviewer
          </h3>
          <p class="font-mono text-xs text-[var(--page-text-muted)] leading-relaxed">
            Flags regression bugs on pull requests before merge. Warns when code re-introduces an anti-pattern that caused an outage in past releases.
          </p>
        </div>
        <div class="mt-4 p-3 bg-[var(--page-card-subtle)] text-[var(--page-text)] border-2 border-[var(--page-border)] rounded font-mono text-[11px]">
          uses: devmind/action-verify@v1
        </div>
      </div>

      <!-- Cell 6: REST API & Webhooks (6 cols) -->
      <div class="bento-item md:col-span-6 border-[3px] border-[var(--page-border)] rounded-lg shadow-[6px_6px_0_0_var(--page-shadow)] p-8 bg-[var(--bento-coral-bg)] text-[var(--bento-coral-text)] flex flex-col justify-between">
        <div>
          <span class="px-3 py-1 bg-[var(--page-card-subtle)] text-[var(--page-text)] border border-[var(--page-border)] rounded font-mono text-xs font-bold inline-block mb-4">
            DEVELOPER API
          </span>
          <h3 class="font-heading font-bold text-2xl mb-2">
            REST Endpoints & Webhooks
          </h3>
          <p class="font-mono text-xs opacity-85 leading-relaxed">
            Export and ingest memory graphs programmatically. Stream real-time bug telemetry into your internal developer portal or Datadog dashboard.
          </p>
        </div>
        <div class="mt-4 p-3 bg-[var(--page-card-subtle)] text-[var(--accent-yellow)] border-2 border-[var(--page-border)] rounded font-mono text-[11px]">
          POST /v1/memories/query &#123; hash, context &#125;
        </div>
      </div>

    </div>

  </div>
</section>
