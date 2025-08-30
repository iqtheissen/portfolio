import React, { useEffect, useState } from 'react';
import ProjectImageGrid from './ProjectImageGrid';
import ProjectInfoPanel from './ProjectInfoPanel';

export default function ProjectDisplay({
  project,
  isMobile = false,
  onClose,
  hoverDirection = 'down',
  onRevealComplete,
  animateReveal = true,
  disableInteractions = false,
}) {
  const images = {
    main: `/projects/${project.name}/main.jpg`,
    small1: `/projects/${project.name}/small1.jpg`,
    small2: `/projects/${project.name}/small2.jpg`,
  };

  const [imagesDone, setImagesDone] = useState(false);
  const [infoDone, setInfoDone] = useState(false);

  useEffect(() => {
    // reset when project changes
    setImagesDone(false);
    setInfoDone(false);
  }, [project && project.name]);

  // If this display should not animate (outgoing/current view), mark children done immediately
  useEffect(() => {
    if (!animateReveal) {
      setImagesDone(true);
      setInfoDone(true);
    }
  }, [animateReveal, project && project.name]);

  useEffect(() => {
    if (imagesDone && infoDone && typeof onRevealComplete === 'function') {
      onRevealComplete();
    }
  }, [imagesDone, infoDone, onRevealComplete]);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        height: '100%',
        gap: isMobile ? '2rem' : '8rem',
        padding: '2rem',
        marginTop: isMobile ? '4rem' : '0',
        position: 'relative',
        boxSizing: 'border-box',
        // start transparent; children will animate in and call onRevealComplete
        opacity: 1,
  // disable pointer interactions for temporary/incoming displays when requested
  pointerEvents: disableInteractions ? 'none' : undefined,
      }}
    >
      {/* Mobile Close Button */}
      {isMobile && onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.5rem 1rem',
            fontSize: '1.5rem',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          ✕
        </button>
      )}

      <div style={{ width: isMobile ? '100%' : '50%' }}>
    <ProjectImageGrid images={images} hoverDirection={hoverDirection} onRevealComplete={() => setImagesDone(true)} animateReveal={animateReveal} disableInteractions={disableInteractions} />
      </div>
      <div style={{ width: isMobile ? '100%' : '50%' }}>
  <ProjectInfoPanel project={project} hoverDirection={hoverDirection} onRevealComplete={() => setInfoDone(true)} animateReveal={animateReveal} disableInteractions={disableInteractions} />
      </div>
    </div>
  );
}
