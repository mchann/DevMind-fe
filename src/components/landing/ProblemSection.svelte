<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  let sectionEl: HTMLElement;
  let cardEls: HTMLElement[] = [];

  const problems = [
    {
      step: '01',
      badgeBg: 'bg-[#FF5C38]',
      badgeText: 'text-white',
      cardBg: 'bg-white',
      restingRotate: -2.2,
      title: 'Re-Googling the exact same obscure fix',
      desc: 'You spend 3 hours debugging an esoteric Docker build cache failure, finally find the fix on page 4 of a GitHub issue, and then six weeks later you hit it on another microservice and start from scratch.',
      footerTag: 'Average cost: 2.5h lost per incident',
      footerColor: 'text-[#FF5C38]',
    },
    {
      step: '02',
      badgeBg: 'bg-[#FFD23F]',
      badgeText: 'text-[#0A0A0A]',
      cardBg: 'bg-[#FFD23F]/20',
      restingRotate: 2.0,
      title: 'Tribal knowledge vaporizes when seniors take PTO',
      desc: 'The staging environment breaks at 4 PM on Friday. The only engineer who knows why Postgres sslmode behaves oddly with the replica is hiking with zero cellular reception. The PR remains frozen.',
      footerTag: 'Impact: Deployment blockers & team panic',
      footerColor: 'text-[#0A0A0A]',
    },
    {
      step: '03',
      badgeBg: 'bg-[#2DD4BF]',
      badgeText: 'text-[#0A0A0A]',
      cardBg: 'bg-[#2DD4BF]/20',
      restingRotate: -1.8,
      title: 'AI assistants forget everything between chats',
      desc: 'Claude and Cursor are brilliant at code, but they are completely amnesiac. Every new chat window starts with zero knowledge of your monorepo\'s idiosyncrasies, custom build hooks, and past hotfixes.',
      footerTag: 'Fix: Persistent external memory injection',
      footerColor: 'text-teal-800',
    },
  ];

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    cardEls.forEach((card, i) => {
      const p = problems[i];
      
      // Rubber-stamp entrance
      gsap.fromTo(card,
        {
          y: prefersReducedMotion ? 0 : -160,
          opacity: 0,
          rotation: prefersReducedMotion ? 0 : (p.restingRotate > 0 ? 16 : -16),
        },
        {
          y: 0,
          opacity: 1,
          rotation: p.restingRotate,
          duration: prefersReducedMotion ? 0.3 : 0.85,
          ease: 'back.out(1.8)',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Interactive hover tilt
      if (!prefersReducedMotion) {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            rotation: p.restingRotate > 0 ? p.restingRotate + 2.4 : p.restingRotate - 2.4,
            y: -5,
            duration: 0.22,
            ease: 'power1.out',
            boxShadow: '9px 9px 0 0 var(--page-shadow)',
            overwrite: 'auto',
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            rotation: p.restingRotate,
            y: 0,
            duration: 0.65,
            ease: 'elastic.out(1, 0.4)',
            boxShadow: '6px 6px 0 0 var(--page-shadow)',
            overwrite: 'auto',
          });
        });
      }
    });
  });
</script>

<section id="problems" bind:this={sectionEl} class="py-20 lg:py-28 relative">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <div class="max-w-3xl mb-16">
      <h2 class="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[var(--page-text)] leading-tight">
        Software engineering is 40% building, 60% solving déjà-vu bugs.
      </h2>
      <p class="font-mono text-base text-[var(--page-text-muted)] mt-4 font-medium">
        Modern teams flush thousands of engineering hours into the void solving problems someone on the team already solved three months ago.
      </p>
    </div>

    <!-- 3 Rubber-Stamp Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {#each problems as p, i}
        <div
          bind:this={cardEls[i]}
          class="problem-card border-[3px] border-[var(--page-border)] rounded-lg shadow-[6px_6px_0_0_var(--page-shadow)] p-8 relative bg-[var(--page-card)]"
        >
          <div class="w-12 h-12 {i === 0 ? 'bg-[var(--accent-coral)] text-white' : i === 1 ? 'bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)]' : 'bg-[var(--accent-teal)] text-[var(--accent-teal-text)]'} border-[3px] border-[var(--page-border)] rounded-lg flex items-center justify-center font-mono font-bold text-lg mb-6 shadow-[3px_3px_0_0_var(--page-shadow)]">
            {p.step}
          </div>
          <h3 class="font-heading font-bold text-2xl text-[var(--page-text)] mb-3 leading-snug">
            {p.title}
          </h3>
          <p class="font-mono text-sm text-[var(--page-text-muted)] leading-relaxed">
            {p.desc}
          </p>
          <div class="mt-6 pt-4 border-t-2 border-[var(--page-border)]/20 font-mono text-xs font-bold {i === 0 ? 'text-[var(--accent-coral)]' : i === 1 ? 'text-[var(--accent-yellow)]' : 'text-[var(--accent-teal)]'}">
            {p.footerTag}
          </div>
        </div>
      {/each}
    </div>

  </div>
</section>
