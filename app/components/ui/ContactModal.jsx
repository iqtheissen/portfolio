"use client";

import { useEffect, useRef } from "react";
import { Mail, Phone, Linkedin, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { gsap } from "gsap";
import BeveledBox from "./BeveledBox";
import MenuToggleButton from "./MenuToggleButton";
import styles from "./ContactModal.module.css";

export default function ContactModal({ isOpen, isVisible, isNavigationVisible, onClose, onAfterClose, isMobile }) {
  const dialogRef = useRef(null);
  const backdropRef = useRef(null);
  const cardRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!isVisible) return;
    const previousFocus = document.activeElement;
    return () => {
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const animation = gsap.to([backdropRef.current, cardRef.current], {
      opacity: isOpen ? 1 : 0,
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.35,
      ease: "power2.inOut",
      onComplete: () => {
        if (!isOpen) onAfterClose();
      },
    });

    return () => animation.kill();
  }, [isOpen, isVisible, onAfterClose]);

  useEffect(() => {
    if (!isVisible || isNavigationVisible) return;
    const dialog = dialogRef.current;
    const focusableElements = () => Array.from(dialog.querySelectorAll('a[href], button:not([disabled])'));
    const focusFirst = () => focusableElements()[0]?.focus({ preventScroll: true });

    // The dialog stays in the page's stacking order so the closing menu can cover it.
    // Keep modal keyboard behavior once the navigation has finished closing.
    focusFirst();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "Tab") {
        const elements = focusableElements();
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    const handleFocus = (event) => {
      if (!dialog.contains(event.target)) focusFirst();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocus);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocus);
    };
  }, [isVisible, isNavigationVisible, onClose, isMobile]);

  const contacts = [
    { label: t("contact.email"), value: "quinttheissen@gmail.com", href: "mailto:quinttheissen@gmail.com", Icon: Mail },
    { label: t("contact.phone"), value: "06 31505205", href: "tel:+31631505205", Icon: Phone },
    { label: "LinkedIn", value: "Quint Theissen", href: "https://www.linkedin.com/in/quinttheissen", Icon: Linkedin, external: true },
  ];

  return (
    <dialog
      id="contact-modal"
      ref={dialogRef}
      open={isVisible}
      inert={isNavigationVisible}
      className={styles.modal}
      data-custom-cursor={!isMobile}
      aria-labelledby="contact-title"
      aria-modal={isVisible && !isNavigationVisible ? true : undefined}
      aria-hidden={isNavigationVisible || undefined}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      data-lenis-prevent
    >
      <div ref={backdropRef} className={styles.backdrop} aria-hidden="true" />
      {isMobile && (
        <div className={styles.mobileToggle}>
          <MenuToggleButton isOpen onClick={onClose} aria-label={t("contact.close")} aria-controls="contact-modal" />
        </div>
      )}
      <div ref={cardRef} className={styles.card}>
        <BeveledBox padding={24}>
          <div className={styles.content}>
            <div className={styles.header}>
              <h2 id="contact-title">{t("nav.contact")}</h2>
              {!isMobile && (
                <button type="button" onClick={onClose} className={`${styles.close} cursor-target`} aria-label={t("contact.close")}>
                  <X size={24} aria-hidden="true" />
                </button>
              )}
            </div>
            <dl className={styles.details}>
              {contacts.map(({ label, value, href, Icon, external }) => (
                <div key={href} className={styles.row}>
                  <dt><Icon size={18} aria-hidden="true" />{label}</dt>
                  <dd>
                    <a
                      href={href}
                      className="cursor-target"
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                    >
                      {value}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </BeveledBox>
      </div>
    </dialog>
  );
}
