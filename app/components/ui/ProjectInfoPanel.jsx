import React from 'react';
import TechTag from './TechTag';
import CyberButton from './CyberButton';

export default function ProjectInfoPanel({
  project,
}) {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '3rem',
        overflowY: 'auto',
      }}
    >
      {/* Title */}
      <h1 style={{ margin: 0, textTransform: 'uppercase' }}>{project.title}</h1>

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
  <TechTag key={tech + index} text={tech} color="#61dafb" />
))}
      </div>

      {/* Description */}
      <div>
        <strong style={{ display: 'block', marginBottom: '0.3rem' }}>Description</strong>
        <p style={{ marginTop: 0 }}>{project.description}</p>
      </div>

      {/* Year & Goal */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
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
      <div>
        <strong style={{ display: 'block', marginBottom: '0.2rem' }}>Status</strong>
        <div>{project.status}</div>
      </div>

      {/* View Project Button */}
      <div style={{ marginTop: '2rem' }}>
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
      
    </div>
  );
}
