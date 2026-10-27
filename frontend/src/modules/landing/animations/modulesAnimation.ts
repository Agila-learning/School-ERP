import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const initEcosystemAnimation = (sectionSelector: string) => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sectionSelector,
      start: 'top 70%',
      toggleActions: 'play none none none',
    },
    defaults: { ease: 'power3.out' }
  });

  const heading = `${sectionSelector} .lp-section-head`;
  const core = `${sectionSelector} .lp-eco-core`;
  const lines = `${sectionSelector} .lp-eco-path`;
  const nodes = `${sectionSelector} .lp-eco-node`;

  gsap.set(heading, { y: 30, opacity: 0 });
  gsap.set(core, { scale: 0.8, opacity: 0 });
  gsap.set(lines, { strokeDasharray: 1000, strokeDashoffset: 1000, opacity: 0 });
  gsap.set(nodes, { scale: 0, opacity: 0 });

  tl.to(heading, { y: 0, opacity: 1, duration: 0.8 })
    .to(core, { scale: 1, opacity: 1, duration: 1, ease: 'back.out(1.5)' }, '-=0.4')
    .to(lines, { strokeDashoffset: 0, opacity: 0.4, duration: 1.5, ease: 'power2.inOut' }, '-=0.5')
    .to(nodes, { scale: 1, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'back.out(1.2)' }, '-=1.0');

  // Pulsing animation for the core
  const coreEl = document.querySelector(core);
  let pulseTween: gsap.core.Tween | null = null;
  if (coreEl) {
    pulseTween = gsap.to(coreEl, {
      boxShadow: '0 0 60px rgba(79, 70, 229, 0.4), inset 0 0 30px rgba(79, 70, 229, 0.4)',
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  // Draw pulses along the paths continuously
  const paths = document.querySelectorAll(lines);
  const pathTweens: gsap.core.Tween[] = [];
  paths.forEach(path => {
    pathTweens.push(gsap.to(path, {
      strokeDashoffset: -1000,
      duration: 15,
      repeat: -1,
      ease: 'none'
    }));
  });

  return {
    timeline: tl,
    kill: () => {
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
      if (pulseTween) pulseTween.kill();
      pathTweens.forEach(t => t.kill());
    }
  };
};

export const initModulesAnimation = (sectionSelector: string) => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sectionSelector,
      start: 'top 75%',
      toggleActions: 'play none none none',
    },
    defaults: { ease: 'power3.out' }
  });

  const heading = `${sectionSelector} .lp-modules-heading`;
  const subtitle = `${sectionSelector} .lp-modules-subtitle`;
  const cards = `${sectionSelector} .lp-module-card`;

  gsap.set([heading, subtitle], { y: 30, opacity: 0 });
  gsap.set(cards, { y: 40, opacity: 0, scale: 0.96 });

  tl.to(heading, { y: 0, opacity: 1, duration: 0.8 })
    .to(subtitle, { y: 0, opacity: 1, duration: 0.8 }, '-=0.6')
    .to(cards, { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.15 }, '-=0.4');

  return {
    kill: () => {
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
    }
  };
};

export const initEcosystemBarAnimation = (barSelector: string) => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: barSelector,
      start: 'top 90%',
    }
  });

  const title = `${barSelector} .lp-eco-bar-title`;
  const items = `${barSelector} .lp-eco-bar-item`;

  gsap.set(title, { opacity: 0, y: 20 });
  gsap.set(items, { opacity: 0, x: -20 });

  tl.to(title, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
    .to(items, { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }, '-=0.3');

  return {
    kill: () => {
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
    }
  };
};
