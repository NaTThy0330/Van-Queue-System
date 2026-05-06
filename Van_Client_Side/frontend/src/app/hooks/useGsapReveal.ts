import { RefObject, useLayoutEffect } from "react";
import gsap from "gsap";

type RevealOptions = {
  hero?: string;
  card?: string;
  action?: string;
  stagger?: number;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useGsapReveal(
  scopeRef: RefObject<HTMLElement | null>,
  deps: unknown[] = [],
  options: RevealOptions = {}
) {
  useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope || prefersReducedMotion()) return;

    const hero = options.hero ?? "[data-reveal='hero']";
    const card = options.card ?? "[data-reveal='card']";
    const action = options.action ?? "[data-reveal='action']";
    const stagger = options.stagger ?? 0.08;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(hero, { y: 22, opacity: 0, duration: 0.7 })
        .from(card, { y: 18, opacity: 0, duration: 0.45, stagger }, "-=0.35")
        .from(action, { y: 12, opacity: 0, duration: 0.35, stagger: 0.05 }, "-=0.25");
    }, scope);

    return () => ctx.revert();
  }, deps);
}
