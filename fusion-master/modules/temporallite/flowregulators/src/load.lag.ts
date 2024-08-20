import { FlowRegulatorHysterisState, FlowRegulatorState, FlowRegulatorTargetNumberState } from "./flow.regulator.domain";


export function calculateSmoothedLoadLag ( oldLag: number, smoothingFactor, newLag: number ): number {
  return smoothingFactor * newLag + (1 - smoothingFactor) * oldLag;
}

export function evaluateAcceptReject ( state: FlowRegulatorHysterisState, newSmoothedLag: number ): boolean {
  if ( newSmoothedLag > state.upperThreshold && state.isAccepting ) {
    return false;  // Move to rejecting
  } else if ( newSmoothedLag < state.lowerThreshold && !state.isAccepting ) {
    return true;  // Move to accepting
  }
  return state.isAccepting;
}

export function calculateNewTargetNumber ( state: FlowRegulatorTargetNumberState ): number {
  if ( state.isAccepting ) {
    return state.currentTargetNumber + state.targetDelta;  // Increase the target
  } else {
    return state.currentTargetNumber - state.targetDelta;  // Decrease the target
  }
}

export function startFlowRegulator ( initialState: FlowRegulatorState, timeservice: () => number ): void {
  let state = initialState;

  let lastTime = timeservice ()

  // Function to measure event loop lag
  const measureEventLoopLag = (): number => {
    const currentTime = timeservice ();
    const lag = currentTime - lastTime - state.measurementms;  // We expect this function to run every 1000 ms
    lastTime = currentTime;
    return lag;
  };

  // Update loop
  setInterval ( () => {
    if ( state.kill ) return
    const newLag = measureEventLoopLag ();
    state.instantaneousLoadLag = newLag;

    const newSmoothedLag = calculateSmoothedLoadLag ( state.instantaneousLoadLag, state.smoothingFactor, newLag );
    const newAcceptingState = evaluateAcceptReject ( state, newSmoothedLag );
    const newTargetNumber = calculateNewTargetNumber ( { ...state, isAccepting: newAcceptingState } );

    state = {
      ...state,
      smoothedLoadLag: newSmoothedLag,
      isAccepting: newAcceptingState,
      currentTargetNumber: newTargetNumber
    };

    if ( state.debug )
      console.log ( 'instantaneousLoadLag', newLag, 'smoothedLoadLag', newSmoothedLag, 'isAccepting', newAcceptingState, 'currentTargetNumber', newTargetNumber );
  }, state.measurementms );
}