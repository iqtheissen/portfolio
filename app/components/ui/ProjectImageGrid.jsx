import React from 'react';
import IconButton from './IconButton'; // Adjust path if necessary
import TiltedCard from '@/app/blocks/Components/TiltedCard/TiltedCard';

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
        className='cursor-target'
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
          <TiltedCard
            imageSrc={main}
            altText="Main project"
            containerWidth="100%"
            containerHeight="100%"
            imageWidth="100%"
            imageHeight="100%"
            showMobileWarning={false}
            showTooltip={false}
            scaleOnHover={1.05}
            rotateAmplitude={7}
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
            className='cursor-target'
            style={{
              width: '100%',
              aspectRatio: '1 / 1',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#444',
            }}
          >
            {src && (
              <TiltedCard
                imageSrc={src}
                altText={`Project thumb ${idx + 1}`}
                containerWidth="100%"
                containerHeight="100%"
                imageWidth="100%"
                imageHeight="100%"
                showMobileWarning={false}
                showTooltip={false}
                scaleOnHover={1.05}
                rotateAmplitude={7}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
