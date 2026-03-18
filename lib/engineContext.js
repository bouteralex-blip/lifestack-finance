'use client';
import { createContext, useContext, useState, useCallback } from 'react';

// Shared engine state context — PortfolioVOS computes engines, SystemsModule reads them
const EngineContext = createContext({
  ENGINE: null,
  MKTENG: null,
  AGENT: null,
  setEngines: () => {},
});

export function EngineProvider({ children }) {
  const [engines, setEnginesState] = useState({ ENGINE: null, MKTENG: null, AGENT: null });
  const setEngines = useCallback((ENGINE, MKTENG, AGENT) => {
    setEnginesState({ ENGINE, MKTENG, AGENT });
  }, []);
  return (
    <EngineContext.Provider value={{ ...engines, setEngines }}>
      {children}
    </EngineContext.Provider>
  );
}

export function useEngines() {
  return useContext(EngineContext);
}
