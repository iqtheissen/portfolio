import React, { useEffect, useRef } from 'react';
import TechTag from './TechTag';
import CyberButton from './CyberButton';

export default function ProjectInfoPanel({
  project,
  hoverDirection = 'down',
  onRevealComplete,
  animateReveal = true,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!animateReveal) {
      if (onRevealComplete) onRevealComplete();
      return undefined;
    }

    const el = containerRef.current;
    if (!el) return;

    const children = Array.from(el.querySelectorAll('[data-reveal]'));
    if (children.length === 0) {
      if (onRevealComplete) onRevealComplete();
      return;
    }

    const order = hoverDirection === 'down' ? children : children.slice().reverse();

    order.forEach((child, idx) => {
      child.style.opacity = '0';
      child.style.transform = hoverDirection === 'down' ? 'translateY(12px)' : 'translateY(-12px)';
  child.style.animation = `revealItem 0.72s ease forwards`;
  child.style.animationDelay = `${0.128 * idx}s`;
    });

    const last = order[order.length - 1];
    let called = false;
    const handler = (e) => {
      if (called) return;
      if (e.target !== last) return;
      called = true;
      if (onRevealComplete) onRevealComplete();
    };

    last.addEventListener('animationend', handler);

  const fallback = setTimeout(() => {
      if (!called) {
        called = true;
        if (onRevealComplete) onRevealComplete();
      }
  }, 1600);

    return () => {
      last.removeEventListener('animationend', handler);
      clearTimeout(fallback);
    };
  }, [project && project.name, hoverDirection, onRevealComplete]);

  return (
    <div
      ref={containerRef}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '3rem',
        overflowY: 'auto',
      }}
    >
      {/* Title */}
      <h1 data-reveal style={{ margin: 0, textTransform: 'uppercase' }}>{project.title}</h1>

      {/* Tags */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginTop: '-3rem',
          marginBottom: '1rem',
        }}
      >
        {project.tags.map((tech, index) => (
          <div key={tech + index} data-reveal>
            <TechTag text={tech}  />
          </div>
        ))}
      </div>

      {/* Description */}
      <div data-reveal>
        <strong style={{ display: 'block', marginBottom: '0.3rem' }}>Description</strong>
        <p style={{ marginTop: 0 }}>{project.description}</p>
      </div>

      {/* Year & Goal */}
      <div data-reveal style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <strong style={{ display: 'block', marginBottom: '0.2rem' }}>Year</strong>
          <div>{project.year}</div>
        </div>
        <div style={{ flex: 2, minWidth: '200px' }}>
          <strong style={{ display: 'block', marginBottom: '0.2rem' }}>Goal</strong>
          <div>{project.goal}</div>
        </div>
      </div>

      {/* Status */}
      <div data-reveal>
        <strong style={{ display: 'block', marginBottom: '0.2rem' }}>Status</strong>
        <div>{project.status}</div>
      </div>

      {/* View Project Button */}
      <div data-reveal style={{ marginTop: '2rem' }}>
        <CyberButton
          href={project.url}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.2rem',
          }}
          tag="f-67"
          decryptedText="VIEW PROJECT"
        >
          view project
        </CyberButton>
      </div>

      <style jsx>{`
        @keyframes revealItem {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
}
