import React from 'react';
import ProjectImageGrid from './ProjectImageGrid';
import ProjectInfoPanel from './ProjectInfoPanel';

export default function ProjectDisplay({
  project,
  isMobile = false,
  onClose,
}) {
  const images = {
    main: `/projects/${project.name}/main.png`,
    small1: `/projects/${project.name}/small1.png`,
    small2: `/projects/${project.name}/small2.png`,
  };

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
        <ProjectImageGrid images={images} />
      </div>
      <div style={{ width: isMobile ? '100%' : '50%' }}>
        <ProjectInfoPanel project={project} />
      </div>
    </div>
  );
}
