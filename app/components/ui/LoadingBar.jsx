import React, { useEffect } from 'react';

function LoadingBar({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof onComplete === 'function') {
        onComplete(); // ✅ Notify parent after animation duration
      }
    }, 2000); // ⏱ Match your CSS animation duration (3s)

    return () => clearTimeout(timer); // Cleanup on unmount
  }, [onComplete]);

  return (
    <div id='loader'>
      <div id='title' className='flex'>
        <p className='loading-text'>LOADING</p>
        <div className='therefore'>∴</div>
        <p className="loading-number">%</p>
      </div>
      <div id='loading-bar-border'>
        <div className='loading-bar'></div>
      </div>
      <div id='warning'>
        <div className='exclamation'>!</div>
        &nbsp; CAUTION, Do not turn off.
        <div id='line-cascates'></div>
      </div>
    </div>
  );
}

export default LoadingBar;
