import React from 'react';

// Change this value to "roll" the color mapping for all tags.
const COLOR_SEED = 123456;

function hashString(str) {
  // djb2
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash >>> 0);
}

function hslToHex(h, s, l) {
  // h in [0,360], s,l in [0,100]
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export default function TechTag({ text, color }) {
  // If color prop is provided, use it. Otherwise compute a deterministic bright color from text.
  const tagText = (text || '').toString();
  const tagColor =
    color ||
    (() => {
  const hHash = hashString(tagText + String(COLOR_SEED));
      const hue = hHash % 360;
      // Bright saturated palette: saturation 72-94, lightness 42-56
      const sat = 72 + (hHash % 23); // 72..94
      const light = 42 + (hHash % 15); // 42..56
      return hslToHex(hue, sat, light);
    })();
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
    <svg width={tagWidth} height={tagHeight} style={{ display: 'block' }}>
      {/* Custom outlined shape */}
      {/* Top line */}
  <line x1="0" y1="0" x2={bevelX} y2="0" stroke={tagColor} strokeWidth="2" />
      {/* Bevel line */}
  <line x1={bevelX} y1="0" x2={tagWidth} y2={bevelY} stroke={tagColor} strokeWidth="2" />
      {/* Right line */}
  <line x1={tagWidth} y1={bevelY} x2={tagWidth} y2={tagHeight} stroke={tagColor} strokeWidth="2" />
      {/* Bottom line */}
  <line x1={tagWidth} y1={tagHeight} x2="0" y2={tagHeight} stroke={tagColor} strokeWidth="2" />
      {/* Left line (thicker) */}
  <line x1="0" y1={tagHeight} x2="0" y2="0" stroke={tagColor} strokeWidth="10" />

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
