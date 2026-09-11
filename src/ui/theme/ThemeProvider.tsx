'use client';
import * as React from 'react';
type Theme = 'system' | 'light' | 'dark'; type Density = 'comfortable' | 'compact' | 'dense';
const Ctx = React.createContext<{ theme: Theme; setTheme: (t: Theme) => void; density: Density; setDensity: (d: Density) => void }>({ theme: 'system', setTheme: () => {}, density: 'compact', setDensity: () => {} });
/** Theme applies immediately (ACC-01 instant preference) and persists locally; System follows prefers-color-scheme; no theme-specific DOM. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>('system'); const [density, setDensityState] = React.useState<Density>('compact');
  React.useEffect(() => { setThemeState((localStorage.getItem('am.theme') as Theme) || 'system'); setDensityState((localStorage.getItem('am.density') as Density) || 'compact'); }, []);
  React.useEffect(() => { const mq = window.matchMedia('(prefers-color-scheme: dark)'); const apply = () => { document.documentElement.dataset.theme = theme === 'system' ? (mq.matches ? 'dark' : 'light') : theme; }; apply(); mq.addEventListener('change', apply); return () => mq.removeEventListener('change', apply); }, [theme]);
  React.useEffect(() => { document.documentElement.dataset.density = density; }, [density]);
  const setTheme = (t: Theme) => { setThemeState(t); localStorage.setItem('am.theme', t); }; const setDensity = (d: Density) => { setDensityState(d); localStorage.setItem('am.density', d); };
  return <Ctx.Provider value={{ theme, setTheme, density, setDensity }}>{children}</Ctx.Provider>;
}
export const useTheme = () => React.useContext(Ctx);
