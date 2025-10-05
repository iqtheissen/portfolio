import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import projectsEn from '../data/projects.json';
import projectsNl from '../data/projects.nl.json';

export function useProjects() {
  const { i18n } = useTranslation();
  const [projects, setProjects] = useState(projectsEn);

  useEffect(() => {
    if (i18n.language === 'nl') {
      setProjects(projectsNl);
    } else {
      setProjects(projectsEn);
    }
  }, [i18n.language]);

  return projects;
}