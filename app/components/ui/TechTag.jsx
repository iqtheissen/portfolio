import React from 'react';

export default function TechTag({ text, color = '#3498db'}) {
  const bevelSize = 10;

  const paddingX = 16;
  const paddingY = 6;
  const fontSize = 14;
  

  const textWidth = text.length * (fontSize * 0.6);
  const tagWidth = textWidth + paddingX * 2;
  const tagHeight = fontSize + paddingY * 2;

  const bevelX = tagWidth - bevelSize;
  const bevelY = bevelSize;

  return (
    <svg
      width={tagWidth}
      height={tagHeight}
      style={{ display: 'block'}}
    >
      {/* Custom outlined shape */}
      {/* Top line */}
      <line
        x1="0"
        y1="0"
        x2={bevelX}
        y2="0"
        stroke={color}
        strokeWidth="2"
      />
      {/* Bevel line */}
      <line
        x1={bevelX}
        y1="0"
        x2={tagWidth}
        y2={bevelY}
        stroke={color}
        strokeWidth="2"
      />
      {/* Right line */}
      <line
        x1={tagWidth}
        y1={bevelY}
        x2={tagWidth}
        y2={tagHeight}
        stroke={color}
        strokeWidth="2"
      />
      {/* Bottom line */}
      <line
        x1={tagWidth}
        y1={tagHeight}
        x2="0"
        y2={tagHeight}
        stroke={color}
        strokeWidth="2"
      />
      {/* Left line (thicker) */}
      <line
        x1="0"
        y1={tagHeight}
        x2="0"
        y2="0"
        stroke={color}
        strokeWidth="10"
      />

      {/* Text */}
      <text
        x={tagWidth / 2}
        y={tagHeight / 2 + fontSize / 3}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="regular"
        fill='#ffffff'
        
        
      >
        {"#" + text}
      </text>
    </svg>
  );
}
