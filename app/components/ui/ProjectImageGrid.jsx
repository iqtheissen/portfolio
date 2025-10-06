import React, { useEffect, useRef } from 'react';
import IconButton from './IconButton'; // Adjust path if necessary
import TiltedCard from '@/app/blocks/Components/TiltedCard/TiltedCard';

export default function ProjectImageGrid({ images, githubUrl, hoverDirection = 'down', onRevealComplete, animateReveal = true, disableInteractions = false }) {
  const { main, small1, small2 } = images || {};
  const containerRef = useRef(null);

  useEffect(() => {
    if (!animateReveal) {
      if (typeof onRevealComplete === 'function') onRevealComplete();
      return undefined;
    }

    const el = containerRef.current;
    if (!el) return;

    const items = Array.from(el.querySelectorAll('[data-reveal]'));
    if (items.length === 0) {
      if (typeof onRevealComplete === 'function') onRevealComplete();
      return;
    }

    const order = hoverDirection === 'down' ? items : items.slice().reverse();
    const last = order[order.length - 1];

    let called = false;
    const handler = (e) => {
      if (called) return;
      if (e.target !== last) return;
      called = true;
      if (typeof onRevealComplete === 'function') onRevealComplete();
    };

    last.addEventListener('animationend', handler);

    const fallback = setTimeout(() => {
      if (!called) {
        called = true;
        if (typeof onRevealComplete === 'function') onRevealComplete();
      }
    }, 1400);

    return () => {
      last.removeEventListener('animationend', handler);
      clearTimeout(fallback);
    };
  }, [main, small1, small2, hoverDirection, onRevealComplete]);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        gap: '1rem',
        height: '100%',
      }}
    >
      {/* Main 16:9 image with GitHub button */}
  <div
    data-reveal
    className={disableInteractions ? '' : 'cursor-target'}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#333',
  opacity: 0,
  transform: hoverDirection === 'down' ? 'translateY(12px)' : 'translateY(-12px)',
  animation: main ? `staggerFade 0.96s ease forwards` : 'none',
  animationDelay: main ? '0.192s' : '0s',
        }}
      >
        {main && (
          <TiltedCard
            imageSrc={main}
            altText="Main project"
            containerWidth="100%"
            containerHeight="100%"
            imageWidth="100%"
            imageHeight="100%"
            showMobileWarning={false}
            showTooltip={false}
            scaleOnHover={disableInteractions ? 1 : 1.05}
            rotateAmplitude={disableInteractions ? 0 : 7}
          />
        )}

        {/* GitHub IconButton */}
        {githubUrl && githubUrl.trim() !== '' && (
          <div
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              zIndex: 2,
            }}
          >
            <a href={githubUrl} target="_blank" rel="noopener noreferrer">
              <IconButton icon={<img src="/icons/github.svg" alt="GitHub" />} />
            </a>
          </div>
        )}
      </div>

      {/* Bottom two square images */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          overflow: 'hidden',
        }}
      >
  {[small1, small2].map((src, idx) => {
          const delay = 0.192 + (idx + 1) * 0.128; // stagger after main (scaled 1.6x)
          return (
          <div
            key={idx}
            className={disableInteractions ? '' : 'cursor-target'}
      data-reveal
            style={{
              width: '100%',
              aspectRatio: '4 / 3',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#444',
              opacity: 0,
              transform: hoverDirection === 'down' ? 'translateY(12px)' : 'translateY(-12px)',
              animation: src ? `staggerFade 0.8s ease forwards` : 'none',
              animationDelay: src ? `${delay}s` : '0s',
            }}
          >
            {src && (
              <TiltedCard
                imageSrc={src}
                altText={`Project thumb ${idx + 1}`}
                containerWidth="100%"
                containerHeight="100%"
                imageWidth="100%"
                imageHeight="100%"
                showMobileWarning={false}
                showTooltip={false}
                scaleOnHover={disableInteractions ? 1 : 1.05}
                rotateAmplitude={disableInteractions ? 0 : 7}
              />
            )}
          </div>
        )})}
      </div>
      <style jsx>{`
        @keyframes staggerFade {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
