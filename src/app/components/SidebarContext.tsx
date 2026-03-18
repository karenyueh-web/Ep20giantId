import { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  isMobile: boolean;
  isTablet: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: true,
  isMobile: false,
  isTablet: false,
  toggle: () => {},
  close: () => {},
  open: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const handleResize = useCallback(() => {
    const w = window.innerWidth;
    const mobile = w < 768;
    const tablet = w >= 768 && w < 1280;
    setIsMobile(mobile);
    setIsTablet(tablet);
    // On mobile/tablet, sidebar defaults to closed
    if (mobile || tablet) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);
  const open = useCallback(() => setIsOpen(true), []);

  return (
    <SidebarContext.Provider value={{ isOpen, isMobile, isTablet, toggle, close, open }}>
      {children}
    </SidebarContext.Provider>
  );
}
