import React, { useEffect, useState } from 'react';


export default function ProjectList({
  onSelect,
  projects,
  selectedProjectName,
  onHover,
  onHoverEnd,
  isMobile = false,
  progress = 0,
  isAnimating = false,
}) {
  const [animationPhase, setAnimationPhase] = useState('idle'); // 'idle' | 'forward' | 'reverse'

  // When isAnimating changes, update animation phase accordingly
  useEffect(() => {
    if (isAnimating) {
      setAnimationPhase('forward');
    } else if (animationPhase === 'forward') {
      // Start reverse animation only if we were in forward
      setAnimationPhase('reverse');
    }
  }, [isAnimating]);

  // After reverse animation ends, reset to idle
  useEffect(() => {
    if (animationPhase === 'reverse') {
      // Duration of reverse animation: max delay + animation duration
      // Non-selected items: delay per item 100ms * index, duration 600ms
      // Selected item: 900ms duration (slower blur & grow)
      // So max delay = 3 * 100 = 300ms + 600ms = 900ms total approx.
      const timer = setTimeout(() => {
        setAnimationPhase('idle');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [animationPhase]);

  // Dynamic gap for mobile only
  const mobileMaxGap = 40; // px
  const mobileMinGap = 12; // px
  const mobileGap = mobileMinGap + (mobileMaxGap - mobileMinGap) * (1 - progress);

  return (
    <div
      style={{
        width: isMobile ? '100%' : '200px',
        height: '100%',
        position: 'relative',
        padding: isMobile ? `0 1rem` : '0 1rem 0 2rem',
        zIndex: 5,
        display: 'flex',
        justifyContent: isMobile ? 'center' : 'flex-start',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: isMobile ? `${mobileGap}px` : '1.5rem',
          transition: isMobile ? 'gap 0.1s ease-out' : 'none',
          margin: isMobile ? 'auto' : 'auto 0',
          width: isMobile ? '75vw' : '100%',
          maxWidth: isMobile ? '75vw' : 'unset',
          position: 'relative',
        }}
      >
        {projects.map((project, idx) => {
          const isSelected = project.name === selectedProjectName;

          // Base styles
          const itemBaseStyle = {
            display: 'block',
            width: '100%',
            color: isSelected ? 'white' : 'grey',
            fontSize: isMobile ? '1.2rem' : '1.1rem',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            lineHeight: 1,
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'color 0.3s ease',
            position: 'relative',
            willChange: 'transform, opacity, filter',
          };

          // Calculate delays for animation sequencing
          // Forward animation: non-selected animate top-to-bottom (idx * 100ms)
          // Reverse animation: non-selected animate bottom-to-top ((len - idx - 1) * 100ms)
          const totalItems = projects.length;
          const baseDuration = 600; // ms for transform & opacity animations
          const selectedDuration = 900; // ms for blur & scale of selected
          const delayPerItem = 100; // ms delay between items

          let animationStyles = {};

          if (animationPhase === 'forward') {
            if (isSelected) {
              // Selected button animates: blur + grow + fade out slower
              animationStyles = {
                transform: 'translateX(calc(30vw - 25%)) scale(1.1)',
                opacity: 0,
                filter: 'blur(4px)',
                pointerEvents: 'none',
                transition: `transform ${selectedDuration}ms ease ${delayPerItem * totalItems}ms, opacity ${selectedDuration}ms ease ${delayPerItem * totalItems}ms, filter ${selectedDuration}ms ease ${delayPerItem * totalItems}ms`,
              };
            } else {
              // Non-selected buttons slide left with delay in sequence top-to-bottom
              const delay = idx * delayPerItem;
              animationStyles = {
                transform: 'translateX(-30%)',
                opacity: 0,
                filter: 'none',
                pointerEvents: 'none',
                transition: `transform ${baseDuration}ms ease ${delay}ms, opacity ${baseDuration}ms ease ${delay}ms`,
              };
            }
          } else if (animationPhase === 'reverse') {
            if (isSelected) {
              // Selected button animates back: un-blur, un-scale, fade in slower
              animationStyles = {
                transform: 'translateX(0) scale(1)',
                opacity: 1,
                filter: 'blur(0)',
                pointerEvents: 'auto',
                transition: `transform ${selectedDuration}ms ease 0ms, opacity ${selectedDuration}ms ease 0ms, filter ${selectedDuration}ms ease 0ms`,
              };
            } else {
              // Non-selected buttons slide back from left with delay bottom-to-top
              const delay = (totalItems - idx - 1) * delayPerItem;
              animationStyles = {
                transform: 'translateX(0)',
                opacity: 1,
                filter: 'none',
                pointerEvents: 'auto',
                transition: `transform ${baseDuration}ms ease ${delay}ms, opacity ${baseDuration}ms ease ${delay}ms`,
              };
            }
          } else {
            // idle state - no animation styles applied
            animationStyles = {
              transform: 'translateX(0)',
              opacity: 1,
              filter: 'none',
              pointerEvents: 'auto',
              transition: 'none',
            };
          }

          // Divider style with animation (mobile only)
          const dividerStyle = {
            height: '1px',
            width: animationPhase !== 'idle' && isMobile ? 0 : '75vw',
            background: 'darkgrey',
            opacity: animationPhase !== 'idle' && isMobile ? 0 : 1,
            transition: 'width 0.6s ease, opacity 0.6s ease',
            margin: '0.5rem 0',
          };

          return (
            <React.Fragment key={project.name}>
              <div
                className="cursor-target"
                onClick={() => onSelect?.(project)}
                onMouseEnter={() => {
                  if (!isSelected) onHover?.(project.name);
                }}
                onMouseLeave={() => onHoverEnd?.()}
                style={{ ...itemBaseStyle, ...animationStyles }}
              >
                {project.title.toUpperCase()}
              </div>

              {/* Divider between items (mobile only) */}
              {isMobile && idx < projects.length - 1 && (
                <div style={dividerStyle} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Vertical divider on desktop */}
      {!isMobile && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: '1px',
            background:
              'linear-gradient(to bottom, transparent 0%, white 50%, transparent 100%)',
          }}
        />
      )}
    </div>
  );
}
