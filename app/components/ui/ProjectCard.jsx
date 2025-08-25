import React from 'react';
import BeveledBox from '../ui/BeveledBox';

function ProjectCard({
  title,
  company,
  period,
  location,
  description,
  width = '100%',
  height = 'auto',
}) {
  return (
    <BeveledBox
      style={{
        width,
        height,
        minHeight: '200px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: 'white',
        fontSize: '1.2rem', // Larger base font size
        lineHeight: 1.6,
      }}
    >
      <div>
        <h3
          style={{
            fontSize: '1.4rem',
            fontWeight: 'bold',
            marginBottom: '8px',
          }}
        >
          {title}
        </h3>

        {company && (
          <p
            style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              opacity: 0.85,
              marginBottom: '6px',
            }}
          >
            {company}
          </p>
        )}

        {(period || location) && (
          <p
            style={{
              fontSize: '1rem',
              opacity: 0.7,
              marginBottom: '10px',
            }}
          >
            {period} {location ? `• ${location}` : ''}
          </p>
        )}

        {description && (
          <p
            style={{
              fontSize: '1rem',
              opacity: 0.9,
            }}
          >
            {description}
          </p>
        )}
      </div>
    </BeveledBox>
  );
}

export default ProjectCard;
