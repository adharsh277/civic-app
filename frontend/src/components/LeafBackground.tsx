const leaves = Array.from({ length: 18 }).map((_, index) => ({
  id: index,
  left: `${Math.round(Math.random() * 100)}%`,
  size: `${18 + Math.round(Math.random() * 24)}px`,
  duration: `${18 + Math.round(Math.random() * 18)}s`,
  delay: `${Math.round(Math.random() * -24)}s`,
}));

export function LeafBackground() {
  return (
    <div className="leaf-layer" aria-hidden="true">
      {leaves.map((leaf) => (
        <span
          key={leaf.id}
          className="leaf"
          style={{
            ["--leaf-left" as string]: leaf.left,
            ["--leaf-size" as string]: leaf.size,
            ["--leaf-duration" as string]: leaf.duration,
            ["--leaf-delay" as string]: leaf.delay,
          }}
        />
      ))}
    </div>
  );
}
