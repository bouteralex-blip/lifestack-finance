'use client';
import { createContext, useContext, useState, useCallback } from 'react';

// Shared engine state context — PortfolioVOS computes engines, all modules can read them
// PRICES carries raw market prices so CareerModule / any module can display live values
const EngineContext = createContext({
  ENGINE: null,
  MKTENG: null,
  AGENT: null,
  PRICES: null,
  setEngines: () => {},
  setPrices: () => {},
});

export function EngineProvider({ children }) {
  const [engines, setEnginesState] = useState({ ENGINE: null, MKTENG: null, AGENT: null });
  const [prices, setPricesState] = useState(null);
  const setEngines = useCallback((ENGINE, MKTENG, AGENT) => {
    setEnginesState({ ENGINE, MKTENG, AGENT });
  }, []);
  const setPrices = useCallback((p) => {
    setPricesState(p);
  }, []);
  return (
    <EngineContext.Provider value={{ ...engines, PRICES: prices, setEngines, setPrices }}>
      {children}
    </EngineContext.Provider>
  );
}

export function useEngines() {
  return useContext(EngineContext);
}
