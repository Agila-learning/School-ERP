import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const initWorkflowAnimation = (sectionSelector: string) => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sectionSelector,
      start: 'top top',
      end: '+=400%', // Increased scroll duration for 6 steps
      pin: true,
      scrub: 1,
    }
  });

  const steps = gsap.utils.toArray(`${sectionSelector} .lp-workflow-step`);
  const activeLine = document.querySelector(`${sectionSelector} .lp-workflow-line-active`);
  const msgs = gsap.utils.toArray(`${sectionSelector} .lp-workflow-msg`);
  const previews = gsap.utils.toArray(`${sectionSelector} .lp-preview-card`);

  // Force initial states
  if (steps[0]) (steps[0] as HTMLElement).classList.add('active');
  
  const stepWidth = 100 / (steps.length - 1);

  for (let i = 0; i < steps.length - 1; i++) {
    const currentStep = steps[i] as HTMLElement;
    const nextStep = steps[i + 1] as HTMLElement;
    
    // Calculate which message should show based on current step progress
    const currentMsgIndex = Math.floor((i / (steps.length - 1)) * msgs.length);
    let nextMsgIndex = Math.floor(((i + 1) / (steps.length - 1)) * msgs.length);
    if (nextMsgIndex >= msgs.length) nextMsgIndex = msgs.length - 1;

    const currentMsg = msgs[currentMsgIndex] as HTMLElement;
    const nextMsg = msgs[nextMsgIndex] as HTMLElement;
    
    const currentPreview = previews[i] as HTMLElement;
    const nextPreview = previews[i + 1] as HTMLElement;

    // Line drawing segment
    tl.to(activeLine, { width: `${(i + 1) * stepWidth}%`, duration: 2, ease: 'none' });

    // State changes triggered during the line drawing
    tl.to(currentStep, { opacity: 0.4, duration: 0.5 }, '<1');
    tl.to(nextStep, { opacity: 1, duration: 0.5 }, '<');
    
    tl.add(() => {
      currentStep.classList.remove('active');
      nextStep.classList.add('active');
    }, '<');

    // UI Preview transition
    tl.to(currentPreview, { opacity: 0, scale: 0.95, y: -20, duration: 0.5 }, '<');
    tl.fromTo(nextPreview, { opacity: 0, scale: 1.05, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.5 }, '<0.2');

    // Message transition (if crossing boundary)
    if (currentMsg !== nextMsg) {
      tl.to(currentMsg, { opacity: 0, y: -20, duration: 0.5 }, '<');
      tl.fromTo(nextMsg, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '<0.2');
    }
  }

  return {
    kill: () => {
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
    }
  };
};

// End of file