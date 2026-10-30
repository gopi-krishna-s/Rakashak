import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppShell } from './layouts/AppShell';

import { CommandCenter } from './pages/CommandCenter';
import { Robots } from './pages/Robots';
import { RobotA } from './pages/RobotA';
import { RobotB } from './pages/RobotB';
import { ArmControl } from './pages/ArmControl';
import { OperationalMap } from './pages/OperationalMap';
import { RobotVision } from './pages/RobotVision';
import { CommsNetwork } from './pages/CommsNetwork';
import { VictimDetection } from './pages/VictimDetection';
import { Operations } from './pages/Operations';
import { EventLogs } from './pages/EventLogs';
import { Settings } from './pages/Settings';
import { SystemHealth } from './pages/SystemHealth';
import { NotFound } from './pages/NotFound';

export const App = () => {
  return (
    <AppProvider>
      <Router>
        <AppShell>
          <Routes>
            <Route path="/" element={<CommandCenter />} />
            <Route path="/robots" element={<Robots />} />
            <Route path="/robot-a" element={<RobotA />} />
            <Route path="/robot-a/arm" element={<ArmControl />} />
            <Route path="/robot-b" element={<RobotB />} />
            <Route path="/map" element={<OperationalMap />} />
            <Route path="/vision" element={<RobotVision />} />
            <Route path="/network" element={<CommsNetwork />} />
            <Route path="/victims" element={<VictimDetection />} />
            <Route path="/operations" element={<Operations />} />
            <Route path="/logs" element={<EventLogs />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/system" element={<SystemHealth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppShell>
      </Router>
    </AppProvider>
  );
};

export default App;
