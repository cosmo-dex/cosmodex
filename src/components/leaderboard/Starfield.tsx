const STARS = Array.from({ length: 90 }, (_, i) => {
  const a = (i * 9301 + 49297) % 233280;
  const b = (i * 4967 + 7919) % 65521;
  const c = (i * 104729 + 1301) % 9973;
  return {
    left: (a / 233280) * 100,
    top: (b / 65521) * 100,
    size: 1 + (c % 3) * 0.6,
    delay: (c % 40) / 10,
    duration: 2.5 + (c % 30) / 10,
  };
});

export function Starfield() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animation: `cosmo-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
