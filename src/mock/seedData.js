/**
 * RESCUEBOT Initial Realistic Seed Data
 */

export const SEED_ROBOTS = [
  {
    id: 'ROBOT-A',
    name: 'Robot A "Leader"',
    type: 'Rescue/Leader (4-Wheel + Arm)',
    ipAddress: '10.229.134.76',
    cameraUrl: 'http://10.229.134.182/',
    status: 'IDLE',
    mode: 'MANUAL', // MANUAL | AUTONOMOUS
    battery: 82,
    signal: 92,
    tempC: 36.2,
    speed: 0.0,
    heading: 45,
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      heading: 45,
      source: 'simulated',
      timestamp: new Date().toISOString(),
    },
    armState: {
      status: 'IDLE', // IDLE | MOVING | HOLDING | FAULT | STOPPED
      armed: false,
      gripper: 'OPEN', // OPEN | CLOSED | GRIPPING | UNKNOWN
      joints: {
        base: 0,
        shoulder: 15,
        elbow: 45,
        wrist: 0,
        gripper: 30,
      },
    },
    payload: '5-DOF Robotic Arm + Thermal + Gas',
    lastHeartbeat: new Date().toISOString(),
    origin: 'simulated',
  },
  {
    id: 'ROBOT-B',
    name: 'Robot B "Relay"',
    type: 'Mobile Communication Relay',
    ipAddress: '10.229.134.77',
    cameraUrl: 'http://10.229.134.76:8080/video_feed',
    status: 'IDLE',
    mode: 'MANUAL',
    battery: 91,
    signal: 96,
    tempC: 31.8,
    speed: 0.0,
    heading: 180,
    location: {
      latitude: 37.7752,
      longitude: -122.4188,
      heading: 180,
      source: 'simulated',
      timestamp: new Date().toISOString(),
    },
    relayState: {
      active: false, // false = standing by, true = actively routing Station <-> B <-> A
      connectedDevices: ['ROBOT-A'],
      routeQuality: 98,
      hopCount: 2,
    },
    payload: 'High-Gain Mesh Node + Directional Antenna',
    lastHeartbeat: new Date().toISOString(),
    origin: 'simulated',
  },
];

export const SEED_VICTIMS = [
  {
    id: 'VIC-101',
    label: 'Victim Detection #101',
    source: 'CAMERA', // CAMERA | CSI-WIFI | THERMAL
    confidence: 78,
    status: 'POSSIBLE', // POSSIBLE | CONFIRMED | FALSE_POSITIVE | RESCUED
    location: { latitude: 37.7751, longitude: -122.4191, zone: 'Sector B North' },
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    notes: 'Thermal anomaly detected near rubble pile',
    origin: 'simulated',
  },
  {
    id: 'VIC-102',
    label: 'Victim Detection #102',
    source: 'THERMAL',
    confidence: 94,
    status: 'CONFIRMED',
    location: { latitude: 37.7744, longitude: -122.4202, zone: 'Sector C Collapse Zone' },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    notes: 'Audible sound + 37.1°C heat signature confirmed',
    origin: 'simulated',
  },
  {
    id: 'VIC-103',
    label: 'Victim Detection #103',
    source: 'CSI-WIFI',
    confidence: 98,
    status: 'RESCUED',
    location: { latitude: 37.7756, longitude: -122.4181, zone: 'Shelter Entry' },
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    notes: 'Extricated by Heavy Unit team at 17:40',
    origin: 'simulated',
  },
];

export const SEED_MISSION = {
  id: 'MIS-2026-ALPHA',
  name: 'Disaster Zone Search Alpha',
  status: 'ACTIVE', // PLANNING | ACTIVE | PAUSED | EMERGENCY | COMPLETED
  startTime: new Date(Date.now() - 5400000).toISOString(),
  objective: 'Locate survivors in SF Sector B/C collapse zone and maintain relay mesh coverage.',
  searchAreaSqM: 18500,
  coveredAreaSqM: 14200,
  searchZones: [
    { id: 'Z1', name: 'Sector A Base', coverage: 100, status: 'CLEAR' },
    { id: 'Z2', name: 'Sector B Rubble', coverage: 75, status: 'SEARCHING' },
    { id: 'Z3', name: 'Sector C Structure', coverage: 40, status: 'SEARCHING' },
  ],
  objectivesChecklist: [
    { id: 'OBJ-1', text: 'Establish Field Base Station telemetry', completed: true },
    { id: 'OBJ-2', text: 'Deploy Robot B Relay to Sector B edge', completed: true },
    { id: 'OBJ-3', text: 'Scan Sector B/C for survivor signals', completed: false },
  ],
  origin: 'simulated',
};

export const SEED_COMMS = {
  state: 'CONNECTED_DIRECT', // CONNECTED_DIRECT | DEGRADED | LOST | RECOVERING | RELAY_ACTIVE
  directLink: {
    stationToA: { rssi: -64, quality: 92, latencyMs: 14, lastSeen: new Date().toISOString() },
    stationToB: { rssi: -58, quality: 96, latencyMs: 8, lastSeen: new Date().toISOString() },
  },
  relayLink: {
    stationToB: { rssi: -58, quality: 96, latencyMs: 8, lastSeen: new Date().toISOString() },
    bToA: { rssi: -68, quality: 88, latencyMs: 18, lastSeen: new Date().toISOString() },
  },
  activePath: 'DIRECT', // DIRECT | RELAY | NONE
  failureCount: 0,
  recoveryCount: 0,
  lastStateChange: new Date().toISOString(),
  origin: 'simulated',
};
