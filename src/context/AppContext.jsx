import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { simulatorEngine } from '../mock/simulator.js';
import { isDemoMode, robotService, commsService, victimService, missionService, alertService, logService } from '../services/factory.js';
import { desktop } from '../utils/desktop.js';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [robots, setRobots] = useState([]);
  const [selectedRobotId, setSelectedRobotId] = useState('ROBOT-A');
  const [comms, setComms] = useState({ state: 'CONNECTED_DIRECT', activePath: 'DIRECT' });
  const [victims, setVictims] = useState([]);
  const [mission, setMission] = useState({ name: 'Disaster Zone Search Alpha', status: 'ACTIVE', progress: 65 });
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [estopLatched, setEstopLatched] = useState(false);
  const [theme, setTheme] = useState('light');
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [demoStepNotice, setDemoStepNotice] = useState(null);

  // Add Toast Notification
  const addToast = useCallback((type, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Theme Sync
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    document.body.classList.toggle('estop-latched', estopLatched);
  }, [theme, estopLatched]);

  // Initial Data Load & Subscription
  useEffect(() => {
    if (isDemoMode()) {
      simulatorEngine.start();
      const unsub = simulatorEngine.subscribe((data) => {
        setRobots(data.robots);
        setVictims(data.victims);
        setMission(data.mission);
        setComms(data.comms);
        setLogs(data.logs);
        setAlerts(data.alerts);
        setEstopLatched(data.estopLatched);
      });
      return () => {
        unsub();
        simulatorEngine.stop();
      };
    } else {
      // Live Mode Fetching
      const fetchData = async () => {
        try {
          const [r, v, m, c, a, l] = await Promise.all([
            robotService.getRobots(),
            victimService.getVictims(),
            missionService.getCurrentMission(),
            commsService.getStatus(),
            alertService.getAlerts(),
            logService.getLogs(),
          ]);
          setRobots(r || []);
          setVictims(v || []);
          setMission(m || {});
          setComms(c || {});
          setAlerts(a || []);
          setLogs(l || []);
        } catch (err) {
          addToast('error', `Live Backend Connection Failed: ${err.message}`);
        }
      };
      fetchData();
      const interval = setInterval(fetchData, 3000);
      return () => clearInterval(interval);
    }
  }, [addToast]);

  // E-STOP Trigger (Minimal dependency safety module)
  const triggerEstop = useCallback(() => {
    setEstopLatched(true);
    if (isDemoMode()) {
      simulatorEngine.triggerEstop();
    } else {
      robotService.stopAll();
    }
    addToast('error', 'GLOBAL EMERGENCY STOP LATCHED');
  }, [addToast]);

  // E-STOP Reset
  const resetEstop = useCallback(() => {
    setEstopLatched(false);
    if (isDemoMode()) {
      simulatorEngine.resetEstop();
    }
    addToast('info', 'Global Emergency Stop Reset');
  }, [addToast]);

  // Toggle Theme
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Selected Robot Helper
  const selectedRobot = robots.find((r) => r.id === selectedRobotId) || robots[0] || {};

  const unacknowledgedAlertsCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  const value = {
    isDemoMode: isDemoMode(),
    robots,
    selectedRobotId,
    setSelectedRobotId,
    selectedRobot,
    comms,
    victims,
    setVictims,
    mission,
    setMission,
    logs,
    alerts,
    setAlerts,
    unacknowledgedAlertsCount,
    estopLatched,
    triggerEstop,
    resetEstop,
    theme,
    toggleTheme,
    isAlertDrawerOpen,
    setIsAlertDrawerOpen,
    toasts,
    addToast,
    demoStepNotice,
    setDemoStepNotice,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
