"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher({ className, style, isMobile = false }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [fadeState, setFadeState] = useState('idle'); // 'idle' | 'fading-in' | 'changing' | 'fading-out'
  const [targetLanguage, setTargetLanguage] = useState(null);
  const dropdownRef = useRef(null);

  const setLang = async (lng) => {
    if (i18n.language === lng) return;
    
    // Smooth fade effect for both desktop and mobile
    setTargetLanguage(lng);
    setFadeState('fading-in');
  };

  // Handle fade completion and language change
  useEffect(() => {
    if (fadeState === 'fading-in') {
      // Wait for fade-in to complete, then change language
      const timer = setTimeout(() => {
        setFadeState('changing');
      }, 300); // Match CSS transition duration
      return () => clearTimeout(timer);
    } else if (fadeState === 'changing' && targetLanguage) {
      // Change language when fully black
      i18n.changeLanguage(targetLanguage)
        .then(() => {
          localStorage.setItem("locale", targetLanguage);
          setIsOpen(false);
          setTargetLanguage(null);
          setFadeState('fading-out');
        })
        .catch((e) => {
          console.warn("i18n changeLanguage failed", e);
          setFadeState('idle');
          setTargetLanguage(null);
        });
    } else if (fadeState === 'fading-out') {
      // Wait for fade-out to complete
      const timer = setTimeout(() => {
        setFadeState('idle');
      }, 300); // Match CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [fadeState, targetLanguage, i18n]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'nl', label: 'NL' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <>
      {/* Smooth fade to black overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'black',
          opacity: fadeState === 'idle' ? 0 : fadeState === 'fading-out' ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
          zIndex: 9999,
          pointerEvents: 'none',
        }}
      />

      <div className={className} style={{ position: 'relative', ...style }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'transparent',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '1.1rem',
          fontWeight: 500,
          padding: '0.375rem 0.625rem',
          transition: 'background-color 0.2s ease',
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        <img
          src="/globe.svg"
          alt="Language"
          style={{
            width: '22px',
            height: '22px',
            filter: 'brightness(0) invert(1)', // Make it white
          }}
        />
        <span style={{ fontSize: '1.1rem' }}>{currentLanguage.label}</span>
        <span style={{
          fontSize: '0.8rem',
          transition: 'transform 0.2s ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '0.25rem 0',
            minWidth: '60px',
            zIndex: 1001,
            backdropFilter: 'blur(10px)',
          }}
        >
          {languages.map((lang) => (
            <button
              className="cursor-target"
              key={lang.code}
              onClick={() => setLang(lang.code)}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: 'none',
                color: i18n.language === lang.code ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.9rem',
                fontWeight: i18n.language === lang.code ? 600 : 400,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = i18n.language === lang.code ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
