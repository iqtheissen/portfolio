import React, { useEffect } from 'react';

function LoadingBar({ onComplete, assetsLoaded = false }) {
  useEffect(() => {
    if (assetsLoaded) {
      // Complete immediately when assets are loaded
      if (typeof onComplete === 'function') {
        onComplete();
      }
    }
  }, [assetsLoaded, onComplete]);

  return (
    <div id='loader'>
      <div id='title' className='flex'>
        <p className='loading-text'>LOADING</p>
        <div className='therefore'>∴</div>
        <p className="loading-number">%</p>
      </div>
      <div id='loading-bar-border'>
        <div 
          className='loading-bar'
          style={assetsLoaded ? { width: '100%', animation: 'none' } : {}}
        ></div>
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
