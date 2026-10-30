/**
 * RESCUEBOT Simulation Engine
 * Drives realistic field telemetry, kinematics, battery decay, and comms link changes.
 */

import { SEED_ROBOTS, SEED_VICTIMS, SEED_MISSION, SEED_COMMS } from './seedData.js';

class SimulationEngine {
  constructor() {
    this.robots = JSON.parse(JSON.stringify(SEED_ROBOTS));
    this.victims = JSON.parse(JSON.stringify(SEED_VICTIMS));
    this.mission = JSON.parse(JSON.stringify(SEED_MISSION));
    this.comms = JSON.parse(JSON.stringify(SEED_COMMS));
    this.logs = [
      {
        id: 'L1',
        timestamp: new Date().toISOString(),
        source: 'SYSTEM',
        category: 'System',
        type: 'SYS_INIT',
        message: 'RESCUEBOT Field Station Initialized (DEMO MODE)',
        details: { mode: 'DEMO', VITE_DEMO_MODE: true },
      },
    ];
    this.alerts = [];
    this.timer = null;
    this.subscribers = new Set();
    this.estopLatched = false;
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), 2000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  subscribe(fn) {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  notify() {
    const payload = {
      robots: this.robots,
      victims: this.victims,
      mission: this.mission,
      comms: this.comms,
      logs: this.logs,
      alerts: this.alerts,
      estopLatched: this.estopLatched,
    };
    this.subscribers.forEach((fn) => fn(payload));
  }

  tick() {
    if (this.estopLatched) return;

    // Simulate Robot Telemetry Updates
    this.robots = this.robots.map((r) => {
      let speed = r.speed;
      let battery = r.battery;
      let tempC = r.tempC;
      let lat = r.location.latitude;
      let lng = r.location.longitude;

      if (r.status === 'MOVING') {
        speed = Math.min(1.8, (speed || 0.8) + 0.1);
        lat += (Math.random() - 0.48) * 0.0001;
        lng += (Math.random() - 0.48) * 0.0001;
      }

      // Slow battery decay
      if (Math.random() < 0.2) battery = Math.max(1, battery - 1);
      // Temp drift
      tempC = +(tempC + (Math.random() - 0.5) * 0.2).toFixed(1);

      return {
        ...r,
        speed,
        battery,
        tempC,
        location: {
          ...r.location,
          latitude: +lat.toFixed(5),
          longitude: +lng.toFixed(5),
          timestamp: new Date().toISOString(),
        },
        lastHeartbeat: new Date().toISOString(),
      };
    });

    this.notify();
  }

  // E-Stop Latch / Reset
  triggerEstop() {
    this.estopLatched = true;
    this.robots = this.robots.map((r) => ({
      ...r,
      status: 'STOPPED',
      speed: 0,
      armState: { ...r.armState, status: 'STOPPED' },
    }));
    this.mission.status = 'EMERGENCY';

    const alert = {
      id: `ALT-${Date.now()}`,
      severity: 'CRITICAL',
      source: 'SYSTEM',
      message: 'GLOBAL EMERGENCY STOP LATCHED BY OPERATOR',
      timestamp: new Date().toISOString(),
      status: 'ACTIVE',
    };
    this.alerts.unshift(alert);

    this.addLog('System', 'ESTOP_TRIGGER', 'GLOBAL EMERGENCY STOP ACTIVATED', alert);
    this.notify();
  }

  resetEstop() {
    this.estopLatched = false;
    this.robots = this.robots.map((r) => ({
      ...r,
      status: 'IDLE',
      armState: { ...r.armState, status: 'IDLE' },
    }));
    this.mission.status = 'ACTIVE';

    this.addLog('System', 'ESTOP_RESET', 'Global Emergency Stop reset by operator', {});
    this.notify();
  }

  // Movement Control Pulse
  sendMovementCommand(robotId, direction) {
    if (this.estopLatched) return { success: false, reason: 'E-STOP latched' };

    const robot = this.robots.find((r) => r.id === robotId);
    if (!robot) return { success: false, reason: 'Robot not found' };
    if (robot.mode === 'AUTONOMOUS') return { success: false, reason: 'Robot in AUTONOMOUS mode' };

    let latDelta = 0;
    let lngDelta = 0;
    const step = 0.0001;

    if (direction === 'FORWARD') latDelta = step;
    if (direction === 'BACKWARD') latDelta = -step;
    if (direction === 'LEFT') lngDelta = -step;
    if (direction === 'RIGHT') lngDelta = step;

    this.robots = this.robots.map((r) => {
      if (r.id !== robotId) return r;
      return {
        ...r,
        status: direction === 'STOP' ? 'IDLE' : 'MOVING',
        speed: direction === 'STOP' ? 0 : 1.2,
        location: {
          ...r.location,
          latitude: +(r.location.latitude + latDelta).toFixed(5),
          longitude: +(r.location.longitude + lngDelta).toFixed(5),
          timestamp: new Date().toISOString(),
        },
      };
    });

    this.notify();
    return { success: true };
  }

  // Arm Control Command
  sendArmCommand(robotId, action, jointData) {
    if (this.estopLatched) return { success: false, reason: 'E-STOP latched' };

    const robot = this.robots.find((r) => r.id === robotId);
    if (!robot || !robot.armState) return { success: false, reason: 'Arm unavailable' };
    if (!robot.armState.armed && action !== 'ARM' && action !== 'DISARM') {
      return { success: false, reason: 'Arm is DISARMED. Confirm Arming first.' };
    }

    if (action === 'ARM') robot.armState.armed = true;
    if (action === 'DISARM') robot.armState.armed = false;

    if (jointData) {
      robot.armState.joints = { ...robot.armState.joints, ...jointData };
    }

    this.addLog('Robot', 'ARM_CMD', `Arm action [${action}] executed`, { robotId, action, jointData });
    this.notify();
    return { success: true };
  }

  // Communication Recovery Scenario Controls
  setCommsState(state) {
    this.comms.state = state;
    this.comms.lastStateChange = new Date().toISOString();

    if (state === 'CONNECTED_DIRECT') {
      this.comms.activePath = 'DIRECT';
      this.robots[1].relayState.active = false;
    } else if (state === 'LOST') {
      this.comms.activePath = 'NONE';
      this.comms.failureCount++;
      const alert = {
        id: `ALT-LOST-${Date.now()}`,
        severity: 'CRITICAL',
        source: 'ROBOT-A',
        message: 'COMMUNICATION LINK LOST WITH ROBOT A',
        timestamp: new Date().toISOString(),
        status: 'ACTIVE',
      };
      this.alerts.unshift(alert);
      this.addLog('Communication', 'LINK_LOST', 'Communication link lost with Robot A', {});
    } else if (state === 'RECOVERING') {
      this.comms.activePath = 'NONE';
      this.robots[1].status = 'MOVING'; // Robot B repositions
      this.addLog('Communication', 'RECOVERY_INIT', 'Robot B repositioning to restore communication link', {});
    } else if (state === 'RELAY_ACTIVE') {
      this.comms.activePath = 'RELAY';
      this.comms.recoveryCount++;
      this.robots[1].relayState.active = true;
      this.robots[1].status = 'IDLE';
      this.addLog('Communication', 'RELAY_ENGAGED', 'Relay established: Station <-> Robot B <-> Robot A', {});
    }

    this.notify();
  }

  addLog(category, type, message, details = {}) {
    const entry = {
      id: `L-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      source: 'SIMULATOR',
      category,
      type,
      message,
      details,
    };
    this.logs.unshift(entry);
  }
}

export const simulatorEngine = new SimulationEngine();
