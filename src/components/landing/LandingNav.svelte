<script lang="ts">
  import { onMount } from 'svelte';
  import { Sun, Moon } from 'lucide-svelte';
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { isIntroComplete } from '../../stores/introStore';

  let currentTheme: 'neoLight' | 'neoDark' = 'neoLight';
  let navEl: HTMLElement;

  // React to store changes
  $: if ($isIntroComplete && navEl) {
    gsap.to(navEl, { yPercent: 0, duration: 0.8, ease: 'power3.out' });
  }

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Apply theme
    const savedTheme = localStorage.getItem('theme') as 'neoLight' | 'neoDark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    currentTheme = savedTheme || (prefersDark ? 'neoDark' : 'neoLight');
    document.documentElement.setAttribute('data-theme', currentTheme);

    // Initial hidden state
    if (!$isIntroComplete) {
      gsap.set(navEl, { yPercent: -100 });
    } else {
      gsap.set(navEl, { yPercent: 0 });
    }
  });

  function toggleTheme() {
    currentTheme = currentTheme === 'neoLight' ? 'neoDark' : 'neoLight';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', currentTheme);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', currentTheme);
    }
  }
</script>

<header bind:this={navEl} class="landing-nav fixed top-0 left-0 right-0 z-50 backdrop-blur-md">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
    
    <!-- Brand Logo with cursor -->
    <a href="/" class="flex items-center gap-2 group">
      <span class="font-mono font-extrabold text-xl tracking-tight text-[var(--nav-text)] flex items-center group-hover:-translate-y-0.5 transition-transform">
        DevMind<span class="ml-0.5 cursor-blink text-[var(--nav-text)]">_</span>
      </span>
    </a>

    <!-- Navigation Links -->
    <nav class="hidden md:flex items-center gap-8 font-mono font-bold text-sm text-[var(--nav-text)]">
      <a href="#problems" class="hover:text-[var(--accent-coral)] transition-colors">The Problem</a>
      <a href="#how-it-works" class="hover:text-[var(--accent-coral)] transition-colors">How MCP Works</a>
      <a href="#stack" class="hover:text-[var(--accent-coral)] transition-colors">Bento Stack</a>
      <a href="#install" class="hover:text-[var(--accent-coral)] transition-colors">Docs & Specs</a>
    </nav>

    <!-- Right Actions -->
    <div class="flex items-center gap-3">
      
      <!-- Neo-Brutalist Light/Dark Theme Toggle -->
      <button
        type="button"
        on:click={toggleTheme}
        class="theme-btn"
        title="Toggle {currentTheme === 'neoDark' ? 'Light' : 'Dark'} Mode"
        aria-label="Toggle theme"
      >
        {#if currentTheme === 'neoDark'}
          <Moon size={16} strokeWidth={2.5} class="text-[var(--accent-yellow)]" />
          <span class="text-xs font-mono font-bold">DARK</span>
        {:else}
          <Sun size={16} strokeWidth={2.5} class="text-[#FF5C38]" />
          <span class="text-xs font-mono font-bold">LIGHT</span>
        {/if}
      </button>

      <!-- Sign In Link for existing users -->
      <a
        href="/auth/login"
        class="hidden sm:inline-block font-mono font-bold text-sm text-[var(--nav-text)] hover:text-[var(--accent-coral)] transition-colors px-2 py-1"
      >
        Sign In
      </a>

      <!-- Primary CTA Button -->
      <a
        href="/auth/register"
        class="inline-flex items-center justify-center border-[2.5px] border-[var(--nav-border)] bg-[var(--nav-cta-bg)] text-[var(--nav-cta-text)] px-5 py-2.5 rounded-lg font-mono font-bold text-sm shadow-[4px_4px_0_0_var(--nav-shadow)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--nav-shadow)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_0_var(--nav-shadow)] transition-all"
      >
        Get Started &rarr;
      </a>
    </div>

  </div>
</header>

<div class="h-20" aria-hidden="true"></div>

<style>
  .landing-nav {
    --nav-bg:         rgba(246, 242, 233, 0.95);
    --nav-border:     #0A0A0A;
    --nav-shadow:     #0A0A0A;
    --nav-text:       #0A0A0A;
    --nav-card:       #FFFFFF;
    --nav-badge-bg:   #FFD23F;
    --nav-badge-text: #0A0A0A;
    --nav-cta-bg:     #FFD23F;
    --nav-cta-text:   #0A0A0A;

    background-color: var(--nav-bg);
    border-bottom: 3px solid var(--nav-border);
    transition: background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease;
  }

  :global([data-theme='neoDark']) .landing-nav,
  :global(.dark) .landing-nav {
    --nav-bg:         rgba(18, 19, 22, 0.95);
    --nav-border:     #2E323D; /* Graphite gray border - matches global.css */
    --nav-shadow:     #000000; /* Dark shadow, zero white */
    --nav-text:       #E2E8F0;
    --nav-card:       #1A1D24;
    --nav-badge-bg:   #C9972E;
    --nav-badge-text: #0F172A;
    --nav-cta-bg:     #C9972E;
    --nav-cta-text:   #0F172A;
  }

  /* Neo-Brutalist Theme Toggle Button */
  .theme-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.75rem;
    border: 2px solid var(--nav-border);
    background-color: var(--nav-card);
    color: var(--nav-text);
    border-radius: 0.5rem;
    box-shadow: 3px 3px 0 0 var(--nav-shadow);
    cursor: pointer;
    transition: transform 0.1s ease, box-shadow 0.1s ease, background-color 0.25s ease, border-color 0.25s ease;
  }

  .theme-btn:hover {
    transform: translate(-1.5px, -1.5px);
    box-shadow: 5px 5px 0 0 var(--nav-shadow);
  }

  .theme-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 0 var(--nav-shadow);
  }

  @keyframes blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  .cursor-blink {
    animation: blink 0.9s infinite;
  }
</style>







