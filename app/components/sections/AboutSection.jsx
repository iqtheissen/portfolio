import React, { useState, useRef } from 'react';
import ProjectCard from '../ui/ProjectCard';
import RevealText from '../ui/RevealText';
import SectionHeader from '../ui/SectionHeader';

export default function AboutSection({ progress, isMobile, scrollY }) {
  const experiences = [
    {
      title: 'Software Engineer',
      company: 'PixelForge Labs',
      period: 'May 2022 – Present',
      location: 'Remote',
      description:
        'Developed backend services and APIs using Node.js and PostgreSQL. Integrated third-party services and built scalable RESTful endpoints for mobile apps. Contributed to DevOps pipelines and CI/CD workflows.',
    },
    {
      title: 'Design Intern',
      company: 'BrightFrame Studio',
      period: 'Jun 2021 – Aug 2021',
      location: 'San Francisco, CA',
      description:
        'Supported senior designers in developing high-fidelity prototypes. Participated in branding workshops and usability testing sessions for client projects across fintech and healthcare industries.',
    },
    {
      title: 'Mobile App Developer',
      company: 'LumenTech',
      period: 'Jan 2021 – Apr 2022',
      location: 'Austin, TX',
      description:
        'Built cross-platform mobile apps using React Native. Focused on performance optimization and offline-first features. Implemented biometric authentication and integrated cloud sync.',
    },
    {
      title: 'Computer Science Teaching Assistant',
      company: 'University of Aurora',
      period: 'Sep 2020 – May 2021',
      location: 'Aurora, CO',
      description:
        'Assisted in teaching Data Structures and Algorithms courses. Led weekly labs, graded assignments, and mentored students during office hours. Helped design practical programming exercises.',
    },
    {
      title: 'Full Stack Bootcamp Graduate',
      company: 'CodeCrush Academy',
      period: 'Mar 2020 – Aug 2020',
      location: 'Online',
      description:
        'Completed an intensive coding bootcamp focused on MERN stack. Built several full-stack applications and collaborated with teams on agile development cycles. Capstone project: a real-time chat app.',
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const prevCard = () => {
    setActiveIndex((i) => (i === 0 ? experiences.length - 1 : i - 1));
  };

  const nextCard = () => {
    setActiveIndex((i) => (i === experiences.length - 1 ? 0 : i + 1));
  };

  const dragStartX = useRef(null);
  const dragDeltaX = useRef(0);
  const isDragging = useRef(false);
  const threshold = 50;

  const handleDragStart = (e) => {
    isDragging.current = true;
    dragStartX.current = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
  };

  const handleDragMove = (e) => {
    if (!isDragging.current) return;
    const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    dragDeltaX.current = currentX - dragStartX.current;
  };

  const handleDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (dragDeltaX.current > threshold) {
      prevCard();
    } else if (dragDeltaX.current < -threshold) {
      nextCard();
    }

    dragStartX.current = null;
    dragDeltaX.current = 0;
  };

  return (
    <section
      id="about"
      style={{
        position: 'relative',
        width: '100%',
        height: isMobile ? 'auto' : '100vh',
        padding: '0 4vw',
        color: 'white',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: isMobile ? 'column-reverse' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? '15vh' : '4vw',
        userSelect: isDragging.current ? 'none' : 'auto',
        justifyContent: 'space-between',
      }}
    >
      <SectionHeader
        title="ABOUT"
        sectionId="about"
        progress={progress}
        fromLeft={false}
        isMobile={isMobile}
        >
      </SectionHeader>
        
      {/* Experience Cards */}
      <div
        style={{
          flex: isMobile ? 'unset' : 1,
          width: isMobile ? '100%' : 'auto',
          height: isMobile ? '50vh' : '400px',
          maxWidth: isMobile ? '100%' : '35vw',
          marginBottom : isMobile ? '18vh' : 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          touchAction: 'pan-y',
        }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {experiences.map((exp, idx) => {
          const offset = idx - activeIndex;
          if (offset < -2 || offset > 2) return null;

          const baseZIndex = 10;
          const zIndex = baseZIndex - Math.abs(offset);
          const translateX = offset * 60;
          const scale = 1 - Math.abs(offset) * 0.1;
          const opacity = offset === 0 ? 1 : 0.5;

          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translateX(${translateX}px) translateY(-50%) scale(${scale})`,
                width: isMobile ? '80vw' : '25vw',
                height: isMobile ? '80%' : 'auto',
                transform: `translate(calc(-50% + ${translateX}px), -50%) scale(${scale})`,
                transition: 'transform 0.5s ease, opacity 0.5s ease',
                zIndex,
                opacity,
                cursor: offset === 0 ? 'default' : 'pointer',
                borderRadius: '10px',
              }}
              onClick={() => {
                if (offset !== 0) setActiveIndex(idx);
              }}
            >
              <ProjectCard
                title={exp.title}
                description={exp.description}
                company={exp.company}
                period={exp.period}
                location={exp.location}
              />
            </div>
          );
        })}

        {/* Navigation buttons */}
        <button
          onClick={prevCard}
          style={{
            position: 'absolute',
            left: '5px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            zIndex: 20,
          }}
          aria-label="Previous Experience"
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: '10px solid transparent',
              borderBottom: '10px solid transparent',
              borderRight: '15px solid white',
            }}
          />
        </button>
        <button
          onClick={nextCard}
          style={{
            position: 'absolute',
            right: '5px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            zIndex: 20,
          }}
          aria-label="Next Experience"
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: '10px solid transparent',
              borderBottom: '10px solid transparent',
              borderLeft: '15px solid white',
            }}
          />
        </button>
      </div>

      {/* About Text */}
      <div
        style={{
          flex: isMobile ? 'unset' : 1,
          
          maxWidth: isMobile ? '100%' : '70ch',
          fontSize: '1rem',
          lineHeight: 1.7,
          textAlign: 'left',
          position: 'relative',
          zIndex: 5,
          marginTop: isMobile ? '18vh' : 0,
          paddingLeft: isMobile ? '4vw' : 0,
          paddingRight: isMobile ? '4vw' : 0,
          marginLeft: 0,
        }}
        data-scroll
        data-scroll-speed="2"
        data-scroll-direction="vertical"
      >
        <RevealText progress={progress} start={0.3} end={1}>
        <p>I’m a creative developer exploring interaction and animation.</p>
        <p>
          I specialize in frontend experiences and work with tools like <strong>React</strong> and{' '}
          <em>Three.js</em>.
        </p>
</RevealText>

      </div>
    </section>
  );
}
