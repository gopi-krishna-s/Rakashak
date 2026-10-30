/**
 * RESCUEBOT Communication Recovery Demo Scenario Runner
 * Sequentially triggers link loss, Robot B repositioning, relay activation, and direct link restoration.
 */

import { simulatorEngine } from './simulator.js';

let scenarioTimeout = null;

export const runRecoveryDemoScenario = (onStepCallback) => {
  if (scenarioTimeout) clearTimeout(scenarioTimeout);

  // Step 1: Force DIRECT LINK
  simulatorEngine.setCommsState('CONNECTED_DIRECT');
  if (onStepCallback) onStepCallback('Step 1: Direct link established (Station <-> Robot A)');

  // Step 2: Severe Link Loss (after 3 seconds)
  scenarioTimeout = setTimeout(() => {
    simulatorEngine.setCommsState('LOST');
    if (onStepCallback) onStepCallback('Step 2: Communication LINK LOST with Robot A!');

    // Step 3: Initiate Recovery (after 4 seconds)
    scenarioTimeout = setTimeout(() => {
      simulatorEngine.setCommsState('RECOVERING');
      if (onStepCallback) onStepCallback('Step 3: Robot B repositioning to recovery position...');

      // Step 4: Establish Relay (after 5 seconds)
      scenarioTimeout = setTimeout(() => {
        simulatorEngine.setCommsState('RELAY_ACTIVE');
        if (onStepCallback) onStepCallback('Step 4: RELAY ACTIVE! Link restored via Station <-> Robot B <-> Robot A');

        // Step 5: Return to Direct Link (after 6 seconds)
        scenarioTimeout = setTimeout(() => {
          simulatorEngine.setCommsState('CONNECTED_DIRECT');
          if (onStepCallback) onStepCallback('Step 5: Direct communication link restored to Robot A.');
        }, 6000);
      }, 5000);
    }, 4000);
  }, 3000);
};

export const stopRecoveryDemoScenario = () => {
  if (scenarioTimeout) {
    clearTimeout(scenarioTimeout);
    scenarioTimeout = null;
  }
};
