import React, { useEffect, useState, useRef } from 'react';
import { useDecryptAnimation } from '../../hooks/useDecryptAnimation';

function ProjectListItem({
  project,
  idx,
  isSelected,
  disabled,
  isMobile,
  animationStyles,
  itemBaseStyle,
  shouldDim,
  onSelect,
  onHover,
  onHoverEnd,
  dividerStyle,
  hasDivider = false,
  swapActive = false,
}) {
  // when selected -> uppercase (decryptedText), otherwise lowercase (originalText)
  const original = project.title.toLowerCase();
  const decrypted = project.title.toUpperCase();
  const { displayText, startAnimation, resetText } = useDecryptAnimation({ originalText: original, decryptedText: decrypted, delay: 25 });

  // track previous selection to trigger animations on selection change
  const [wasSelected, setWasSelected] = useState(false);

  useEffect(() => {
    // on mount or when isSelected changes, run appropriate animation
    // When an item becomes selected, animate to uppercase and keep it that way
    if (isSelected) {
      startAnimation();
    } else {
      // deselected -> ensure lowercase
      resetText();
    }
    setWasSelected(isSelected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected]);

  // hover brightness for unselected items
  const [isHover, setIsHover] = useState(false);

  // clear hover state when selection changes to avoid stale hover color
  useEffect(() => {
    setIsHover(false);
  }, [isSelected]);

  return (
    <React.Fragment>
      <div
        className={isSelected ? '' : (disabled ? '' : 'cursor-target')}
        onClick={() => { if (!disabled && (!isSelected || isMobile)) onSelect?.(project); }}
        onMouseEnter={() => {
          if (!disabled && !isSelected && !isMobile) {
            setIsHover(true);
            startAnimation(); // hover: temporary uppercase
            onHover?.(project.name);
          }
        }}
        onMouseLeave={() => {
          if (!disabled && !isSelected && !isMobile) {
            setIsHover(false);
            resetText();
            onHoverEnd?.();
          }
        }}
        style={{
          ...itemBaseStyle,
          ...animationStyles,
          opacity: shouldDim && !isSelected ? 0.25 : (animationStyles.opacity ?? 1),
          cursor: isSelected ? 'default' : (disabled ? 'default' : itemBaseStyle.cursor),
          pointerEvents: disabled ? 'none' : undefined,
          transition: 'opacity 0.3s ease, transform 0.6s ease, filter 0.6s ease, color 0.15s ease',
          color: isSelected ? itemBaseStyle.color : (isHover ? '#ddd' : itemBaseStyle.color),
          textTransform: 'none', // controlled via decrypt animation
        }}
      >
        {displayText}
      </div>

      {/* Divider between items (mobile only) */}
      {hasDivider && (
        <div style={dividerStyle} />
      )}
    </React.Fragment>
  );
}


export default function ProjectList({
  onSelect,
  projects,
  selectedProjectName,
  onHover,
  onHoverEnd,
  isMobile = false,
  progress = 0,
  isAnimating = false,
  isDisabled = false,
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
  const listRef = useRef(null);
  const itemRefs = useRef([]);
  const [handleTop, setHandleTop] = useState(0);

  useEffect(() => {
    // update item refs array length
    itemRefs.current = itemRefs.current.slice(0, projects.length);
  }, [projects.length]);

  useEffect(() => {
    // position the handle to match the selected item
    const selectedIndex = projects.findIndex(p => p.name === selectedProjectName);
    const el = itemRefs.current[selectedIndex];
    if (el && listRef.current) {
      const listRect = listRef.current.getBoundingClientRect();
      const itemRect = el.getBoundingClientRect();
      const top = itemRect.top - listRect.top + itemRect.height / 2; // center of item
      setHandleTop(top);
    }
  }, [selectedProjectName, projects, isDisabled]);

  return (
    <div
      style={{
        width: isMobile ? '100%' : '200px',
        height: '100%',
        position: 'relative',
        padding: isMobile ? '0 0' : '0 1rem 0 2rem',
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
          width: isMobile ? '100%' : '100%',
          maxWidth: isMobile ? '100%' : 'unset',
          position: 'relative',
        }}
      >
  {projects.map((project, idx) => {
          const isSelected = project.name === selectedProjectName;
          const isVisuallySelected = isMobile || isSelected; // On mobile, all projects appear selected

          // Base styles
          const itemBaseStyle = {
            display: 'block',
            width: '100%',
            color: isVisuallySelected ? 'white' : 'grey',
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
            width: animationPhase !== 'idle' && isMobile ? 0 : '100%',
            background: 'darkgrey',
            opacity: animationPhase !== 'idle' && isMobile ? 0 : 1,
            transition: 'width 0.6s ease, opacity 0.6s ease',
            margin: '0.5rem 0',
          };

          const disabled = isDisabled || animationPhase !== 'idle';
          const shouldDim = !isMobile && isDisabled; // only dim on desktop while a project swap is playing

          // Render a dedicated list item so we can use hooks per item
          return (
            <div key={project.name} ref={el => itemRefs.current[idx] = el} style={{ width: '100%' }}>
              <ProjectListItem
                project={project}
                idx={idx}
                isSelected={isVisuallySelected}
                disabled={disabled}
                isMobile={isMobile}
                animationStyles={animationStyles}
                itemBaseStyle={itemBaseStyle}
                shouldDim={shouldDim}
                onSelect={onSelect}
                onHover={onHover}
                onHoverEnd={onHoverEnd}
                dividerStyle={dividerStyle}
                hasDivider={isMobile && idx < projects.length - 1}
                swapActive={isDisabled}
              />
            </div>
          );
        })}
      </div>

      {/* Vertical divider on desktop */}
      {!isMobile && (
        <>
          <div
            ref={listRef}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              // move slightly further right without affecting layout
              right: '-20px',
              width: '1px',
              background:
                'linear-gradient(to bottom, transparent 0%, white 50%, transparent 100%)',
              opacity: isDisabled ? 0.5 : 1,
              transition: 'opacity 0.3s ease',
            }}
          />
          {/* scrollbar-like handle */}
          <div
            style={{
              position: 'absolute',
              // move the handle the same amount as the divider so it visually aligns
              right: '-20px',
              width: isDisabled ? '7px' : '10px',
              borderRadius: '2px',
              height: '36px',
              background: 'white',
              transform: 'translateX(50%)',
              transition: 'top 0.3s cubic-bezier(0.2,0,0.2,1), width .2s cubic-bezier(0.2,0,0.2,1)',
              top: handleTop ? `${handleTop - 18}px` : '0px',
              
              pointerEvents: 'none',
            }}
          />
        </>
      )}
    </div>
  );
}
