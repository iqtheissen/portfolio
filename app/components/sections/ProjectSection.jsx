import React, { useState, useEffect } from 'react';
import ProjectList from '../ui/ProjectList';
import ProjectDisplay from '../ui/ProjectDisplay';
import projects from '../../data/projects.json';


import SectionHeader from '../ui/SectionHeader';

export default function ProjectSection({ progress, isMobile, isMobileOverlayOpen, setIsMobileOverlayOpen}) {
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [currentProject, setCurrentProject] = useState(projects[0]);
  const [nextProject, setNextProject] = useState(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapDirection, setSwapDirection] = useState('down');
  const [hoveredProjectName, setHoveredProjectName] = useState(null);
  const [hoverDirection, setHoverDirection] = useState(null);
  const [showMobileOverlay, setShowMobileOverlay] = useState(false);
  const [isMobileOverlayVisible, setIsMobileOverlayVisible] = useState(false);

  const handleSelect = (project) => {
    if (project.name === selectedProject.name || isSwapping) return;

    const currentIdx = projects.findIndex(p => p.name === selectedProject.name);
    const nextIdx = projects.findIndex(p => p.name === project.name);
    const direction = nextIdx > currentIdx ? 'up' : 'down';

    setSwapDirection(direction);
    setSelectedProject(project);
    setNextProject(project);
    setIsSwapping(true);

    if (isMobile) {
      document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
      document.body.style.overflow = 'hidden';

      setTimeout(() => {
        setIsMobileOverlayVisible(true);
        setIsMobileOverlayOpen(true);
      }, 0);
    }
  };

  const handleProjectHover = (projectName) => {
    if (projectName === selectedProject.name) {
      setHoverDirection(null);
    } else {
      const currentIdx = projects.findIndex(p => p.name === selectedProject.name);
      const hoverIdx = projects.findIndex(p => p.name === projectName);
      setHoverDirection(hoverIdx > currentIdx ? 'down' : 'up');
    }
    setHoveredProjectName(projectName);
  };

  const handleProjectLeave = () => {
    setHoveredProjectName(null);
    setHoverDirection(null);
  };

  useEffect(() => {
    if (!hoveredProjectName) {
      setHoverDirection(null);
      return;
    }

    const hoveredIdx = projects.findIndex(p => p.name === hoveredProjectName);
    const selectedIdx = projects.findIndex(p => p.name === selectedProject.name);

    if (hoveredIdx > selectedIdx) setHoverDirection('down');
    else if (hoveredIdx < selectedIdx) setHoverDirection('up');
    else setHoverDirection(null);
  }, [hoveredProjectName, selectedProject]);

  useEffect(() => {
    if (!isSwapping) return;

    const timeout = setTimeout(() => {
      setCurrentProject(nextProject);
      setNextProject(null);
      setIsSwapping(false);
    }, 600);

    return () => clearTimeout(timeout);
  }, [isSwapping, nextProject]);

  useEffect(() => {
  if (isMobileOverlayOpen) {
    setShowMobileOverlay(true);
  } else {
    const timeout = setTimeout(() => {
      setShowMobileOverlay(false);
    }, 500); // match 'slideOutRight' duration
    return () => clearTimeout(timeout);
  }
}, [isMobileOverlayOpen]);

  return (
    <section
      id="projects"
      style={{
        position: 'relative',
        width: '100%',
        height: isMobile ? '80vh' : '100vh',
        padding: '0',
        color: 'white',
        overflow: 'hidden',
      }}
    >
      <SectionHeader
        title="WORK"
        sectionId="projects"
        progress={progress}
        fromLeft={true}
        style={{ opacity: isMobileOverlayOpen ? 0 : 1, transition: "opacity 0.3s ease" }}
        isMobile={isMobile}
      />

        
          

      <div
        style={{
          marginTop: isMobile ? 0 : 'calc(8vh + 12px + 2rem)',
          height: 'calc(100vh - (8vh + 12px + 2rem))',
          display: 'flex',
          padding: '2rem',
          boxSizing: 'border-box',
          gap: '5rem',
          position: 'relative',
          zIndex: 5,
        }}
      >
        <ProjectList
          projects={projects}
          onSelect={handleSelect}
          selectedProjectName={selectedProject.name}
          onHover={handleProjectHover}
          onHoverEnd={handleProjectLeave}
          progress={progress}
          style={{
            margin: isMobile ? 'auto' : '0',
            alignSelf: isMobile ? 'center' : 'flex-start',
          }}
          isMobile={isMobile}
          isAnimating={isMobileOverlayOpen}
        />
        
        { /* Project Mobile Modal */}
        {!isMobile && (
          <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                backgroundColor: 'white',
                opacity: !isSwapping && hoverDirection === 'up' ? 1 : 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '2px',
                backgroundColor: 'white',
                opacity: !isSwapping && hoverDirection === 'down' ? 1 : 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                zIndex: 1,
                animation:
                  isSwapping
                    ? swapDirection === 'down'
                      ? 'hideDown 0.6s ease forwards'
                      : 'hideUp 0.6s ease forwards'
                    : 'none',
              }}
            >
              <ProjectDisplay
                project={currentProject}
              />
            </div>
            {isSwapping && nextProject && (
              <div
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  zIndex: 2,
                  animation:
                    swapDirection === 'down'
                      ? 'revealDown 0.6s ease forwards'
                      : 'revealUp 0.6s ease forwards',
                }}
              >
                <ProjectDisplay
                 project={selectedProject}
                />
              </div>
            )}
            {isSwapping && (
              <div
                style={{
                  position: 'absolute',
                  top: swapDirection === 'down' ? '-2px' : '100%',
                  left: 0,
                  height: '2px',
                  width: '100%',
                  backgroundColor: 'white',
                  zIndex: 4,
                  animation:
                    swapDirection === 'down'
                      ? 'sweepLine 0.6s ease forwards'
                      : 'sweepLineReverse 0.6s ease forwards',
                }}
              />
            )}
          </div>
        )}
      </div>

       {isMobile && showMobileOverlay && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'transparent',
      zIndex: 9999,
      overflow: 'auto',
      animation: isMobileOverlayOpen
        ? 'slideInRight 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards'
        : 'slideOutRight 0.5s ease forwards',
    }}
  >
    <ProjectDisplay
      project={selectedProject}
      isMobile={isMobile}
    />
  </div>
)}

      
    </section>
  );
}
