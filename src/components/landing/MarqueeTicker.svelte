<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';

  export let items: string[] = [];
  export let bgClass: string = 'bg-[#0A0A0A]';
  export let textClass: string = 'text-[#F6F2E9]';
  export let duration: number = 22;

  let trackEl: HTMLElement;

  onMount(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tween = gsap.to(trackEl, {
      xPercent: -50,
      repeat: -1,
      duration: prefersReducedMotion ? duration * 2 : duration,
      ease: 'none',
    });

    return () => {
      tween.kill();
    };
  });
</script>

<div class="overflow-hidden whitespace-nowrap flex border-y-[3px] border-[var(--page-border)] py-3 font-mono text-sm font-bold tracking-wider uppercase {bgClass} {textClass}">
  <div bind:this={trackEl} class="flex items-center gap-8 pr-8 flex-shrink-0 will-change-transform">
    <!-- Sequence 1 -->
    {#each items as item}
      <span>{item}</span>
      <span class="opacity-40 select-none">/</span>
    {/each}

    <!-- Duplicated Sequence 2 for seamless infinite loop -->
    {#each items as item}
      <span>{item}</span>
      <span class="opacity-40 select-none">/</span>
    {/each}
  </div>
</div>
