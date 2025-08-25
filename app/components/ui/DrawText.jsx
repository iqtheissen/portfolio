import React, { useRef, useEffect, useState } from "react";

export default function DrawText({
  text,
  progress = 0,        // 0 to 1, how much outline to draw
  fontSize = 64,
  strokeWidth = 0.5,
  strokeColor = "white",
  fillColor = "transparent",
  style = {},
  transitionSpeed = 0.1,
  ease = "ease",
}) {
  const textRef = useRef(null);
  const [bbox, setBbox] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!textRef.current) return;

    const box = textRef.current.getBBox();
    setBbox({
      width: box.width,
      height: box.height,
    });
  }, [text]);

  // Approximate path length for stroke dash (double the width is a rough heuristic)
  const pathLength = bbox.width * 2 || 100; // fallback to 100 if zero
  const dashOffset = pathLength * (1 - progress);

  return (
    <svg
      width={bbox.width || fontSize * 2}  // width exactly fitting text
      height={bbox.height || fontSize * 1.2}
      viewBox={`0 0 ${bbox.width || fontSize * 2} ${bbox.height || fontSize * 1.2}`}
      style={{
        overflow: "visible",
        display: "inline-block",    // makes SVG behave like inline text
        verticalAlign: "baseline",  // aligns baseline with surrounding text
        ...style,
      }}
    >
      <text
        ref={textRef}
        x={0}
        y={fontSize}  // baseline
        fontSize={fontSize}
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={pathLength}
        strokeDashoffset={dashOffset}
        style={{ transition: `stroke-dashoffset ${transitionSpeed}s ${ease}` }}
      >
        {text}
      </text>
    </svg>
  );
}
