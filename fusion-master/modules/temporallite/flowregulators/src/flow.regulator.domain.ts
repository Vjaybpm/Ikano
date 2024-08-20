export interface FlowRegulatorHysterisState {
  smoothedLoadLag: number;
  upperThreshold: number;
  lowerThreshold: number;
  isAccepting: boolean;
}
export interface FlowRegulatorTargetNumberState {
  currentTargetNumber: number;
  targetDelta: number;
  isAccepting: boolean;            // Current state, true if accepting, false if rejecting
}

export interface FlowRegulatorState extends FlowRegulatorHysterisState, FlowRegulatorTargetNumberState{
  debug?: boolean;
  kill?: boolean;
  instantaneousLoadLag: number;    // The most recent measurement of event loop lag
  smoothedLoadLag: number;         // Smoothed load lag using exponential smoothing
  smoothingFactor: number;         // Smoothing factor for the load lag (e.g., 0.1 for 10%)
  currentTargetNumber: number;     // Current target number of workflows that can be handled
  upperThreshold: number;          // Upper threshold for switching to rejecting state
  lowerThreshold: number;          // Lower threshold for switching back to accepting state
  isAccepting: boolean;            // Current state, true if accepting, false if rejecting
  measurementms: number;           // Measurement interval in milliseconds
  targetDelta: number;             // The amount to increase or decrease the target number
}

export function defaultFlowRegulatorState (): FlowRegulatorState {
  return {
    instantaneousLoadLag: 0,
    smoothedLoadLag: 0,
    smoothingFactor: 0.1,
    currentTargetNumber: 1,
    upperThreshold: 100,
    lowerThreshold: 10,
    isAccepting: true,
    measurementms: 1000,
    targetDelta: 3
  }
}