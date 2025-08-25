import React from 'react';

export default function RevealText({
  children,
  progress = 0,
  start = 0,
  end = 1,
  startColor = '#777',
  endColor = '#fff',
}) {
  const blurRange = 4;
  const maxBlur = 8;

  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    return match
      ? [
          parseInt(match[1], 16),
          parseInt(match[2], 16),
          parseInt(match[3], 16),
        ]
      : [255, 255, 255];
  };

  const startRGB = hexToRgb(startColor);
  const endRGB = hexToRgb(endColor);

  const interpolateColor = (t) => {
    const r = Math.round(startRGB[0] + (endRGB[0] - startRGB[0]) * t);
    const g = Math.round(startRGB[1] + (endRGB[1] - startRGB[1]) * t);
    const b = Math.round(startRGB[2] + (endRGB[2] - startRGB[2]) * t);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Flatten all text from children to count total words
  let wordList = [];

  const extractWords = (node) => {
    if (typeof node === 'string') {
      const words = node.match(/\S+\s*/g) || [];
      wordList.push(...words);
    } else if (Array.isArray(node)) {
      node.forEach(extractWords);
    } else if (React.isValidElement(node)) {
      extractWords(node.props.children);
    }
  };

  extractWords(children);

  const totalWords = wordList.length;
  const normalizedProgress =
    progress <= start ? 0 : progress >= end ? 1 : (progress - start) / (end - start);
  const currentIndex = normalizedProgress * totalWords;

  let globalWordIndex = 0;

  // Recursively wrap each word in span with styles
  const processNode = (node) => {
    if (typeof node === 'string') {
      const words = node.match(/\S+\s*/g) || [];

      return words.map((word, i) => {
        const index = globalWordIndex++;
        let blur = 0;
        let color = startColor;

        if (index < currentIndex) {
          color = endColor;
        } else if (index < currentIndex + blurRange) {
          const t = (index - currentIndex) / blurRange;
          blur = maxBlur * t;
          color = interpolateColor(1 - t);
        }

        return (
          <span
            key={index}
            style={{
              color,
              filter: `blur(${blur}px)`,
              transition: 'color 0.3s ease-out, filter 0.3s ease-out',
            }}
          >
            {word}
          </span>
        );
      });
    }

    if (Array.isArray(node)) {
      return node.map((child, i) => <React.Fragment key={i}>{processNode(child)}</React.Fragment>);
    }

    if (React.isValidElement(node)) {
      return React.cloneElement(
        node,
        { ...node.props, key: node.key || globalWordIndex },
        processNode(node.props.children)
      );
    }

    return null;
  };

  return <>{processNode(children)}</>;
}
