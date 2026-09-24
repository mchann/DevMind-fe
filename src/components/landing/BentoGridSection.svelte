<script lang="ts">
  import { onMount } from "svelte";
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";

  const items = [
    {
      num: "01",
      tag: "PRIMARY IDE",
      title: "VS CODE & CURSOR",
      desc: "Injects contextual error resolution directly into Cursor composer windows and VS Code Copilot chats. Watches terminal output automatically for stack traces.",
      code: '// In cursor settings.json\n"mcpServers": {\n  "devmind": { "command": "devmind-mcp" }\n}',
      bg: "bg-[var(--bento-teal-bg)]",
      text: "text-[var(--bento-teal-text)]",
    },
    {
      num: "02",
      tag: "HEADLESS CLI",
      title: "TERMINAL DAEMON",
      desc: "Run `devmind capture` right in your bash or zsh session. Intercepts non-zero process exits.",
      code: "$ devmind log --last-error\n> Indexed commit 4b29f0 as fix",
      bg: "bg-[var(--bento-yellow-bg)]",
      text: "text-[var(--bento-yellow-text)]",
    },
    {
      num: "03",
      tag: "OPEN PROTOCOL",
      title: "MCP SERVER",
      desc: "Fully compliant with the Anthropic Model Context Protocol. Works out-of-the-box with Claude Desktop, Cline, Roo Code, LibreChat, and custom enterprise agentic frameworks.",
      code: "Capabilities:\n- Tool Calling\n- Context Prompts\n- Dynamic Resources",
      bg: "bg-[var(--bento-pink-bg)]",
      text: "text-[var(--bento-pink-text)]",
    },
    {
      num: "04",
      tag: "COLLABORATION",
      title: "SLACK BOT",
      desc: "Paste a traceback in #dev-ops. DevMind responds in the thread with who fixed it previously, the link to the PR, and the diff.",
      code: "@devmind explain C-1049",
      bg: "bg-white",
      text: "text-[#0A0A0A]",
    },
    {
      num: "05",
      tag: "CI/CD WORKFLOWS",
      title: "GITHUB ACTIONS",
      desc: "Flags regression bugs on pull requests before merge. Warns when code re-introduces an anti-pattern that caused an outage in past releases.",
      code: "uses: devmind/action-verify@v1",
      bg: "bg-[var(--bento-coral-bg)]",
      text: "text-[var(--bento-coral-text)]",
    },
  ];

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);

    const panels = gsap.utils.toArray(".integration-panel");
    const container = document.querySelector("#stack-container");

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      // Set all to static position for reduced motion
      gsap.set(panels, { position: "relative", yPercent: 0 });
      return;
    }

    // Set initial position: panel 0 is at 0, others are at 100% (hidden below)
    panels.forEach((panel: any, i) => {
      if (i > 0) {
        gsap.set(panel, { yPercent: 100 });
      }
    });

    // Create a scrub timeline to slide panels up one by one
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top 80px", // Start pinning below the 80px navbar
        pin: true,
        scrub: 1,
        snap: {
          snapTo: 1 / (panels.length - 1),
          duration: 0.5,
          ease: "power2.inOut",
        },
        end: () => "+=" + window.innerHeight * panels.length,
      },
    });

    panels.forEach((panel: any, i) => {
      if (i === 0) return;

      tl.to(panel, {
        yPercent: 0,
        ease: "none",
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  });
</script>

<!-- The pinned container needs a fixed height so absolute children fill it perfectly -->
<section
  id="stack"
  class="relative w-full border-t-[3px] border-[var(--page-border)] bg-[var(--page-bg)]"
>
  <div
    class="py-24 md:py-32 flex flex-col items-center justify-center text-center px-4"
  >
    <h2
      class="font-heading font-black text-5xl md:text-7xl lg:text-[7rem] text-[var(--page-text)] uppercase tracking-tighter leading-[0.9] slide-up-text mb-6"
    >
      Ecosystem<br />Integrations
    </h2>
    <p
      class="font-mono text-sm md:text-lg text-[var(--page-text-muted)] font-medium max-w-2xl slide-up-text"
    >
      DevMind bridges your IDE, continuous integration pipelines, terminal
      tools, and AI clients through zero-configuration connectors.
    </p>
  </div>

  <div
    id="stack-container"
    class="relative w-full h-[calc(100dvh-80px)] overflow-hidden border-t-[3px] border-[var(--page-border)]"
  >
    {#each items as item, i}
      <!-- Each panel is stacked using absolute positioning and z-index -->
      <!-- The border-t creates the separation line when a new panel slides up over the previous one -->
      <div
        class="integration-panel absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center p-6 md:p-16 {item.bg} {item.text} {i >
        0
          ? 'border-t-[3px] border-[var(--page-border)] shadow-[0_-15px_30px_rgba(0,0,0,0.1)]'
          : ''}"
        style="z-index: {i + 10};"
      >
        <!-- Background decorative text (optional huge number behind) -->
        <div
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-black opacity-5 select-none pointer-events-none"
        >
          {item.num}
        </div>

        <!-- Top Left Number & Tag -->
        <div
          class="absolute top-6 left-6 md:top-8 md:left-8 z-20 flex flex-col items-start"
        >
          <div
            class="font-heading font-extrabold text-4xl md:text-6xl tracking-tighter opacity-90 leading-none"
          >
            {item.num}
          </div>
          <div
            class="font-mono text-xs md:text-sm font-bold tracking-widest uppercase mt-2 opacity-80 bg-black/5 px-2 py-1 rounded"
          >
            {item.tag}
          </div>
        </div>

        <!-- Center Massive Typography -->
        <div
          class="w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center relative z-20 mt-12 md:mt-0"
        >
          <h3
            class="font-heading font-black text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-tighter uppercase"
            style="text-shadow: 4px 4px 0px rgba(0,0,0,0.1);"
          >
            {item.title}
          </h3>

          <p
            class="font-mono text-sm md:text-base lg:text-lg max-w-2xl mt-6 md:mt-8 opacity-95 font-medium leading-relaxed bg-white/10 p-4 md:p-6 backdrop-blur-sm border-[3px] border-current shadow-[6px_6px_0_0_currentColor] rounded-xl text-left"
          >
            {item.desc}
          </p>

          <!-- Code block -->
          <div
            class="mt-6 md:mt-8 p-4 md:p-6 border-[3px] border-[var(--page-border)] bg-[var(--page-card-subtle)] text-[var(--page-text)] shadow-[6px_6px_0_0_var(--page-shadow)] rounded-xl text-left w-full max-w-2xl"
          >
            <pre
              class="font-mono text-xs md:text-base whitespace-pre-wrap font-bold overflow-x-auto"><code
                >{item.code}</code
              ></pre>
          </div>
        </div>
      </div>
    {/each}
  </div>
</section>
