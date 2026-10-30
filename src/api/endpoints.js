/**
 * RESCUEBOT Central Endpoint Definitions
 * All backend API routes centralized in one place.
 */

export const ENDPOINTS = {
  // Robots & Telemetry
  GET_ROBOTS: '/robots',
  GET_ROBOT_TELEMETRY: (id) => `/robots/${id}/telemetry`,
  GET_ROBOT_LOCATION: (id) => `/robots/${id}/location`,

  // Robot Motion & Control
  POST_MOVEMENT: (id) => `/robots/${id}/movement`,
  POST_ARM_COMMAND: (id) => `/robots/${id}/arm/command`,
  POST_ROBOT_STOP: (id) => `/robots/${id}/stop`,
  POST_STOP_ALL: '/stop-all',

  // Communication & Relay
  GET_COMMS_STATUS: '/communication/status',
  POST_RELAY_TOGGLE: (id) => `/robots/${id}/relay`,
  POST_RELAY_REPOSITION: (id) => `/robots/${id}/relay/reposition`,

  // Victims & Search
  GET_VICTIMS: '/victims',
  PATCH_VICTIM: (id) => `/victims/${id}`,

  // Missions & Operations
  GET_CURRENT_MISSION: '/missions/current',
  POST_MISSION_CONTROL: '/missions/control',

  // Logs & Alerts
  GET_LOGS: '/logs',
  GET_ALERTS: '/alerts',
  POST_ACK_ALERT: (id) => `/alerts/${id}/ack`,

  // Realtime Stream
  REALTIME_WS: '/ws',
  REALTIME_SSE: '/events',
};
