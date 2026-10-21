import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const INSTITUTIONS_DATA = {
  ispotec: {
    id: 'ispotec',
    name: 'ISPOTEC Online',
    shortName: 'ISPOTEC',
    fullName: 'Instituto Superior Politécnico e de Tecnologias',
    level: 'Ensino Superior Politécnico',
    tagline: 'Plataforma de aprendizagem colaborativa e gestão académica',
    slogan: 'Inovação, Ciência e Excelência no Ensino Superior',
    badge: '🎓 Ensino Superior',
    logo: '/assets/img/logo-ispotec.png',
    homeUrl: '/',
    primaryColor: '#0055a4',
    secondaryColor: '#003366',
    accentColor: '#10b981',
    gradient: 'linear-gradient(135deg, #0055a4 0%, #003366 50%, #004080 100%)',
    contacts: {
      phones: ['878787442', '877906666', '873045610'],
      whatsapp: '258878787442',
      email: 'ifoptec.politecnica@gmail.com',
      locations: ['Moçambique']
    }
  },
  ifoptec: {
    id: 'ifoptec',
    name: 'IFOPTEC Online',
    shortName: 'IFOPTEC',
    fullName: 'Instituto de Formação Politécnica e de Tecnologias',
    level: 'Ensino Técnico Médio & Curta Duração',
    tagline: 'Formar • Inovar • Transformar — O seu futuro começa aqui!',
    slogan: 'Qualificação Hoje, Mais Oportunidades Amanhã!',
    badge: '🏥 Ensino Médio & Saúde',
    logo: '/assets/img/logo-ifoptec.png',
    homeUrl: '/ifoptec',
    primaryColor: '#02529c',
    secondaryColor: '#002f5e',
    accentColor: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #02529c 0%, #002f5e 50%, #0b63b6 100%)',
    contacts: {
      phones: ['840726974', '870726974', '869700700'],
      whatsapp: '258840726974',
      email: 'ifoptec.politecnica@gmail.com',
      locations: [
        { nome: 'Polo Matola-Rio', endereco: 'Rua da Mozal' }
      ]
    }
  }
};

const InstitutionContext = createContext(null);

export function InstitutionProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Detect institution from route or saved preference
  const isIfoptecRoute = location.pathname.startsWith('/ifoptec');

  const [activeId, setActiveId] = useState(() => {
    if (isIfoptecRoute) return 'ifoptec';
    try {
      const saved = localStorage.getItem('ispotec_active_institution');
      if (saved && INSTITUTIONS_DATA[saved]) return saved;
    } catch (_) {}
    return 'ispotec';
  });

  // Keep activeId synchronized if user navigates to /ifoptec or /
  useEffect(() => {
    if (isIfoptecRoute && activeId !== 'ifoptec') {
      setActiveId('ifoptec');
      try {
        localStorage.setItem('ispotec_active_institution', 'ifoptec');
      } catch (_) {}
    } else if (location.pathname === '/' && activeId === 'ifoptec' && !localStorage.getItem('ispotec_active_institution')) {
      setActiveId('ispotec');
    }
  }, [location.pathname, isIfoptecRoute]);

  const switchInstitution = (institutionId) => {
    const validId = INSTITUTIONS_DATA[institutionId] ? institutionId : 'ispotec';
    setActiveId(validId);
    try {
      localStorage.setItem('ispotec_active_institution', validId);
    } catch (_) {}

    if (validId === 'ifoptec') {
      if (!location.pathname.startsWith('/ifoptec')) {
        navigate('/ifoptec');
      }
    } else {
      if (location.pathname.startsWith('/ifoptec')) {
        navigate('/');
      }
    }
  };

  const institution = useMemo(() => {
    return INSTITUTIONS_DATA[activeId] || INSTITUTIONS_DATA.ispotec;
  }, [activeId]);

  const value = {
    institution,
    activeId,
    isIfoptec: activeId === 'ifoptec' || isIfoptecRoute,
    isIspotec: activeId === 'ispotec' && !isIfoptecRoute,
    switchInstitution,
    availableInstitutions: Object.values(INSTITUTIONS_DATA)
  };

  return (
    <InstitutionContext.Provider value={value}>
      {children}
    </InstitutionContext.Provider>
  );
}

export function useInstitution() {
  const context = useContext(InstitutionContext);
  if (!context) {
    throw new Error('useInstitution must be used within an InstitutionProvider');
  }
  return context;
}
