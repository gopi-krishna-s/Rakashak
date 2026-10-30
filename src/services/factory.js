/**
 * RESCUEBOT Service Factory
 * Automatically routes data calls to Live API Client or Mock Simulation Engine based on VITE_DEMO_MODE.
 */

import { apiClient } from '../api/client.js';
import { ENDPOINTS } from '../api/endpoints.js';
import { simulatorEngine } from '../mock/simulator.js';

const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

export const isDemoMode = () => IS_DEMO_MODE;

export const robotService = {
  getRobots: async () => {
    if (IS_DEMO_MODE) return simulatorEngine.robots;
    return await apiClient.get(ENDPOINTS.GET_ROBOTS);
  },

  getTelemetry: async (robotId) => {
    if (IS_DEMO_MODE) {
      const robot = simulatorEngine.robots.find((r) => r.id === robotId);
      return robot || null;
    }
    return await apiClient.get(ENDPOINTS.GET_ROBOT_TELEMETRY(robotId));
  },

  sendMovement: async (robotId, direction) => {
    if (IS_DEMO_MODE) {
      return simulatorEngine.sendMovementCommand(robotId, direction);
    }
    return await apiClient.post(ENDPOINTS.POST_MOVEMENT(robotId), { direction });
  },

  stopRobot: async (robotId) => {
    if (IS_DEMO_MODE) {
      return simulatorEngine.sendMovementCommand(robotId, 'STOP');
    }
    return await apiClient.post(ENDPOINTS.POST_ROBOT_STOP(robotId));
  },

  stopAll: async () => {
    if (IS_DEMO_MODE) {
      simulatorEngine.triggerEstop();
      return { success: true };
    }
    return await apiClient.post(ENDPOINTS.POST_STOP_ALL);
  },
};

export const armService = {
  sendCommand: async (robotId, action, jointData) => {
    if (IS_DEMO_MODE) {
      return simulatorEngine.sendArmCommand(robotId, action, jointData);
    }
    return await apiClient.post(ENDPOINTS.POST_ARM_COMMAND(robotId), { action, joints: jointData });
  },
};

export const commsService = {
  getStatus: async () => {
    if (IS_DEMO_MODE) return simulatorEngine.comms;
    return await apiClient.get(ENDPOINTS.GET_COMMS_STATUS);
  },

  toggleRelay: async (robotId, active) => {
    if (IS_DEMO_MODE) {
      simulatorEngine.setCommsState(active ? 'RELAY_ACTIVE' : 'CONNECTED_DIRECT');
      return { success: true };
    }
    return await apiClient.post(ENDPOINTS.POST_RELAY_TOGGLE(robotId), { active });
  },
};

export const victimService = {
  getVictims: async () => {
    if (IS_DEMO_MODE) return simulatorEngine.victims;
    return await apiClient.get(ENDPOINTS.GET_VICTIMS);
  },

  updateVictim: async (id, patch) => {
    if (IS_DEMO_MODE) {
      const idx = simulatorEngine.victims.findIndex((v) => v.id === id);
      if (idx !== -1) {
        simulatorEngine.victims[idx] = { ...simulatorEngine.victims[idx], ...patch };
      }
      return simulatorEngine.victims[idx];
    }
    return await apiClient.patch(ENDPOINTS.PATCH_VICTIM(id), patch);
  },
};

export const missionService = {
  getCurrentMission: async () => {
    if (IS_DEMO_MODE) return simulatorEngine.mission;
    return await apiClient.get(ENDPOINTS.GET_CURRENT_MISSION);
  },
};

export const alertService = {
  getAlerts: async () => {
    if (IS_DEMO_MODE) return simulatorEngine.alerts;
    return await apiClient.get(ENDPOINTS.GET_ALERTS);
  },

  acknowledgeAlert: async (id) => {
    if (IS_DEMO_MODE) {
      const alert = simulatorEngine.alerts.find((a) => a.id === id);
      if (alert) alert.status = 'ACKNOWLEDGED';
      simulatorEngine.notify();
      return { success: true };
    }
    return await apiClient.post(ENDPOINTS.POST_ACK_ALERT(id));
  },
};

export const logService = {
  getLogs: async () => {
    if (IS_DEMO_MODE) return simulatorEngine.logs;
    return await apiClient.get(ENDPOINTS.GET_LOGS);
  },
};
