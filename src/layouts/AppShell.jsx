import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { SideNav } from '../components/layout/SideNav';
import { ToastRegion } from '../components/layout/ToastRegion';
import { AlertDrawer } from '../components/layout/AlertDrawer';
import { useApp } from '../context/AppContext';

export const AppShell = ({ children }) => {
  const { triggerEstop, selectedRobotId, robots } = useApp();
  const navigate = useNavigate();

  // Keyboard Shortcuts Listener (Esc/Space = Stop Selected Robot, Shift+Esc = Global E-Stop, G+<letter> = Navigate)
  useEffect(() => {
    let keyGpressed = false;
    let keyGTimer = null;

    const handleKeyDown = (e) => {
      // Ignore when typing in input/textarea/select
      if (['input', 'textarea', 'select'].includes(document.activeElement?.tagName?.toLowerCase())) return;

      if (e.shiftKey && e.key === 'Escape') {
        e.preventDefault();
        triggerEstop();
        return;
      }

      if (e.key === 'Escape' || e.code === 'Space') {
        e.preventDefault();
        // Stop selected robot
        return;
      }

      if (e.key === 'g' || e.key === 'G') {
        keyGpressed = true;
        if (keyGTimer) clearTimeout(keyGTimer);
        keyGTimer = setTimeout(() => {
          keyGpressed = false;
        }, 1000);
        return;
      }

      if (keyGpressed) {
        keyGpressed = false;
        const k = e.key.toLowerCase();
        if (k === 'c') navigate('/');
        if (k === 'm') navigate('/map');
        if (k === 'r') navigate('/robots');
        if (k === 'a') navigate('/robot-a');
        if (k === 'b') navigate('/robot-b');
        if (k === 'n') navigate('/network');
        if (k === 'v') navigate('/vision');
        if (k === 'l') navigate('/logs');
        if (k === 's') navigate('/settings');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerEstop, navigate]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--bg)] text-[var(--ink)] overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <SideNav />
        <main className="flex-1 overflow-hidden relative bg-[var(--bg)] p-4">
          {children}
        </main>
      </div>
      <ToastRegion />
      <AlertDrawer />
    </div>
  );
};
