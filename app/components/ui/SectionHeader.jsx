import React from 'react';
import DrawText from './DrawText';

export default function SectionHeader({
  title,
  sectionId,
  progress,
  fromLeft = true,
  isMobile = false,
  style = {},
}) {
  const dashAnimationName = fromLeft ? 'dashScrollLeft' : 'dashScrollRight';

  const dividerStyle = {
    zIndex: 3,
    position: 'absolute',
    top: '8vh',
    height: '12px',
    backgroundImage:
      'repeating-linear-gradient(135deg, #0B2028 0 10px, transparent 10px 20px)',
    backgroundSize: '30px 100%',
    backgroundRepeat: 'repeat-x',
    animation: `${dashAnimationName} 4s linear infinite`,
    pointerEvents: 'none',
    transition: 'width 0.2s ease',
    ...(isMobile
      ? {
          left: 0,
          right: 0,
          width: '100%',
        }
      : {
          ...(fromLeft ? { left: 0 } : { right: 0 }),
          width: `${progress * 100}%`,
          WebkitMaskImage: fromLeft
            ? 'linear-gradient(to right, black 30%, transparent 70%)'
            : 'linear-gradient(to left, black 30%, transparent 70%)',
          maskImage: fromLeft
            ? 'linear-gradient(to right, black 30%, transparent 70%)'
            : 'linear-gradient(to left, black 30%, transparent 70%)',
          transformOrigin: fromLeft ? 'left' : 'right',
        }),
    ...style,
  };

  const titleStyle = {
    position: 'absolute',
    top: 'calc(8vh + 6px)',
    
    fontStyle: 'italic',
    fontWeight: 400,
    color: 'transparent',
    WebkitTextStroke: '0.5px white',
    textStroke: '0.5px white',
    pointerEvents: 'none',
    zIndex: 4,
    userSelect: 'none',
    ...(isMobile
      ? {
            left: '8vw',
          transform: ' translateY(-50%)',
          textAlign: 'left',
          fontSize: '3rem',
        }
      : {
          ...(fromLeft ? { left: '4vw' } : { right: '4vw' }),
          transform: 'translateY(-50%)',
          textAlign: fromLeft ? 'left' : 'right',
          fontSize: '4rem',
        }),
    ...style,
  };

  return (
    <>
      <div aria-label={`${sectionId}-divider`} style={dividerStyle} />

      <div aria-label={`${sectionId}-title`} style={titleStyle}>
        {isMobile ? (
          title
        ) : (
          <DrawText
            text={title}
            progress={progress}
            style={{
              color: 'white',
              fontSize: '4rem',
              fontStyle: 'italic',
              fontWeight: 400,
              textAlign: fromLeft ? 'left' : 'right',
            }}
          />
        )}
      </div>
    </>
  );
}
