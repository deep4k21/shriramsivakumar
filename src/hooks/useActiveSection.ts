import { useEffect, useState } from 'react';

const OBSERVED_IDS = ['home', 'intro', 'about', 'portfolio', 'career'];

export function useActiveSection() {
  const [active, setActive] = useState('home');
  const [aboutIn, setAboutIn] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setAboutIn(true);
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setActive(entry.target.id);
          if (entry.target.id === 'about') setAboutIn(true);
        });
      },
      { rootMargin: '-40% 0px -50% 0px' },
    );

    OBSERVED_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  return { active, aboutIn };
}
