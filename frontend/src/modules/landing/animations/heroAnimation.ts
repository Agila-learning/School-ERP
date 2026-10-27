import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const initHeroAnimation = (
  heroContainerSelector: string,
  onComplete?: () => void
) => {
  const tl = gsap.timeline({
    onComplete,
    defaults: { ease: 'power3.out' }
  });

  // Selectors for elements within the hero container
  const eyebrow = `${heroContainerSelector} .lp-hero-badge`;
  const heading = `${heroContainerSelector} .lp-hero-heading`;
  const subtext = `${heroContainerSelector} .lp-hero-subtext`;
  const actions = `${heroContainerSelector} .lp-hero-actions`;
  const trust = `${heroContainerSelector} .lp-hero-trust`;
  const videoContainer = `${heroContainerSelector} .lp-hero-video-wrapper`;
  const floatingCards = `${heroContainerSelector} .lp-floating-card`;

  // Initial states
  gsap.set([eyebrow, heading, subtext, actions, trust], { y: 30, opacity: 0 });
  gsap.set(videoContainer, { y: 40, scale: 0.92, opacity: 0 });
  gsap.set(floatingCards, { opacity: 0, scale: 0.8, y: 20 });

  // Entrance animation sequence
  tl.to(eyebrow, { y: 0, opacity: 1, duration: 0.6 })
    .to(heading, { y: 0, opacity: 1, duration: 0.8 }, '-=0.4')
    .to(subtext, { y: 0, opacity: 1, duration: 0.8 }, '-=0.6')
    .to(actions, { y: 0, opacity: 1, duration: 0.6 }, '-=0.6')
    .to(trust, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
    .to(videoContainer, { y: 0, scale: 1, opacity: 1, duration: 1.2, ease: 'expo.out' }, '-=0.8')
    .to(floatingCards, { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'back.out(1.5)' }, '-=0.6');

  return tl;
};

export const initFloatingAnimation = (videoContainerSelector: string) => {
  // Respect prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return () => {};

  const videoContainer = document.querySelector(videoContainerSelector);
  if (!videoContainer) return () => {};

  // Extremely subtle floating effect for the main container
  gsap.to(videoContainer, {
    y: -8,
    duration: 4.5,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
  
  // Floating cards parallax effect based on mouse movement
  const cards = document.querySelectorAll(`${videoContainerSelector} .lp-floating-card`);
  
  const handleMouseMove = (e: MouseEvent) => {
    const xPos = (e.clientX / window.innerWidth - 0.5) * 20;
    const yPos = (e.clientY / window.innerHeight - 0.5) * 20;

    cards.forEach((card, i) => {
      const depth = (i + 1) * 0.5;
      gsap.to(card, {
        x: xPos * depth,
        y: yPos * depth,
        duration: 1,
        ease: 'power2.out',
      });
    });
  };
  
  // Only add mouse parallax on desktop
  if (window.innerWidth > 768) {
     window.addEventListener('mousemove', handleMouseMove);
  }
  
  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
    gsap.killTweensOf(videoContainer);
    gsap.killTweensOf(cards);
  };
};
