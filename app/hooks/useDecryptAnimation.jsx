import { useState, useRef, useEffect } from "react";

const randomChar = () => {
  const chars = "!@#$%^&*()_+-=[]{}|;:',.<>/?0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return chars[Math.floor(Math.random() * chars.length)];
};

export function useDecryptAnimation({ originalText, decryptedText, delay = 25 }) {
  const [displayText, setDisplayText] = useState(originalText);
  const frameRef = useRef(0);
  const directionRef = useRef("forward"); // "forward" or "backward"
  const animationFrameId = useRef(null);
  const lastUpdateRef = useRef(performance.now());

  const animate = (timestamp) => {
    const targetText = directionRef.current === "forward" ? decryptedText : originalText;
    const length = targetText.length;
    const elapsed = timestamp - lastUpdateRef.current;

    if (elapsed > delay) {
      frameRef.current++;
      lastUpdateRef.current = timestamp;

      setDisplayText(
        targetText
          .split("")
          .map((char, i) =>
            i < frameRef.current ? targetText[i] : randomChar()
          )
          .join("")
      );
    }

    if (frameRef.current <= length) {
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      setDisplayText(targetText);
      animationFrameId.current = null;
    }
  };

  const startAnimation = () => {
    directionRef.current = "forward";
    frameRef.current = 0;
    lastUpdateRef.current = performance.now();
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    animationFrameId.current = requestAnimationFrame(animate);
  };

  const reverseAnimation = () => {
    directionRef.current = "backward";
    frameRef.current = 0;
    lastUpdateRef.current = performance.now();
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    animationFrameId.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return {
    displayText,
    startAnimation,
    resetText: reverseAnimation,
  };
}
