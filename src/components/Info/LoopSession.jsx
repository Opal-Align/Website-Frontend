import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/** STEP_DATA index for Identify (01) — restart here when leaving the loop zone */
export const IDENTIFY_IDX = 3;

const LoopSessionContext = createContext(null);

/**
 * Wrap mobile Orbit+Cards (or desktop Loop) so active step is shared and
 * resets to Identify when `zoneActive` becomes false (left the loop zone).
 */
export function LoopSessionProvider({ zoneActive, children }) {
  const [active, setActive] = useState(IDENTIFY_IDX);
  const [resetEpoch, setResetEpoch] = useState(0);
  const wasActiveRef = useRef(zoneActive);

  useEffect(() => {
    if (wasActiveRef.current && !zoneActive) {
      setActive(IDENTIFY_IDX);
      setResetEpoch((n) => n + 1);
    }
    wasActiveRef.current = zoneActive;
  }, [zoneActive]);

  const value = useMemo(
    () => ({ active, setActive, zoneActive, resetEpoch }),
    [active, zoneActive, resetEpoch],
  );

  return (
    <LoopSessionContext.Provider value={value}>
      {children}
    </LoopSessionContext.Provider>
  );
}

export function useLoopSession(fallbackZoneActive = true) {
  const ctx = useContext(LoopSessionContext);
  const [localActive, setLocalActive] = useState(IDENTIFY_IDX);
  const [localEpoch, setLocalEpoch] = useState(0);
  const wasActiveRef = useRef(fallbackZoneActive);

  useEffect(() => {
    if (ctx) return;
    if (wasActiveRef.current && !fallbackZoneActive) {
      setLocalActive(IDENTIFY_IDX);
      setLocalEpoch((n) => n + 1);
    }
    wasActiveRef.current = fallbackZoneActive;
  }, [ctx, fallbackZoneActive]);

  if (ctx) return ctx;
  return {
    active: localActive,
    setActive: setLocalActive,
    zoneActive: fallbackZoneActive,
    resetEpoch: localEpoch,
  };
}
