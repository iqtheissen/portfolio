import React, { useState, useRef } from 'react';
import ProjectCard from '../ui/ProjectCard';
import RevealText from '../ui/RevealText';
import SectionHeader from '../ui/SectionHeader';
import RippleGrid from '@/app/blocks/Backgrounds/RippleGrid/RippleGrid';

export default function AboutSection({ progress, isMobile, scrollY }) {
  const experiences = [
    {
      title: 'MBO Software Developer',
      company: 'MBO Utrecht',
      period: 'Aug 2019 – June 2022',
      location: 'Utrecht, Netherlands',
      description:
        "Completed a vocational program in Software Development, gaining a foundation in front-end, PHP-based back-end development, and game development. Built practical projects in web and game applications, collaborating in agile team environments and applying version control and modern programming practices.",
    },
    {
      title: 'Software Development Intern',
      company: 'AXiS Digitaal',
      period: 'Aug 2022 – May 2023',
      location: 'Nieuwegein, Netherlands',
      description:
        "Worked on Unity game development using C# and WordPress-based web projects. Assisted in managing partner relationships and conducted client interviews to gather requirements. Collaborated with the development team to deliver practical solutions and gain hands-on experience in both software and client-facing processes.",
    },
    {
      title: 'Junior Software Developer',
      company: 'AXiS Digitaal',
      period: 'May 2023 – Dec 2023',
      location: 'Nieuwegein, Netherlands',
      description:
        "Designed a website for the gaming brand AXiS Gameforce and created a GUI for a data entry application. Oversaw a team of interns on WordPress projects and took on increased responsibility in project management. Developed an educational web-based game for children, working closely with international clients to meet their needs.",
    },
    {
      title: 'AD Software Developer',
      company: 'Hogeschool Utrecht',
      period: 'Aug 2024 – Current',
      location: 'Amersfoort, Netherlands',
      description:
        "Collaborated in an agile team environment with fellow students, developing multiple applications across Java and C#. Projects included a CLI application for managing patient data, a JavaFX public transport app for assisting people with autism, a C# public transport dashboard for a real client, and a flashcard game for learning programming terms. Gained hands-on experience in project management, teamwork, and delivering functional software solutions.",
    }

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
        padding: isMobile ? '0 4vw' : '0 6vw',
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
          marginBottom : isMobile ? '40vh' : 0,
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
        {/* Ripple background positioned behind the cards and scaled larger */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: isMobile
              ? 'translate(-50%, -50%) scale(1.6)'
              : 'translate(-50%, -50%) scale(1.4)',
            width: isMobile ? '160%' : '140%',
            height: isMobile ? '160%' : '140%',
            zIndex: 0,
            pointerEvents: 'auto',
            overflow: 'hidden',
          }}
          aria-hidden={true}
        >
          <RippleGrid
            enableRainbow={false}
            gridColor="#ffffff"
            rippleIntensity={0.015}
            gridSize={20}
            gridThickness={30}
            mouseInteraction={true}
            mouseInteractionRadius={1.2}
            opacity={0.6}
          />
        </div>
              
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
                width: isMobile ? '75vw' : '25vw',
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
          
          maxWidth: isMobile ? '100%' : '30vw',
          fontSize: isMobile ? '1rem' : '1.1rem',
          lineHeight: 1.7,
          textAlign: 'left',
          position: 'relative',
          zIndex: 5,
          marginTop: isMobile ? '18vh' : 0,
          paddingLeft: isMobile ? '4vw' : 0,
          paddingRight: isMobile ? '4vw' : 0,
          marginLeft: 0,
          marginRight: isMobile ? 0 : '3vw',
        }}
        data-scroll
        data-scroll-speed="2"
        data-scroll-direction="vertical"
      >
        <RevealText progress={progress} start={0.3} end={1} >
          <p style={{ marginBottom: isMobile ? '0.75rem' : '1rem' }}>
            I am a passionate software developer with a solid foundation in front-end, PHP-based back-end development, and game development. Throughout my education at MBO Utrecht and hands-on experiences at AXiS Digitaal and Hogeschool Utrecht, I have gained practical expertise in building web, mobile, and desktop applications across a variety of technologies, including Java, C#, JavaFX, Unity, React Native, and WordPress.
          </p>
          <p style={{ marginBottom: isMobile ? '0.75rem' : '1rem' }}>
            I thrive in collaborative, agile team environments, having led interns, worked directly with clients, and contributed to real-world projects ranging from educational games and public transport applications to dashboards and data management tools. My work blends technical skill with creativity, a keen eye for user experience, and a focus on delivering practical solutions that make an impact.
          </p>
          <p style={{ marginBottom: isMobile ? '0.75rem' : '1rem' }}>
            Driven by curiosity and continuous learning, I enjoy tackling complex problems, exploring new technologies, and creating software that is both functional and engaging.
          </p>
        </RevealText>

      </div>
    </section>
  );
}
