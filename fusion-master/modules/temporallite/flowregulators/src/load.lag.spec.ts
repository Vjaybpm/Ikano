import { FlowRegulatorHysterisState, FlowRegulatorState, FlowRegulatorTargetNumberState } from "./flow.regulator.domain";
import { calculateNewTargetNumber, calculateSmoothedLoadLag, evaluateAcceptReject } from "./load.lag";

const state: FlowRegulatorState = {
  instantaneousLoadLag: 0,
  smoothedLoadLag: 50,
  smoothingFactor: 0.1,
  currentTargetNumber: 5,
  upperThreshold: 50,
  lowerThreshold: 40,
  isAccepting: true,
  measurementms: 1000,
  targetDelta: 3
};


describe ( 'calculateSmoothedLoadLag', () => {
  test ( 'correctly calculates with high smoothing factor', () => {
    expect ( calculateSmoothedLoadLag ( 50, 0.9, 100 ) ).toBe ( 95 ); // 0.9 * 100 + 0.1 * 50 = 95
  } );

  test ( 'correctly calculates with low smoothing factor', () => {
    expect ( calculateSmoothedLoadLag ( 50, 0.1, 100 ) ).toBe ( 55 ); // 0.1 * 100 + 0.9 * 50 = 55
  } );

  test ( 'handles zero smoothing factor', () => {
    expect ( calculateSmoothedLoadLag ( 50, 0, 100 ) ).toBe ( 50 ); // 0 * 100 + 1 * 50 = 50
  } );

  test ( 'handles full smoothing factor', () => {
    expect ( calculateSmoothedLoadLag ( 50, 1, 100 ) ).toBe ( 100 ); // 1 * 100 + 0 * 50 = 100
  } );

  test ( 'correctly calculates with zero new lag', () => {
    expect ( calculateSmoothedLoadLag ( 50, 0.5, 0 ) ).toBe ( 25 ); // 0.5 * 0 + 0.5 * 50 = 25
  } );
} );


describe ( 'evaluateAcceptReject', () => {
  test ( 'transitions to rejecting when lag exceeds upper threshold and currently accepting', () => {
    const state: FlowRegulatorHysterisState = {
      smoothedLoadLag: 40,
      upperThreshold: 50,
      lowerThreshold: 30,
      isAccepting: true
    };
    const newSmoothedLag = 60; // Above upper threshold
    expect ( evaluateAcceptReject ( state, newSmoothedLag ) ).toBe ( false );
  } );

  test ( 'remains accepting when lag is below upper threshold and currently accepting', () => {
    const state: FlowRegulatorHysterisState = {
      smoothedLoadLag: 40,
      upperThreshold: 50,
      lowerThreshold: 30,
      isAccepting: true
    };
    const newSmoothedLag = 45; // Below upper threshold
    expect ( evaluateAcceptReject ( state, newSmoothedLag ) ).toBe ( true );
  } );

  test ( 'transitions to accepting when lag drops below lower threshold and currently rejecting', () => {
    const state: FlowRegulatorHysterisState = {
      smoothedLoadLag: 60,
      upperThreshold: 50,
      lowerThreshold: 30,
      isAccepting: false
    };
    const newSmoothedLag = 25; // Below lower threshold
    expect ( evaluateAcceptReject ( state, newSmoothedLag ) ).toBe ( true );
  } );

  test ( 'remains rejecting when lag is above lower threshold and currently rejecting', () => {
    const state: FlowRegulatorHysterisState = {
      smoothedLoadLag: 60,
      upperThreshold: 50,
      lowerThreshold: 30,
      isAccepting: false
    };
    const newSmoothedLag = 35; // Above lower threshold but below upper threshold
    expect ( evaluateAcceptReject ( state, newSmoothedLag ) ).toBe ( false );
  } );

  test ( 'maintains current state when lag is between thresholds', () => {
    const state: FlowRegulatorHysterisState = {
      smoothedLoadLag: 45,
      upperThreshold: 50,
      lowerThreshold: 40,
      isAccepting: true
    };
    const newSmoothedLag = 45; // Within thresholds
    expect ( evaluateAcceptReject ( state, newSmoothedLag ) ).toBe ( true );
  } );
} );


describe ( 'calculateNewTargetNumber', () => {
  test ( 'increases target number when in accepting state', () => {
    const state: FlowRegulatorTargetNumberState = {
      currentTargetNumber: 10,
      targetDelta: 2,
      isAccepting: true
    };
    expect ( calculateNewTargetNumber ( state ) ).toBe ( 12 ); // 10 + 2
  } );

  test ( 'decreases target number when in rejecting state', () => {
    const state: FlowRegulatorTargetNumberState = {
      currentTargetNumber: 10,
      targetDelta: 2,
      isAccepting: false
    };
    expect ( calculateNewTargetNumber ( state ) ).toBe ( 8 ); // 10 - 2
  } );

  test ( 'handles zero target delta', () => {
    const state: FlowRegulatorTargetNumberState = {
      currentTargetNumber: 10,
      targetDelta: 0,
      isAccepting: true
    };
    expect ( calculateNewTargetNumber ( state ) ).toBe ( 10 ); // 10 + 0
  } );

  test ( 'properly adjusts target with large delta', () => {
    const state: FlowRegulatorTargetNumberState = {
      currentTargetNumber: 100,
      targetDelta: 50,
      isAccepting: false
    };
    expect ( calculateNewTargetNumber ( state ) ).toBe ( 50 ); // 100 - 50
  } );
} );
