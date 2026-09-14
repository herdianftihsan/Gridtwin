# Fix Decision Workspace Simulation Flow

The current Decision Workspace auto-simulates (Live Preview) whenever the configuration changes. This bypasses the intended UX flow (READY -> Configure -> Run Simulation -> Results -> Decision) and leaves users confused when they first arrive at a project because there is no clear "Run Simulation" call to action. Furthermore, the "Save Scenario" button doesn't actually update the UI with the saved result.

## Proposed Changes

### `apps/web/src/components/workspace/workspace-container.tsx`
- **Stop Auto-Simulating**: Remove `triggerSimulation` from `handleConfigChange`. This ensures the user must explicitly click a button to run the simulation.
- **Explicit "Run Simulation" CTA**: 
  - Add a primary "Run Simulation" button to the header (replacing "Save Scenario" when it's unsaved/custom, or if no simulation has been run).
  - Update the "No Telemetry Yet" empty state to clearly instruct the user to configure and click "Run Simulation". Include a "Run Simulation" button directly in the empty state.
- **Unify Simulation Logic**: Combine the "Run Simulation" (which also saves the result) and the preview logic so that clicking "Run Simulation" hits the `POST /api/projects/:id/simulate` endpoint with `persist: true`. When it resolves, it will update `currentResult` and persist the scenario in the backend.

### `apps/web/src/components/workspace/simulation-controls/simulation-controls.tsx`
- Remove the "Live Preview" badge since simulation will now be an explicit action rather than automatically debounced on every keystroke/slider change.

## User Review Required

Please confirm if you agree with removing the "Live Preview" (auto-simulate on slider change) behavior in favor of an explicit "Run Simulation" button to enforce the step-by-step flow described in your request.
