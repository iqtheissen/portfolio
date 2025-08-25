import React, { useRef, useState, useLayoutEffect, useId } from 'react';

function BeveledBox({
  children,
  backgroundColor = '#010F15',
  strokeColor = '#ffffff',
  strokeWidth = 2,
  bevel = 24,
  padding = 16,
}) {
  const contentRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const id = useId();

  useLayoutEffect(() => {
    if (!contentRef.current) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    resizeObserver.observe(contentRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const innerW = size.width + padding * 2;
  const innerH = size.height + padding * 2;
  const svgW = innerW + strokeWidth;
  const svgH = innerH + strokeWidth;

  const s = strokeWidth / 2;
  const b = bevel;
  const w = innerW;
  const h = innerH;

  const path = `
    M${b + s} ${s}
    H${w + s}
    V${h - b + s}
    L${w - b + s} ${h + s}
    H${s}
    V${b + s}
    L${b + s} ${s}
    Z
  `;

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        padding,
        boxSizing: 'content-box',
      }}
    >
      <svg
        width={svgW}
        height={svgH}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}
      >
        <defs>
          <clipPath id={`beveled-clip-${id}`}>
            <path d={path} />
          </clipPath>
        </defs>
        <g clipPath={`url(#beveled-clip-${id})`}>
          <rect width={w} height={h} x={0} y={0} fill={backgroundColor} />
          <path
            d={path}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>

      <div
        ref={contentRef}
        style={{ position: 'relative', zIndex: 1 }}
        className="text-white"
      >
        {children}
      </div>

      <svg
        width={18}
        height={18}
        viewBox="0 0 20 20"
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}
        fill="none"
      >
        <path d="M20 0H0V20L20 0Z" fill="#ffffff" />
      </svg>
    </div>
  );
}

export default BeveledBox;
