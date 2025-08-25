import React from 'react';
import IconButton from './IconButton'; // Adjust path if necessary

export default function ProjectImageGrid({ images, githubUrl = "https://app.ynab.com/users/sign_in" }) {
  const { main, small1, small2 } = images || {};

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        gap: '1rem',
        height: '100%',
      }}
    >
      {/* Main 16:9 image with GitHub button */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#333',
        }}
      >
        {main && (
          <img
            src={main}
            alt="Main project"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}

        {/* GitHub IconButton */}
        {githubUrl && (
          <div
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              zIndex: 2,
            }}
          >
            <a href={githubUrl} target="_blank" rel="noopener noreferrer">
              <IconButton icon={<img src="/icons/github.svg" alt="GitHub" />} />
            </a>
          </div>
        )}
      </div>

      {/* Bottom two square images */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          overflow: 'hidden',
        }}
      >
        {[small1, small2].map((src, idx) => (
          <div
            key={idx}
            style={{
              width: '100%',
              aspectRatio: '1 / 1',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#444',
            }}
          >
            {src && (
              <img
                src={src}
                alt={`Project thumb ${idx + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
